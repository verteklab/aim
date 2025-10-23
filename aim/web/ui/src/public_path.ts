// @ts-ignore
// 让运行时的资源前缀由 qiankun 注入
if ((window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
} else if ((window as any).externalPublicPath) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = (window as any).externalPublicPath;
}

// 处理动态导入的样式文件
const originalImport = window.__webpack_require__;
if (originalImport) {
  window.__webpack_require__ = function (moduleId: string) {
    const result = originalImport.call(this, moduleId);

    // 如果是样式模块，确保路径正确
    if (
      typeof moduleId === 'string' &&
      (moduleId.includes('.scss') || moduleId.includes('.css'))
    ) {
      // 处理样式模块的路径
      if (moduleId.includes('/assets/') || moduleId.includes('/static/')) {
        const publicPath =
          (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__ ||
          (window as any).externalPublicPath;
        if (publicPath) {
          // const fixedModuleId = publicPath + moduleId.replace(/^\//, '');
          // console.log('Fixed SCSS module path:', moduleId, '->', fixedModuleId);
        }
      }
    }

    return result;
  };
}

// 确保字体文件和样式文件路径正确处理
const originalCreateElement = document.createElement;
document.createElement = function (
  tagName: string,
  options?: ElementCreationOptions,
) {
  const element = originalCreateElement.call(this, tagName, options);

  // 处理link标签（字体文件和样式文件）
  if (tagName.toLowerCase() === 'link' && element instanceof HTMLLinkElement) {
    const originalSetAttribute = element.setAttribute;
    element.setAttribute = function (name: string, value: string) {
      if (
        name === 'href' &&
        (value.includes('/assets/') || value.includes('/static/')) &&
        (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__
      ) {
        // 为字体文件、样式文件等静态资源添加正确的前缀
        value =
          (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__ +
          value.replace(/^\//, '');
      }
      return originalSetAttribute.call(this, name, value);
    };
  }

  // 处理style标签（内联样式）
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
        const publicPath =
          (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__ ||
          (window as any).externalPublicPath;
        if (publicPath) {
          value = publicPath + value.replace(/^\//, '');
        }
      }
      return originalSetAttribute.call(this, name, value);
    };
  }

  return element;
};

// console.log('__webpack_public_path__', __webpack_public_path__);
