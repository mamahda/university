import { compose, identity, invert, multiply, normalize, subtract } from './mat4.js';

// Mouse picking without touching the renderer: a ray from the camera through the clicked
// pixel is tested against the world-space bounding box of every mesh in each target subtree
// (the exhibits); the nearest mesh hit decides the target. Boxes are rebuilt per click, so
// moving parts such as the robot arm are always current.

const localBoundsCache = new WeakMap();

function localBounds(geometry) {
  let box = localBoundsCache.get(geometry);
  if (box) return box;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  const p = geometry.positions;
  for (let i = 0; i < p.length; i += 3) {
    for (let k = 0; k < 3; k += 1) {
      min[k] = Math.min(min[k], p[i + k]);
      max[k] = Math.max(max[k], p[i + k]);
    }
  }
  box = { min, max };
  localBoundsCache.set(geometry, box);
  return box;
}

// World-space box around a mesh: the 8 corners of its local box placed by its world matrix.
function meshWorldBounds(geometry, world) {
  const box = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  const { min, max } = localBounds(geometry);
  for (let c = 0; c < 8; c += 1) {
    const x = c & 1 ? max[0] : min[0];
    const y = c & 2 ? max[1] : min[1];
    const z = c & 4 ? max[2] : min[2];
    const w = [
      world[0] * x + world[4] * y + world[8] * z + world[12],
      world[1] * x + world[5] * y + world[9] * z + world[13],
      world[2] * x + world[6] * y + world[10] * z + world[14],
    ];
    for (let k = 0; k < 3; k += 1) {
      box.min[k] = Math.min(box.min[k], w[k]);
      box.max[k] = Math.max(box.max[k], w[k]);
    }
  }
  return box;
}

// Nearest ray distance to any mesh of a subtree; world matrix = parent world × local, as in the renderer.
function nearestMeshHit(node, parentWorld, ray) {
  if (node.visible === false) return null;
  const world = multiply(parentWorld, compose(node.position, node.rotation, node.scale));
  let best = node.mesh ? rayHitsBox(ray, meshWorldBounds(node.mesh.geometry, world)) : null;
  for (const child of node.children) {
    const t = nearestMeshHit(child, world, ray);
    if (t !== null && (best === null || t < best)) best = t;
  }
  return best;
}

function unproject(inverse, x, y, z) {
  const v = [x, y, z, 1];
  const r = [0, 0, 0, 0];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) r[row] += inverse[col * 4 + row] * v[col];
  }
  return [r[0] / r[3], r[1] / r[3], r[2] / r[3]];
}

// Ray through normalised device coordinates (x, y in −1…1, y up).
export function screenRay(ndcX, ndcY, { projection, view }) {
  const inverse = invert(multiply(projection, view));
  const near = unproject(inverse, ndcX, ndcY, -1);
  const far = unproject(inverse, ndcX, ndcY, 1);
  return { origin: near, direction: normalize(subtract(far, near)) };
}

// Slab test: distance along the ray to the box, or null when it misses.
export function rayHitsBox({ origin, direction }, { min, max }) {
  let near = -Infinity;
  let far = Infinity;
  for (let k = 0; k < 3; k += 1) {
    if (Math.abs(direction[k]) < 1e-9) {
      if (origin[k] < min[k] || origin[k] > max[k]) return null;
      continue;
    }
    const t1 = (min[k] - origin[k]) / direction[k];
    const t2 = (max[k] - origin[k]) / direction[k];
    near = Math.max(near, Math.min(t1, t2));
    far = Math.min(far, Math.max(t1, t2));
  }
  if (near > far || far < 0) return null;
  return Math.max(near, 0);
}

// targets: [{ key, root }] whose roots sit under `parentWorld`. Returns the nearest key hit, or null.
export function pickTarget(targets, ray, parentWorld = identity()) {
  let best = null;
  for (const { key, root } of targets) {
    const t = nearestMeshHit(root, parentWorld, ray);
    if (t !== null && (!best || t < best.t)) best = { key, t };
  }
  return best?.key ?? null;
}

// World box around a whole subtree (union of its mesh boxes).
function subtreeBounds(node, parentWorld, box = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }) {
  if (node.visible === false) return box;
  const world = multiply(parentWorld, compose(node.position, node.rotation, node.scale));
  if (node.mesh) {
    const mesh = meshWorldBounds(node.mesh.geometry, world);
    for (let k = 0; k < 3; k += 1) {
      box.min[k] = Math.min(box.min[k], mesh.min[k]);
      box.max[k] = Math.max(box.max[k], mesh.max[k]);
    }
  }
  for (const child of node.children) subtreeBounds(child, world, box);
  return box;
}

// Screen rectangle (canvas pixels, origin top-left) covered by a subtree, clipped to the canvas,
// or null when it is entirely behind the camera. Used to place the popup beside the object.
export function screenRect(root, parentWorld, { projection, view }, width, height) {
  const { min, max } = subtreeBounds(root, parentWorld);
  if (!Number.isFinite(min[0])) return null;
  const clip = multiply(projection, view);
  let left = Infinity; let top = Infinity; let right = -Infinity; let bottom = -Infinity;
  for (let c = 0; c < 8; c += 1) {
    const p = [c & 1 ? max[0] : min[0], c & 2 ? max[1] : min[1], c & 4 ? max[2] : min[2]];
    const x = clip[0] * p[0] + clip[4] * p[1] + clip[8] * p[2] + clip[12];
    const y = clip[1] * p[0] + clip[5] * p[1] + clip[9] * p[2] + clip[13];
    const w = clip[3] * p[0] + clip[7] * p[1] + clip[11] * p[2] + clip[15];
    if (w <= 0.01) { // a corner behind the camera: the object reaches past the screen edge
      left = 0; top = 0; right = width; bottom = height;
      break;
    }
    const sx = ((x / w + 1) / 2) * width;
    const sy = ((1 - y / w) / 2) * height;
    left = Math.min(left, sx); right = Math.max(right, sx);
    top = Math.min(top, sy); bottom = Math.max(bottom, sy);
  }
  left = Math.max(0, left); top = Math.max(0, top);
  right = Math.min(width, right); bottom = Math.min(height, bottom);
  if (right <= left || bottom <= top) return null;
  return { left, top, right, bottom };
}
