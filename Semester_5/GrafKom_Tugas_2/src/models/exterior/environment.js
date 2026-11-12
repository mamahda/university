import { box, cylinder, gablePrism, profilePrism, sphere } from '../../webgl/geometry.js';
import { addChildren, createNode } from '../../webgl/sceneNode.js';
import { CANOPY, CCWS_DIMENSIONS, MATERIALS } from '../building/ccwsBuilding.js';
import { alignY, boxFrom, cylinderBetween, gableEndProfile, mesh } from '../shared/parts.js';

// Surroundings seen in the reference photos. Positions are ESTIMATES read from the photos,
// not measurements, and are given relative to the CCWS gable ends and the canopy so they
// follow the building if its size changes.
const WEST = -CCWS_DIMENSIONS.length / 2;
const EAST = CCWS_DIMENSIONS.length / 2;
const CANOPY_MID = (CANOPY.zMin + CANOPY.zMax) / 2;
const SHED = { x: WEST - 20, z: CANOPY.zMin - 2.8 };
const ENV_MATERIALS = {
  soil: { color: [0.45, 0.35, 0.26] },
  curb: { color: [0.74, 0.73, 0.69] },
  concrete: { color: [0.68, 0.67, 0.64] },
  lawn: { color: [0.4, 0.5, 0.28] },
  bark: { color: [0.43, 0.38, 0.32] },
  leaves: [{ color: [0.22, 0.36, 0.17] }, { color: [0.29, 0.44, 0.21] }, { color: [0.18, 0.31, 0.15] }],
  palm: { color: [0.3, 0.5, 0.22] },
  rail: { color: [0.16, 0.24, 0.48], specular: 0.4, shininess: 48 },
};

// Broad rain tree: tall trunk, a few thick branches, and a wide cluster of foliage. The
// branches and foliage hang off a crown pivot at the top of the trunk, so swaying the
// crown pivot moves the whole canopy while the trunk stays put.
function createTree(name, position, { trunkHeight, trunkRadius, crownRadius, spread, crownHeight, count = 6 }) {
  const crownBase = trunkHeight - 0.3;
  const crown = createNode(`${name}CrownPivot`, { position: [0, crownBase, 0] });
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + 0.4;
    const y = crownHeight + (i % 2) * 1.1 - 0.4 - crownBase;
    const center = [Math.cos(angle) * spread, y, Math.sin(angle) * spread];
    const branch = [center[0] * 0.75, y - 0.3, center[2] * 0.75];
    crown.children.push(
      mesh(`${name}Branch${i}`, cylinder(trunkRadius * 0.45, trunkRadius * 0.2, Math.hypot(...branch), 7), ENV_MATERIALS.bark, {
        rotation: alignY(branch),
      }),
      mesh(`${name}Crown${i}`, sphere(crownRadius * (0.8 + ((i * 37) % 5) * 0.06)), ENV_MATERIALS.leaves[i % 3], { position: center }),
    );
  }
  crown.children.push(mesh(`${name}CrownTop`, sphere(crownRadius * 1.1), ENV_MATERIALS.leaves[1], { position: [0, crownHeight + 1.2 - crownBase, 0] }));
  return addChildren(
    createNode(`${name}Pivot`, { position }),
    mesh(`${name}Trunk`, cylinder(trunkRadius, trunkRadius * 0.7, trunkHeight, 9), ENV_MATERIALS.bark),
    crown,
  );
}

// Bushy palm in front of the co-working gable (photos: eksterior-coworking-*).
function createPalm(name, position) {
  const palm = addChildren(
    createNode(`${name}Pivot`, { position }),
    mesh(`${name}Trunk`, cylinder(0.2, 0.14, 0.7, 7), ENV_MATERIALS.bark),
  );
  for (let i = 0; i < 18; i += 1) {
    const tilt = [-1.0, -0.6, -0.25][i % 3];
    const frond = addChildren(
      createNode(`${name}FrondPivot${i}`, { position: [0, 0.65, 0], rotation: [tilt, (i / 18) * Math.PI * 2 + (i % 3) * 0.2, 0] }),
      boxFrom(`${name}Frond${i}`, [-0.2, 0.2], [-0.02, 0.02], [0, 2.2 - (i % 3) * 0.3], ENV_MATERIALS.palm),
    );
    palm.children.push(frond);
  }
  return palm;
}

// Neighbouring buildings are plain massing (white walls + orange tiled gable roof) so the
// scene stays focused on CCWS. Positions and sizes are estimates.

// Gable roof running along X with white gable ends, built like the CCWS roof: the gable
// ends share the roof's span and pitch and stand a constant 0.15 m above the tiles.
function gableRoof(name, [x0, x1], [z0, z1], baseY, rise) {
  const length = x1 - x0;
  const span = z1 - z0 + 0.8;
  const centerX = (x0 + x1) / 2;
  const centerZ = (z0 + z1) / 2;
  const end = (suffix, x) => mesh(`${name}Gable${suffix}`, profilePrism(gableEndProfile(span, rise, 0.15), 0.3), MATERIALS.wall, {
    position: [x, baseY - 0.05, centerZ],
  });
  return [
    mesh(`${name}Roof`, gablePrism(length - 0.4, span, rise), MATERIALS.roof, { position: [centerX, baseY - 0.05, centerZ] }),
    end('West', x0 + 0.15),
    end('East', x1 - 0.15),
  ];
}

// Single-storey building beside the east end, across a narrow paved passage
// (photo: eksterior-fasad-serong-kanan).
function createEastAnnex() {
  return addChildren(
    createNode('EastAnnex', { position: [EAST + 7.7, 0, 0.3] }),
    boxFrom('AnnexWalls', [-5.2, 5.2], [0, 3.4], [-4.3, 4.3], MATERIALS.wall),
    ...gableRoof('Annex', [-5.2, 5.2], [-4.3, 4.3], 3.4, 1.8),
  );
}

// Two-storey building parallel behind CCWS (layout from the team), running from west of
// the canopy to the east end of the annex, joined to the middle of the CCWS back facade by
// a single-storey connector.
function createBackBuilding() {
  const { depth, floorBandTop } = CCWS_DIMENSIONS;
  const x = [WEST - 31.2, EAST + 12.9];
  const z = [-24, -14];
  return addChildren(
    createNode('BackBuilding'),
    boxFrom('BackBuildingWalls', x, [0, 7.0], z, MATERIALS.wall),
    ...gableRoof('BackBuilding', x, z, 7.0, 2.2),
    // Single storey, the back counterpart of the entrance portal on the front facade.
    // Runs right up to the CCWS back wall (z = −D/2), where the back facade leaves its middle
    // free, just as the front facade does for the entrance portal. It has the portal's width
    // and height, so its flat roof lines up with the top of the floor band under the upper
    // windows of the back wall.
    boxFrom('Connector', [-2.6, 2.6], [0, floorBandTop - 0.3], [z[1], -depth / 2], MATERIALS.wall),
    boxFrom('ConnectorRoof', [-2.8, 2.8], [floorBandTop - 0.3, floorBandTop], [z[1] - 0.2, -depth / 2], MATERIALS.wall),
  );
}

// Flat strip of the given width between two points on the ground.
function pathSegment(name, [x0, z0], [x1, z1], width, height, material) {
  const length = Math.hypot(x1 - x0, z1 - z0);
  return createNode(name, {
    position: [(x0 + x1) / 2, height / 2, (z0 + z1) / 2],
    rotation: [0, Math.atan2(-(z1 - z0), x1 - x0), 0],
    mesh: { geometry: box(length, height, width), material },
  });
}

// Ground zones read from the photos: herringbone paving around the buildings, under the
// canopy driveway and south of the canopy (eksterior-fasad-*, eksterior-coworking-gable-kanopi),
// a planted bed with the palm in front of the gable, bare soil west of the canopy and around
// the big tree trunk, a row of concrete pipe pieces in front of the canopy, a paved path from
// the canopy to the parking shed (eksterior-kanopi-*, lingkungan-pohon-parkir-motor), and a
// lawn beyond the paved area. Each zone sits a few millimetres higher than the one below it
// so overlapping surfaces do not flicker.
function createGround() {
  const ground = addChildren(
    createNode('GroundZones'),
    boxFrom('Lawn', [-150, 150], [-0.1, 0], [-150, 150], ENV_MATERIALS.lawn),
    boxFrom('Paving', [WEST - 7.6, EAST + 19.2], [0, 0.02], [-14, 22], MATERIALS.paving),
    boxFrom('PavingSouthWest', [WEST - 29.2, WEST - 7.6], [0, 0.02], [1.5, 22], MATERIALS.paving),
    boxFrom('SoilWest', [WEST - 29.2, WEST - 7.8], [0, 0.03], [-14, 1.5], ENV_MATERIALS.soil),
    boxFrom('CurbWest', [WEST - 7.8, WEST - 7.5], [0, 0.15], [-14, 1.5], ENV_MATERIALS.curb),
    boxFrom('CurbSoilSouth', [WEST - 29.2, WEST - 7.5], [0, 0.15], [1.5, 1.8], ENV_MATERIALS.curb),
    boxFrom('TreeBed', [WEST - 13.2, WEST - 7.8], [0, 0.035], [1.8, 6.5], ENV_MATERIALS.soil),
    boxFrom('PalmBed', [WEST - 2.6, WEST], [0, 0.035], [CANOPY.zMax + 0.2, CCWS_DIMENSIONS.depth / 2 + 1.4], ENV_MATERIALS.soil),
    boxFrom('PalmBedCurb', [WEST - 2.75, WEST - 2.6], [0, 0.15], [CANOPY.zMax + 0.2, CCWS_DIMENSIONS.depth / 2 + 1.4], ENV_MATERIALS.curb),
    boxFrom('CanopyPad', [WEST - CANOPY.reach - 0.5, WEST], [0, 0.08], [CANOPY.zMin - 0.7, CANOPY.zMax + 0.7], ENV_MATERIALS.concrete),
    boxFrom('ShedFloor', [SHED.x - 6.3, SHED.x + 6.3], [0, 0.08], [SHED.z - 2.8, SHED.z + 2.8], ENV_MATERIALS.concrete),
    pathSegment('ShedPath', [WEST - CANOPY.reach - 0.2, CANOPY.zMax - 0.8], [SHED.x + 5.5, SHED.z + 2.8], 1.5, 0.04, MATERIALS.paving),
  );
  for (let i = 0; i < 4; i += 1) {
    ground.children.push(mesh(`ConcretePipe${i}`, cylinder(0.16, 0.16, 0.8, 8), ENV_MATERIALS.concrete, {
      position: [WEST - CANOPY.reach - 0.75, 0.16, CANOPY_MID - 0.85 + i * 0.34],
      rotation: [0, 0, Math.PI / 2],
    }));
  }
  return ground;
}

// One straight run of the blue pipe railing: posts about every 1.5 m, a top rail and a
// middle rail, from `from` to `to` ([x, z] in the parent's local coordinates).
function railingRun(name, from, to) {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const posts = Math.max(1, Math.round(length / 1.5));
  const at = (t, y) => [from[0] + (to[0] - from[0]) * t, y, from[1] + (to[1] - from[1]) * t];
  const run = addChildren(
    createNode(name),
    cylinderBetween(`${name}TopRail`, at(0, 1.0), at(1, 1.0), 0.03, ENV_MATERIALS.rail),
    cylinderBetween(`${name}MidRail`, at(0, 0.5), at(1, 0.5), 0.025, ENV_MATERIALS.rail),
  );
  for (let i = 0; i <= posts; i += 1) {
    run.children.push(cylinderBetween(`${name}Post${i}`, at(i / posts, 0), at(i / posts, 1.03), 0.03, ENV_MATERIALS.rail));
  }
  return run;
}

// Motorcycle parking shed with a tiled gable roof on posts, fenced all round by the blue
// pipe railing seen in lingkungan-pohon-parkir-motor. The only gap is at the front-east
// corner, where the paved path from the canopy arrives.
function createParkingShed() {
  const fx = 6.2;
  const fz = 2.7;
  const gap = [4.5, fx];
  const fence = addChildren(
    createNode('ShedFence'),
    railingRun('FenceFront', [-fx, fz], [gap[0], fz]),
    railingRun('FenceWest', [-fx, -fz], [-fx, fz]),
    railingRun('FenceBack', [fx, -fz], [-fx, -fz]),
    railingRun('FenceEast', [fx, fz], [fx, -fz]),
  );
  const shed = addChildren(
    createNode('ParkingShed', { position: [SHED.x, 0, SHED.z] }),
    mesh('ShedRoof', gablePrism(12.6, 5.6, 1.3), MATERIALS.roof, { position: [0, 2.5, 0] }),
    fence,
  );
  [-6, -2, 2, 6].forEach((x, i) => {
    shed.children.push(
      boxFrom(`ShedPostFront${i}`, [x - 0.1, x + 0.1], [0, 2.5], [2.4, 2.6], MATERIALS.wall),
      boxFrom(`ShedPostBack${i}`, [x - 0.1, x + 0.1], [0, 2.5], [-2.6, -2.4], MATERIALS.wall),
    );
  });
  return shed;
}

// Returns the environment root plus the pivots the animator sways in the wind.
export function createEnvironment() {
  const trees = addChildren(
    createNode('Trees'),
    createTree('TreeCanopyFront', [WEST - 10.2, 0, 4], { trunkHeight: 5, trunkRadius: 0.6, crownRadius: 3.4, spread: 4.2, crownHeight: 9 }),
    createTree('TreeCanopyBack', [WEST - 12.2, 0, -8], { trunkHeight: 4.6, trunkRadius: 0.55, crownRadius: 3.0, spread: 3.6, crownHeight: 8.6 }),
    createTree('TreeNorthWest', [WEST - 4.2, 0, -9], { trunkHeight: 4.2, trunkRadius: 0.45, crownRadius: 2.4, spread: 2.6, crownHeight: 8, count: 5 }),
    createTree('TreeWestFar', [WEST - 25.2, 0, 7], { trunkHeight: 4.4, trunkRadius: 0.5, crownRadius: 3, spread: 3.5, crownHeight: 8.2 }),
    createTree('TreeEastFront', [EAST + 23.2, 0, 9], { trunkHeight: 3.6, trunkRadius: 0.35, crownRadius: 2.4, spread: 2.6, crownHeight: 6.6, count: 5 }),
    createTree('TreeEastBack', [EAST + 24.2, 0, -7], { trunkHeight: 4, trunkRadius: 0.4, crownRadius: 2.7, spread: 3, crownHeight: 7.4, count: 5 }),
  );

  const palm = createPalm('PalmCorner', [WEST - 1.4, 0, 4.2]);
  const root = addChildren(
    createNode('Environment'),
    createGround(),
    palm,
    trees,
    createEastAnnex(),
    createBackBuilding(),
    createParkingShed(),
  );
  return {
    root,
    animated: {
      crowns: trees.children.map((tree) => tree.children.find((node) => node.name.endsWith('CrownPivot'))),
      fronds: palm.children.filter((node) => node.name.includes('FrondPivot')),
    },
  };
}
