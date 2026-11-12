import { CANOPY, CCWS_DIMENSIONS } from '../models/building/ccwsBuilding.js';
import { DOORS } from './walkArea.js';

// People animation: every pose is set through pivot rotations, every move through the root
// position. Paths are polylines of [x, y, z] points in world space; y follows the ramp and
// the side landing so feet stay on the ground. While "inside" a walker is hidden, since the
// building has no interior. A door swings open on its hinge pivots while someone is near it
// or has just gone through, and closes again afterwards.
const { length: L, depth: D, plinthHeight } = CCWS_DIMENSIONS;
const WEST = -L / 2;
const SPEED = 1.15;
const STRIDE = 1.35;

// Main entrance: across the paving, up the middle ramp, to the double door.
const toMainDoor = (start) => [start, [1.0, 0, D / 2 + 4.6], [0, 0, D / 2 + 3.3], [0, 0, D / 2 + 2.95], [0, plinthHeight, D / 2 + 1.7], [0, plinthHeight, D / 2 + 0.35]];
// Co-working door: from the paving south of the canopy, past the bins, onto the landing.
const toSideDoor = [[WEST - 8.8, 0, CANOPY.zMax + 3.5], [WEST - 3.8, 0, 0.9], [WEST - 1.4, 0, 0.3], [WEST - 1.15, 0.35, 0.3], [WEST - 0.35, 0.35, 0.3]];

const WALKERS = [
  { path: toMainDoor([9, 0, D / 2 + 13]), door: 'main', offset: 0, inside: 6 },
  { path: toSideDoor, door: 'side', offset: 7, inside: 8 },
  { path: toMainDoor([-7, 0, D / 2 + 14]), door: 'main', offset: 15, inside: 5 },
];
const DOOR_OPEN_DISTANCE = 2.6;
const DOOR_HOLD = 1.4;
const DOOR_ANGLE = 1.35;

function measure(path) {
  const lengths = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[2] - path[i][2]));
  return { path, lengths, total: lengths.reduce((a, b) => a + b, 0) };
}

// Point and walking direction at distance `d` along the path.
function sample({ path, lengths }, d) {
  for (let i = 0; i < lengths.length; i += 1) {
    if (d <= lengths[i] || i === lengths.length - 1) {
      const t = Math.min(1, Math.max(0, d / lengths[i]));
      const a = path[i];
      const b = path[i + 1];
      return { position: a.map((v, k) => v + (b[k] - v) * t), heading: Math.atan2(b[0] - a[0], b[2] - a[2]) };
    }
    d -= lengths[i];
  }
  return null;
}

// Leg and arm swing for a walk phase (radians). Negative X rotation swings a limb forward.
function pose(joints, phase, amount) {
  const swing = Math.sin(phase) * amount;
  joints.hipL.rotation[0] = -swing * 0.45;
  joints.hipR.rotation[0] = swing * 0.45;
  joints.kneeL.rotation[0] = Math.max(0, Math.sin(phase + 1.3)) * 0.6 * amount;
  joints.kneeR.rotation[0] = Math.max(0, Math.sin(phase + 1.3 + Math.PI)) * 0.6 * amount;
  joints.shoulderL.rotation[0] = swing * 0.35;
  joints.shoulderR.rotation[0] = -swing * 0.35;
  joints.elbowL.rotation[0] = -0.25 * amount;
  joints.elbowR.rotation[0] = -0.25 * amount;
  joints.pelvis.position[1] = 0.9 + Math.abs(Math.cos(phase)) * 0.025 * amount;
}

// `doors.main` and `doors.side` are the two hinge pivots of each double door. Each pair
// opens outwards: the first leaf turns negative about Y, the second positive.
export function createPeopleMotion(people, doors) {
  const walkers = people.walkers.map((walker, i) => ({ ...walker, ...WALKERS[i], route: measure(WALKERS[i].path) }));
  const { sweeper } = people;
  const sweepBase = [6, 0, D / 2 + 7];
  const openness = { main: 0, side: 0 };

  // `time` is the animation clock (frozen while paused); `delta` is real frame time, so doors
  // still react to `viewer` (the walk-mode camera, [x, z] or null) when animation is paused.
  return function update(time, delta, viewer) {
    const wanted = { main: false, side: false };
    if (viewer) {
      for (const name of ['main', 'side']) {
        if (Math.hypot(viewer[0] - DOORS[name][0], viewer[1] - DOORS[name][1]) < DOOR_OPEN_DISTANCE) wanted[name] = true;
      }
    }
    for (const walker of walkers) {
      // One cycle: walk in, stay inside, walk back out, pause out of sight.
      const walk = walker.route.total / SPEED;
      const cycle = walk * 2 + walker.inside + 3;
      const t = (((time + walker.offset) % cycle) + cycle) % cycle;
      let distance = null;
      let reverse = false;
      if (t < walk) distance = t * SPEED;
      else if (t >= walk + walker.inside && t < walk * 2 + walker.inside) {
        distance = walker.route.total - (t - walk - walker.inside) * SPEED;
        reverse = true;
      }
      walker.root.visible = distance !== null;
      // Keep the door open just after the walker goes in and just before they come out.
      const atDoor = (t >= walk && t < walk + DOOR_HOLD) || (t >= walk + walker.inside - DOOR_HOLD && t < walk + walker.inside);
      if (atDoor || (distance !== null && walker.route.total - distance < DOOR_OPEN_DISTANCE)) wanted[walker.door] = true;
      if (distance === null) continue;
      const { position, heading } = sample(walker.route, distance);
      walker.root.position = position;
      walker.root.rotation[1] = reverse ? heading + Math.PI : heading;
      pose(walker.joints, (distance / STRIDE) * 2 * Math.PI, 1);
    }

    for (const name of ['main', 'side']) {
      openness[name] += ((wanted[name] ? 1 : 0) - openness[name]) * Math.min(1, delta * 3);
      const angle = openness[name] * openness[name] * (3 - 2 * openness[name]) * DOOR_ANGLE;
      doors[name][0].rotation[1] = -angle;
      doors[name][1].rotation[1] = angle;
    }

    // Sweeper: faces the building, side-steps slowly along the yard and swings the broom
    // from the hips; the torso leans forward and the arms stay in a holding pose.
    const j = sweeper.joints;
    const drift = Math.sin(time * 0.09);
    sweeper.root.position = [sweepBase[0] + drift * 4, 0, sweepBase[2]];
    sweeper.root.rotation[1] = Math.PI;
    const stroke = Math.sin(time * 2.4);
    j.torso.rotation = [0.32, stroke * 0.35, 0];
    sweeper.broom.rotation = [0.15, stroke * 0.25, 0];
    j.shoulderR.rotation = [-0.75, 0, 0.12];
    j.elbowR.rotation[0] = -0.6;
    j.shoulderL.rotation = [-0.95, 0, -0.35];
    j.elbowL.rotation[0] = -0.5;
    // Small shuffle of the feet while side-stepping.
    const shuffle = Math.sin(time * 1.6) * 0.12;
    j.hipL.rotation = [-0.1, 0, shuffle];
    j.hipR.rotation = [-0.1, 0, -shuffle];
    j.kneeL.rotation[0] = 0.15;
    j.kneeR.rotation[0] = 0.15;
  };
}
