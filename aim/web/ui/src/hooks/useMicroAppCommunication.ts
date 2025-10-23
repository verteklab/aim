import { useEffect, useCallback, useRef } from 'react';
import React from 'react';

import {
  createMicroAppCommunication,
  getMicroAppCommunication,
  MicroAppMessage,
  MicroAppCommunicationOptions,
} from 'utils/microAppCommunication';

// 导入React

/**
 * 微前端通信Hook
 */
export function useMicroAppCommunication(
  options?: Partial<MicroAppCommunicationOptions>,
) {
  const communicationRef = useRef(getMicroAppCommunication());

  // 初始化通信实例
  useEffect(() => {
    if (!communicationRef.current) {
      const appName = process.env.MICRO_APP_NAME || 'aim-ui';
      communicationRef.current = createMicroAppCommunication({
        appName,
        onMessage: options?.onMessage,
        onError: options?.onError,
        ...options,
      });
    }

    return () => {
      // 组件卸载时不销毁通信实例，因为它是全局的
    };
  }, [options]);

  // 发送消息
  const sendMessage = useCallback(
    (message: Omit<MicroAppMessage, 'source' | 'timestamp'>) => {
      if (communicationRef.current) {
        communicationRef.current.sendMessage(message);
      }
    },
    [],
  );

  // 注册消息处理器
  const onMessage = useCallback(
    (type: string, handler: (message: MicroAppMessage) => void) => {
      if (communicationRef.current) {
        communicationRef.current.on(type, handler);
      }
    },
    [],
  );

  // 移除消息处理器
  const offMessage = useCallback((type: string) => {
    if (communicationRef.current) {
      communicationRef.current.off(type);
    }
  }, []);

  // 获取全局状态
  const getGlobalState = useCallback(() => {
    if (communicationRef.current) {
      return communicationRef.current.getGlobalState();
    }
    return {};
  }, []);

  // 设置全局状态
  const setGlobalState = useCallback((state: any) => {
    if (communicationRef.current) {
      return communicationRef.current.setGlobalState(state);
    }
    return false;
  }, []);

  return {
    sendMessage,
    onMessage,
    offMessage,
    getGlobalState,
    setGlobalState,
    communication: communicationRef.current,
  };
}

/**
 * 监听特定类型消息的Hook
 */
export function useMicroAppMessage(
  messageType: string,
  handler: (message: MicroAppMessage) => void,
  deps: any[] = [],
) {
  const { onMessage, offMessage } = useMicroAppCommunication();

  useEffect(() => {
    onMessage(messageType, handler);

    return () => {
      offMessage(messageType);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageType, handler, onMessage, offMessage, ...deps]);
}

/**
 * 监听全局状态变化的Hook
 */
export function useMicroAppGlobalState() {
  const { getGlobalState, setGlobalState, onMessage, offMessage } =
    useMicroAppCommunication();
  const [globalState, setState] = React.useState(getGlobalState);

  useEffect(() => {
    const handleStateChange = () => {
      setState(getGlobalState());
    };

    // 监听全局状态变化
    onMessage('GLOBAL_STATE_CHANGE', handleStateChange);

    return () => {
      offMessage('GLOBAL_STATE_CHANGE');
    };
  }, [getGlobalState, onMessage, offMessage]);

  return {
    globalState,
    setGlobalState,
    getGlobalState,
  };
}
