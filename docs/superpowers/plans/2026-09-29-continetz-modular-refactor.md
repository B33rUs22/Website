# Continetz Modular Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Split the existing Continetz page into maintainable HTML, CSS, and JavaScript modules without changing its rendered content or interaction contract.

**Architecture:** Keep `index.html` as the static entry point. `assets/js/main.js` loads ordered HTML partials from `pages/`, then initializes the existing content and globe boundaries. CSS is separated by responsibility while preserving the current selectors and visual values.

**Tech Stack:** Semantic HTML, CSS, browser ES modules, native `fetch`, local static server.

---

### Task 1: Create the page partials

**Files:**
- Create: `pages/header.html`
- Create: `pages/hero.html`
- Create: `pages/services.html`
- Create: `pages/process.html`
- Create: `pages/metrics.html`
- Create: `pages/regions.html`
- Create: `pages/sourcing-map.html`
- Create: `pages/materials.html`
- Create: `pages/contact.html`
- Create: `pages/footer.html`

- [ ] Extract the existing body markup into the listed files in page order.
- [ ] Preserve every existing section ID, class, asset path, accessible label, and visible text.
- [ ] Keep the interactive globe canvas and source panel together in `pages/sourcing-map.html`.

### Task 2: Add the composition entry point

**Files:**
- Modify: `index.html`
- Create: `assets/js/main.js`

- [ ] Replace the monolithic body content with a single `<main id="page-content"></main>` mount point while retaining document metadata and stylesheet imports.
- [ ] Add `<script type="module" src="assets/js/main.js"></script>`.
- [ ] Define the ordered partial list in `main.js`:

```js
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
```

- [ ] Fetch each `pages/<part>.html`, fail with a clear error if any request is not successful, insert the combined markup into `#page-content`, then dynamically load the behavior modules.
- [ ] Load `content.js` and `globe.js` only after the partials exist so their existing DOM queries see the complete page.

### Task 3: Separate CSS responsibilities

**Files:**
- Create or restore: `assets/css/reset.css`
- Create or restore: `assets/css/tokens.css`
- Create or restore: `assets/css/global.css`
- Create or restore: `assets/css/components.css`
- Create or restore: `assets/css/pages.css`
- Modify: `index.html`

- [ ] Keep the existing stylesheet paths where they already exist; add only the page-level stylesheet needed for extracted layout rules.
- [ ] Move rules by responsibility without renaming selectors: reset and box sizing in `reset.css`, variables and type scale in `tokens.css`, document/container rules in `global.css`, reusable blocks in `components.css`, and section-specific rules in `pages.css`.
- [ ] Preserve existing font imports and asset URLs.

### Task 4: Preserve behavior module boundaries

**Files:**
- Create or restore: `assets/js/content.js`
- Create or restore: `assets/js/globe.js`

- [ ] Keep content data and source-panel updates in `content.js`.
- [ ] Keep canvas rendering, pointer/keyboard interaction, and region selection in `globe.js`.
- [ ] Export or expose only the initialization functions needed by `main.js`; do not duplicate page markup in JavaScript.
- [ ] Ensure missing optional assets fail gracefully without preventing the rest of the page from rendering.

### Task 5: Validate the modular page

**Files:**
- Validate: `index.html`, `pages/*.html`, `assets/css/*.css`, `assets/js/*.js`

- [ ] Start a local static server from the project root.
- [ ] Load `index.html` in a browser and verify all partials render in order.
- [ ] Verify the navigation targets `#what-we-do`, `#how`, `#continents`, `#materials`, and `#contact` exist after composition.
- [ ] Verify `#earth-canvas`, `#source-region`, `#source-title`, `#source-description`, and `#source-items` exist after composition.
- [ ] Verify there are no failed partial requests or JavaScript console errors.
- [ ] Verify selecting or dragging the globe still updates the source panel.

---

## Self-review

- Spec coverage: the plan keeps `index.html` as the entry point, separates pages/CSS/JS, preserves current markup and behavior, retains no-build compatibility, and includes browser validation.
- Placeholder scan: no `TODO`, `TBD`, or unspecified implementation steps remain.
- Interface consistency: `main.js` owns sequencing; `content.js` owns source content; `globe.js` owns globe behavior; all modules run after page composition.
