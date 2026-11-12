import { sphere } from '../../webgl/geometry.js';
import { addChildren, createNode } from '../../webgl/sceneNode.js';
import { boxFrom, cylinderBetween, mesh } from '../shared/parts.js';

// Low-poly people with a full joint hierarchy, so walking and sweeping are done purely by
// rotating pivots (hip → knee, shoulder → elbow) under a moving root:
//   Person (feet on the ground, faces +Z) → Pelvis (hip height)
//     ├── HipL/R pivot → Thigh, KneeL/R pivot → Shin, Foot
//     └── Torso pivot → Chest, Neck, Head, Hair
//           └── ShoulderL/R pivot → UpperArm, ElbowL/R pivot → Forearm, Hand
// The sweeper also holds a stick broom (sapu lidi) on a pivot in front of the chest.
const SKIN = { color: [0.72, 0.53, 0.4] };
const HAIR = { color: [0.08, 0.07, 0.06] };
const SHOE = { color: [0.12, 0.12, 0.13] };
const BROOM_STICKS = { color: [0.66, 0.55, 0.32] };
const BROOM_TIE = { color: [0.3, 0.22, 0.14] };

function leg(name, side, pants) {
  const knee = addChildren(
    createNode(`${name}Knee${side}`, { position: [0, -0.43, 0] }),
    boxFrom(`${name}Shin${side}`, [-0.06, 0.06], [-0.42, 0], [-0.065, 0.065], pants),
    boxFrom(`${name}Foot${side}`, [-0.055, 0.055], [-0.47, -0.42], [-0.07, 0.17], SHOE),
  );
  const hip = addChildren(
    createNode(`${name}Hip${side}`, { position: [side === 'L' ? 0.1 : -0.1, 0, 0] }),
    boxFrom(`${name}Thigh${side}`, [-0.07, 0.07], [-0.43, 0.02], [-0.08, 0.08], pants),
    knee,
  );
  return { hip, knee };
}

function arm(name, side, shirt) {
  const elbow = addChildren(
    createNode(`${name}Elbow${side}`, { position: [0, -0.29, 0] }),
    boxFrom(`${name}Forearm${side}`, [-0.045, 0.045], [-0.26, 0], [-0.045, 0.045], SKIN),
    boxFrom(`${name}Hand${side}`, [-0.04, 0.04], [-0.35, -0.26], [-0.035, 0.045], SKIN),
  );
  const shoulder = addChildren(
    createNode(`${name}Shoulder${side}`, { position: [side === 'L' ? 0.22 : -0.22, 0.48, 0] }),
    boxFrom(`${name}UpperArm${side}`, [-0.055, 0.055], [-0.3, 0.03], [-0.055, 0.055], shirt),
    elbow,
  );
  return { shoulder, elbow };
}

export function createPerson(name, { shirt, pants, cap = null }) {
  const legL = leg(name, 'L', pants);
  const legR = leg(name, 'R', pants);
  const armL = arm(name, 'L', shirt);
  const armR = arm(name, 'R', shirt);
  const torso = addChildren(
    createNode(`${name}Torso`),
    boxFrom(`${name}Chest`, [-0.18, 0.18], [0.02, 0.56], [-0.1, 0.11], shirt),
    boxFrom(`${name}Neck`, [-0.045, 0.045], [0.56, 0.62], [-0.04, 0.05], SKIN),
    mesh(`${name}Head`, sphere(0.11, 10, 7), SKIN, { position: [0, 0.73, 0.01] }),
    mesh(`${name}Hair`, sphere(0.115, 10, 7), HAIR, { position: [0, 0.76, -0.015] }),
    armL.shoulder,
    armR.shoulder,
  );
  if (cap) torso.children.push(boxFrom(`${name}CapBrim`, [-0.14, 0.14], [0.83, 0.85], [-0.12, 0.2], cap), mesh(`${name}Cap`, sphere(0.12, 10, 5), cap, { position: [0, 0.8, 0] }));
  const pelvis = addChildren(
    createNode(`${name}Pelvis`, { position: [0, 0.9, 0] }),
    boxFrom(`${name}Hips`, [-0.17, 0.17], [-0.06, 0.08], [-0.09, 0.1], pants),
    legL.hip,
    legR.hip,
    torso,
  );
  const root = addChildren(createNode(name), pelvis);
  return {
    root,
    joints: {
      pelvis, torso,
      hipL: legL.hip, kneeL: legL.knee, hipR: legR.hip, kneeR: legR.knee,
      shoulderL: armL.shoulder, elbowL: armL.elbow, shoulderR: armR.shoulder, elbowR: armR.elbow,
    },
  };
}

// Stick broom held at its tied end; it hangs from a pivot in front of the chest, so
// turning the torso and the pivot sweeps the bristle tips across the paving.
function stickBroom(name) {
  return addChildren(
    createNode(`${name}BroomPivot`, { position: [0, 0.08, 0.32] }),
    cylinderBetween(`${name}BroomTie`, [0, 0.05, 0], [0, -0.15, 0.05], 0.035, BROOM_TIE),
    cylinderBetween(`${name}BroomSticks`, [0, -0.15, 0.05], [0, -0.92, 0.42], 0.03, BROOM_STICKS, { radiusTo: 0.16, segments: 10 }),
  );
}

// Positions are ESTIMATES on the paving in front of CCWS and around the co-working door.
export function createPeople() {
  const sweeper = createPerson('Sweeper', { shirt: { color: [0.86, 0.45, 0.14] }, pants: { color: [0.16, 0.2, 0.3] }, cap: { color: [0.2, 0.32, 0.2] } });
  const broom = stickBroom('Sweeper');
  sweeper.joints.torso.children.push(broom);

  const walkers = [
    createPerson('VisitorA', { shirt: { color: [0.25, 0.42, 0.68] }, pants: { color: [0.18, 0.18, 0.2] } }),
    createPerson('VisitorB', { shirt: { color: [0.92, 0.92, 0.9] }, pants: { color: [0.32, 0.27, 0.22] } }),
    createPerson('VisitorC', { shirt: { color: [0.62, 0.2, 0.22] }, pants: { color: [0.2, 0.24, 0.36] } }),
  ];

  const root = addChildren(createNode('People'), sweeper.root, ...walkers.map((walker) => walker.root));
  return { root, sweeper: { ...sweeper, broom }, walkers };
}
