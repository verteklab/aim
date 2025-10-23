/**
 * SCSS文件加载工具，专门处理qiankun环境下的SCSS文件加载问题
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
function getPublicPath(): string {
  if (window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__) {
    return window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
  }
  if (window.externalPublicPath) {
    return window.externalPublicPath;
  }
  return '/';
}

/**
 * 修复SCSS文件路径
 */
export function fixScssPath(originalPath: string): string {
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
 * 处理webpack模块导入的SCSS文件
 */
export function handleScssModuleImport(moduleId: string): string {
  if (moduleId.includes('.scss') || moduleId.includes('.sass')) {
    return fixScssPath(moduleId);
  }
  return moduleId;
}

/**
 * 重写webpack的require函数来处理SCSS模块
 */
export function patchWebpackForScss(): void {
  if (typeof window !== 'undefined' && window.__webpack_require__) {
    const originalRequire = window.__webpack_require__;
    window.__webpack_require__ = function (moduleId: string) {
      const fixedModuleId = handleScssModuleImport(moduleId);
      return originalRequire.call(this, fixedModuleId);
    };
  }
}

/**
 * 处理样式标签的动态创建，专门针对SCSS文件
 */
export function patchStyleElementForScss(): void {
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
          (value.includes('.scss') || value.includes('.sass'))
        ) {
          value = fixScssPath(value);
        }
        return originalSetAttribute.call(this, name, value);
      };
    }

    return element;
  };
}

/**
 * 监听并修复动态加载的SCSS文件
 */
export function watchForScssFiles(): void {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          // 处理link标签中的SCSS文件
          if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
            const href = node.href;
            if (href && (href.includes('.scss') || href.includes('.sass'))) {
              const fixedHref = fixScssPath(href);
              if (fixedHref !== href) {
                node.href = fixedHref;
                // console.log('Fixed SCSS link:', href, '->', fixedHref);
              }
            }
          }

          // 处理style标签中的SCSS文件
          if (node instanceof HTMLStyleElement) {
            const dataHref = node.getAttribute('data-href');
            if (
              dataHref &&
              (dataHref.includes('.scss') || dataHref.includes('.sass'))
            ) {
              const fixedHref = fixScssPath(dataHref);
              if (fixedHref !== dataHref) {
                node.setAttribute('data-href', fixedHref);
                // console.log('Fixed SCSS style:', dataHref, '->', fixedHref);
              }
            }
          }
        });
      }
    });
  });

  observer.observe(document.head, { childList: true, subtree: true });

  // 处理已存在的SCSS文件
  const existingStyles = document.querySelectorAll(
    'link[rel="stylesheet"], style[data-href]',
  );
  existingStyles.forEach((style) => {
    if (style instanceof HTMLLinkElement) {
      const href = style.href;
      if (href && (href.includes('.scss') || href.includes('.sass'))) {
        const fixedHref = fixScssPath(href);
        if (fixedHref !== href) {
          style.href = fixedHref;
          // console.log('Fixed existing SCSS link:', href, '->', fixedHref);
        }
      }
    } else if (style instanceof HTMLStyleElement) {
      const dataHref = style.getAttribute('data-href');
      if (
        dataHref &&
        (dataHref.includes('.scss') || dataHref.includes('.sass'))
      ) {
        const fixedHref = fixScssPath(dataHref);
        if (fixedHref !== dataHref) {
          style.setAttribute('data-href', fixedHref);
          // console.log('Fixed existing SCSS style:', dataHref, '->', fixedHref);
        }
      }
    }
  });
}

/**
 * 初始化SCSS加载器
 */
export function initScssLoader(): void {
  // console.log('Initializing SCSS loader for qiankun environment...');

  // 重写webpack require函数
  patchWebpackForScss();

  // 处理样式元素创建
  patchStyleElementForScss();

  // 监听动态加载的SCSS文件
  watchForScssFiles();

  // console.log('SCSS loader initialized successfully');
}
