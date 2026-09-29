const pageParts = [
  'header',
  'hero',
  'services',
  'process',
  'metrics',
  'regions',
  'sourcing-map',
  'materials',
  'contact',
  'footer'
];

async function fetchPagePart(part) {
  const path = `pages/${part}.html`;
  let response;

  try {
    response = await fetch(path);
  } catch (error) {
    throw new Error(`Failed to fetch page partial "${path}": ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to load page partial "${path}": ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function initializeBehaviorModule(path, exportNames) {
  const moduleUrl = new URL(path, import.meta.url);

  try {
    const response = await fetch(moduleUrl);

    if (!response.ok) {
      reportBehaviorFailure(path);
      return;
    }

    const module = await import(moduleUrl.href);
    const init = exportNames.find((name) => typeof module[name] === 'function');

    if (init) {
      await module[init]();
      return;
    }

    reportBehaviorFailure(path);
  } catch (error) {
    console.error(`Behavior module failed to initialize: ${path}`, error);
    reportBehaviorFailure(path);
  }
}

function reportBehaviorFailure(path) {
  console.warn(`Behavior module is unavailable: ${path}`);

  const status = document.querySelector('#page-status');

  if (status) {
    status.hidden = false;
    status.textContent = 'Interactive sourcing features are temporarily unavailable.';
  }
}

async function composePage() {
  const parts = await Promise.all(pageParts.map(fetchPagePart));
  const header = document.querySelector('#site-header');
  const content = document.querySelector('#page-content');
  const footer = document.querySelector('#site-footer');

  if (!header || !content || !footer) {
    throw new Error('Page composition mounts are missing from index.html.');
  }

  header.innerHTML = parts[0];
  content.innerHTML = parts.slice(1, -1).join('');
  footer.innerHTML = parts[parts.length - 1];

  await initializeBehaviorModule('./content.js', ['initContent', 'init']);
  await initializeBehaviorModule('./globe.js', ['initGlobe', 'init']);
}

composePage().catch((error) => {
  console.error('Continetz page composition failed:', error);

  const status = document.querySelector('#page-status');

  if (status) {
    status.hidden = false;
    status.textContent = window.location.protocol === 'file:'
      ? 'Open this page through a local server. Run "py -m http.server 4173" in the Continetz folder, then visit http://127.0.0.1:4173/.'
      : 'The page could not be loaded. Please refresh and try again.';
  }
});