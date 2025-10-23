/**
 * 字体加载工具函数，用于在qiankun环境下正确加载字体文件
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
  if (window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__) {
    return window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
  }
  if (window.externalPublicPath) {
    return window.externalPublicPath;
  }
  return '/';
}

/**
 * 修复字体文件路径
 */
export function fixFontPath(originalPath: string): string {
  const publicPath = getPublicPath();

  // 如果是相对路径且在qiankun环境下，添加正确的前缀
  if (originalPath.startsWith('./') || originalPath.startsWith('/assets/')) {
    const cleanPath = originalPath.replace(/^\.?\//, '');
    return publicPath + cleanPath;
  }

  return originalPath;
}

/**
 * 动态加载字体文件
 */
export function loadFont(
  fontFamily: string,
  fontPath: string,
  fontWeight = 'normal',
): Promise<void> {
  return new Promise((resolve, reject) => {
    const font = new FontFace(fontFamily, `url(${fixFontPath(fontPath)})`, {
      weight: fontWeight,
    });

    font
      .load()
      .then((loadedFont) => {
        document.fonts.add(loadedFont);
        resolve();
      })
      .catch((error) => {
        console.error(`Failed to load font ${fontFamily}:`, error);
        reject(error);
      });
  });
}

/**
 * 预加载所有字体文件
 */
export function preloadFonts(): Promise<void[]> {
  const publicPath = getPublicPath();

  const fonts = [
    { family: 'Inter', path: `${publicPath}assets/inter/fonts/Inter.ttf` },
    {
      family: 'Inconsolata',
      path: `${publicPath}assets/inconsolata/fonts/Inconsolata.ttf`,
    },
    {
      family: 'icomoon',
      path: `${publicPath}assets/icomoon/fonts/icomoon.woff`,
    },
  ];

  const loadPromises = fonts.map((font) =>
    loadFont(font.family, font.path).catch((error) => {
      console.warn(`Font ${font.family} failed to load:`, error);
    }),
  );

  return Promise.all(loadPromises);
}
