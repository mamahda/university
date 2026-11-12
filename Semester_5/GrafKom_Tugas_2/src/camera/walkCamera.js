import { lookAt, perspective } from '../webgl/mat4.js';

// First-person camera at a person's eye height. WASD or the arrow keys walk, Shift runs,
// the mouse looks around (click the canvas to lock the pointer, Esc to release; dragging
// also works without the lock). `colliders` are [x0, x1, z0, z1] boxes on the ground the
// walker cannot enter; `groundAt(x, z)` gives the floor height (steps, ramp, landing).
const EYE_HEIGHT = 1.6;
const RADIUS = 0.3;
const WALK_SPEED = 1.6;
const RUN_SPEED = 4;
const LOOK = 0.0025;
const MOVE_KEYS = {
  KeyW: [1, 0], ArrowUp: [1, 0], KeyS: [-1, 0], ArrowDown: [-1, 0],
  KeyA: [0, -1], ArrowLeft: [0, -1], KeyD: [0, 1], ArrowRight: [0, 1],
};

export function createWalkCamera(element, { start, colliders, groundAt, bounds = 70 }) {
  const state = { x: start.position[0], z: start.position[1], yaw: start.yaw, pitch: 0, eyeY: EYE_HEIGHT, bob: 0 };
  const keys = new Set();
  let enabled = false;
  let dragging = null;

  const blocked = (x, z) => Math.abs(x) > bounds || Math.abs(z) > bounds
    || colliders.some(([x0, x1, z0, z1]) => x > x0 - RADIUS && x < x1 + RADIUS && z > z0 - RADIUS && z < z1 + RADIUS);

  function look(dx, dy) {
    state.yaw -= dx * LOOK;
    state.pitch = Math.min(1.3, Math.max(-1.3, state.pitch - dy * LOOK));
  }

  const typing = (event) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName);
  function onKeyDown(event) {
    if (!enabled || typing(event)) return;
    if (MOVE_KEYS[event.code] || event.code.startsWith('Shift')) {
      keys.add(event.code);
      if (event.code.startsWith('Arrow')) event.preventDefault();
    }
  }
  const onKeyUp = (event) => keys.delete(event.code);
  const onBlur = () => keys.clear();

  function onPointerDown(event) {
    if (!enabled) return;
    if (document.pointerLockElement !== element && element.requestPointerLock) {
      element.requestPointerLock();
    }
    dragging = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }
  function onPointerMove(event) {
    if (!enabled) return;
    if (document.pointerLockElement === element) {
      look(event.movementX, event.movementY);
    } else if (dragging?.id === event.pointerId) {
      look(event.clientX - dragging.x, event.clientY - dragging.y);
      dragging.x = event.clientX;
      dragging.y = event.clientY;
    }
  }
  function onPointerUp(event) {
    if (dragging?.id === event.pointerId) dragging = null;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointercancel', onPointerUp);

  function update(delta) {
    if (!enabled) return;
    let forward = 0;
    let side = 0;
    for (const code of keys) {
      const move = MOVE_KEYS[code];
      if (move) {
        forward += move[0];
        side += move[1];
      }
    }
    const length = Math.hypot(forward, side);
    if (length > 0) {
      const speed = (keys.has('ShiftLeft') || keys.has('ShiftRight') ? RUN_SPEED : WALK_SPEED) * delta / length;
      // Forward is −Z at yaw 0; right is +X.
      const sin = Math.sin(state.yaw);
      const cos = Math.cos(state.yaw);
      const dx = (-sin * forward + cos * side) * speed;
      const dz = (-cos * forward - sin * side) * speed;
      // Slide along walls: try each axis on its own.
      if (!blocked(state.x + dx, state.z)) state.x += dx;
      if (!blocked(state.x, state.z + dz)) state.z += dz;
      state.bob += speed * 5;
    }
    const target = groundAt(state.x, state.z) + EYE_HEIGHT;
    state.eyeY += (target - state.eyeY) * Math.min(1, delta * 10);
  }

  function matrices(aspect) {
    const eye = [state.x, state.eyeY + Math.sin(state.bob) * 0.025, state.z];
    const direction = [
      -Math.sin(state.yaw) * Math.cos(state.pitch),
      Math.sin(state.pitch),
      -Math.cos(state.yaw) * Math.cos(state.pitch),
    ];
    return {
      projection: perspective((70 * Math.PI) / 180, aspect, 0.05, 400),
      view: lookAt(eye, eye.map((v, i) => v + direction[i]), [0, 1, 0]),
      cameraPosition: eye,
    };
  }

  return {
    matrices,
    update,
    position: () => [state.x, state.z],
    setEnabled(on) {
      enabled = on;
      keys.clear();
      dragging = null;
      if (!on && document.pointerLockElement === element) document.exitPointerLock();
    },
    reset() {
      Object.assign(state, { x: start.position[0], z: start.position[1], yaw: start.yaw, pitch: 0 });
    },
    dispose() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerUp);
    },
  };
}
