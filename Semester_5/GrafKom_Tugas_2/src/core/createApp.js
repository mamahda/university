import { createRenderer } from '../webgl/renderer.js';
import { createOrbitCamera } from '../camera/orbitCamera.js';
import { createWalkCamera } from '../camera/walkCamera.js';
import { WALK_COLLIDERS, WALK_START, groundAt } from '../world/walkArea.js';
import { addChildren, createNode } from '../webgl/sceneNode.js';
import { compose, multiply } from '../webgl/mat4.js';
import { createCcwsBuilding } from '../models/building/ccwsBuilding.js';
import { createEnvironment } from '../models/exterior/environment.js';
import { createInterior, INTERIOR_LAYOUT } from '../models/interior/interior.js';
import { pickTarget, screenRay, screenRect } from '../webgl/picking.js';
import { createExhibition } from '../models/exhibits/exhibition.js';
import { createPeople } from '../models/exterior/people.js';
import { createPeopleMotion } from '../world/peopleMotion.js';
import { createAnimator } from '../world/animator.js';
import { environmentAt } from '../world/dayNight.js';
import { CAMERA_PRESETS } from '../world/cameraPresets.js';

// Hours of scene time per real second while the day–night cycle runs (a full day ≈ 96 s).
const HOURS_PER_SECOND = 0.25;

export function createApp(host) {
  if (!host) throw new Error('Missing #canvas-host element.');
  const status = document.querySelector('#render-status');

  const canvas = document.createElement('canvas');
  // Vertical swipes scroll the page; horizontal drags still orbit (mouse dragging is unaffected).
  canvas.style.touchAction = 'pan-y';
  host.appendChild(canvas);
  let renderer;
  try {
    renderer = createRenderer(canvas, { shadowCenter: [-4, 0, -2], shadowRadius: 34 });
  } catch (error) {
    console.error('Unable to initialize WebGL.', error);
    canvas.remove();
    host.innerHTML = '<div class="error-message">WebGL2 tidak dapat dijalankan. Periksa dukungan browser dan akselerasi hardware.</div>';
    status.textContent = 'WebGL2 tidak tersedia';
    return null;
  }

  const building = createCcwsBuilding();
  const environment = createEnvironment();
  const interior = createInterior();
  const exhibition = createExhibition();
  const people = createPeople();
  const scene = addChildren(createNode('Scene'), environment.root, building.root, interior.root, exhibition.root, people.root);
  const animator = createAnimator(building.animated, environment.animated, createPeopleMotion(people, { main: building.animated.mainDoors, side: building.animated.sideDoors }));
  // The exhibits hang under Scene → InnovationExhibition; picking starts from that node's world matrix.
  const exhibitionWorld = multiply(compose(scene.position, scene.rotation, scene.scale), compose(exhibition.root.position, exhibition.root.rotation, exhibition.root.scale));
  const exhibitRoots = { robot: exhibition.robot.root, motorcycle: exhibition.motorcycle.root, train: exhibition.train.root };
  const orbit = createOrbitCamera(canvas, CAMERA_PRESETS.awal);
  const walk = createWalkCamera(canvas, { start: WALK_START, colliders: WALK_COLLIDERS, groundAt });
  let camera = orbit;

  // Everything the page controls can change. The photos were taken at about 16:24.
  const options = { hour: 16.4, autoTime: false, animate: true, shadows: true, textures: true, exploded: false,
    cutaway: false, walk: false };
  const listeners = new Set();
  let animationTime = 0;
  let last = performance.now();
  let frame = 0;

  function draw(now) {
    const delta = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (options.animate) animationTime += delta;
    if (options.autoTime) {
      options.hour = (options.hour + delta * HOURS_PER_SECOND) % 24;
      listeners.forEach((listener) => listener(options));
    }
    animator.update(animationTime, delta, { animateObjects: options.animate, viewer: options.walk ? walk.position() : null });
    exhibition.update(delta, { animate: options.animate });
    camera.update(delta);

    // Point lights: exterior, workspace and exhibition lamps all switch on with dusk and off at
    // dawn (sky.lampLevel). The renderer takes at most 8 (3 exterior + 3 workspace + 2 exhibition).
    const sky = environmentAt(options.hour);
    if (sky.lampLevel > 0.01) {
      const dimmed = (lamp) => ({ ...lamp, color: lamp.color.map((c) => c * sky.lampLevel) });
      sky.pointLights.push(...building.lamps.map(dimmed), ...interior.workspaceLights.map(dimmed), ...interior.exhibitionLights.map(dimmed));
    }
    const aspect = renderer.resize();
    renderer.render(scene, camera.matrices(aspect), sky, options);
    frame = requestAnimationFrame(draw);
  }

  status.textContent = 'WebGL2 aktif';
  document.querySelector('#loading-message')?.remove();
  frame = requestAnimationFrame(draw);

  return {
    scene,
    options,
    exhibits: { train: exhibition.train, motorcycle: exhibition.motorcycle, robot: exhibition.robot },
    presets: CAMERA_PRESETS,
    set(name, value) {
      options[name] = value;
      if (name === 'exploded') animator.setExploded(value);
      if (name === 'cutaway') {
        // Take off the roof and ceiling to look into the hall from above.
        building.roof.visible = !value;
        interior.ceiling.visible = !value;
      }
      if (name === 'walk') {
        orbit.setEnabled(!value);
        walk.setEnabled(value);
        camera = value ? walk : orbit;
      }
      listeners.forEach((listener) => listener(options));
    },
    onChange(listener) {
      listeners.add(listener);
    },
    flyTo(name) {
      if (options.walk) this.set('walk', false);
      this.applyCutawayFor(name);
      orbit.flyTo(CAMERA_PRESETS[name]);
    },
    jumpTo(name) {
      if (options.walk) this.set('walk', false);
      this.applyCutawayFor(name);
      orbit.jumpTo(CAMERA_PRESETS[name]);
    },
    // Exterior views close the roof again; the cutaway view opens it; interior views keep it as is.
    applyCutawayFor(name) {
      const preset = CAMERA_PRESETS[name];
      if (!preset.interior && options.cutaway !== Boolean(preset.cutaway)) this.set('cutaway', Boolean(preset.cutaway));
    },
    // Which exhibit is under a click (clientX/Y in page pixels): 'robot', 'motorcycle', 'train' or null.
    // Only from inside the hall or with the roof open, so a click on the outer wall never picks
    // an exhibit hidden behind it.
    pick(clientX, clientY) {
      if (options.walk) return null;
      const rect = canvas.getBoundingClientRect();
      const matrices = camera.matrices(rect.width / rect.height);
      const [x, y, z] = matrices.cameraPosition;
      const { halfLength, halfDepth, ceilingY } = INTERIOR_LAYOUT;
      const inside = Math.abs(x) < halfLength && Math.abs(z) < halfDepth && y < ceilingY;
      if (!inside && !options.cutaway) return null;
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = 1 - ((clientY - rect.top) / rect.height) * 2;
      const targets = Object.entries(exhibitRoots).map(([key, root]) => ({ key, root }));
      return pickTarget(targets, screenRay(ndcX, ndcY, matrices), exhibitionWorld);
    },
    // Where an exhibit is on the canvas right now: { left, top, right, bottom } in canvas pixels.
    screenRect(key) {
      const rect = canvas.getBoundingClientRect();
      return screenRect(exhibitRoots[key], exhibitionWorld, camera.matrices(rect.width / rect.height), rect.width, rect.height);
    },
    resetCamera() {
      this.applyCutawayFor('awal');
      camera.reset();
    },
    dispose() {
      cancelAnimationFrame(frame);
      orbit.dispose();
      walk.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
