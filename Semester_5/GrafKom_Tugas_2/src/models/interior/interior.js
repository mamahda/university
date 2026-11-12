import { cylinder } from '../../webgl/geometry.js';
import { addChildren, createNode } from '../../webgl/sceneNode.js';
import { createTextTexture } from '../../webgl/textTexture.js';
import { CCWS_DIMENSIONS, MATERIALS, wallOpenings } from '../building/ccwsBuilding.js';
import { createCafeCounter } from './cafeCounter.js';
import { createWorkspaceFurniture } from './furniture.js';
import { boxFrom, mesh } from '../shared/parts.js';
import { woodFloorTexture } from '../shared/proceduralTextures.js';

// Simplified interior of the CCWS hall, built inside the hollow outer walls (see `createWalls`
// in ccwsBuilding.js). Layout and sizes are ESTIMATES read from the interior photos; no
// floor plan has been measured (docs/FLOOR_PLAN.md). Root origin: the centre of the building
// footprint at ground level; the floor surface is at y = floorY. The room runs along X, with
// the café and workspace towards the west gable (−X) and the exhibition towards +X.
const { length: L, depth: D, wallThickness: T, plinthHeight } = CCWS_DIMENSIONS;

export const INTERIOR_LAYOUT = {
  floorY: plinthHeight,
  ceilingY: 6.6, // ESTIMATE: below the eaves (7.2 m), above the upper window band (5.9 m)
  halfLength: L / 2 - T, // inner face of the gable walls
  halfDepth: D / 2 - T, // inner face of the long walls
  beamSpacing: 3.5,
  beamDrop: 0.45,
  exhibitionStartX: 2.5, // ESTIMATE: where the exhibition zone begins
  // Ceiling lights as point lights (world metres). Workspace lights and exhibition lights can
  // be switched separately. The renderer supports 8 point lights; 3 are used by the exterior lamps.
  // Point lights sit a little below the fixtures so the light spreads to the floor instead of
  // making a hot spot on the ceiling; they switch with dusk and dawn like the exterior lamps.
  workspaceLights: [[-8, 5.1, 0], [-3.2, 5.1, 0], [1.5, 5.1, 0]],
  exhibitionLights: [[6, 5.1, -3], [6, 5.1, 3]],
  lightColor: [1.0, 0.92, 0.8],
  lightIntensity: 1.35,
  lightRange: 13,
};

const FIXTURE_GLOW = 2.4;
const WARM_WHITE = [1.0, 0.92, 0.8];

function createMaterials() {
  return {
    floor: { color: [0.82, 0.78, 0.74], flatColor: [0.31, 0.2, 0.14], texture: woodFloorTexture(), tileSize: [1.44, 0.72], specular: 0.18, shininess: 40 },
    exhibitionFloor: { color: [0.4, 0.42, 0.45], specular: 0.12 },
    ceiling: { color: [0.93, 0.93, 0.91] },
    beam: { color: [0.9, 0.9, 0.88] },
    band: { color: [0.78, 0.72, 0.62] }, // beige band between the lower and upper windows
    track: { color: [0.05, 0.05, 0.06], specular: 0.3 },
    mat: { color: [0.2, 0.2, 0.22] },
    wallPanel: { color: [0.82, 0.84, 0.86] },
    // Daylight seen through the window openings from inside; fades out at night (glowDay).
    pane: { color: [0.55, 0.6, 0.66], emissive: [0.75, 0.85, 1.0], glow: 0.65, glowDay: true, castShadow: false },
    // Ceiling fixtures glow with the day–night lamp level, like the exterior lamps.
    workFixture: { color: [0.95, 0.94, 0.9], emissive: WARM_WHITE, glow: FIXTURE_GLOW, castShadow: false },
    exhibitFixture: { color: [0.95, 0.94, 0.9], emissive: WARM_WHITE, glow: FIXTURE_GLOW, castShadow: false },
    muralTeal: { color: [0.24, 0.48, 0.52] },
    muralPeach: { color: [0.93, 0.64, 0.52] },
    muralNavy: { color: [0.2, 0.28, 0.4] },
  };
}

// White frame and mullions on the inner face of one window opening, plus a daylight pane.
function windowBay(name, [u0, u1, y0, y1], wallZ, inward, materials) {
  const group = createNode(name);
  const frame = 0.05;
  const depth = 0.07;
  const z = inward > 0 ? [wallZ, wallZ + depth] : [wallZ - depth, wallZ];
  const paneZ = wallZ - inward * (T / 2);
  group.children.push(
    boxFrom('Pane', [u0, u1], [y0, y1], [paneZ - 0.01, paneZ + 0.01], materials.pane),
    boxFrom('FrameTop', [u0, u1], [y1 - frame, y1], z, MATERIALS.frameWhite),
    boxFrom('FrameBottom', [u0, u1], [y0, y0 + frame], z, MATERIALS.frameWhite),
    boxFrom('FrameStart', [u0, u0 + frame], [y0, y1], z, MATERIALS.frameWhite),
    boxFrom('FrameEnd', [u1 - frame, u1], [y0, y1], z, MATERIALS.frameWhite),
  );
  const columns = Math.max(1, Math.round((u1 - u0) / 1.05));
  for (let i = 1; i < columns; i += 1) {
    const x = u0 + ((u1 - u0) * i) / columns;
    group.children.push(boxFrom(`Mullion${i}`, [x - 0.02, x + 0.02], [y0, y1], z, MATERIALS.frameWhite));
  }
  const rows = Math.max(1, Math.round((y1 - y0) / 0.8));
  for (let i = 1; i < rows; i += 1) {
    const y = y0 + ((y1 - y0) * i) / rows;
    group.children.push(boxFrom(`Rail${i}`, [u0, u1], [y - 0.02, y + 0.02], z, MATERIALS.frameWhite));
  }
  return group;
}

// Window bays along both long walls. The front wall (z > 0) has its inner face at +halfDepth,
// the back wall at −halfDepth. The door opening of the entrance gets no pane or frame.
function createWindowBays(materials) {
  const { floorY, halfDepth } = INTERIOR_LAYOUT;
  const bays = createNode('WindowBays');
  [[true, halfDepth, -1, 'Front'], [false, -halfDepth, 1, 'Back']].forEach(([withEntrance, wallZ, inward, label]) => {
    wallOpenings(withEntrance)
      .filter(([, , y0]) => y0 > floorY + 0.01)
      .forEach((opening, i) => bays.children.push(windowBay(`${label}Bay${i}`, opening, wallZ, inward, materials)));
  });
  // Glass side door in the west wall: pane and frame, seen against the mural wall.
  const door = windowBayWest(materials);
  bays.children.push(door);
  return bays;
}

function windowBayWest(materials) {
  const { floorY, halfLength } = INTERIOR_LAYOUT;
  const [z0, z1, y1] = [-0.85, 0.85, 2.65];
  const frame = 0.06;
  const x = [-halfLength, -halfLength + 0.08];
  return addChildren(
    createNode('SideDoorBay'),
    boxFrom('Pane', [-halfLength - T / 2 - 0.01, -halfLength - T / 2 + 0.01], [floorY, y1], [z0, z1], materials.pane),
    boxFrom('FrameTop', x, [y1 - frame, y1], [z0, z1], MATERIALS.doorFrame),
    boxFrom('FrameNorth', x, [floorY, y1], [z0, z0 + frame], MATERIALS.doorFrame),
    boxFrom('FrameSouth', x, [floorY, y1], [z1 - frame, z1], MATERIALS.doorFrame),
  );
}

// Beige wall band under the upper windows (the wall between the two window rows) on all four walls.
function createWallBands(materials) {
  const { halfLength: hx, halfDepth: hz } = INTERIOR_LAYOUT;
  const [y0, y1] = [CCWS_DIMENSIONS.groundWindowTop, CCWS_DIMENSIONS.floorBandTop];
  const e = 0.02;
  return addChildren(
    createNode('WallBands'),
    boxFrom('BandFront', [-hx, hx], [y0, y1], [hz - e, hz], materials.band),
    boxFrom('BandBack', [-hx, hx], [y0, y1], [-hz, -hz + e], materials.band),
    boxFrom('BandWest', [-hx, -hx + e], [y0, y1], [-hz, hz], materials.band),
    boxFrom('BandEast', [hx - e, hx], [y0, y1], [-hz, hz], materials.band),
  );
}

// Quote and stylised cloud shapes on the west wall, after the mural in interior-ruang-kerja-mural
// and interior-meja-kasir-kantin. The quote is read from the photo; shapes are simplified.
function createMural(materials) {
  const x = -INTERIOR_LAYOUT.halfLength;
  const quote = {
    color: [1, 1, 1],
    texture: createTextTexture(
      ['"BERMIMPILAH SETINGGI LANGIT,', 'JIKA ENGKAU JATUH ENGKAU AKAN', 'JATUH DI ANTARA BINTANG-BINTANG"', '-IR. SOEKARNO-'],
      { color: '#4d6359', width: 1024, height: 256, fontWeight: 600 },
    ),
    tileSize: [5.2, 1.3],
    alphaTest: true,
  };
  // A disc's axis is Y; turning it by −90° about Z points the axis along +X (into the room).
  const disc = (name, radius, y, z, material) => mesh(name, cylinder(radius, radius, 0.02, 20), material, {
    position: [x + 0.002, y, z],
    rotation: [0, 0, -Math.PI / 2],
  });
  return addChildren(
    createNode('Mural'),
    boxFrom('Quote', [x + 0.008, x + 0.012], [4.65, 5.95], [-2.6, 2.6], quote),
    disc('CloudTeal', 0.7, 5.6, -3.7, materials.muralTeal),
    disc('CloudPeach', 0.55, 5.2, 3.6, materials.muralPeach),
    disc('CloudNavy', 0.35, 4.9, -4.5, materials.muralNavy),
    disc('CloudSmall', 0.28, 5.9, 4.3, materials.muralTeal),
  );
}

// Flat ceiling with cross beams. This node is hidden in the roof cutaway view.
function createCeiling(materials) {
  const { ceilingY, halfLength: hx, halfDepth: hz, beamSpacing, beamDrop } = INTERIOR_LAYOUT;
  const ceiling = addChildren(
    createNode('CeilingAndBeams'),
    boxFrom('Ceiling', [-hx, hx], [ceilingY, ceilingY + 0.15], [-hz, hz], materials.ceiling),
  );
  const count = Math.floor((2 * hx) / beamSpacing);
  for (let i = 0; i < count; i += 1) {
    const x = -hx + beamSpacing * (i + 0.5);
    ceiling.children.push(boxFrom(`Beam${i}`, [x - 0.175, x + 0.175], [ceilingY - beamDrop, ceilingY], [-hz, hz], materials.beam));
  }
  return ceiling;
}

// Fluorescent strips between the beams and track spotlights along the long walls, as seen in the
// photos. Fixtures west of exhibitionStartX belong to the workspace group, the rest to the exhibition.
function createFixtures(materials) {
  const { ceilingY, halfLength: hx, halfDepth: hz, beamSpacing, beamDrop, exhibitionStartX } = INTERIOR_LAYOUT;
  const fixtures = createNode('LightFixtures');
  const materialAt = (x) => (x < exhibitionStartX ? materials.workFixture : materials.exhibitFixture);
  const count = Math.floor((2 * hx) / beamSpacing);
  for (let i = 0; i < count; i += 1) {
    const x = -hx + beamSpacing * (i + 1); // between two beams
    for (const z of [-1.6, 1.6]) {
      fixtures.children.push(boxFrom(`Strip${i}_${z > 0 ? 'S' : 'N'}`, [x - 0.6, x + 0.6], [ceilingY - 0.1, ceilingY - 0.06], [z - 0.06, z + 0.06], materialAt(x)));
    }
  }
  for (const z of [-4.6, 4.6]) {
    const track = createNode(`Track${z > 0 ? 'South' : 'North'}`);
    track.children.push(boxFrom('Rail', [-hx + 0.5, hx - 0.5], [ceilingY - 0.14, ceilingY - 0.1], [z - 0.025, z + 0.025], materials.track));
    for (let x = -hx + 1.5; x < hx - 1; x += 3) {
      track.children.push(
        mesh(`Head${Math.round(x)}`, cylinder(0.05, 0.06, 0.18, 8), materials.track, { position: [x, ceilingY - 0.32, z] }),
        mesh(`Lens${Math.round(x)}`, cylinder(0.045, 0.045, 0.01, 8), materialAt(x), { position: [x, ceilingY - 0.325, z] }),
      );
    }
    fixtures.children.push(track);
  }
  return fixtures;
}

// Floor, a slightly raised exhibition zone, an entrance mat, and a wall panel behind the exhibits.
function createFloorAndZones(materials) {
  const { floorY, halfLength: hx, halfDepth: hz, exhibitionStartX } = INTERIOR_LAYOUT;
  return addChildren(
    createNode('FloorAndZones'),
    boxFrom('Floor', [-hx, hx], [floorY - 0.1, floorY], [-hz, hz], materials.floor),
    boxFrom('ExhibitionZoneFloor', [exhibitionStartX, hx], [floorY, floorY + 0.012], [-hz + 0.2, hz - 0.2], materials.exhibitionFloor),
    boxFrom('EntranceMat', [-1.2, 1.2], [floorY, floorY + 0.012], [hz - 1.6, hz - 0.05], materials.mat),
    boxFrom('ExhibitionWallPanel', [hx - 0.03, hx], [floorY, 4.8], [-5.0, 5.0], materials.wallPanel),
  );
}

export function createInterior() {
  const materials = createMaterials();
  const layout = INTERIOR_LAYOUT;
  const ceiling = createCeiling(materials);

  const workspace = createWorkspaceFurniture();
  workspace.position = [0, layout.floorY, 0];
  const cafe = createCafeCounter();
  cafe.position[1] = layout.floorY;

  const root = addChildren(
    createNode('Interior'),
    createFloorAndZones(materials),
    ceiling,
    createWindowBays(materials),
    createWallBands(materials),
    createMural(materials),
    createFixtures(materials),
    workspace,
    cafe,
  );

  const makeLights = (positions) => positions.map((position) => ({
    position,
    color: layout.lightColor.map((c) => c * layout.lightIntensity),
    range: layout.lightRange,
  }));

  return {
    root,
    ceiling, // hidden in the cutaway view
    workspaceLights: makeLights(layout.workspaceLights),
    exhibitionLights: makeLights(layout.exhibitionLights),
  };
}
