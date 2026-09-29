const sourcing = {
  'north-america': { title: 'North America', description: 'Established producers, advanced manufacturing and large-scale agricultural supply across diverse markets.', items: 'Aerospace components · medical devices · grains · timber and paper' },
  'south-america': { title: 'South America', description: 'A rich source of agricultural commodities, natural materials and distinctive food products.', items: 'Coffee · soy and fruit · leather · copper and lithium' },
  europe: { title: 'Europe', description: 'A broad supplier base for precision manufacturing, design-led goods and specialty food products.', items: 'Industrial machinery · specialty chemicals · technical textiles · olive oil and cheese' },
  africa: { title: 'Africa', description: 'Deep reserves of critical minerals and a growing range of agricultural, textile and craft producers.', items: 'Cocoa · cotton · cashew · copper, cobalt and gemstones' },
  asia: { title: 'Asia', description: 'A diverse manufacturing ecosystem spanning components, consumer goods and traditional materials.', items: 'Electronics · apparel and fabrics · ceramics · tea and spices' },
  oceania: { title: 'Oceania', description: 'Known for high-quality agricultural exports, natural fibers and products from unique local ecosystems.', items: 'Wool · dairy · wine · seafood and specialty minerals' },
  antarctica: { title: 'Antarctica', description: 'Antarctica is protected for science and conservation; commercial extraction of its natural resources is not an appropriate sourcing category.', items: 'Research equipment · scientific instruments · expedition supplies' }
};

const regionOrder = ['north-america', 'south-america', 'europe', 'africa', 'asia', 'oceania', 'antarctica'];

function selectRegion(id) {
  const entry = sourcing[id];
  if (!entry) return;

  const idx = regionOrder.indexOf(id);
  const region = document.getElementById('source-region');
  const title = document.getElementById('source-title');
  const description = document.getElementById('source-description');
  const items = document.getElementById('source-items');

  if (region) region.textContent = `REGION ${String(idx + 1).padStart(2, '0')} / 07`;
  if (title) title.textContent = entry.title;
  if (description) description.textContent = entry.description;
  if (items) items.textContent = entry.items;
}

function initContent() {
  selectRegion('europe');
}

export { initContent, selectRegion };
