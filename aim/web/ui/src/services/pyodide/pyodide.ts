import { getBasePath } from 'config/config';

import { search } from 'pages/Board/search';

import pyodideEngine from './store';

declare const __webpack_public_path__: string | undefined;

// @ts-ignore
window.search = search;

let layoutUpdateTimer: number;
let prevBoardId: undefined | string;

// @ts-ignore
window.updateLayout = (elements: any, boardId: undefined | string) => {
  let layout = toObject(elements.toJs());
  elements.destroy();

  let blocks: Record<string, any[]> = {};
  let components: Record<string, any[]> = {};

  for (let item of layout) {
    let boardId = item.board_id;
    if (!blocks.hasOwnProperty(boardId)) {
      blocks[boardId] = [];
      components[boardId] = [];
    }
    if (item.element === 'block') {
      blocks[boardId].push(item);
    } else {
      components[boardId].push(item);
    }
  }

  if (prevBoardId === boardId) {
    window.clearTimeout(layoutUpdateTimer);
  }

  prevBoardId = boardId;

  layoutUpdateTimer = window.setTimeout(() => {
    pyodideEngine.events.fire(
      boardId as string,
      { blocks, components },
      { savePayload: false },
    );
  }, 50);
};

// @ts-ignore
window.setState = (update: any, boardId: undefined | string) => {
  let stateUpdate = update.toJs();
  update.destroy();
  let state = toObject(stateUpdate);

  pyodideEngine.events.fire(
    boardId as string,
    {
      state: state[boardId as string],
    },
    { savePayload: false },
  );
};

const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full';

const scriptPromises = new Map<string, Promise<void>>();

function normalizeBase(url: string): string {
  if (!url) {
    return '';
  }
  return url.replace(/\/+$/, '');
}

function joinUrl(base: string, path: string): string {
  const normalizedBase = normalizeBase(base);
  const normalizedPath = path.replace(/^\/+/, '');

  if (!normalizedPath) {
    return normalizedBase || '/';
  }

  if (!normalizedBase) {
    return `/${normalizedPath}`;
  }

  return `${normalizedBase}/${normalizedPath}`;
}

function expandWithStaticVariants(base: string, resource: string): string[] {
  const normalizedBase = normalizeBase(base);
  const variants = new Set<string>();

  variants.add(joinUrl(normalizedBase, resource));

  if (!normalizedBase.endsWith('/static-files')) {
    variants.add(joinUrl(normalizedBase, `static-files/${resource}`));
  }

  return Array.from(variants);
}

function collectStaticAssetBases(): string[] {
  const globalScope = window as any;
  const bases: Array<string | undefined | null> = [];

  const runtimePublicPath =
    (typeof __webpack_public_path__ === 'string' && __webpack_public_path__) ||
    globalScope.__webpack_public_path__;

  if (runtimePublicPath) {
    bases.push(runtimePublicPath);
  }

  if (
    globalScope.__POWERED_BY_QIANKUN__ &&
    globalScope.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
  ) {
    bases.push(globalScope.__INJECTED_PUBLIC_PATH_BY_QIANKUN__);
  }

  if (process.env.PUBLIC_URL) {
    bases.push(process.env.PUBLIC_URL as string);
  }

  const basePath = getBasePath(false);
  if (basePath && basePath !== 'undefined') {
    bases.push(basePath);
  }

  bases.push('');

  const normalized = bases
    .filter((item) => item !== null && item !== undefined)
    .map((item) => String(item))
    .filter((item) => item !== 'undefined' && item !== 'null')
    .map((item) => normalizeBase(item));

  return Array.from(new Set(normalized));
}

function collectCandidateBases(): string[] {
  const globalScope = window as any;
  const candidateSet = new Set<string>();

  // 优先使用CDN，避免本地文件不存在的问题
  candidateSet.add(PYODIDE_CDN_URL);

  if (globalScope.__AIM_PYODIDE_BASE_URL__) {
    candidateSet.add(normalizeBase(globalScope.__AIM_PYODIDE_BASE_URL__));
  }

  if (process.env.REACT_APP_PYODIDE_BASE_URL) {
    candidateSet.add(
      normalizeBase(process.env.REACT_APP_PYODIDE_BASE_URL as string),
    );
  }

  const staticBases = collectStaticAssetBases();
  staticBases.forEach((base) => {
    expandWithStaticVariants(base, 'pyodide').forEach((candidate) => {
      candidateSet.add(normalizeBase(candidate));
    });
  });

  return Array.from(candidateSet);
}

function ensurePyodideScript(srcBase: string): Promise<void> {
  const normalizedBase = normalizeBase(srcBase);
  const scriptSrc = `${normalizedBase}/pyodide.js`;

  if (
    (window as any).loadPyodide &&
    document.querySelector(`script[data-pyodide-src="${scriptSrc}"]`)
  ) {
    return Promise.resolve();
  }

  if (scriptPromises.has(scriptSrc)) {
    return scriptPromises.get(scriptSrc)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.dataset.pyodideSrc = scriptSrc;
    script.onload = () => {
      console.log(`Pyodide script loaded successfully from ${scriptSrc}`);
      resolve();
    };
    script.onerror = (event) => {
      console.error(`Failed to load Pyodide script from ${scriptSrc}:`, event);
      script.remove();
      scriptPromises.delete(scriptSrc);
      reject(new Error(`Failed to load Pyodide script from ${scriptSrc}`));
    };
    document.head.appendChild(script);
  });

  scriptPromises.set(scriptSrc, promise);
  return promise;
}

async function attemptLoadPyodideFrom(baseUrl: string) {
  const normalizedBase = normalizeBase(baseUrl);
  await ensurePyodideScript(normalizedBase);

  const loadFn = (window as any).loadPyodide;
  if (typeof loadFn !== 'function') {
    throw new Error('window.loadPyodide is not available after script load');
  }

  return loadFn({
    indexURL: normalizedBase,
    stdout: (...args: any[]) => {
      window.requestAnimationFrame(() => {
        const terminal = document.getElementById('console');
        if (terminal) {
          terminal.innerHTML! += `<p>${args.join(', ')}</p>`;
          terminal.scrollTop = terminal.scrollHeight;
        } else {
          console.log(...args);
        }
      });
    },
    stderr: (...args: any[]) => {
      console.log(...args);
    },
  });
}

export async function loadPyodideInstance() {
  pyodideEngine.setPyodide({
    current: null,
    namespace: null,
    isLoading: true,
  });

  const candidates = collectCandidateBases();
  let lastError: unknown;
  let pyodide: any = null;

  for (const base of candidates) {
    try {
      pyodide = await attemptLoadPyodideFrom(base);
      break;
    } catch (error) {
      lastError = { base, error };
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[Pyodide] failed to load from', base, error);
      }
    }
  }

  if (!pyodide) {
    pyodideEngine.setPyodide({
      current: null,
      namespace: null,
      isLoading: false,
    });
    console.warn(
      '[Pyodide] unable to load from any source, continuing without Python support',
      lastError,
    );
    // 不返回，继续执行，让应用在没有Python支持的情况下运行
    return;
  }

  const namespace = pyodide.toPy({});

  const globalScope = window as any;
  const configuredBases: string[] = [];
  if (globalScope.__AIM_PYODIDE_BASE_URL__) {
    configuredBases.push(globalScope.__AIM_PYODIDE_BASE_URL__);
  }
  if (process.env.REACT_APP_PYODIDE_BASE_URL) {
    configuredBases.push(process.env.REACT_APP_PYODIDE_BASE_URL as string);
  }

  const staticBases = collectStaticAssetBases();
  const aimCoreCandidates = new Set<string>();
  [...configuredBases, ...staticBases].forEach((base) => {
    expandWithStaticVariants(base, 'aim_ui_core.py').forEach((candidate) => {
      aimCoreCandidates.add(candidate);
    });
  });

  let mockText: string | null = null;
  for (const candidate of aimCoreCandidates) {
    try {
      const response = await fetch(candidate);
      if (response.ok) {
        mockText = await response.text();
        break;
      }
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        // eslint-disable-next-line no-console
        console.warn(
          '[Pyodide] failed to fetch aim_ui_core.py from',
          candidate,
        );
      }
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        // eslint-disable-next-line no-console
        console.warn(
          '[Pyodide] error while fetching aim_ui_core.py from',
          candidate,
          error,
        );
      }
    }
  }

  if (!mockText) {
    throw new Error('[Pyodide] could not fetch aim_ui_core.py from any base');
  }

  await pyodide.runPythonAsync(mockText, { globals: namespace });

  pyodideEngine.setPyodide({
    current: pyodide,
    namespace,
    isLoading: false,
  });
}

export async function loadPandas() {
  const pyodide = pyodideEngine.getPyodideCurrent();
  await pyodide.loadPackage('pandas');
}

export async function loadPlotly() {
  const pyodide = pyodideEngine.getPyodideCurrent();
  await pyodide.loadPackage('micropip');
  try {
    const micropip = pyodide.pyimport('micropip');
    await micropip.install('plotly');
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log(ex);
  }
}

// @ts-ignore
window.pyodideEngine = pyodideEngine;

const toObjectDict = {
  [Map.name]: (x: Map<any, any>) =>
    Object.fromEntries(Array.from(x.entries(), ([k, v]) => [k, toObject(v)])),
  [Array.name]: (x: Array<any>) => x.map(toObject),
};
function toObject(x: any): any {
  const cb = toObjectDict[x?.constructor.name];
  if (cb) {
    return cb(x);
  }
  return x;
}
