import { lookAt, perspective } from '../webgl/mat4.js';

// Perspective camera orbiting a target: drag to rotate, Ctrl/⌘ + wheel (or a trackpad pinch,
// which the browser reports as Ctrl + wheel) to zoom. A plain wheel keeps scrolling the page. A view is
// { target, yaw, pitch, distance, fov } with angles in radians; `flyTo` glides to another
// view (used for the photo viewpoints), `update` advances that glide each frame.
export function createOrbitCamera(element, initialView) {
  const copy = (view) => ({ fov: (50 * Math.PI) / 180, ...view, target: [...view.target] });
  const initial = copy(initialView);
  const state = copy(initial);
  let flight = null;
  let dragging = null;
  let enabled = true;

  function onPointerDown(event) {
    if (!enabled) return;
    flight = null;
    dragging = { x: event.clientX, y: event.clientY, id: event.pointerId };
    element.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragging || dragging.id !== event.pointerId) return;
    state.yaw -= (event.clientX - dragging.x) * 0.006;
    state.pitch = Math.min(1.45, Math.max(-0.3, state.pitch + (event.clientY - dragging.y) * 0.006));
    dragging.x = event.clientX;
    dragging.y = event.clientY;
  }

  function onPointerUp(event) {
    if (dragging?.id === event.pointerId) dragging = null;
  }

  function onWheel(event) {
    if (!enabled || !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault(); // also stops the browser's own page zoom
    flight = null;
    // Pinch gestures send small steps; mouse wheels send large ones.
    const rate = Math.abs(event.deltaY) < 20 ? 0.01 : 0.001;
    state.distance = Math.min(110, Math.max(1.5, state.distance * Math.exp(event.deltaY * rate)));
  }

  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointercancel', onPointerUp);
  element.addEventListener('wheel', onWheel, { passive: false });

  function flyTo(view, duration = 1.4) {
    const to = copy(view);
    // Turn the short way round.
    while (to.yaw - state.yaw > Math.PI) to.yaw -= 2 * Math.PI;
    while (to.yaw - state.yaw < -Math.PI) to.yaw += 2 * Math.PI;
    flight = { from: copy(state), to, elapsed: 0, duration };
  }

  function jumpTo(view) {
    flight = null;
    Object.assign(state, copy(view));
  }

  function update(delta) {
    if (!flight) return;
    flight.elapsed += delta;
    const t = Math.min(1, flight.elapsed / flight.duration);
    const ease = t * t * (3 - 2 * t);
    const lerp = (a, b) => a + (b - a) * ease;
    const { from, to } = flight;
    state.target = from.target.map((value, i) => lerp(value, to.target[i]));
    for (const key of ['yaw', 'pitch', 'distance', 'fov']) state[key] = lerp(from[key], to[key]);
    if (t === 1) flight = null;
  }

  function matrices(aspect) {
    const { target: t, yaw: y, pitch: p, distance: d } = state;
    const eye = [
      t[0] + d * Math.cos(p) * Math.sin(y),
      Math.max(0.3, t[1] + d * Math.sin(p)),
      t[2] + d * Math.cos(p) * Math.cos(y),
    ];
    return {
      projection: perspective(state.fov, aspect, 0.1, 400),
      view: lookAt(eye, t, [0, 1, 0]),
      cameraPosition: eye,
    };
  }

  function reset() {
    flyTo(initial);
  }

  function dispose() {
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('pointermove', onPointerMove);
    element.removeEventListener('pointerup', onPointerUp);
    element.removeEventListener('pointercancel', onPointerUp);
    element.removeEventListener('wheel', onWheel);
  }

  function setEnabled(on) {
    enabled = on;
    dragging = null;
  }

  return { matrices, flyTo, jumpTo, update, reset, setEnabled, dispose };
}
