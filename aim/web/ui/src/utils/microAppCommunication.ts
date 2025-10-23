/**
 * 微前端通信工具
 * 支持主应用与子应用之间的通信
 */

export interface MicroAppMessage {
  type: string;
  payload?: any;
  source: string;
  target?: string;
  timestamp: number;
}

export interface MicroAppCommunicationOptions {
  appName: string;
  onMessage?: (message: MicroAppMessage) => void;
  onError?: (error: Error) => void;
}

class MicroAppCommunication {
  private appName: string;
  private messageHandlers: Map<string, (message: MicroAppMessage) => void> =
    new Map();
  private onMessage?: (message: MicroAppMessage) => void;
  private onError?: (error: Error) => void;

  constructor(options: MicroAppCommunicationOptions) {
    this.appName = options.appName;
    this.onMessage = options.onMessage;
    this.onError = options.onError;

    this.init();
  }

  private init() {
    // 监听来自主应用的消息
    window.addEventListener('message', this.handleMessage.bind(this));

    // 监听qiankun的全局状态变化
    if ((window as any).__POWERED_BY_QIANKUN__) {
      this.setupQiankunCommunication();
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = event.data as MicroAppMessage;

      // 验证消息格式
      if (!message || typeof message !== 'object' || !message.type) {
        return;
      }

      // 如果是发送给当前应用的，或者是广播消息
      if (!message.target || message.target === this.appName) {
        this.processMessage(message);
      }
    } catch (error) {
      this.onError?.(error as Error);
    }
  }

  private processMessage(message: MicroAppMessage) {
    // 调用通用消息处理器
    this.onMessage?.(message);

    // 调用特定类型的消息处理器
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  private setupQiankunCommunication() {
    // 监听qiankun的全局状态变化
    const originalSetGlobalState = (window as any).__GLOBAL_STATE__
      ?.setGlobalState;
    if (originalSetGlobalState) {
      (window as any).__GLOBAL_STATE__.setGlobalState = (state: any) => {
        const result = originalSetGlobalState(state);

        // 发送状态变化消息
        this.sendMessage({
          type: 'GLOBAL_STATE_CHANGE',
          payload: state,
          source: this.appName,
          timestamp: Date.now(),
        });

        return result;
      };
    }
  }

  /**
   * 发送消息到主应用或其他微应用
   */
  public sendMessage(message: Omit<MicroAppMessage, 'source' | 'timestamp'>) {
    const fullMessage: MicroAppMessage = {
      ...message,
      source: this.appName,
      timestamp: Date.now(),
    };

    try {
      // 发送到主应用
      if ((window as any).__POWERED_BY_QIANKUN__) {
        // 通过qiankun的通信机制发送
        if ((window as any).__GLOBAL_STATE__?.setGlobalState) {
          (window as any).__GLOBAL_STATE__.setGlobalState({
            [`${this.appName}_message`]: fullMessage,
          });
        }
      }

      // 通过postMessage发送
      window.parent.postMessage(fullMessage, '*');

      console.log(`[${this.appName}] Message sent:`, fullMessage);
    } catch (error) {
      this.onError?.(error as Error);
    }
  }

  /**
   * 注册消息处理器
   */
  public on(type: string, handler: (message: MicroAppMessage) => void) {
    this.messageHandlers.set(type, handler);
  }

  /**
   * 移除消息处理器
   */
  public off(type: string) {
    this.messageHandlers.delete(type);
  }

  /**
   * 获取全局状态
   */
  public getGlobalState() {
    if ((window as any).__GLOBAL_STATE__?.getGlobalState) {
      return (window as any).__GLOBAL_STATE__.getGlobalState();
    }
    return {};
  }

  /**
   * 设置全局状态
   */
  public setGlobalState(state: any) {
    if ((window as any).__GLOBAL_STATE__?.setGlobalState) {
      return (window as any).__GLOBAL_STATE__.setGlobalState(state);
    }
    return false;
  }

  /**
   * 销毁通信实例
   */
  public destroy() {
    window.removeEventListener('message', this.handleMessage.bind(this));
    this.messageHandlers.clear();
  }
}

// 创建全局通信实例
let globalCommunication: MicroAppCommunication | null = null;

export function createMicroAppCommunication(
  options: MicroAppCommunicationOptions,
) {
  if (globalCommunication) {
    globalCommunication.destroy();
  }

  globalCommunication = new MicroAppCommunication(options);
  return globalCommunication;
}

export function getMicroAppCommunication() {
  return globalCommunication;
}

// 导出类型和工具函数
export { MicroAppCommunication };
