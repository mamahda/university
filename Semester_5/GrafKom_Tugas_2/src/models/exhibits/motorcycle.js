import { cylinder } from '../../webgl/geometry.js';
import { addChildren, createNode } from '../../webgl/sceneNode.js';
import { boxFrom, cylinderBetween, mesh } from '../shared/parts.js';

// Simplified electric motorcycle on a display platform. No photo of the real exhibit is
// available yet, so this is a generic electric motorcycle (battery pack between the wheels,
// no engine or exhaust); the shapes and all sizes are ESTIMATES, not the real exhibit.
//
// Local frame: origin on the floor at the centre of the platform. The bike points towards +X
// and its sides are ±Z. Wheel pivots sit on the axle centres with the axle along Z, so
// rotating a pivot about Z spins that wheel and nothing else; the frame stays still.
export const MOTORCYCLE_CONFIG = {
  platform: { length: 2.8, width: 1.5, height: 0.15 },
  wheelRadius: 0.3,
  tireWidth: 0.1,
  wheelBase: 1.25,
  spinSpeed: 9, // rad/s at full power (about 2.7 m/s of "virtual" travel)
  acceleration: 5, // rad/s², so the wheels spin up and down smoothly
};

function createMaterials() {
  return {
    platform: { color: [0.42, 0.44, 0.47], specular: 0.2 },
    platformEdge: { color: [0.15, 0.55, 0.6] },
    frame: { color: [0.14, 0.14, 0.16], specular: 0.5, shininess: 48 },
    body: { color: [0.13, 0.52, 0.58], specular: 0.55, shininess: 64 },
    bodyDark: { color: [0.1, 0.1, 0.12], specular: 0.4 },
    seat: { color: [0.06, 0.06, 0.07], specular: 0.15 },
    metal: { color: [0.7, 0.71, 0.73], specular: 0.7, shininess: 64 },
    tire: { color: [0.05, 0.05, 0.06] },
    rim: { color: [0.78, 0.79, 0.8], specular: 0.6, shininess: 64 },
    marker: { color: [0.95, 0.9, 0.2] },
    // Headlight, tail light and dashboard light up when the power is on.
    headlight: { color: [0.95, 0.95, 0.9], emissive: [1.0, 0.95, 0.8], glow: 0, glowAlways: true, castShadow: false },
    tailLight: { color: [0.6, 0.05, 0.05], emissive: [1.0, 0.1, 0.1], glow: 0, glowAlways: true, castShadow: false },
    dash: { color: [0.05, 0.08, 0.08], emissive: [0.3, 1.0, 0.8], glow: 0, glowAlways: true, castShadow: false },
  };
}

// Wheel with its pivot at the axle. The tire is a cylinder whose axis is turned onto Z; spokes
// and a yellow marker make the rotation visible.
function createWheel(name, position, radius, width, m) {
  const pivot = createNode(name, { position });
  const turnToZ = [Math.PI / 2, 0, 0]; // a cylinder's axis is Y; this turns it onto Z
  pivot.children.push(
    mesh('Tire', cylinder(radius, radius, width, 20), m.tire, { rotation: turnToZ, position: [0, 0, -width / 2] }),
    mesh('Rim', cylinder(radius * 0.68, radius * 0.68, width + 0.012, 20), m.rim, { rotation: turnToZ, position: [0, 0, -(width + 0.012) / 2] }),
    mesh('Hub', cylinder(0.06, 0.06, width + 0.05, 10), m.metal, { rotation: turnToZ, position: [0, 0, -(width + 0.05) / 2] }),
    boxFrom('Marker', [radius - 0.05, radius + 0.005], [-0.02, 0.02], [-width / 2 - 0.004, width / 2 + 0.004], m.marker),
  );
  for (let i = 0; i < 5; i += 1) {
    // Each bar passes through the hub, so five bars make ten spokes.
    pivot.children.push(addChildren(
      createNode(`Spoke${i}`, { rotation: [0, 0, (i * Math.PI) / 5] }),
      boxFrom('Bar', [-radius * 0.66, radius * 0.66], [-0.012, 0.012], [-0.012, 0.012], m.metal),
    ));
  }
  return pivot;
}

export function createMotorcycle(config = MOTORCYCLE_CONFIG) {
  const m = createMaterials();
  const { platform, wheelRadius: r, tireWidth, wheelBase } = config;
  const axleY = r;
  const rearX = -wheelBase / 2;
  const frontX = wheelBase / 2;

  const rearWheel = createWheel('RearWheelPivot', [rearX, axleY, 0], r, tireWidth, m);
  const frontWheel = createWheel('FrontWheelPivot', [frontX, axleY, 0], r, tireWidth, m);

  const headY = 1.0; // steering head height
  const headX = frontX - 0.12;
  const handlebar = addChildren(
    createNode('HandlebarAssembly', { position: [headX, headY, 0] }),
    cylinderBetween('Bar', [0, 0.06, -0.3], [0, 0.06, 0.3], 0.014, m.frame),
    boxFrom('GripLeft', [-0.02, 0.02], [0.045, 0.075], [-0.4, -0.3], m.seat),
    boxFrom('GripRight', [-0.02, 0.02], [0.045, 0.075], [0.3, 0.4], m.seat),
    boxFrom('Dashboard', [-0.06, 0.04], [0.08, 0.16], [-0.1, 0.1], m.bodyDark),
    boxFrom('DashboardScreen', [-0.062, -0.058], [0.1, 0.15], [-0.07, 0.07], m.dash),
    boxFrom('Headlight', [0.02, 0.2], [-0.2, -0.02], [-0.11, 0.11], m.bodyDark),
    boxFrom('HeadlightLens', [0.2, 0.215], [-0.18, -0.04], [-0.09, 0.09], m.headlight),
  );

  // Front fork: two legs from the steering head down to the front axle, plus a fender.
  const fork = createNode('FrontFork');
  for (const side of [-1, 1]) {
    fork.children.push(cylinderBetween(`ForkLeg${side}`, [headX, headY - 0.05, side * 0.08], [frontX, axleY, side * 0.08], 0.018, m.metal));
  }
  fork.children.push(boxFrom('FrontFender', [frontX - 0.22, frontX + 0.22], [axleY + r + 0.03, axleY + r + 0.06], [-0.07, 0.07], m.body));

  // Rear swingarm from the frame to the rear axle.
  const swingarm = createNode('Swingarm');
  for (const side of [-1, 1]) {
    swingarm.children.push(cylinderBetween(`Arm${side}`, [-0.15, 0.36, side * 0.1], [rearX, axleY, side * 0.1], 0.02, m.frame));
  }

  const panels = addChildren(
    createNode('BodyPanels'),
    boxFrom('BatteryCover', [-0.3, 0.42], [0.3, 0.72], [-0.15, 0.15], m.body),
    boxFrom('RearFairing', [-0.78, -0.2], [0.55, 0.8], [-0.17, 0.17], m.body),
    boxFrom('LegShield', [headX - 0.1, headX + 0.02], [0.45, headY - 0.1], [-0.17, 0.17], m.body),
    boxFrom('TailLight', [-0.82, -0.78], [0.66, 0.74], [-0.1, 0.1], m.tailLight),
    boxFrom('Footrest0', [-0.05, 0.2], [0.26, 0.29], [0.15, 0.3], m.frame),
    boxFrom('Footrest1', [-0.05, 0.2], [0.26, 0.29], [-0.3, -0.15], m.frame),
  );

  const frame = addChildren(
    createNode('MotorcycleFrame', { position: [0, platform.height, 0] }),
    boxFrom('Chassis', [-0.32, 0.4], [0.24, 0.32], [-0.1, 0.1], m.frame),
    boxFrom('BatteryPack', [-0.28, 0.34], [0.32, 0.5], [-0.11, 0.11], m.bodyDark),
    cylinderBetween('NeckTube', [0.3, 0.45, 0], [headX, headY - 0.05, 0], 0.03, m.frame),
    panels,
    boxFrom('Seat', [-0.68, -0.05], [0.8, 0.88], [-0.14, 0.14], m.seat),
    handlebar,
    fork,
    swingarm,
    frontWheel,
    rearWheel,
  );

  const base = addChildren(
    createNode('DisplayPlatform'),
    boxFrom('Slab', [-platform.length / 2, platform.length / 2], [0, platform.height], [-platform.width / 2, platform.width / 2], m.platform),
    boxFrom('EdgeStrip', [-platform.length / 2 - 0.01, platform.length / 2 + 0.01], [0, 0.03], [-platform.width / 2 - 0.01, platform.width / 2 + 0.01], m.platformEdge),
  );
  const root = addChildren(createNode('MotorcycleRoot'), base, frame);

  let powered = false;
  let speed = 0; // current wheel speed, rad/s

  function setPowered(on) {
    powered = on;
    m.headlight.glow = on ? 2.2 : 0;
    m.tailLight.glow = on ? 1.4 : 0;
    m.dash.glow = on ? 1.8 : 0;
  }

  return {
    root,
    config,
    setPowered,
    state: () => ({ powered, wheelSpeed: speed }),
    // The wheels speed up and slow down at a fixed acceleration; `spin` false freezes them
    // (the page's "Animasi objek" pause). Only the wheel pivots rotate, never the frame.
    update(delta, { spin = true } = {}) {
      if (!spin) return;
      const target = powered ? config.spinSpeed : 0;
      const change = Math.sign(target - speed) * Math.min(Math.abs(target - speed), config.acceleration * delta);
      speed += change;
      // Rolling towards +X is a clockwise turn seen from +Z, i.e. negative about Z.
      frontWheel.rotation[2] -= speed * delta;
      rearWheel.rotation[2] -= speed * delta;
    },
  };
}
