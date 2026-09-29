import { selectRegion } from './content.js';

function initGlobe() {
  const globe = document.querySelector('.globe');
  const canvas = document.getElementById('earth-canvas');
  const texture = document.getElementById('earth-map');

  if (!globe || !canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const regions = [
    { id: 'north-america', label: 'North America', lat: 40, lon: -100 },
    { id: 'south-america', label: 'South America', lat: -15, lon: -60 },
    { id: 'europe', label: 'Europe', lat: 51, lon: 15 },
    { id: 'africa', label: 'Africa', lat: 0, lon: 20 },
    { id: 'asia', label: 'Asia', lat: 35, lon: 100 },
    { id: 'oceania', label: 'Oceania', lat: -25, lon: 135 },
    { id: 'antarctica', label: 'Antarctica', lat: -82, lon: 0 }
  ];

  let yaw = 0;
  let pitch = 0;
  let dragging = false;
  let dragged = false;
  let lastX = 0;
  let lastY = 0;
  let activePointer = null;
  let sphereRadius = 0;
  let pixelRatio = 1;
  let markerHits = [];
  let mapPixels = null;

  function resizeGlobe() {
    const box = globe.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(box.width * pixelRatio);
    canvas.height = Math.round(box.height * pixelRatio);
    sphereRadius = Math.min(canvas.width, canvas.height) / 2;
    drawGlobe();
  }

  function project(latDeg, lonDeg) {
    const lat = latDeg * Math.PI / 180;
    const lon = lonDeg * Math.PI / 180 + yaw;
    const x = Math.cos(lat) * Math.sin(lon);
    const y = Math.sin(lat);
    const z = Math.cos(lat) * Math.cos(lon);
    const py = y * Math.cos(pitch) - z * Math.sin(pitch);
    const pz = y * Math.sin(pitch) + z * Math.cos(pitch);
    return { x: x * sphereRadius, y: -py * sphereRadius, z: pz, visible: pz > 0.015 };
  }

  function drawGlobe() {
    if (!ctx || !sphereRadius) return;

    const w = canvas.width;
    const h = canvas.height;
    const r = sphereRadius;
    const cx = w / 2;
    const cy = h / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const pixels = ctx.createImageData(w, h);
    const data = pixels.data;
    const seaLevel = new Uint8ClampedArray([195, 195, 195]);

    for (let py = Math.max(0, Math.floor(cy - r)); py < Math.min(h, Math.ceil(cy + r)); py++) {
      const ny = -(py + 0.5 - cy) / r;
      for (let px = Math.max(0, Math.floor(cx - r)); px < Math.min(w, Math.ceil(cx + r)); px++) {
        const nx = (px + 0.5 - cx) / r;
        const rr = nx * nx + ny * ny;
        if (rr > 1) continue;
        const nz = Math.sqrt(1 - rr);
        let gray = seaLevel[0];

        if (mapPixels && texture) {
          const yy = ny * Math.cos(pitch) + nz * Math.sin(pitch);
          const zz = nz * Math.cos(pitch) - ny * Math.sin(pitch);
          const lon = Math.atan2(nx, zz) - yaw;
          const lat = Math.asin(Math.max(-1, Math.min(1, yy)));
          const u = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1;
          const v = Math.max(0, Math.min(0.999999, 0.5 - lat / Math.PI));
          const ix = Math.min(texture.naturalWidth - 1, Math.floor(u * texture.naturalWidth));
          const iy = Math.floor(v * texture.naturalHeight);
          const p = (iy * texture.naturalWidth + ix) * 4;
          gray = Math.round(.299 * mapPixels[p] + .587 * mapPixels[p + 1] + .114 * mapPixels[p + 2]);
        }

        const light = Math.max(.35, Math.min(1, .60 + .40 * nz));
        const edgeShade = Math.max(.48, 1 - Math.pow(1 - nz, 1.4) * .52);
        const value = Math.round(gray * light * edgeShade);
        const i = (py * w + px) * 4;
        data[i] = data[i + 1] = data[i + 2] = value;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(pixels, 0, 0);
    // A soft monochrome rim and a subtle lit edge keep the actual sphere clearly defined.
    const rim = ctx.createRadialGradient(cx - r * .32, cy - r * .38, r * .58, cx, cy, r * 1.02);
    rim.addColorStop(0, 'rgba(255,255,255,0)');
    rim.addColorStop(.82, 'rgba(0,0,0,0)');
    rim.addColorStop(1, 'rgba(0,0,0,.24)');
    ctx.beginPath();
    ctx.arc(cx, cy, r - .5, 0, Math.PI * 2);
    ctx.fillStyle = rim;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.30)';
    ctx.lineWidth = Math.max(1, pixelRatio);
    ctx.stroke();

    markerHits = [];
    regions.forEach((region) => {
      const pt = project(region.lat, region.lon);
      if (!pt.visible) return;
      const mx = cx + pt.x;
      const my = cy + pt.y;
      const rad = Math.max(5, Math.round(r * .024));
      markerHits.push({ x: mx, y: my, radius: Math.max(17 * pixelRatio, rad * 2.5), region });
      ctx.beginPath();
      ctx.arc(mx, my, rad + 3 * pixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, my, rad, 0, Math.PI * 2);
      ctx.fillStyle = '#111';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, my, rad * .4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });
  }

  function loadMapPixels() {
    if (!texture || !texture.complete || !texture.naturalWidth) return;
    const off = document.createElement('canvas');
    off.width = texture.naturalWidth;
    off.height = texture.naturalHeight;
    const offCtx = off.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;
    offCtx.drawImage(texture, 0, 0);
    mapPixels = offCtx.getImageData(0, 0, off.width, off.height).data;
    drawGlobe();
  }

  if (texture) {
    texture.addEventListener('load', loadMapPixels);
    if (texture.complete) loadMapPixels();
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resizeGlobe).observe(globe);
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * pixelRatio, y: (event.clientY - rect.top) * pixelRatio };
  }

  function stopRotation() {
    if (!dragging) return;
    dragging = false;
    activePointer = null;
    globe.classList.remove('is-dragging');
  }

  globe.addEventListener('pointermove', (event) => {
    if (dragging) return;
    const pos = pointerPosition(event);
    const overMarker = markerHits.some((marker) => Math.hypot(pos.x - marker.x, pos.y - marker.y) < marker.radius);
    canvas.classList.toggle('is-marker-hover', overMarker);
  });
  globe.addEventListener('pointerleave', () => canvas.classList.remove('is-marker-hover'));
  globe.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    dragged = false;
    activePointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    globe.classList.add('is-dragging');
    globe.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  globe.addEventListener('pointermove', (event) => {
    if (!dragging || event.pointerId !== activePointer) return;
    if (event.pointerType === 'mouse' && (event.buttons & 1) !== 1) {
      stopRotation();
      return;
    }
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 1) dragged = true;
    yaw += dx / (2 * sphereRadius / pixelRatio) * 2.2;
    pitch = Math.max(-1.25, Math.min(1.25, pitch + dy / (2 * sphereRadius / pixelRatio) * 2.0));
    drawGlobe();
    event.preventDefault();
  });

  function finishPointer(event) {
    if (!dragging || event.pointerId !== activePointer) return;
    const wasDrag = dragged;
    const pos = pointerPosition(event);
    stopRotation();
    if (!wasDrag) {
      const hit = markerHits.slice().reverse().find((marker) => Math.hypot(pos.x - marker.x, pos.y - marker.y) < marker.radius);
      if (hit) selectRegion(hit.region.id);
    }
  }

  globe.addEventListener('pointerup', finishPointer);
  globe.addEventListener('pointercancel', stopRotation);
  globe.addEventListener('lostpointercapture', stopRotation);
  window.addEventListener('blur', stopRotation);
  canvas.addEventListener('keydown', (event) => {
    const regionIndex = Number(event.key) - 1;

    if (regionIndex >= 0 && regionIndex < regions.length) {
      selectRegion(regions[regionIndex].id);
      event.preventDefault();
      return;
    }

    const step = .12;
    if (event.key === 'ArrowLeft') yaw -= step;
    else if (event.key === 'ArrowRight') yaw += step;
    else if (event.key === 'ArrowUp') pitch = Math.max(-1.25, pitch - step);
    else if (event.key === 'ArrowDown') pitch = Math.min(1.25, pitch + step);
    else return;
    event.preventDefault();
    drawGlobe();
  });

  resizeGlobe();
}

export { initGlobe };
