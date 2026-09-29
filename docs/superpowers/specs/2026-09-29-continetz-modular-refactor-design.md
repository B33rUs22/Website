# Continetz Modular Refactor Design

## Goal

Refactor the existing monolithic `index.html` into maintainable modules while preserving the current Continetz page output, copy, navigation, styling direction, assets, and interactive globe behavior.

## Constraints

- Keep `index.html` as the browser entry point.
- Do not redesign the page or invent new content.
- Preserve existing section IDs, class names, asset paths, accessible labels, and visible text unless a structural change requires a minimal equivalent.
- Keep the project usable without a build tool.
- Use the existing JavaScript responsibilities: content/state handling remains separate from globe behavior.

## Architecture

`index.html` becomes a document shell containing metadata, stylesheet imports, the page mount point, and module scripts. The page sections are represented as HTML partials under `pages/` and loaded into the mount point by a small composition module.

- `pages/header.html`: brand and primary navigation.
- `pages/hero.html`: hero route, headline, supporting text, and proof points.
- `pages/services.html`: service offerings.
- `pages/process.html`: trade process steps.
- `pages/metrics.html`: trade metrics strip.
- `pages/regions.html`: connected regions.
- `pages/sourcing-map.html`: interactive globe and source detail panel.
- `pages/materials.html`: supplier material cards.
- `pages/contact.html`: contact and office information.
- `pages/footer.html`: footer content.
- `assets/js/main.js`: loads partials in order and initializes page behavior after composition.
- `assets/js/content.js`: existing content data and source panel state behavior, retained as the content boundary.
- `assets/js/globe.js`: existing globe rendering and pointer interaction, retained as the globe boundary.

CSS remains split by responsibility under `assets/css/`: reset/base tokens, global layout rules, reusable components, and page-specific composition rules. Existing styles are moved without changing their visual values.

## Data Flow

1. The browser loads `index.html`.
2. `main.js` fetches the ordered HTML partials and inserts them into the page shell.
3. Once all partials are present, `main.js` initializes `content.js` and `globe.js`.
4. The globe continues to update the existing source panel elements by their current IDs.
5. Navigation continues to use the existing hash targets.

Because `fetch()` is used for partial loading, the page should be run through a local static server rather than opened directly with `file://`.

## Compatibility and Validation

- Confirm every existing navigation anchor resolves to a rendered section.
- Confirm the page contains the existing globe canvas and source panel IDs after composition.
- Confirm the page loads without JavaScript syntax errors through a local static server.
- Confirm the source panel and globe interaction continue to work.
- Confirm the original images and fonts remain referenced through their existing paths.

## Out of Scope

- Visual redesign.
- New dependencies or framework migration.
- New business content.
- Rewriting globe rendering or changing the sourcing data model.
