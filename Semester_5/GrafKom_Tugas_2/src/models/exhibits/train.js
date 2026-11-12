import { cylinder, profilePrism } from '../../webgl/geometry.js';
import { addChildren, createNode } from '../../webgl/sceneNode.js';
import { createTextTexture } from '../../webgl/textTexture.js';
import { boxFrom, mesh } from '../shared/parts.js';

// Train display segment from interior-pameran-kereta and interior-lorong-ruang-kerja: a
// carriage mock-up with a dark grey skirt, white lower panel, thin red line, dark window band
// with two windows, a red upper band with a destination display, and a white door.
// Only what is visible in the photo is modelled. The photo reads "HST 01 JAKARTA"; this is
// NOT confirmed as an official Whoosh exhibit, and no train specification is assumed.
//
// Local frame: origin on the floor at the centre of the segment, the long side runs along X
// and the visible side faces +Z. All sizes are ESTIMATES (the team's note that the mock-up
// takes about 3/7 of the room length is not measured, so length and depth are adjustable here).
export const TRAIN_CONFIG = {
  length: 9.6,
  depth: 3.0,
  height: 4.0,
  skirtHeight: 0.35,
  lowerPanelTop: 1.55,
  redLineTop: 1.7,
  windowBandTop: 2.95,
  upperBandTop: 3.85,
  windows: [[-3.8, -1.8], [-1.3, 0.7]], // x ranges of the two windows
  door: { x: [1.9, 3.2], bottom: 0.3, top: 3.4, slide: 1.25 }, // slide: how far the door moves when open
  display: { x: [-3.2, -0.4], y: [3.15, 3.6] },
};

function createMaterials() {
  return {
    skirt: { color: [0.36, 0.37, 0.4] },
    lower: { color: [0.88, 0.89, 0.9], specular: 0.25, shininess: 40 },
    red: { color: [0.8, 0.15, 0.25], specular: 0.35, shininess: 48 },
    dark: { color: [0.2, 0.2, 0.22], specular: 0.3 },
    roof: { color: [0.88, 0.88, 0.9] },
    frame: { color: [0.05, 0.05, 0.06], specular: 0.3 },
    // Window glass glows warmly when the train lights are on.
    glass: { color: [0.1, 0.12, 0.14], specular: 0.9, shininess: 96, reflect: 0.35, emissive: [1.0, 0.85, 0.55], glow: 0, glowAlways: true },
    door: { color: [0.93, 0.93, 0.95], specular: 0.3, shininess: 40 },
    recess: { color: [0.06, 0.06, 0.07] },
    sign: { color: [0.78, 0.15, 0.2] },
    white: { color: [0.95, 0.95, 0.95] },
    plate: { color: [0.96, 0.96, 0.94] },
    displayBack: { color: [0.03, 0.03, 0.04] },
  };
}

function textMaterial(lines, color, tile, extra = {}) {
  return { color: [1, 1, 1], texture: createTextTexture(lines, { color, width: 512, height: 128 * lines.length, fontWeight: 700 }), tileSize: tile, alphaTest: true, ...extra };
}

export function createTrain(config = TRAIN_CONFIG) {
  const m = createMaterials();
  const { length: len, depth, skirtHeight, lowerPanelTop, redLineTop, windowBandTop, upperBandTop, height } = config;
  const x = [-len / 2, len / 2];
  const z = [-depth / 2, depth / 2];
  const face = depth / 2; // the visible side plane

  const body = addChildren(
    createNode('MainCarriageBody'),
    boxFrom('Skirt', x, [0, skirtHeight], z, m.skirt),
    boxFrom('LowerPanel', x, [skirtHeight, lowerPanelTop], z, m.lower),
    boxFrom('RedLine', x, [lowerPanelTop, redLineTop], z, m.red),
    boxFrom('WindowBand', x, [redLineTop, windowBandTop], z, m.dark),
    boxFrom('UpperBand', x, [windowBandTop, upperBandTop], z, m.red),
  );
  // Rounded roof edge of the photo, simplified to a trapezoid prism.
  const roof = mesh('Roof', profilePrism([[-depth / 2, 0], [depth / 2, 0], [depth / 2 - 0.2, height - upperBandTop], [-depth / 2 + 0.2, height - upperBandTop]], len), m.roof, {
    position: [0, upperBandTop, 0],
  });

  const windows = createNode('WindowGroups');
  config.windows.forEach(([x0, x1], i) => {
    const [y0, y1] = [redLineTop + 0.12, windowBandTop - 0.12];
    const f = 0.07;
    windows.children.push(addChildren(
      createNode(`Window${i}`),
      boxFrom('FrameTop', [x0, x1], [y1 - f, y1], [face, face + 0.03], m.frame),
      boxFrom('FrameBottom', [x0, x1], [y0, y0 + f], [face, face + 0.03], m.frame),
      boxFrom('FrameLeft', [x0, x0 + f], [y0, y1], [face, face + 0.03], m.frame),
      boxFrom('FrameRight', [x1 - f, x1], [y0, y1], [face, face + 0.03], m.frame),
      boxFrom('Glass', [x0 + f, x1 - f], [y0 + f, y1 - f], [face, face + 0.012], m.glass),
    ));
  });

  // Door: a recess behind it (visible when open) and a white panel that slides along the side.
  const { x: [dx0, dx1], bottom, top } = config.door;
  const doorPanel = addChildren(
    createNode('DoorSlidePivot'),
    boxFrom('DoorPanel', [dx0, dx1], [bottom, top], [face, face + 0.045], m.door),
    boxFrom('DoorWindow', [(dx0 + dx1) / 2 - 0.2, (dx0 + dx1) / 2 + 0.2], [1.4, 3.0], [face + 0.045, face + 0.052], m.glass),
  );
  const doorAssembly = addChildren(
    createNode('DoorAssembly'),
    boxFrom('DoorRecess', [dx0 + 0.05, dx1 - 0.05], [bottom + 0.05, top - 0.05], [face, face + 0.012], m.recess),
    doorPanel,
  );

  // Destination display and the number plates, with letters taken from the photo.
  const [ddx0, ddx1] = config.display.x;
  const [ddy0, ddy1] = config.display.y;
  const displayText = textMaterial(['HST 01  JAKARTA'], '#ffb03a', [ddx1 - ddx0 - 0.1, ddy1 - ddy0 - 0.08], {
    emissive: [1.0, 0.65, 0.2], glow: 0, glowAlways: true,
  });
  const signage = addChildren(
    createNode('DestinationDisplay'),
    boxFrom('DisplayBack', [ddx0, ddx1], [ddy0, ddy1], [face, face + 0.03], m.displayBack),
    boxFrom('DisplayText', [ddx0 + 0.05, ddx1 - 0.05], [ddy0 + 0.04, ddy1 - 0.04], [face + 0.03, face + 0.034], displayText),
    boxFrom('CarNumberTile', [1.2, 1.7], [2.3, 2.8], [face, face + 0.02], m.sign),
    boxFrom('CarNumber', [1.2, 1.7], [2.3, 2.8], [face + 0.02, face + 0.024], textMaterial(['1'], '#ffffff', [0.5, 0.5])),
    mesh('NoSmokingDisc', cylinder(0.17, 0.17, 0.02, 14), m.white, { position: [1.45, 1.95, face], rotation: [Math.PI / 2, 0, 0] }),
    boxFrom('NamePlate', [-1.0, 0.7], [0.55, 0.85], [face, face + 0.02], m.plate),
    boxFrom('NamePlateText', [-1.0, 0.7], [0.55, 0.85], [face + 0.02, face + 0.024], textMaterial(['DEMU 1 0 25 01'], '#222222', [1.7, 0.3])),
  );

  const root = addChildren(createNode('TrainExhibitRoot'), body, roof, windows, doorAssembly, signage);

  let doorTarget = 0;
  let doorAmount = 0;
  let lightsOn = false;

  return {
    root,
    config,
    // Interaction 1: the door slides open and closed.
    setDoorOpen(open) { doorTarget = open ? 1 : 0; },
    // Interaction 2: the destination display and the window lights switch on.
    setLightsOn(on) {
      lightsOn = on;
      m.glass.glow = on ? 0.7 : 0;
      displayText.glow = on ? 1.6 : 0;
    },
    state: () => ({ doorOpen: doorTarget === 1, doorAmount, lightsOn }),
    update(delta) {
      // Constant-speed slide (about 1.2 s end to end), smoothed at both ends.
      const step = delta / 1.2;
      doorAmount += Math.sign(doorTarget - doorAmount) * Math.min(Math.abs(doorTarget - doorAmount), step);
      const ease = doorAmount * doorAmount * (3 - 2 * doorAmount);
      doorPanel.position[0] = ease * config.door.slide;
    },
  };
}
