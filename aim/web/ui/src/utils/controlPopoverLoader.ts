/**
 * ControlPopover 样式加载器
 * 专门处理 ControlPopover 组件在 qiankun 环境下的样式加载问题
 */

declare global {
  interface Window {
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
    externalPublicPath?: string;
  }
}

/**
 * 获取正确的资源路径前缀
 */
export function getPublicPath(): string {
  if (
    typeof window !== 'undefined' &&
    (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__
  ) {
    return (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
  }
  return (window as any).externalPublicPath || '/';
}

/**
 * 确保 ControlPopover 样式正确加载
 */
export function ensureControlPopoverStyles(): void {
  // 检查是否在 qiankun 环境下
  if (typeof window === 'undefined') return;

  const publicPath = getPublicPath();

  // 检查 ControlPopover 样式是否已加载
  const existingStyle = document.querySelector('style[data-controlpopover]');
  if (existingStyle) return;

  // 创建内联样式来确保 ControlPopover 样式正确应用
  const style = document.createElement('style');
  style.setAttribute('data-controlpopover', 'true');
  style.textContent = `
    .ControlPopover {
      box-shadow: 0 0.25rem 0.375rem rgba(144, 175, 218, 0.2) !important;
      border: 0.0625rem solid #e8f1fc !important;
    }
    
    .ControlPopover__container .MuiListItem-button {
      color: #414b6d !important;
      font-size: 0.875rem !important;
      padding: 0.5rem !important;
      border-radius: 0.25rem !important;
    }
    
    .ControlPopover__container .MuiListItem-button:hover {
      background-color: #f2f5fa !important;
    }
    
    .ControlPopover__container-small .MuiListItem-button {
      height: 28px !important;
    }
    
    .ControlPopover__container-medium .MuiListItem-button {
      height: 32px !important;
    }
    
    .ControlPopover__container-large .MuiListItem-button {
      height: 36px !important;
    }
    
    .ControlPopover__container .MuiListItem-root.Mui-selected {
      background-color: transparent !important;
      color: #1473e6 !important;
    }
    
    .ControlPopover__container .MuiListItem-root.Mui-selected:hover {
      background-color: #f2f5fa !important;
    }
    
    .ControlPopover__container .MuiListItem-root.Mui-selected:after {
      content: "✓" !important;
      position: absolute !important;
      right: 0.5rem !important;
    }
    
    .ControlPopover__container .subtitle {
      text-transform: uppercase !important;
    }
    
    .ControlPopover__title {
      padding: 0.5rem 1rem !important;
      border-bottom: 0.0625rem solid #e8f1fc !important;
      background: #f3f8fe !important;
    }
  `;

  document.head.appendChild(style);
}

/**
 * 监听动态添加的 ControlPopover 元素
 */
export function watchControlPopoverElements(): void {
  if (typeof window === 'undefined') return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // 检查是否包含 ControlPopover 相关元素
            const controlPopover =
              node.querySelector?.('.ControlPopover') ||
              (node.classList?.contains('ControlPopover') ? node : null);

            if (controlPopover) {
              // 确保样式正确应用
              ensureControlPopoverStyles();
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * 初始化 ControlPopover 样式加载器
 */
export function initControlPopoverLoader(): void {
  // 确保样式正确加载
  ensureControlPopoverStyles();

  // 监听动态添加的元素
  watchControlPopoverElements();

  // 处理已存在的 ControlPopover 元素
  const existingPopovers = document.querySelectorAll('.ControlPopover');
  if (existingPopovers.length > 0) {
    ensureControlPopoverStyles();
  }
}
