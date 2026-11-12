import { cylinder, extrudedPolygon, gablePrism, profilePrism } from '../../webgl/geometry.js';
import { addChildren, createNode } from '../../webgl/sceneNode.js';
import { createTextTexture } from '../../webgl/textTexture.js';
import { boxFrom, cylinderBetween, gableEndProfile, mesh, seededRandom, slabWithOpenings } from '../shared/parts.js';
import {
  ceilingSlatTexture, concreteTexture, pebbleTexture, plasterTexture, plinthTexture, roofTileTexture, turfTexture,
  windowGrilleTexture,
} from '../shared/proceduralTextures.js';

// Semua ukuran (meter) adalah PERKIRAAN dari foto dan video di public/assets/references,
// bukan hasil pengukuran. Sumbu: X = panjang gedung (sisi co-working di -X),
// Y = tinggi (tanah di Y = 0), Z = kedalaman (fasad utama menghadap +Z).
export const CCWS_DIMENSIONS = {
  length: 24.5,
  depth: 12,
  eaveHeight: 7.2,
  ridgeHeight: 9.5,
  plinthHeight: 0.6,
  wallThickness: 0.3, // estimate; the walls are hollow so the interior can be seen
  // Facade bands, read from the ratio of band heights in eksterior-fasad-serong-*.
  groundWindowBottom: 0.9,
  groundWindowTop: 3.3,
  floorBandTop: 4.35,
  fasciaBottom: 5.9,
  fasciaTop: 7.25,
};

// Facade layout along X, measured outwards from the centre and mirrored on both sides.
// Both facade photos and the second video show the same order from each end pier towards
// the middle: a 6-column window bay, a downpipe, a 2-column bay, then the entrance portal.
const PANE = 1.05;
const FACADE = {
  portalHalf: 2.6,
  innerBay: [2.65, 4.75],
  innerPipe: 4.95,
  outerBay: [5.15, 11.45],
  endPipe: 11.2,
};
// Upper window mullions sit on the pane column lines; five panes span the portal.
const UPPER_MULLIONS = [0.53, 1.59, 2.65, 3.7, 4.75, 5.15, 6.2, 7.25, 8.3, 9.35, 10.4, 11.45];

// Canopy on the west gable (eksterior-coworking-gable-kanopi, eksterior-kanopi-depan): the
// side door sits under the gable apex (z = 0) and the canopy, about 4.9 m wide, is centred
// on it. `reach` is how far the slab sticks out from the wall, `apex` its pentagon point,
// `slabTop` the top of the slab; its underside (slabTop − 0.77) clears the side door head.
export const CANOPY = { zMin: -2.45, zMax: 2.45, reach: 7.0, apex: 8.4, slabTop: 3.9 };


const LAMP_COLOR = [1.0, 0.84, 0.6];

export const MATERIALS = {
  wall: { color: [0.97, 0.97, 0.95], texture: plasterTexture(), tileSize: [3, 3], bump: 0.004 },
  plinth: { color: [1, 1, 1], flatColor: [0.9, 0.9, 0.88], texture: plinthTexture(), tileSize: [4, 0.6] },
  concrete: { color: [0.98, 0.98, 0.96], texture: concreteTexture(), tileSize: [2, 2], bump: 0.006 },
  roof: { color: [1, 1, 1], flatColor: [0.72, 0.36, 0.22], texture: roofTileTexture(), tileSize: [1.2, 1.4], bump: 0.035, specular: 0.08 },
  ridge: { color: [0.6, 0.3, 0.18], specular: 0.08 },
  glass: {
    color: [0.24, 0.29, 0.33], specular: 0.9, shininess: 96, reflect: 0.45,
    emissive: [1.0, 0.8, 0.52], glow: 0.55,
  },
  windowFrame: { color: [0.55, 0.58, 0.6], specular: 0.25 },
  frameWhite: { color: [0.95, 0.95, 0.94], specular: 0.1 },
  pipe: { color: [0.36, 0.45, 0.56], specular: 0.35, shininess: 48 },
  turf: { color: [1, 1, 1], flatColor: [0.24, 0.42, 0.2], texture: turfTexture(), tileSize: [0.6, 0.6] },
  pebbles: { color: [1, 1, 1], flatColor: [0.82, 0.82, 0.8], texture: pebbleTexture(), tileSize: [0.8, 0.8] },
  doorFrame: { color: [0.24, 0.24, 0.26], specular: 0.35 },
  doorLeafFrame: { color: [0.42, 0.43, 0.45], specular: 0.5, shininess: 48 },
  doorGlass: {
    color: [0.12, 0.14, 0.16], specular: 0.9, shininess: 96, reflect: 0.5,
    emissive: [1.0, 0.82, 0.55], glow: 0.35,
  },
  handle: { color: [0.75, 0.76, 0.78], specular: 0.8, shininess: 64 },
  ceiling: { color: [1, 1, 1], flatColor: [0.24, 0.23, 0.22], texture: ceilingSlatTexture(), tileSize: [1.2, 1.2] },
  ceilingDark: { color: [0.17, 0.17, 0.18] },
  lampLens: { color: [0.95, 0.94, 0.9], emissive: LAMP_COLOR, glow: 2.4, castShadow: false },
  planter: { color: [0.42, 0.43, 0.44], texture: concreteTexture(), tileSize: [1, 1] },
  soil: { color: [0.3, 0.23, 0.17] },
  leaf: { color: [0.24, 0.42, 0.2], specular: 0.15 },
  leafEdge: { color: [0.62, 0.62, 0.3] },
  sink: { color: [0.88, 0.88, 0.86], specular: 0.4 },
  metal: { color: [0.62, 0.63, 0.65], specular: 0.6, shininess: 48 },
  rubber: { color: [0.08, 0.08, 0.09] },
  // One texture tile = 2 columns × 3 rows of panes (see windowGrilleTexture). At night the
  // dark glass parts glow as if the rooms behind were lit.
  grille: {
    color: [1, 1, 1], flatColor: [0.36, 0.4, 0.43], texture: windowGrilleTexture(), tileSize: [2 * PANE, 2.4],
    emissive: [1.0, 0.8, 0.52], glow: 0.5, emissiveMask: true,
  },
  paving: { color: [1, 1, 1], flatColor: [0.55, 0.55, 0.53], texture: '/assets/textures/paving-herringbone.jpg', tileSize: [1.6, 1.6], bump: 0.012 },
};

// Sign letters: the text texture on several thin, alpha-tested layers stacked along `axis`
// (0 = X, 2 = Z) in direction `outward`, so the letters have depth and cast shadows.
function sign(name, lines, color, align, ranges, canvasSize, { axis, outward, layers = 4 }) {
  const material = {
    color: [1, 1, 1],
    texture: createTextTexture(lines, { color, align, ...canvasSize }),
    tileSize: [Math.max(ranges[0][1] - ranges[0][0], ranges[2][1] - ranges[2][0]), ranges[1][1] - ranges[1][0]],
    alphaTest: true,
    specular: 0.2,
  };
  const group = createNode(name);
  for (let i = 0; i < layers; i += 1) {
    const layerRanges = ranges.map((range) => [...range]);
    const start = ranges[axis][outward > 0 ? 1 : 0] + outward * i * 0.012;
    layerRanges[axis] = outward > 0 ? [start, start + 0.004] : [start - 0.004, start];
    group.children.push(boxFrom(`${name}Layer${i}`, ...layerRanges, material));
  }
  return group;
}

const mirror = (spans) => [...spans.map(([a, b]) => [-b, -a]).reverse(), ...spans];
const mirrorValues = (values) => [...values.map((x) => -x).reverse(), ...values];

// Hollow outer walls: four slabs with openings where the facade windows, the entrance and
// the west side door are. The window and door parts of the facade sit on the outside face and
// close the openings from outside, so the exterior looks the same as with a solid block;
// from inside, the openings show the glass (interior.js adds daylight panes and frames).
export function wallOpenings(withEntrance) {
  const { groundWindowBottom: gb, groundWindowTop: gt, floorBandTop, fasciaBottom, plinthHeight } = CCWS_DIMENSIONS;
  const ground = mirror([FACADE.innerBay, FACADE.outerBay]).map(([a, b]) => [a, b, gb, gt]);
  const upper = [[-FACADE.outerBay[1], -FACADE.outerBay[0]], [-FACADE.innerBay[1], FACADE.innerBay[1]], [FACADE.outerBay[0], FACADE.outerBay[1]]]
    .map(([a, b]) => [a, b, floorBandTop, fasciaBottom]);
  if (!withEntrance) return [...ground, ...upper];
  // Door opening up to the frame head (3.0 m), narrow window columns either side up to 3.3 m.
  const post = 1.03;
  return [...ground, ...upper, [-post, post, plinthHeight, 3.0], [-1.95, -post, gb, gt], [post, 1.95, gb, gt]];
}

function createWalls() {
  const { length: L, depth: D, eaveHeight, wallThickness: t, plinthHeight } = CCWS_DIMENSIONS;
  const door = 0.85;
  const walls = createNode('Walls');
  walls.children.push(
    slabWithOpenings('WallFront', [-L / 2, L / 2], [0, eaveHeight], [D / 2 - t, D / 2], wallOpenings(true), MATERIALS.wall),
    slabWithOpenings('WallBack', [-L / 2, L / 2], [0, eaveHeight], [-D / 2, -D / 2 + t], wallOpenings(false), MATERIALS.wall),
    slabWithOpenings('WallWest', [-D / 2 + t, D / 2 - t], [0, eaveHeight], [-L / 2, -L / 2 + t], [[-door, door, plinthHeight, 2.65]], MATERIALS.wall, 'x'),
    boxFrom('WallEast', [L / 2 - t, L / 2], [0, eaveHeight], [-D / 2 + t, D / 2 - t], MATERIALS.wall),
  );
  return walls;
}

function createMainBlock() {
  const { length: L, depth: D, eaveHeight, ridgeHeight } = CCWS_DIMENSIONS;
  // The roof eaves rest on the front edge of the fascia (0.9 m out from each long wall), as in
  // the facade photos. The gable walls follow the roof outline at exactly the same pitch and
  // stand a constant 0.2 m proud of it (a pentagon: the roof triangle raised by a band).
  const span = D + 1.8;
  const rise = ridgeHeight - eaveHeight;
  const gable = (name, x) => mesh(name, profilePrism(gableEndProfile(span, rise, 0.2), 0.4), MATERIALS.wall, {
    position: [x, eaveHeight - 0.05, 0],
  });
  const roof = addChildren(
    createNode('RoofGroup'),
    mesh('Roof', gablePrism(L - 0.5, span, rise), MATERIALS.roof, { position: [0, eaveHeight - 0.05, 0] }),
    mesh('RidgeCap', profilePrism([[-0.2, 0], [0.2, 0], [0, 0.16]], L - 0.5), MATERIALS.ridge, { position: [0, ridgeHeight - 0.08, 0] }),
  );
  return addChildren(
    createNode('MainBlock'),
    createWalls(),
    roof,
    gable('GableWest', -L / 2 + 0.2),
    gable('GableEast', L / 2 - 0.2),
  );
}

// White 3D frame grid over a textured window bay, plus a concrete sill.
function windowFrames(name, [x0, x1], [y0, y1], columns, rows) {
  const group = createNode(name);
  const bar = 0.06;
  const z = [0.03, 0.1];
  for (let c = 0; c <= columns; c += 1) {
    const x = x0 + ((x1 - x0) * c) / columns;
    const half = c === 0 || c === columns ? bar : bar / 2;
    group.children.push(boxFrom(`${name}Mullion${c}`, [x - half, x + half], [y0, y1], z, MATERIALS.frameWhite));
  }
  for (let r = 0; r <= rows; r += 1) {
    const y = y0 + ((y1 - y0) * r) / rows;
    const half = r === 0 || r === rows ? bar : bar / 2;
    group.children.push(boxFrom(`${name}Transom${r}`, [x0, x1], [y - half, y + half], z, MATERIALS.frameWhite));
  }
  group.children.push(boxFrom(`${name}Sill`, [x0 - 0.06, x1 + 0.06], [y0 - 0.1, y0 - 0.02], [0, 0.18], MATERIALS.concrete));
  return group;
}

// Top-hung sash of the upper windows: the pivot sits on the hinge line, the pane hangs
// below it, and a negative rotation about X swings the bottom edge outwards.
function awningSash(name, [x0, x1], hingeY, height) {
  const width = x1 - x0;
  const frame = 0.05;
  return addChildren(
    createNode(`${name}Pivot`, { position: [(x0 + x1) / 2, hingeY, 0.09] }),
    boxFrom(`${name}Glass`, [-width / 2 + frame, width / 2 - frame], [-height + frame, -frame], [-0.015, 0.015], MATERIALS.glass),
    boxFrom(`${name}FrameTop`, [-width / 2, width / 2], [-frame, 0], [-0.03, 0.03], MATERIALS.windowFrame),
    boxFrom(`${name}FrameBottom`, [-width / 2, width / 2], [-height, -height + frame], [-0.03, 0.03], MATERIALS.windowFrame),
    boxFrom(`${name}FrameLeft`, [-width / 2, -width / 2 + frame], [-height, 0], [-0.03, 0.03], MATERIALS.windowFrame),
    boxFrom(`${name}FrameRight`, [width / 2 - frame, width / 2], [-height, 0], [-0.03, 0.03], MATERIALS.windowFrame),
  );
}

// Round downpipe with the gooseneck seen in the facade photos: it drops from the fascia
// soffit close to the wall, kinks outwards past the floor band, and runs down to the plinth.
function downpipe(name, x) {
  const { plinthHeight, fasciaBottom } = CCWS_DIMENSIONS;
  const r = 0.075;
  const kinkTop = fasciaBottom - 0.25;
  const kinkBottom = fasciaBottom - 0.75;
  return addChildren(
    createNode(name),
    cylinderBetween(`${name}Top`, [x, kinkTop, 0.16], [x, fasciaBottom + 0.05, 0.16], r, MATERIALS.pipe),
    cylinderBetween(`${name}Neck`, [x, kinkBottom, 0.42], [x, kinkTop, 0.16], r, MATERIALS.pipe),
    cylinderBetween(`${name}Main`, [x, plinthHeight + 0.15, 0.42], [x, kinkBottom, 0.42], r, MATERIALS.pipe),
    cylinderBetween(`${name}Shoe`, [x, plinthHeight + 0.02, 0.6], [x, plinthHeight + 0.15, 0.42], r, MATERIALS.pipe),
    ...[1.6, 3.6].map((y, i) => boxFrom(`${name}Bracket${i}`, [x - 0.1, x + 0.1], [y, y + 0.05], [0.3, 0.5], MATERIALS.pipe)),
  );
}

// Concrete pot with snake plants (sansevieria), as along the planter strip in the photos.
function planter(name, x, seed) {
  const { plinthHeight } = CCWS_DIMENSIONS;
  const random = seededRandom(seed);
  const pot = addChildren(
    createNode(name, { position: [x, plinthHeight, 0.3] }),
    boxFrom(`${name}Pot`, [-0.2, 0.2], [0, 0.38], [-0.18, 0.18], MATERIALS.planter),
    boxFrom(`${name}Soil`, [-0.17, 0.17], [0.38, 0.39], [-0.15, 0.15], MATERIALS.soil),
  );
  for (let i = 0; i < 6; i += 1) {
    const height = 0.45 + random() * 0.35;
    const leaf = addChildren(
      createNode(`${name}Leaf${i}`, {
        position: [(random() - 0.5) * 0.2, 0.38, (random() - 0.5) * 0.16],
        rotation: [(random() - 0.5) * 0.35, random() * Math.PI, (random() - 0.5) * 0.35],
      }),
      boxFrom(`${name}LeafBlade${i}`, [-0.035, 0.035], [0, height], [-0.006, 0.006], MATERIALS.leaf),
      boxFrom(`${name}LeafTip${i}`, [-0.02, 0.02], [height, height + 0.06], [-0.004, 0.004], MATERIALS.leafEdge),
    );
    pot.children.push(leaf);
  }
  return pot;
}

// Glass door leaf hung on a vertical hinge: the pivot is the hinge, the leaf extends along
// local +X (direction = 1) or −X (direction = −1), or along Z when axis = 'z', and the
// handle sits near the free edge on the outside.
function doorLeaf(name, pivotPosition, width, height, direction, axis = 'x') {
  const span = direction > 0 ? [0.02, width] : [-width, -0.02];
  const handleAt = direction > 0 ? width - 0.12 : -width + 0.12;
  const along = (range, y, depth) => (axis === 'x' ? [range, y, depth] : [depth, y, range]);
  const handle = axis === 'x' ? [handleAt, 0.07] : [-0.07, handleAt];
  return addChildren(
    createNode(`${name}Pivot`, { position: pivotPosition }),
    boxFrom(`${name}Glass`, ...along([span[0] + 0.07, span[1] - 0.07], [0.12, height - 0.07], [-0.012, 0.012]), MATERIALS.doorGlass),
    boxFrom(`${name}Stile0`, ...along([span[0], span[0] + 0.07], [0, height], [-0.025, 0.025]), MATERIALS.doorLeafFrame),
    boxFrom(`${name}Stile1`, ...along([span[1] - 0.07, span[1]], [0, height], [-0.025, 0.025]), MATERIALS.doorLeafFrame),
    boxFrom(`${name}Rail0`, ...along(span, [0, 0.12], [-0.025, 0.025]), MATERIALS.doorLeafFrame),
    boxFrom(`${name}Rail1`, ...along(span, [height - 0.07, height], [-0.025, 0.025]), MATERIALS.doorLeafFrame),
    cylinderBetween(`${name}Handle`, [handle[0], 0.85, handle[1]], [handle[0], 1.35, handle[1]], 0.015, MATERIALS.handle),
  );
}

// Entrance portal (eksterior-fasad-pintu-utama, eksterior-fasad-serong-*): a white box frame
// projecting 1.7 m with a two-line sign, a central double glass door flanked by two narrow
// window columns on each side, and in front, between two low cheek walls: steps, a ramp in
// the middle, and steps again.
function createEntrance() {
  const { plinthHeight: floor, groundWindowBottom, groundWindowTop } = CCWS_DIMENSIONS;
  // Double glass door, two framed leaves of 0.93 m; a narrow two-column window either side.
  const door = 0.95;
  const post = door + 0.08;
  const narrowGrille = { ...MATERIALS.grille, tileSize: [1.95 - post, 2.4] };
  const doorWest = doorLeaf('MainDoorWest', [-door, floor, 0.1], door - 0.02, 2.3, 1);
  const doorEast = doorLeaf('MainDoorEast', [door, floor, 0.1], door - 0.02, 2.3, -1);
  const rampHalf = 0.65;
  const ramp = mesh('Ramp', profilePrism([[1.7, 0], [2.95, 0], [2.95, 0.02], [1.7, floor]], 2 * rampHalf), MATERIALS.concrete);
  const steps = (side, [x0, x1]) => [
    boxFrom(`StepTop${side}`, [x0, x1], [0, 0.4], [1.7, 2.05], MATERIALS.concrete),
    boxFrom(`StepBottom${side}`, [x0, x1], [0, 0.2], [2.05, 2.4], MATERIALS.concrete),
  ];
  const entrance = addChildren(
    createNode('Entrance'),
    boxFrom('PortalWallWest', [-2.6, -1.95], [floor, 4.35], [0, 1.7], MATERIALS.wall),
    boxFrom('PortalWallEast', [1.95, 2.6], [floor, 4.35], [0, 1.7], MATERIALS.wall),
    boxFrom('PortalRoof', [-2.6, 2.6], [3.55, 4.35], [0, 1.7], MATERIALS.wall),
    boxFrom('PortalFloor', [-1.95, 1.95], [0, floor], [0, 1.7], MATERIALS.concrete),
    boxFrom('PortalLamp', [-0.15, 0.15], [3.52, 3.55], [0.7, 1.0], MATERIALS.lampLens),
    sign('PortalSign', ['OPOP TRAINING CENTER'], '#1d2a33', 'center', [[-1.8, 1.8], [3.92, 4.2], [1.7, 1.7]], { width: 1024, height: 96 }, { axis: 2, outward: 1, layers: 3 }),
    sign('PortalSubtitle', ['INSTITUT TEKNOLOGI SEPULUH NOPEMBER'], '#1d2a33', 'center', [[-1.6, 1.6], [3.74, 3.88], [1.7, 1.7]], { width: 1024, height: 64 }, { axis: 2, outward: 1, layers: 2 }),
    boxFrom('EntranceWindowWest', [-1.95, -post], [groundWindowBottom, groundWindowTop], [0, 0.03], narrowGrille),
    boxFrom('EntranceWindowEast', [post, 1.95], [groundWindowBottom, groundWindowTop], [0, 0.03], narrowGrille),
    windowFrames('EntranceFramesWest', [-1.95, -post], [groundWindowBottom, groundWindowTop], 2, 3),
    windowFrames('EntranceFramesEast', [post, 1.95], [groundWindowBottom, groundWindowTop], 2, 3),
    boxFrom('DoorFrameHead', [-post, post], [floor + 2.3, 3.0], [0, 0.08], MATERIALS.doorFrame),
    boxFrom('DoorFrameWest', [-post, -door], [floor, floor + 2.3], [0, 0.08], MATERIALS.doorFrame),
    boxFrom('DoorFrameEast', [door, post], [floor, floor + 2.3], [0, 0.08], MATERIALS.doorFrame),
    boxFrom('DoorTransom', [-door, door], [floor + 2.38, 2.95], [0.02, 0.05], MATERIALS.doorGlass),
    doorWest,
    doorEast,
    boxFrom('CheekWallWest', [-2.6, -1.95], [0, 0.8], [1.4, 2.95], MATERIALS.wall),
    boxFrom('CheekWallEast', [1.95, 2.6], [0, 0.8], [1.4, 2.95], MATERIALS.wall),
    ...steps('West', [-1.95, -rampHalf]),
    ramp,
    ...steps('East', [rampHalf, 1.95]),
  );
  return { entrance, doors: [doorWest, doorEast] };
}

// Long two-storey facade (photos: eksterior-fasad-*). Children use the wall plane as
// z = 0 with positive z pointing out of the building; "Left"/"Right" are as seen from
// outside. The back facade reuses this layout rotated 180°; instead of the entrance portal
// its middle meets the single-storey connector to the back building (environment.js),
// so the same central gap is left free of windows, pebbles and grass.
function createFacade(name, { position, rotation = [0, 0, 0], withEntrance }) {
  const { length: L, fasciaTop, fasciaBottom, floorBandTop, groundWindowBottom, groundWindowTop, plinthHeight } = CCWS_DIMENSIONS;
  const inner = FACADE.outerBay[1];
  const transom = (floorBandTop + fasciaBottom) / 2;
  const facade = addChildren(
    createNode(name, { position, rotation }),
    boxFrom('PierLeft', [-L / 2, -inner], [0, fasciaTop], [0, 0.9], MATERIALS.wall),
    boxFrom('PierRight', [inner, L / 2], [0, fasciaTop], [0, 0.9], MATERIALS.wall),
    boxFrom('Fascia', [-L / 2, L / 2], [fasciaBottom, fasciaTop], [0, 0.9], MATERIALS.wall),
    boxFrom('FasciaJoint', [-L / 2 + 0.05, L / 2 - 0.05], [6.55, 6.57], [0.9, 0.905], MATERIALS.windowFrame),
    boxFrom('FloorBand', [-inner, inner], [groundWindowTop, floorBandTop], [0, 0.3], MATERIALS.wall),
    boxFrom('Plinth', [-L / 2, L / 2], [0, plinthHeight], [0, 1.4], MATERIALS.plinth),
  );
  const add = (...nodes) => facade.children.push(...nodes);

  // Upper floor: three glazed groups split by the wall strips the inner downpipes run
  // down. The top row is fixed glazing; the bottom row is top-hung sashes (hinge pivots).
  const upperGroups = [[-inner, -FACADE.outerBay[0]], [-FACADE.innerBay[1], FACADE.innerBay[1]], [FACADE.outerBay[0], inner]];
  const lines = mirrorValues(UPPER_MULLIONS);
  upperGroups.forEach(([x0, x1], g) => {
    add(
      boxFrom(`UpperGlazing${g}`, [x0, x1], [transom, fasciaBottom], [0, 0.04], MATERIALS.glass),
      boxFrom(`UpperRoomBehind${g}`, [x0, x1], [floorBandTop, transom], [0, 0.02], MATERIALS.ceilingDark),
      boxFrom(`UpperTransom${g}`, [x0, x1], [transom - 0.04, transom + 0.04], [0, 0.12], MATERIALS.windowFrame),
      boxFrom(`UpperHead${g}`, [x0, x1], [fasciaBottom - 0.06, fasciaBottom], [0, 0.12], MATERIALS.windowFrame),
      boxFrom(`UpperSill${g}`, [x0 - 0.05, x1 + 0.05], [floorBandTop, floorBandTop + 0.06], [0, 0.16], MATERIALS.windowFrame),
    );
    const columns = lines.filter((x) => x >= x0 - 0.01 && x <= x1 + 0.01);
    for (let c = 0; c < columns.length - 1; c += 1) {
      add(awningSash(`${name}Sash${g}_${c}`, [columns[c] + 0.04, columns[c + 1] - 0.04], transom - 0.04, transom - 0.04 - floorBandTop - 0.06));
    }
  });
  lines.forEach((x, i) => add(
    boxFrom(`UpperMullion${i}`, [x - 0.04, x + 0.04], [floorBandTop, fasciaBottom], [0, 0.12], MATERIALS.windowFrame),
  ));

  mirror([FACADE.innerBay, FACADE.outerBay]).forEach((span, i) => {
    const columns = Math.round(((span[1] - span[0]) / MATERIALS.grille.tileSize[0]) * 2);
    add(
      boxFrom(`GroundWindows${i}`, span, [groundWindowBottom, groundWindowTop], [0, 0.03], MATERIALS.grille),
      windowFrames(`GroundFrames${i}`, span, [groundWindowBottom, groundWindowTop], columns, 3),
    );
  });

  // Plinth top: white pebbles along the wall with the potted plants, artificial grass in front.
  mirror([[FACADE.portalHalf, inner]]).forEach((span, i) => add(
    boxFrom(`Pebbles${i}`, span, [plinthHeight, plinthHeight + 0.02], [0, 0.6], MATERIALS.pebbles),
    boxFrom(`Grass${i}`, span, [plinthHeight, plinthHeight + 0.05], [0.6, 1.3], MATERIALS.turf),
  ));
  mirrorValues([3.7, 6.725, 9.875]).forEach((x, i) => add(planter(`${name}Planter${i}`, x, 100 + i + (withEntrance ? 0 : 50))));
  mirrorValues([FACADE.innerPipe, FACADE.endPipe]).forEach((x, i) => add(downpipe(`${name}Downpipe${i}`, x)));

  if (!withEntrance) return { facade, doors: [], entrance: null };
  const { entrance, doors } = createEntrance();
  add(entrance);
  return { facade, doors, entrance };
}

// Wheelie bin (body, hinged lid, wheels) with its front facing −X, out from under the canopy.
// The lid pivot is the hinge at the back; a negative rotation about Z lifts the lid.
function wheelieBin(name, [x, z], color) {
  const body = { color, specular: 0.3 };
  const lid = addChildren(
    createNode(`${name}LidPivot`, { position: [0.36, 1.0, 0] }),
    boxFrom(`${name}Lid`, [-0.76, 0], [0, 0.05], [-0.31, 0.31], body),
  );
  const bin = addChildren(
    createNode(name, { position: [x, 0.08, z] }),
    mesh(`${name}Body`, profilePrism([[-0.27, 0], [0.27, 0], [0.3, 0.92], [-0.3, 0.92]], 0.6), body, { rotation: [0, Math.PI / 2, 0] }),
    boxFrom(`${name}Rim`, [-0.36, 0.36], [0.92, 1.0], [-0.31, 0.31], body),
    cylinderBetween(`${name}Handle`, [0.4, 0.95, -0.22], [0.4, 0.95, 0.22], 0.02, MATERIALS.rubber),
    cylinderBetween(`${name}Axle`, [0.3, 0.12, -0.3], [0.3, 0.12, 0.3], 0.02, MATERIALS.metal),
    cylinderBetween(`${name}WheelLeft`, [0.3, 0.12, -0.32], [0.3, 0.12, -0.24], 0.12, MATERIALS.rubber, { segments: 12 }),
    cylinderBetween(`${name}WheelRight`, [0.3, 0.12, 0.24], [0.3, 0.12, 0.32], 0.12, MATERIALS.rubber, { segments: 12 }),
    lid,
  );
  return bin;
}

// Small round pedal bin with a hinged lid, standing on the metal rack.
function pedalBin(name, z, color) {
  const body = { color, specular: 0.35 };
  const lid = addChildren(
    createNode(`${name}LidPivot`, { position: [0.2, 0.62, 0] }),
    mesh(`${name}Lid`, cylinder(0.21, 0.16, 0.08, 16), body, { position: [-0.2, 0, 0] }),
    mesh(`${name}Knob`, cylinder(0.03, 0.03, 0.14, 8), MATERIALS.rubber, { position: [-0.2, 0.06, 0] }),
  );
  const bin = addChildren(
    createNode(name, { position: [0, 0.14, z] }),
    mesh(`${name}Body`, cylinder(0.18, 0.21, 0.62, 16), body),
    lid,
  );
  return bin;
}

// Porte-cochère over the co-working side door (photos: eksterior-kanopi-samping,
// eksterior-kanopi-depan, eksterior-coworking-gable-kanopi). Local x = 0 is the west gable
// wall; the canopy extends towards −X.
// - A thick flat slab, pentagonal in plan, runs from the wall to a point facing west, with a
//   slightly inset lower band; from the front its tip reads as the lower chevron.
// - Two square columns stand just outside the slab's two long sides at its outer corners and
//   rise a little above it. Each column carries on as a sloping arm up to the middle, so
//   column + arm form one frame shaped like a house outline (⌂). The triangle between the
//   arms and the slab is open (sky shows through in the side photo).
// - At the apex both arms end in a vertical cut with a narrow gap between them, which reads
//   as the two "fins" of the split ridge from the front.
function createCanopy() {
  const { zMin, zMax, reach, apex, slabTop } = CANOPY;
  const mid = (zMin + zMax) / 2;
  const column = 0.6;
  const columnX = [-reach - 0.4, -reach + 0.4];
  const columnTop = slabTop + 0.3;
  const apexTop = columnTop + 1.45;
  const gap = 0.16;
  // Arm profile in the canopy's z–y plane for the side at `edge` (zMax side when sign = 1).
  const arm = (name, sign) => {
    const edge = sign > 0 ? zMax : zMin;
    const profile = [
      [edge, slabTop],
      [edge + sign * column, slabTop],
      [edge + sign * column, columnTop],
      [mid + sign * gap, apexTop],
      [mid + sign * gap, apexTop - 0.5],
    ];
    return mesh(name, profilePrism(profile, columnX[1] - columnX[0]), MATERIALS.concrete, {
      position: [(columnX[0] + columnX[1]) / 2, 0, 0],
    });
  };
  const outline = (inset) => [[0, zMin + inset], [-reach + inset, zMin + inset], [-apex + inset * 2, mid], [-reach + inset, zMax - inset], [0, zMax - inset]];

  const canopy = addChildren(
    createNode('Canopy'),
    mesh('CanopySlab', extrudedPolygon(outline(0), 0.55), MATERIALS.concrete, { position: [0, slabTop - 0.55, 0] }),
    mesh('CanopySlabBand', extrudedPolygon(outline(0.12), 0.2), MATERIALS.concrete, { position: [0, slabTop - 0.75, 0] }),
    mesh('CanopyCeiling', extrudedPolygon(outline(0.2), 0.02), MATERIALS.ceiling, { position: [0, slabTop - 0.77, 0] }),
    boxFrom('CanopyLampInner', [-2.6, -2.2], [slabTop - 0.79, slabTop - 0.77], [mid - 0.2, mid + 0.2], MATERIALS.lampLens),
    boxFrom('CanopyLampOuter', [-5.4, -5.0], [slabTop - 0.79, slabTop - 0.77], [mid - 0.2, mid + 0.2], MATERIALS.lampLens),
    boxFrom('CanopyColumnNorth', columnX, [0, columnTop], [zMin - column, zMin], MATERIALS.concrete),
    boxFrom('CanopyColumnSouth', columnX, [0, columnTop], [zMax, zMax + column], MATERIALS.concrete),
    arm('CanopyArmNorth', -1),
    arm('CanopyArmSouth', 1),
    boxFrom('BinPlatform', [-6.6, -5.4], [0, 0.08], [mid - 2.0, mid + 2.0], MATERIALS.concrete),
  );

  // Three wheelie bins and, on a metal rack, three pedal bins (eksterior-kanopi-depan).
  [[0.12, 0.3, 0.2], [0.12, 0.12, 0.13], [0.1, 0.3, 0.7]].forEach((color, i) => {
    canopy.children.push(wheelieBin(`WheelieBin${i}`, [-6.0, mid - 1.55 + i * 0.66], color));
  });
  const rack = addChildren(
    createNode('BinRack', { position: [-6.0, 0.08, mid + 0.95] }),
    boxFrom('RackShelf', [-0.25, 0.25], [0.12, 0.14], [-0.65, 0.65], MATERIALS.metal),
    ...[[-0.22, -0.62], [-0.22, 0.62], [0.22, -0.62], [0.22, 0.62]].map(([x, z], i) => boxFrom(`RackLeg${i}`, [x - 0.02, x + 0.02], [0, 0.6], [z - 0.02, z + 0.02], MATERIALS.metal)),
    boxFrom('RackRailBack', [0.2, 0.24], [0.55, 0.6], [-0.65, 0.65], MATERIALS.metal),
  );
  [[0.2, 0.6, 0.25], [0.9, 0.75, 0.1], [0.75, 0.12, 0.1]].forEach((color, i) => {
    rack.children.push(pedalBin(`PedalBin${i}`, -0.43 + i * 0.43, color));
  });
  canopy.children.push(rack);
  return canopy;
}

// West gable end with the CO-WORKING SPACE sign (photos: eksterior-coworking-*). The wall is
// flat apart from the louvred slot under the apex and the double glass side door centred
// under it and the canopy. Local x = 0 is the wall face, +x points into the building.
function createCoworkingEnd() {
  const { length: L } = CCWS_DIMENSIONS;
  const door = 0.85;
  const doorNorth = doorLeaf('SideDoorNorth', [-0.09, 0.35, -door], door - 0.02, 2.3, 1, 'z');
  const doorSouth = doorLeaf('SideDoorSouth', [-0.09, 0.35, door], door - 0.02, 2.3, -1, 'z');
  const canopy = createCanopy();
  const end = addChildren(
    createNode('CoworkingEnd', { position: [-L / 2, 0, 0] }),
    boxFrom('SlotWindow', [-0.02, 0], [7.0, 8.3], [-0.28, 0.28], MATERIALS.ceilingDark),
    ...[7.25, 7.55, 7.85, 8.15].map((y, i) => boxFrom(`SlotLouver${i}`, [-0.05, 0], [y - 0.04, y + 0.04], [-0.28, 0.28], MATERIALS.windowFrame)),
    sign('CoworkingSign', ['CO-', 'WORKING', 'SPACE'], '#2f6f80', 'right', [[-0.004, 0], [3.8, 5.8], [CANOPY.zMax + 0.1, 5.4]], { width: 1024, height: 600 }, { axis: 0, outward: -1, layers: 5 }),
    boxFrom('SideDoorFrameHead', [-0.1, 0], [2.65, 2.85], [-door - 0.08, door + 0.08], MATERIALS.doorFrame),
    boxFrom('SideDoorFrameNorth', [-0.1, 0], [0.3, 2.85], [-door - 0.08, -door], MATERIALS.doorFrame),
    boxFrom('SideDoorFrameSouth', [-0.1, 0], [0.3, 2.85], [door, door + 0.08], MATERIALS.doorFrame),
    doorNorth,
    doorSouth,
    boxFrom('SideLanding', [-1.2, 0], [0, 0.35], [-1.4, 1.4], MATERIALS.concrete),
    boxFrom('Sink', [-0.32, 0], [0.78, 0.92], [1.3, 1.65], MATERIALS.sink),
    cylinderBetween('SinkTap', [-0.05, 1.05, 1.47], [-0.18, 1.05, 1.47], 0.015, MATERIALS.handle),
    canopy,
  );
  return { end, canopy, doors: [doorNorth, doorSouth] };
}

// Builds CCWS and reports the nodes the animator moves and the lamps that light up at night.
export function createCcwsBuilding() {
  const { length: L, depth: D } = CCWS_DIMENSIONS;
  const mainBlock = createMainBlock();
  const front = createFacade('FrontFacade', { position: [0, 0, D / 2], withEntrance: true });
  const back = createFacade('BackFacade', { position: [0, 0, -D / 2], rotation: [0, Math.PI, 0], withEntrance: false });
  const coworking = createCoworkingEnd();
  const root = addChildren(createNode('CCWS'), mainBlock, front.facade, back.facade, coworking.end);
  const roof = mainBlock.children.find((node) => node.name === 'RoofGroup');
  const mid = (CANOPY.zMin + CANOPY.zMax) / 2;

  return {
    root,
    roof, // hidden in the cutaway view
    animated: {
      mainDoors: front.doors,
      sideDoors: coworking.doors,
      // "Exploded view": each part slides away from its parent along these offsets.
      explode: [
        { node: roof, offset: [0, 4.5, 0] },
        { node: front.facade, offset: [0, 0, 4] },
        { node: front.entrance, offset: [0, 0, 2.5] },
        { node: back.facade, offset: [0, 0, -4] },
        { node: coworking.end, offset: [-4, 0, 0] },
        { node: coworking.canopy, offset: [-3, 0, 0] },
      ],
    },
    lamps: [
      { position: [0, 3.35, D / 2 + 0.85], color: LAMP_COLOR.map((c) => c * 2.2), range: 7 },
      { position: [-L / 2 - 2.4, CANOPY.slabTop - 0.9, mid], color: LAMP_COLOR.map((c) => c * 2.4), range: 7 },
      { position: [-L / 2 - 5.2, CANOPY.slabTop - 0.9, mid], color: LAMP_COLOR.map((c) => c * 2.4), range: 7 },
    ],
  };
}
