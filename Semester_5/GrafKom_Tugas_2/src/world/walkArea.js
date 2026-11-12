import { CANOPY, CCWS_DIMENSIONS } from '../models/building/ccwsBuilding.js';
import { CAFE_LAYOUT } from '../models/interior/cafeCounter.js';
import { EXHIBITION_LAYOUT } from '../models/exhibits/exhibition.js';
import { MOTORCYCLE_CONFIG } from '../models/exhibits/motorcycle.js';
import { ROBOT_CONFIG } from '../models/exhibits/robotArm.js';
import { TRAIN_CONFIG } from '../models/exhibits/train.js';

// Where the first-person walker can go. Colliders are [x0, x1, z0, z1] ground boxes in world
// space. The CCWS hall can be entered through the main double door and the co-working door:
// its four outer walls are solid except for those two gaps. Inside, the train mockup, the
// robot and motorcycle platforms and the café counters block the way; tables and chairs do
// not (kept simple on purpose). Positions come from the same layout constants the models use.
const { length: L, depth: D, plinthHeight, wallThickness: T } = CCWS_DIMENSIONS;
const WEST = -L / 2;
const EAST = L / 2;
const front = D / 2;
const MAIN_DOOR = 0.9; // half-width of the walkable gap (the two leaves span ±0.95 m)
const SIDE_DOOR = 0.8; // half-width of the co-working door gap (leaves span ±0.85 m)

export const DOORS = { main: [0, front], side: [WEST, 0] };

function exhibitColliders() {
  const { train, motorcycle, robot } = EXHIBITION_LAYOUT;
  // The train stands turned 90°, so its length runs along Z and its depth along X.
  const trainBox = [train.x - TRAIN_CONFIG.depth / 2, train.x + TRAIN_CONFIG.depth / 2, train.z - TRAIN_CONFIG.length / 2, train.z + TRAIN_CONFIG.length / 2];
  const half = ROBOT_CONFIG.platform.size / 2;
  const robotBox = [robot.x - half, robot.x + half, robot.z - half, robot.z + half];
  // Bounding box of the turned motorcycle platform.
  const { length, width } = MOTORCYCLE_CONFIG.platform;
  const c = Math.abs(Math.cos(motorcycle.turn));
  const s = Math.abs(Math.sin(motorcycle.turn));
  const hx = (length / 2) * c + (width / 2) * s;
  const hz = (length / 2) * s + (width / 2) * c;
  const motoBox = [motorcycle.x - hx, motorcycle.x + hx, motorcycle.z - hz, motorcycle.z + hz];
  return [trainBox, robotBox, motoBox];
}

function cafeColliders() {
  // Same local boxes as createCafeCounter, moved to the café origin.
  const [cx, cz] = CAFE_LAYOUT.position;
  const wallZ = CAFE_LAYOUT.backWallZ;
  return [
    [-2.4, 2.0, 0.5, 1.2], // front counter
    [1.4, 2.0, -1.4, 0.5], // return counter
    [-3.0, 2.2, wallZ, wallZ + 0.7], // back counter
  ].map(([x0, x1, z0, z1]) => [cx + x0, cx + x1, cz + z0, cz + z1]);
}

export const WALK_COLLIDERS = [
  // Outer walls of the hall, with the two door gaps.
  [WEST, -MAIN_DOOR, front - T, front],
  [MAIN_DOOR, EAST, front - T, front],
  [WEST, EAST, -front, -front + T],
  [WEST, WEST + T, -front, -SIDE_DOOR],
  [WEST, WEST + T, SIDE_DOOR, front],
  [EAST - T, EAST, -front, front],
  // Outside the hall.
  [WEST, EAST, -front - 1.4, -front],               // back plinth
  [WEST, -2.6, front, front + 1.4],                 // front plinth, west of the portal
  [2.6, EAST, front, front + 1.4],                  // front plinth, east of the portal
  [-2.6, -1.95, front, front + 2.95],               // portal wall + cheek wall, west
  [1.95, 2.6, front, front + 2.95],                 // portal wall + cheek wall, east
  [WEST - CANOPY.reach - 0.4, WEST - CANOPY.reach + 0.4, CANOPY.zMin - 0.6, CANOPY.zMin], // canopy column north
  [WEST - CANOPY.reach - 0.4, WEST - CANOPY.reach + 0.4, CANOPY.zMax, CANOPY.zMax + 0.6], // canopy column south
  [-2.6, 2.6, -14, -front - 1.4],                   // connector to the back building
  [WEST - 31.2, EAST + 12.9, -24, -14],             // back building
  [EAST + 2.5, EAST + 12.9, -4, 4.6],               // east annex
  // Inside the hall.
  ...exhibitColliders(),
  ...cafeColliders(),
];

export function groundAt(x, z) {
  if (x > WEST && x < EAST && z > -front && z < front) return plinthHeight; // hall floor
  const onPortal = x > -1.95 && x < 1.95;
  if (onPortal && z >= front && z <= front + 1.7) return plinthHeight;
  if (onPortal && z > front + 1.7 && z < front + 2.95) return plinthHeight * (1 - (z - front - 1.7) / 1.25);
  if (x > WEST - 1.2 && x <= WEST && z > -1.4 && z < 1.4) return 0.35;
  return 0;
}

// Start on the paving in front of the main entrance, facing the building.
export const WALK_START = { position: [0, front + 14], yaw: 0 };
