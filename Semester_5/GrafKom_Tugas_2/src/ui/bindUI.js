import { formatClock } from '../world/dayNight.js';
import { renderSceneTree } from './renderSceneTree.js';

// Optional URL parameters open the scene in a given state, e.g. for a demo:
// ?jam=20.5&kamera=pintuUtama&urai=1&animasi=0&bayangan=0&tekstur=0&siklus=1&mode=jalan
// More: atap=0 (potongan), motor=1, pintuKereta=1, layarKereta=1, penuh=1 (layar penuh).
function applyQuery(app) {
  const query = new URLSearchParams(window.location.search);
  if (query.has('jam')) app.set('hour', Math.min(24, Math.max(0, Number(query.get('jam')) || 0)));
  for (const [key, option] of [['siklus', 'autoTime'], ['animasi', 'animate'], ['bayangan', 'shadows'], ['tekstur', 'textures'], ['urai', 'exploded']]) {
    if (query.has(key)) app.set(option, query.get(key) === '1');
  }
  if (query.has('atap')) app.set('cutaway', query.get('atap') === '0');
  if (app.presets[query.get('kamera')]) app.jumpTo(query.get('kamera'));
  if (query.get('motor') === '1') app.exhibits.motorcycle.setPowered(true);
  if (query.get('pintuKereta') === '1') app.exhibits.train.setDoorOpen(true);
  if (query.get('layarKereta') === '1') app.exhibits.train.setLightsOn(true);
  if (query.get('mode') === 'jalan') app.set('walk', true);
}

// Exhibit controls live in one popup over the canvas. A click (not a drag) on the robot arm,
// the motorcycle or the train opens its controls; a click elsewhere, the close button or Esc
// closes it. The popup is placed beside the object's on-screen box so it does not cover it.
const EDGE = 12; // keep this far from the canvas edges
const GAP = 16; // and this far from the object

function overlap(a, b) {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

// Tries right, left, below and above the object; keeps the spot that hides the least of it.
function bestSpot(object, size, area) {
  const clampX = (x) => Math.max(EDGE, Math.min(x, area.width - size.width - EDGE));
  const clampY = (y) => Math.max(EDGE, Math.min(y, area.height - size.height - EDGE));
  const midX = (object.left + object.right - size.width) / 2;
  const midY = (object.top + object.bottom - size.height) / 2;
  const spots = [
    { left: object.right + GAP, top: midY },
    { left: object.left - GAP - size.width, top: midY },
    { left: midX, top: object.bottom + GAP },
    { left: midX, top: object.top - GAP - size.height },
  ].map(({ left, top }) => {
    const x = clampX(left);
    const y = clampY(top);
    return { left: x, top: y, hidden: overlap(object, { left: x, top: y, right: x + size.width, bottom: y + size.height }) };
  });
  return spots.reduce((best, spot) => (spot.hidden < best.hidden ? spot : best));
}

function bindExhibitPopup(app, $) {
  const popup = $('#exhibit-popup');
  const title = $('#popup-title');
  const host = $('#canvas-host');
  const canvas = host.querySelector('canvas');
  const parts = [...popup.querySelectorAll('[data-exhibit]')];
  let current = null;
  let replace = 0;

  function place() {
    popup.style.left = popup.style.top = popup.style.right = popup.style.bottom = '';
    popup.classList.remove('popup-top');
    if (!current) return;
    const object = app.screenRect(current);
    const area = host.getBoundingClientRect();
    // On a phone the popup is docked full width (CSS); dock it at the end away from the object.
    if (window.matchMedia('(max-width: 699px)').matches) {
      if (object && (object.top + object.bottom) / 2 > area.height / 2) popup.classList.add('popup-top');
      return;
    }
    if (!object) return; // object off screen: keep the default corner
    const spot = bestSpot(object, popup.getBoundingClientRect(), area);
    popup.style.left = `${spot.left}px`;
    popup.style.top = `${spot.top}px`;
    popup.style.right = 'auto';
  }

  // `afterFlight`: the camera is still gliding to a preset, so place again once it has arrived.
  function open(key, { afterFlight = false } = {}) {
    current = key;
    for (const part of parts) part.hidden = part.dataset.exhibit !== key;
    title.textContent = parts.find((part) => part.dataset.exhibit === key)?.dataset.title ?? '';
    popup.hidden = false;
    place();
    clearTimeout(replace);
    if (afterFlight) replace = setTimeout(place, 1600);
  }

  function close() {
    current = null;
    clearTimeout(replace);
    popup.hidden = true;
  }

  let press = null;
  canvas.addEventListener('pointerdown', (event) => { press = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener('pointerup', (event) => {
    if (!press) return;
    const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y);
    press = null;
    if (moved > 6) { // that was a drag to orbit, not a click: the object moved, so follow it
      if (current) place();
      return;
    }
    const key = app.pick(event.clientX, event.clientY);
    if (key) open(key);
    else close();
  });
  $('#popup-close').addEventListener('click', close);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && current) close(); });
  app.onChange(({ walk }) => { if (walk) close(); });
  window.addEventListener('resize', place);

  return { open, close };
}

// "Layar penuh" makes the viewer fill the screen. It uses the Fullscreen API when the browser
// allows it; otherwise (e.g. iPhone Safari) the viewer just covers the page. While full, the
// control panel starts hidden and "Tampilkan kontrol" shows it floating over the canvas.
function bindFullView($) {
  const viewer = $('.viewer');
  const button = $('#fullscreen');
  const panelButton = $('#toggle-panel');
  const popup = $('#exhibit-popup');
  const isFull = () => viewer.classList.contains('is-full');
  const isNative = () => document.fullscreenElement === viewer;

  function setPanel(on) {
    viewer.classList.toggle('no-panel', !on);
    panelButton.setAttribute('aria-expanded', String(on));
    panelButton.textContent = on ? 'Sembunyikan kontrol' : 'Tampilkan kontrol';
  }
  function show(on) {
    viewer.classList.toggle('is-full', on);
    document.documentElement.classList.toggle('viewer-full', on);
    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? 'Keluar layar penuh' : 'Layar penuh';
    panelButton.hidden = !on;
    setPanel(!on); // hidden while full, back in place afterwards
  }
  function enter() {
    show(true);
    viewer.requestFullscreen?.().catch(() => {}); // refused: the covering view stays
  }
  function exit() {
    if (isNative()) document.exitFullscreen(); // fullscreenchange then calls show(false)
    else show(false);
  }

  button.addEventListener('click', () => (isFull() ? exit() : enter()));
  panelButton.addEventListener('click', () => setPanel(viewer.classList.contains('no-panel')));
  // Esc in native fullscreen is handled by the browser and ends up here.
  document.addEventListener('fullscreenchange', () => { if (isFull() && !isNative()) show(false); });
  // Esc in the covering view: close an open exhibit popup first, the full view on the next press.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isFull() && !isNative() && popup.hidden) show(false);
  }, { capture: true });
  // ?penuh=1 opens the page in the covering view (true fullscreen needs a click).
  if (new URLSearchParams(window.location.search).get('penuh') === '1') show(true);
}

const ROBOT_LABELS ={ base: 'Putar dasar', shoulder: 'Bahu', elbow: 'Siku', wrist: 'Pergelangan', gripper: 'Gripper' };

// Slider panel for the robot arm. Joint sliders show the target angle; the arm glides to it.
// Limits come from the robot's own config so the sliders and the model never disagree.
function bindRobot(robot, $) {
  const list = $('#robot-sliders');
  const status = $('#robot-status');
  const grabButton = $('#robot-grab');
  const inputs = {};

  for (const name of robot.joints) {
    const [lo, hi] = robot.config.limits[name];
    const isGripper = name === 'gripper';
    const row = document.createElement('label');
    row.className = 'slider-row';
    const text = document.createElement('span');
    text.textContent = ROBOT_LABELS[name];
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(isGripper ? 0 : lo);
    input.max = String(isGripper ? 100 : hi);
    input.step = '1';
    const output = document.createElement('output');
    row.append(text, input, output);
    list.append(row);
    inputs[name] = { input, output, isGripper };
    input.addEventListener('input', () => {
      robot.setJoint(name, isGripper ? Number(input.value) / 100 : Number(input.value));
      sync();
    });
  }

  function sync() {
    const target = robot.getTarget();
    for (const [name, { input, output, isGripper }] of Object.entries(inputs)) {
      const shown = isGripper ? Math.round(target[name] * 100) : Math.round(target[name]);
      input.value = String(shown);
      output.textContent = isGripper ? `${shown}%` : `${shown}°`;
    }
    const holding = robot.isHolding();
    grabButton.textContent = holding ? 'Lepas kotak' : 'Ambil kotak';
    grabButton.setAttribute('aria-pressed', String(holding));
  }

  const say = (message) => { status.textContent = message; };
  $('#robot-ready').addEventListener('click', () => { robot.setPose(robot.config.readyPose); sync(); say('Pose siap.'); });
  $('#robot-pick-pose').addEventListener('click', () => { robot.pickPose(); sync(); say('Lengan bergerak ke pose ambil. Setelah berhenti, tekan "Ambil kotak".'); });
  $('#robot-reset').addEventListener('click', () => { robot.resetPose(); sync(); say('Pose dikembalikan ke posisi awal (kotak tidak dipindahkan).'); });
  $('#robot-reset-box').addEventListener('click', () => { robot.resetCube(); sync(); say('Kotak dikembalikan ke platform.'); });
  grabButton.addEventListener('click', () => { const result = robot.grab(); sync(); say(result.message); });
  sync();
}

export function bindUI(app) {
  if (!app) {
    document.querySelector('.controls')?.setAttribute('hidden', '');
    return;
  }
  const $ = (selector) => document.querySelector(selector);
  applyQuery(app);

  $('#reset-camera').addEventListener('click', () => app.resetCamera());
  bindFullView($);

  const orbitButton = $('#mode-orbit');
  const walkButton = $('#mode-walk');
  const hint = $('#camera-hint');
  const showMode = ({ walk }) => {
    orbitButton.setAttribute('aria-pressed', String(!walk));
    walkButton.setAttribute('aria-pressed', String(walk));
    hint.textContent = walk
      ? 'Klik kanvas lalu gerakkan mouse untuk melihat (Esc melepas). W A S D atau panah untuk berjalan, Shift untuk berlari.'
      : 'Seret untuk memutar; Ctrl + gulir untuk zoom';
  };
  orbitButton.addEventListener('click', () => app.set('walk', false));
  walkButton.addEventListener('click', () => app.set('walk', true));
  app.onChange(showMode);
  showMode(app.options);

  const slider = $('#time-of-day');
  const label = $('#time-label');
  const showTime = ({ hour }) => {
    slider.value = String(hour);
    label.textContent = formatClock(hour);
  };
  slider.addEventListener('input', () => app.set('hour', Number(slider.value)));
  app.onChange(showTime);
  showTime(app.options);

  const toggles = [['#auto-time', 'autoTime'], ['#animate', 'animate'], ['#shadows', 'shadows'], ['#textures', 'textures'], ['#exploded', 'exploded'], ['#cutaway', 'cutaway']];
  for (const [id, option] of toggles) {
    $(id).addEventListener('change', (event) => app.set(option, event.target.checked));
  }
  // The roof view can also change by choosing a camera view, so keep the checkboxes in step.
  const showToggles = (options) => toggles.forEach(([id, option]) => { $(id).checked = options[option]; });
  app.onChange(showToggles);
  showToggles(app.options);

  const { motorcycle, train, robot } = app.exhibits;
  $('#moto-power').checked = motorcycle.state().powered;
  $('#moto-power').addEventListener('change', (event) => {
    motorcycle.setPowered(event.target.checked);
    $('#moto-status').textContent = event.target.checked
      ? 'Menyala: kedua roda berputar pada porosnya, rangka diam, lampu menyala.'
      : 'Mati: roda melambat sampai diam, lampu padam.';
  });
  if (motorcycle.state().powered) $('#moto-power').dispatchEvent(new Event('change')); // started from the URL
  const trainStatus = () => {
    $('#train-status').textContent = `Pintu ${$('#train-door').checked ? 'terbuka' : 'tertutup'}, layar dan lampu ${$('#train-lights').checked ? 'menyala' : 'padam'}.`;
  };
  $('#train-door').checked = train.state().doorOpen;
  $('#train-lights').checked = train.state().lightsOn;
  trainStatus();
  $('#train-door').addEventListener('change', (event) => { train.setDoorOpen(event.target.checked); trainStatus(); });
  $('#train-lights').addEventListener('change', (event) => { train.setLightsOn(event.target.checked); trainStatus(); });
  bindRobot(robot, $);

  const presets = $('#camera-presets');
  const interiorPresets = $('#camera-presets-interior');
  const presetButtons = {};
  for (const [name, preset] of Object.entries(app.presets)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = preset.label;
    button.addEventListener('click', () => goTo(name, { scroll: false }));
    (preset.interior || preset.cutaway ? interiorPresets : presets).append(button);
    presetButtons[name] = button;
  }

  const markPreset = (name) => Object.entries(presetButtons).forEach(([key, button]) => button.setAttribute('aria-current', String(key === name)));

  const popup = bindExhibitPopup(app, $);
  // Choosing an exhibit's camera view also opens its controls, so they work without the mouse too.
  const PRESET_EXHIBIT = { pameranRobot: 'robot', pameranMotor: 'motorcycle', pameran: 'train' };

  // "Lihat di model" under each photo flies the camera to the same view and scrolls back to the canvas.
  function goTo(name, { scroll = true } = {}) {
    if (!app.presets[name]) return;
    app.flyTo(name);
    markPreset(name);
    if (PRESET_EXHIBIT[name]) popup.open(PRESET_EXHIBIT[name], { afterFlight: true });
    else popup.close();
    const box = $('.stage').getBoundingClientRect();
    if (scroll && (box.top < -box.height * 0.25 || box.bottom > innerHeight + box.height * 0.25)) {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      $('#model').scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    }
  }
  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => goTo(button.dataset.preset));
  });
  const fromQuery = new URLSearchParams(window.location.search).get('kamera');
  if (app.presets[fromQuery]) markPreset(fromQuery);

  renderSceneTree($('#scene-tree'), app.scene);
}
