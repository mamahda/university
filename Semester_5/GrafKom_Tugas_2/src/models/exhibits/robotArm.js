import { box, cylinder } from '../../webgl/geometry.js';
import { compose, multiply } from '../../webgl/mat4.js';
import { addChildren, createNode } from '../../webgl/sceneNode.js';
import { boxFrom, mesh } from '../shared/parts.js';

// Articulated robot arm on a display platform. The real exhibit has not been photographed,
// so this is a generic industrial arm; shapes and all sizes are ESTIMATES.
//
// Hierarchy (every joint is a pivot node placed at the joint centre):
//   RobotArmRoot → DisplayPlatform, BaseVisual → BaseYawPivot → TurntableVisual → ShoulderPivot
//   → (UpperArmVisual, ElbowPivot → (ForearmVisual, WristPivot → GripperRoot → (PalmVisual,
//   LeftFingerPivot → finger, RightFingerPivot → finger))).
// Rotating a pivot turns everything below it, because world = parent world × local.
//
// Local frame: origin on the floor at the platform centre. At base angle 0 the arm swings in
// the XY plane towards +X. Shoulder, elbow and wrist turn about Z; their angles are measured
// as forward lean, so 0 is straight up and positive leans towards +X (rotation z = −angle).
export const ROBOT_CONFIG = {
  platform: { size: 2.4, height: 0.15 },
  baseHeight: 0.4,
  turntableHeight: 0.18,
  shoulderHeight: 0.35, // shoulder axis above the yaw pivot
  upperArm: 1.0,
  forearm: 0.9,
  palm: 0.1,
  fingerLength: 0.3,
  fingerPivotX: 0.085,
  fingerSwing: 0.5, // rad each finger turns outwards when fully open
  boxSize: 0.12,
  boxStart: [0.8, 0, 0], // where the pickable box rests, x and z on the platform
  // Joint limits in degrees; gripper is an opening fraction (0 closed, 1 open).
  limits: {
    base: [-170, 170],
    shoulder: [-30, 110],
    elbow: [-10, 145],
    wrist: [-100, 100],
    gripper: [0, 1],
  },
  // Poses are in degrees. pickPose puts the gripper pointing down onto the box at boxStart; it
  // was found by searching the arm's forward kinematics (grasp point within 1 cm of the box).
  readyPose: { base: 0, shoulder: 30, elbow: 70, wrist: 0, gripper: 1 },
  pickPose: { base: 0, shoulder: 59, elbow: 125, wrist: -4, gripper: 1 },
  jointSpeed: 8, // exponential approach rate (1/s) towards the target angle
  reach: 0.16, // how close (m) the grasp point must be to the box centre to pick it up
};

const JOINTS = ['base', 'shoulder', 'elbow', 'wrist', 'gripper'];
const rad = (degrees) => (degrees * Math.PI) / 180;
const clamp = (value, [lo, hi]) => Math.min(hi, Math.max(lo, value));

function createMaterials() {
  return {
    platform: { color: [0.42, 0.44, 0.47], specular: 0.2 },
    platformEdge: { color: [0.9, 0.45, 0.15] },
    base: { color: [0.2, 0.22, 0.26], specular: 0.4, shininess: 48 },
    link: { color: [0.92, 0.5, 0.12], specular: 0.5, shininess: 56 },
    joint: { color: [0.25, 0.27, 0.3], specular: 0.6, shininess: 64 },
    gripper: { color: [0.55, 0.57, 0.6], specular: 0.6, shininess: 64 },
    cube: { color: [0.18, 0.5, 0.75], specular: 0.35, shininess: 40, emissive: [0.3, 0.8, 1.0], glow: 0, glowAlways: true },
  };
}

// Cylinder whose axis is turned onto Z, centred on the pivot (a joint cap).
function jointCap(name, radius, width, material) {
  return mesh(name, cylinder(radius, radius, width, 14), material, { rotation: [Math.PI / 2, 0, 0], position: [0, 0, -width / 2] });
}

// Euler angles [x, y, z] of a 4×4 column-major rotation, for the local matrix order
// T · Rz · Ry · Rx used by `compose` (so R = Rz · Ry · Rx).
function eulerFromMatrix(m) {
  const sy = -m[2]; // −R[2][0]… m[col * 4 + row], so R[2][0] = m[2]
  const y = Math.asin(Math.max(-1, Math.min(1, sy)));
  return [Math.atan2(m[6], m[10]), y, Math.atan2(m[1], m[0])];
}

export function createRobotArm(config = ROBOT_CONFIG) {
  const m = createMaterials();
  const { platform, baseHeight, turntableHeight, shoulderHeight, upperArm, forearm, palm, fingerLength, fingerPivotX } = config;

  // ----- hierarchy, from the gripper up to the base -----
  const finger = (name, side) => addChildren(
    createNode(name, { position: [side * fingerPivotX, palm, 0] }),
    boxFrom(`${name.replace('Pivot', '')}Visual`, [-0.02, 0.02], [0, fingerLength], [-0.04, 0.04], m.gripper),
  );
  const leftFinger = finger('LeftFingerPivot', -1);
  const rightFinger = finger('RightFingerPivot', 1);
  const gripperRoot = addChildren(
    createNode('GripperRoot', { position: [0, 0.06, 0] }),
    boxFrom('PalmVisual', [-0.11, 0.11], [0, palm], [-0.07, 0.07], m.gripper),
    leftFinger,
    rightFinger,
  );
  const wristPivot = addChildren(
    createNode('WristPivot', { position: [0, forearm, 0] }),
    jointCap('WristCap', 0.07, 0.2, m.joint),
    gripperRoot,
  );
  const elbowPivot = addChildren(
    createNode('ElbowPivot', { position: [0, upperArm, 0] }),
    jointCap('ElbowCap', 0.11, 0.26, m.joint),
    boxFrom('ForearmVisual', [-0.07, 0.07], [0, forearm], [-0.055, 0.055], m.link),
    wristPivot,
  );
  const shoulderPivot = addChildren(
    createNode('ShoulderPivot', { position: [0, shoulderHeight, 0] }),
    jointCap('ShoulderCap', 0.14, 0.3, m.joint),
    boxFrom('UpperArmVisual', [-0.09, 0.09], [0, upperArm], [-0.07, 0.07], m.link),
    elbowPivot,
  );
  const turntable = addChildren(
    mesh('TurntableVisual', cylinder(0.3, 0.28, turntableHeight, 16), m.base),
    boxFrom('ShoulderHousing', [-0.2, 0.2], [turntableHeight, shoulderHeight + 0.15], [-0.2, 0.2], m.base),
    shoulderPivot,
  );
  const yawPivot = addChildren(createNode('BaseYawPivot', { position: [0, baseHeight, 0] }), turntable);
  const baseVisual = addChildren(
    mesh('BaseVisual', cylinder(0.38, 0.34, baseHeight, 16), m.base, { position: [0, platform.height, 0] }),
    yawPivot,
  );

  const half = platform.size / 2;
  const platformNode = addChildren(
    createNode('DisplayPlatform'),
    boxFrom('Slab', [-half, half], [0, platform.height], [-half, half], m.platform),
    boxFrom('EdgeStrip', [-half - 0.01, half + 0.01], [0, 0.03], [-half - 0.01, half + 0.01], m.platformEdge),
  );

  // The pickable box lies on the platform. While it is free it is a child of the root.
  const cubeRest = [config.boxStart[0], platform.height + config.boxSize / 2, config.boxStart[2]];
  const cube = mesh('PickableBox', box(config.boxSize, config.boxSize, config.boxSize), m.cube, { position: [...cubeRest] });

  const root = addChildren(createNode('RobotArmRoot'), platformNode, baseVisual, cube);

  // ----- state -----
  const target = { ...config.readyPose };
  const current = { ...config.readyPose };
  let held = false;
  const nodes = {
    yaw: yawPivot, shoulder: shoulderPivot, elbow: elbowPivot, wrist: wristPivot, left: leftFinger, right: rightFinger,
  };

  function applyPose() {
    nodes.yaw.rotation[1] = rad(current.base);
    nodes.shoulder.rotation[2] = -rad(current.shoulder);
    nodes.elbow.rotation[2] = -rad(current.elbow);
    nodes.wrist.rotation[2] = -rad(current.wrist);
    // Fingers swing outwards when opening: the left finger is on −X and turns by +Z.
    nodes.left.rotation[2] = current.gripper * config.fingerSwing;
    nodes.right.rotation[2] = -current.gripper * config.fingerSwing;
  }
  applyPose();

  // Matrix from the robot root to GripperRoot, multiplied down the chain (parent × local).
  function gripperMatrix() {
    const chain = [baseVisual, yawPivot, turntable, shoulderPivot, elbowPivot, wristPivot, gripperRoot];
    return chain.reduce((matrix, node) => multiply(matrix, compose(node.position, node.rotation, node.scale)), compose([0, 0, 0], [0, 0, 0], [1, 1, 1]));
  }

  // Grasp point: between the fingertips' base, in GripperRoot space, and the same point in root space.
  const graspLocal = [0, palm + fingerLength / 2, 0];
  function graspPoint() {
    const g = gripperMatrix();
    const [x, y, z] = graspLocal;
    return [0, 1, 2].map((row) => g[row] * x + g[4 + row] * y + g[8 + row] * z + g[12 + row]);
  }
  const distanceToCube = () => Math.hypot(...graspPoint().map((value, i) => value - cube.position[i]));

  function setJoint(name, value) {
    if (!JOINTS.includes(name)) throw new Error(`Unknown robot joint "${name}".`);
    target[name] = clamp(value, config.limits[name]);
    return target[name];
  }

  function setPose(pose) {
    for (const name of JOINTS) if (pose[name] !== undefined) setJoint(name, pose[name]);
  }

  // Attach: the box moves from the root to GripperRoot and is snapped to the grasp point.
  // Release: the box gets back its position and orientation in root space, so it stays where it is.
  function grab() {
    if (held) return release();
    if (distanceToCube() > config.reach) return { ok: false, message: 'Kotak di luar jangkauan gripper. Dekatkan gripper ke kotak biru.' };
    root.children.splice(root.children.indexOf(cube), 1);
    cube.position = [...graspLocal];
    cube.rotation = [0, 0, 0];
    gripperRoot.children.push(cube);
    held = true;
    setJoint('gripper', 0);
    return { ok: true, message: 'Kotak dipegang. Gerakkan lengan untuk memindahkannya.' };
  }

  function release() {
    if (!held) return { ok: false, message: 'Tidak ada kotak yang dipegang.' };
    const world = multiply(gripperMatrix(), compose(graspLocal, [0, 0, 0], [1, 1, 1]));
    gripperRoot.children.splice(gripperRoot.children.indexOf(cube), 1);
    cube.position = [world[12], world[13], world[14]];
    cube.rotation = eulerFromMatrix(world);
    root.children.push(cube);
    held = false;
    setJoint('gripper', 1);
    return { ok: true, message: 'Kotak dilepas di posisinya.' };
  }

  function resetCube() {
    if (held) release();
    cube.position = [...cubeRest];
    cube.rotation = [0, 0, 0];
  }

  return {
    root,
    config,
    joints: JOINTS,
    setJoint,
    setPose,
    getTarget: () => ({ ...target }),
    getCurrent: () => ({ ...current }),
    grab,
    resetCube,
    resetPose() { setPose(config.readyPose); },
    pickPose() { setPose(config.pickPose); },
    isHolding: () => held,
    graspPoint,
    boxNode: cube,
    gripperNode: gripperRoot,
    update(delta) {
      const k = 1 - Math.exp(-config.jointSpeed * delta);
      for (const name of JOINTS) current[name] += (target[name] - current[name]) * k;
      applyPose();
      // The box glows while it is within reach of the open gripper.
      m.cube.glow = !held && distanceToCube() <= config.reach ? 0.9 : 0;
    },
  };
}
