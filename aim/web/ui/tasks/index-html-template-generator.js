const fs = require('fs').promises;

const buildDirectoryPath = `${__dirname}/../build/`;
const staticFilesKey = '/static/';
const basePathKey = `{{ base_path }}${staticFilesKey}`;

(async () => {
  const HTML = await fs.readFile(`${buildDirectoryPath}index.html`, 'utf8');
  // Replace /static/ paths with template variable for dynamic base path support
  const replacedHTML = HTML.replaceAll(staticFilesKey, basePathKey);
  // Also replace /vs/ (Monaco Editor) and /assets/ if present
  const replacedHTML2 = replacedHTML
    .replaceAll('/vs/', `{{ base_path }}/vs/`)
    .replaceAll('/assets/', `{{ base_path }}/assets/`);

  await fs.writeFile(`${buildDirectoryPath}index-template.html`, replacedHTML2);

  console.log('index-template.html file is generated');
})();
