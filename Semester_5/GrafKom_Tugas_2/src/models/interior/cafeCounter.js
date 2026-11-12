import { cylinder } from '../../webgl/geometry.js';
import { addChildren, createNode } from '../../webgl/sceneNode.js';
import { createTextTexture } from '../../webgl/textTexture.js';
import { boxFrom, mesh, seededRandom } from '../shared/parts.js';

// Coffee and snack counter (interior-meja-kasir-kantin, interior-lorong-ruang-kerja). The
// layout is ESTIMATED: a front counter facing the hall, a back counter against the north wall
// with the coffee machine, sink and fridges, and shelves above. Local origin: on the floor,
// at the centre of the café area. The local +Z side faces the hall.

const CAFE_MATERIALS = {
  counterBody: { color: [0.6, 0.62, 0.68], specular: 0.1 },
  counterTop: { color: [0.42, 0.4, 0.37], specular: 0.25, shininess: 40 },
  counterBase: { color: [0.45, 0.42, 0.38] },
  accentOrange: { color: [0.9, 0.52, 0.36] },
  accentBlue: { color: [0.32, 0.45, 0.62] },
  backBody: { color: [0.28, 0.29, 0.31] },
  steel: { color: [0.7, 0.71, 0.73], specular: 0.7, shininess: 64 },
  black: { color: [0.06, 0.06, 0.07], specular: 0.4, shininess: 48 },
  fridgeWhite: { color: [0.9, 0.9, 0.92], specular: 0.3 },
  fridgeGlass: { color: [0.2, 0.28, 0.33], specular: 0.8, shininess: 80, reflect: 0.25 },
  shelf: { color: [0.75, 0.7, 0.62] },
  crate: { color: [0.94, 0.94, 0.9] },
  crateYellow: { color: [0.95, 0.78, 0.15] },
  banner: { color: [0.96, 0.78, 0.35] },
};
const PRODUCT_COLORS = [[0.85, 0.2, 0.15], [0.2, 0.5, 0.8], [0.95, 0.75, 0.15], [0.3, 0.65, 0.3], [0.9, 0.5, 0.2], [0.55, 0.25, 0.55]];

export const CAFE_LAYOUT = {
  position: [-8.6, -3.6], // x, z of the café origin (world metres, relative to the interior root)
  backWallZ: -2.1, // local z of the north wall face
  frontCounterHeight: 1.05,
  backCounterHeight: 0.9,
};

function counter(name, [x0, x1], [z0, z1], height, facing) {
  // Panelled body with a thicker top. `facing` is the side with the decorative panel (+1 = +z).
  const front = facing > 0 ? [z1 - 0.03, z1] : [z0, z0 + 0.03];
  return addChildren(
    createNode(name),
    boxFrom('Body', [x0, x1], [0, height - 0.04], [z0, z1], CAFE_MATERIALS.counterBody),
    boxFrom('Plinth', [x0, x1], [0, 0.1], [z0 - 0.01, z1 + 0.01], CAFE_MATERIALS.counterBase),
    boxFrom('Top', [x0 - 0.04, x1 + 0.04], [height - 0.04, height], [z0 - 0.04, z1 + 0.04], CAFE_MATERIALS.counterTop),
    // Simplified version of the orange and blue triangle pattern on the counter front.
    boxFrom('AccentOrange', [x0 + 0.3, x0 + 1.5], [0.45, 0.8], [front[0], front[1] + 0.01 * facing], CAFE_MATERIALS.accentOrange),
    boxFrom('AccentBlue', [x0 + 0.9, x0 + 1.9], [0.3, 0.6], [front[0], front[1] + 0.012 * facing], CAFE_MATERIALS.accentBlue),
  );
}

function crate(name, [x, z], y, color, random) {
  const group = createNode(name, { position: [x, y, z] });
  group.children.push(boxFrom('Box', [-0.2, 0.2], [0, 0.14], [-0.14, 0.14], color));
  for (let i = 0; i < 4; i += 1) {
    const px = -0.15 + i * 0.1;
    const pz = (random() - 0.5) * 0.12;
    const material = { color: PRODUCT_COLORS[Math.floor(random() * PRODUCT_COLORS.length)] };
    group.children.push(boxFrom(`Item${i}`, [px - 0.04, px + 0.04], [0.14, 0.14 + 0.05 + random() * 0.04], [pz - 0.05, pz + 0.05], material));
  }
  return group;
}

function coffeeMachine() {
  return addChildren(
    createNode('CoffeeMachine', { position: [-1.0, CAFE_LAYOUT.backCounterHeight, CAFE_LAYOUT.backWallZ + 0.4] }),
    boxFrom('Body', [-0.28, 0.28], [0, 0.5], [-0.2, 0.2], CAFE_MATERIALS.black),
    boxFrom('Head', [-0.28, 0.28], [0.34, 0.5], [0.1, 0.26], CAFE_MATERIALS.steel),
    boxFrom('DripTray', [-0.25, 0.25], [0, 0.03], [0.2, 0.34], CAFE_MATERIALS.steel),
    mesh('Spout0', cylinder(0.02, 0.02, 0.08, 6), CAFE_MATERIALS.steel, { position: [-0.1, 0.26, 0.2] }),
    mesh('Spout1', cylinder(0.02, 0.02, 0.08, 6), CAFE_MATERIALS.steel, { position: [0.1, 0.26, 0.2] }),
  );
}

export function createCafeCounter(layout = CAFE_LAYOUT) {
  const random = seededRandom(77);
  const { backWallZ: wallZ, frontCounterHeight: frontH, backCounterHeight: backH } = layout;
  const cafe = createNode('Cafe', { position: [layout.position[0], 0, layout.position[1]] });

  const frontCounter = counter('FrontCounter', [-2.4, 2.0], [0.5, 1.2], frontH, 1);
  const returnCounter = counter('ReturnCounter', [1.4, 2.0], [-1.4, 0.5], frontH, 1);
  const backCounter = counter('BackCounter', [-3.0, 2.2], [wallZ, wallZ + 0.7], backH, 1);
  frontCounter.children.push(
    crate('Crate0', [-1.9, 0.85], frontH, CAFE_MATERIALS.crate, random),
    crate('Crate1', [-1.3, 0.85], frontH, CAFE_MATERIALS.crateYellow, random),
    crate('Crate2', [-0.6, 0.85], frontH, CAFE_MATERIALS.crate, random),
    crate('Crate3', [0.1, 0.85], frontH, CAFE_MATERIALS.crateYellow, random),
    crate('Crate4', [0.8, 0.85], frontH, CAFE_MATERIALS.crate, random),
  );
  backCounter.children.push(
    coffeeMachine(),
    boxFrom('Sink', [-2.6, -1.9], [backH, backH + 0.02], [wallZ + 0.12, wallZ + 0.58], CAFE_MATERIALS.steel),
    mesh('Kettle', cylinder(0.1, 0.08, 0.2, 8), CAFE_MATERIALS.steel, { position: [0.6, backH, wallZ + 0.35] }),
  );

  // Two wall shelves above the back counter with a few snack and drink blocks.
  const shelves = createNode('Shelves');
  [1.55, 2.05].forEach((y, row) => {
    shelves.children.push(boxFrom(`Shelf${row}`, [-2.8, 1.0], [y, y + 0.03], [wallZ, wallZ + 0.3], CAFE_MATERIALS.shelf));
    for (let i = 0; i < 9; i += 1) {
      const x = -2.65 + i * 0.42;
      const material = { color: PRODUCT_COLORS[(i + row * 3) % PRODUCT_COLORS.length] };
      shelves.children.push(boxFrom(`Product${row}_${i}`, [x, x + 0.14 + random() * 0.1], [y + 0.03, y + 0.18 + random() * 0.1], [wallZ + 0.06, wallZ + 0.22], material));
    }
  });

  // Black two-door fridge and a white drink fridge with a glass front (both seen in the photos).
  const fridges = createNode('Fridges');
  fridges.children.push(
    boxFrom('Fridge', [2.35, 2.95], [0, 1.7], [wallZ, wallZ + 0.65], CAFE_MATERIALS.black),
    boxFrom('DrinkFridge', [3.05, 3.75], [0, 1.9], [wallZ, wallZ + 0.7], CAFE_MATERIALS.fridgeWhite),
    boxFrom('DrinkFridgeGlass', [3.1, 3.7], [0.15, 1.7], [wallZ + 0.7, wallZ + 0.72], CAFE_MATERIALS.fridgeGlass),
  );

  // Menu banner on a stand: text categories as visible on the banner in the photo.
  const bannerMaterial = {
    color: [1, 1, 1],
    texture: createTextTexture(['Menu', 'ESPRESSO BASED', 'NON COFFEE', 'VARIAN KOPI SUSU'], { color: '#3b2a12', width: 512, height: 1024, fontWeight: 700 }),
    tileSize: [0.6, 1.5],
    alphaTest: true,
  };
  const banner = addChildren(
    createNode('MenuBanner', { position: [-2.9, 0, 1.0], rotation: [0, 0.35, 0] }),
    boxFrom('Board', [-0.3, 0.3], [0.1, 1.6], [-0.01, 0.01], CAFE_MATERIALS.banner),
    boxFrom('Text', [-0.3, 0.3], [0.1, 1.6], [0.01, 0.012], bannerMaterial),
    boxFrom('Foot', [-0.25, 0.25], [0, 0.1], [-0.12, 0.12], CAFE_MATERIALS.black),
  );

  return addChildren(cafe, addChildren(createNode('Counter'), frontCounter, returnCounter, backCounter), shelves, fridges, banner);
}
