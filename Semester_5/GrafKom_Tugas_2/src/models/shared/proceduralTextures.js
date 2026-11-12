// Canvas-drawn textures for details where a photo crop would not tile cleanly.
// Colours are sampled by eye from the reference photos. Every texture repeats without a
// visible seam, so materials can tile it by real-world size (see `tileSize`).
import { seededRandom } from './parts.js';

function createCanvas(width, height = width) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

// Tileable fractal value noise in [0, 1]: random values on a lattice that wraps around,
// smoothly interpolated, summed over a few octaves.
function tileableNoise(seed, baseCells, octaves = 4) {
  const random = seededRandom(seed);
  const layers = [];
  for (let o = 0; o < octaves; o += 1) {
    const cells = baseCells << o;
    layers.push({ cells, values: Float32Array.from({ length: cells * cells }, random), weight: 0.5 ** o });
  }
  const total = layers.reduce((sum, layer) => sum + layer.weight, 0);
  const smooth = (t) => t * t * (3 - 2 * t);
  return (u, v) => {
    let sum = 0;
    for (const { cells, values, weight } of layers) {
      const x = u * cells;
      const y = v * cells;
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const fx = smooth(x - x0);
      const fy = smooth(y - y0);
      const at = (i, j) => values[((j % cells) + cells) % cells * cells + (((i % cells) + cells) % cells)];
      const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
      const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
      sum += (top + (bottom - top) * fy) * weight;
    }
    return sum / total;
  };
}

// Fills a canvas pixel by pixel; `shade(u, v)` returns [r, g, b] in 0..255.
function paint(size, shade, height = size) {
  const canvas = createCanvas(size, height);
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const [r, g, b] = shade(x / size, y / height);
      const i = (y * size + x) * 4;
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

const clamp255 = (value) => Math.max(0, Math.min(255, value));

// Painted render: near-white with faint blotches and fine grain, so large walls are not flat.
export function plasterTexture() {
  const blotch = tileableNoise(11, 4, 4);
  const grain = tileableNoise(12, 64, 2);
  return paint(256, (u, v) => {
    const value = 238 + (blotch(u, v) - 0.5) * 16 + (grain(u, v) - 0.5) * 10;
    return [clamp255(value), clamp255(value), clamp255(value - 3)];
  });
}

// Plinth: white render with grey-green rain and soil stains rising from the bottom edge,
// as on the planter base in eksterior-fasad-serong-*. Canvas top = top of the plinth.
export function plinthTexture() {
  const streaks = tileableNoise(21, 16, 3);
  const blotch = tileableNoise(22, 4, 3);
  return paint(512, (u, v) => {
    const fromBottom = 1 - v;
    const stain = Math.max(0, 1 - fromBottom * (1.2 + streaks(u, 0.5) * 1.6)) * (0.55 + blotch(u, v) * 0.6);
    const base = 236 + (blotch(u, v) - 0.5) * 14;
    return [clamp255(base - stain * 95), clamp255(base - stain * 85), clamp255(base - stain * 95)];
  }, 128);
}

// Cast concrete of the canopy frame: grey with mottling and pores.
export function concreteTexture() {
  const mottling = tileableNoise(31, 6, 4);
  const pores = tileableNoise(32, 96, 1);
  return paint(256, (u, v) => {
    const value = 214 + (mottling(u, v) - 0.5) * 34 - (pores(u, v) > 0.82 ? 30 : 0);
    return [clamp255(value), clamp255(value), clamp255(value - 4)];
  });
}

// Artificial turf on the planter strip: dense dark green blades.
export function turfTexture() {
  const blades = tileableNoise(41, 128, 1);
  const patches = tileableNoise(42, 8, 3);
  return paint(256, (u, v) => {
    const n = blades(u, v) * 0.7 + patches(u, v) * 0.3;
    return [clamp255(34 + n * 40), clamp255(70 + n * 60), clamp255(30 + n * 30)];
  });
}

// White pebbles along the wall behind the turf.
export function pebbleTexture() {
  const canvas = createCanvas(256);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#9a9890';
  ctx.fillRect(0, 0, 256, 256);
  const random = seededRandom(51);
  for (let i = 0; i < 900; i += 1) {
    const x = random() * 256;
    const y = random() * 256;
    const r = 2 + random() * 4;
    const tone = 205 + random() * 45;
    ctx.fillStyle = `rgb(${tone} ${tone} ${tone - 6})`;
    for (const [dx, dy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
      ctx.beginPath();
      ctx.ellipse(x + dx, y + dy, r, r * 0.8, random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return canvas;
}

// Metal strip ceiling of the canopy (eksterior-kanopi-depan): dark strips with light seams.
// The strips run along the canvas height, i.e. across the canopy from one column to the other.
export function ceilingSlatTexture() {
  const canvas = createCanvas(256);
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < 8; i += 1) {
    const x = i * 32;
    const strip = ctx.createLinearGradient(x, 0, x + 32, 0);
    strip.addColorStop(0, '#4a4644');
    strip.addColorStop(0.5, '#33302e');
    strip.addColorStop(1, '#262422');
    ctx.fillStyle = strip;
    ctx.fillRect(x, 0, 32, 256);
    ctx.fillStyle = '#6b6662';
    ctx.fillRect(x, 0, 2, 256);
  }
  return canvas;
}

// Clay roof tiles, 4 × 4 per texture: each tile is shaded across its width so it reads as a
// curved tile, has a dark overlap shadow along its lower edge, and some weathering. The
// renderer also uses brightness as a bump height, which gives the rows relief.
export function roofTileTexture() {
  const weather = tileableNoise(61, 4, 4);
  const random = seededRandom(62);
  const tints = Array.from({ length: 16 }, () => (random() - 0.5) * 28);
  return paint(256, (u, v) => {
    const col = Math.floor(u * 4);
    const row = Math.floor(v * 4);
    const across = u * 4 - col;
    const down = v * 4 - row;
    const curve = Math.sin(across * Math.PI);
    const overlap = down > 0.88 ? 0.45 : 1 - (1 - down) * 0.12;
    const tint = tints[(row * 4 + col) % 16];
    const dirt = (weather(u, v) - 0.5) * 40;
    const shade = (0.62 + curve * 0.45) * overlap;
    return [clamp255((196 + tint + dirt) * shade), clamp255((96 + tint * 0.5 + dirt) * shade), clamp255((58 + dirt * 0.6) * shade)];
  });
}

// Ground-floor window block: 2 columns × 3 rows of identical panes, each with the grille of
// the top row in eksterior-fasad-serong-kanan. Drawn rather than cropped so every line is
// straight; the tile is cut at mullion centres so it repeats without seams. Lines are in
// pane-relative units (0..1): horizontal [y, x0, x1] and vertical [x, y0, y1].
const GRILLE = {
  h: [[0.15, 0, 1], [0.32, 0.1, 0.9], [0.49, 0.2, 0.45], [0.49, 0.55, 0.8], [0.67, 0.1, 0.9], [0.845, 0, 1]],
  v: [
    [0.1, 0, 1], [0.9, 0, 1],
    [0.5, 0, 0.32], [0.5, 0.67, 1],
    [0.2, 0.32, 0.67], [0.45, 0.32, 0.67], [0.55, 0.32, 0.67], [0.8, 0.32, 0.67],
  ],
};

function drawGrille(ctx, x, y, w, h, pattern) {
  ctx.strokeStyle = '#d7dbdc';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (const [ly, x0, x1] of pattern.h) {
    ctx.moveTo(x + x0 * w, y + ly * h);
    ctx.lineTo(x + x1 * w, y + ly * h);
  }
  for (const [lx, y0, y1] of pattern.v) {
    ctx.moveTo(x + lx * w, y + y0 * h);
    ctx.lineTo(x + lx * w, y + y1 * h);
  }
  ctx.stroke();
}

export function windowGrilleTexture() {
  const width = 448;
  const height = 512;
  const frame = 22;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#eceeee';
  ctx.fillRect(0, 0, width, height);

  const columnWidth = width / 2;
  const rowHeight = height / 3;
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 2; col += 1) {
      // Every pane uses the same plain frame as the top row in the photo.
      const x = col * columnWidth + frame / 2;
      const y = row * rowHeight + frame / 2;
      const w = columnWidth - frame;
      const h = rowHeight - frame;
      const glass = ctx.createLinearGradient(0, y, 0, y + h);
      glass.addColorStop(0, '#323a3f');
      glass.addColorStop(1, '#1b2023');
      ctx.fillStyle = glass;
      ctx.fillRect(x, y, w, h);
      drawGrille(ctx, x, y, w, h, GRILLE);
    }
  }
  return canvas;
}

// Dark walnut-look vinyl planks for the interior floor (interior-lorong-ruang-kerja): four
// planks across the canvas height, running along the width, with staggered end joints.
// The colours were picked by eye from the photo, not measured.
export function woodFloorTexture() {
  const width = 512;
  const height = 256;
  const grain = tileableNoise(31, 8, 3);
  const fine = tileableNoise(32, 48, 2);
  const planks = 4;
  return paint(width, (u, v) => {
    const row = Math.floor(v * planks);
    const along = (u + row * 0.37) % 1; // each row is shifted so the joints do not line up
    const tone = 0.5 + (fine(along * 0.5, v * 4) - 0.5) * 0.9 + (grain(u, v) - 0.5) * 0.5;
    const seamV = Math.abs((v * planks) % 1 - 0.5) > 0.465;
    const seamU = along < 0.006 || along > 0.994;
    const shade = seamV || seamU ? 0.55 : 0.85 + tone * 0.3;
    return [clamp255(96 * shade), clamp255(62 * shade), clamp255(42 * shade)];
  }, height);
}
