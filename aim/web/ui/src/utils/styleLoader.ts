/**
 * 样式加载工具函数，用于在qiankun环境下正确加载SCSS/CSS文件
 * 这个工具不依赖额外的webpack loader，而是通过运行时处理来解决路径问题
 */

declare global {
  interface Window {
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
    externalPublicPath?: string;
    __webpack_require__?: (moduleId: string) => any;
  }
}

/**
 * 获取正确的资源路径前缀
 */
export function getPublicPath(): string {
  if (window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__) {
    return window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
  }
  if (window.externalPublicPath) {
    return window.externalPublicPath;
  }
  return '/';
}

/**
 * 修复样式文件路径
 */
export function fixStylePath(originalPath: string): string {
  const publicPath = getPublicPath();

  // 如果是相对路径且在qiankun环境下，添加正确的前缀
  if (
    originalPath.startsWith('./') ||
    originalPath.startsWith('/static/') ||
    originalPath.startsWith('/assets/')
  ) {
    const cleanPath = originalPath.replace(/^\.?\//, '');
    return publicPath + cleanPath;
  }

  return originalPath;
}

/**
 * 动态加载样式文件
 */
export function loadStyle(href: string, id?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载过
    if (id && document.getElementById(id)) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fixStylePath(href);

    if (id) {
      link.id = id;
    }

    link.onload = () => resolve();
    link.onerror = (error) => {
      console.error(`Failed to load style ${href}:`, error);
      reject(error);
    };

    document.head.appendChild(link);
  });
}

/**
 * 预加载关键样式文件
 */
export function preloadCriticalStyles(): Promise<void[]> {
  const publicPath = getPublicPath();

  const criticalStyles = [
    { href: `${publicPath}assets/inter/inter.css`, id: 'inter-font' },
    {
      href: `${publicPath}assets/inconsolata/inconsolata.css`,
      id: 'inconsolata-font',
    },
    {
      href: `${publicPath}assets/icomoon/icomoonIcons.css`,
      id: 'icomoon-icons',
    },
  ];

  const loadPromises = criticalStyles.map((style) =>
    loadStyle(style.href, style.id).catch((error) => {
      console.warn(`Style ${style.href} failed to load:`, error);
    }),
  );

  return Promise.all(loadPromises);
}

/**
 * 处理webpack模块导入的样式
 */
export function handleWebpackStyleImport(moduleId: string): string {
  if (moduleId.includes('.scss') || moduleId.includes('.css')) {
    return fixStylePath(moduleId);
  }
  return moduleId;
}

/**
 * 处理动态导入的样式模块
 */
export function handleDynamicStyleImport(moduleId: string): string {
  if (moduleId.includes('.scss') || moduleId.includes('.css')) {
    return fixStylePath(moduleId);
  }
  return moduleId;
}

/**
 * 重写webpack的require函数来处理样式模块
 */
export function patchWebpackRequire(): void {
  if (typeof window !== 'undefined' && window.__webpack_require__) {
    const originalRequire = window.__webpack_require__;
    window.__webpack_require__ = function (moduleId: string) {
      const fixedModuleId = handleDynamicStyleImport(moduleId);
      return originalRequire.call(this, fixedModuleId);
    };
  }
}

/**
 * 处理样式标签的动态创建
 */
export function patchStyleElementCreation(): void {
  const originalCreateElement = document.createElement;
  document.createElement = function (
    tagName: string,
    options?: ElementCreationOptions,
  ) {
    const element = originalCreateElement.call(this, tagName, options);

    if (
      tagName.toLowerCase() === 'style' &&
      element instanceof HTMLStyleElement
    ) {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function (name: string, value: string) {
        if (
          name === 'data-href' &&
          value &&
          (value.includes('/assets/') || value.includes('/static/'))
        ) {
          value = fixStylePath(value);
        }
        return originalSetAttribute.call(this, name, value);
      };
    }

    return element;
  };
}

/**
 * 初始化样式加载器 - 增强版本，处理qiankun环境下的SCSS文件加载
 */
export function initStyleLoader(): void {
  // 重写webpack require函数
  patchWebpackRequire();

  // 处理样式元素创建
  patchStyleElementCreation();

  // 监听动态样式加载
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
            const href = node.href;
            if (
              href &&
              (href.includes('/assets/') || href.includes('/static/'))
            ) {
              const fixedHref = fixStylePath(href);
              if (fixedHref !== href) {
                node.href = fixedHref;
              }
            }
          }

          // 处理内联样式
          if (node instanceof HTMLStyleElement) {
            const dataHref = node.getAttribute('data-href');
            if (
              dataHref &&
              (dataHref.includes('/assets/') || dataHref.includes('/static/'))
            ) {
              const fixedHref = fixStylePath(dataHref);
              if (fixedHref !== dataHref) {
                node.setAttribute('data-href', fixedHref);
              }
            }
          }
        });
      }
    });
  });

  observer.observe(document.head, { childList: true, subtree: true });

  // 处理已存在的样式元素
  const existingStyles = document.querySelectorAll(
    'link[rel="stylesheet"], style[data-href]',
  );
  existingStyles.forEach((style) => {
    if (style instanceof HTMLLinkElement) {
      const href = style.href;
      if (href && (href.includes('/assets/') || href.includes('/static/'))) {
        const fixedHref = fixStylePath(href);
        if (fixedHref !== href) {
          style.href = fixedHref;
        }
      }
    } else if (style instanceof HTMLStyleElement) {
      const dataHref = style.getAttribute('data-href');
      if (
        dataHref &&
        (dataHref.includes('/assets/') || dataHref.includes('/static/'))
      ) {
        const fixedHref = fixStylePath(dataHref);
        if (fixedHref !== dataHref) {
          style.setAttribute('data-href', fixedHref);
        }
      }
    }
  });
}
