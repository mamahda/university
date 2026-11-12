import { cylinder } from '../../webgl/geometry.js';
import { addChildren, createNode } from '../../webgl/sceneNode.js';
import { boxFrom, mesh } from '../shared/parts.js';

// Furniture builders for the co-working hall. Every builder returns a node whose origin is
// on the floor, centred under the piece. Chairs and sofas face local +Z. Sizes are ESTIMATES
// from interior-lorong-ruang-kerja and interior-ruang-kerja-mural, not measurements.

const FURNITURE_MATERIALS = {
  tableTop: { color: [0.9, 0.86, 0.78], specular: 0.12, shininess: 24 },
  steel: { color: [0.07, 0.07, 0.08], specular: 0.35, shininess: 40 },
  screen: { color: [0.36, 0.38, 0.4] },
  sofa: { color: [0.2, 0.2, 0.22] },
  sofaCushion: { color: [0.27, 0.27, 0.3] },
  rug: { color: [0.55, 0.43, 0.3] },
};
// Seat colours seen in the photos: yellow, grey, black, and a salmon pink.
const CHAIR_COLORS = [[0.93, 0.74, 0.12], [0.55, 0.57, 0.6], [0.1, 0.1, 0.12], [0.9, 0.5, 0.42]];

export const WORKSPACE_LAYOUT = {
  tableHeight: 0.75,
  // x, z: table centre on the floor (world metres, relative to the interior root). `sides` says
  // where chairs sit ('n' = at smaller z, 'm' = at larger z); `screen` puts a partition on one side.
  tables: [
    { x: -7.0, z: 4.95, length: 1.8, depth: 0.75, sides: ['n'], screen: 'm' },
    { x: -5.0, z: 4.95, length: 1.8, depth: 0.75, sides: ['n'], screen: 'm' },
    { x: -3.0, z: 4.95, length: 1.8, depth: 0.75, sides: ['n'], screen: 'm' },
    { x: -5.4, z: -4.95, length: 1.8, depth: 0.75, sides: ['m'], screen: 'n' },
    { x: -3.4, z: -4.95, length: 1.8, depth: 0.75, sides: ['m'], screen: 'n' },
    { x: -8.4, z: 1.2, length: 2.4, depth: 0.9, sides: ['n', 'm'] },
    { x: -4.4, z: 1.2, length: 2.4, depth: 0.9, sides: ['n', 'm'] },
    { x: -4.4, z: -1.2, length: 2.4, depth: 0.9, sides: ['n', 'm'] },
  ],
  // Lounge in the south-west corner.
  sofas: [
    { name: 'SofaSouth', x: -10.2, z: 5.2, facing: Math.PI },
    { name: 'SofaWest', x: -11.5, z: 3.3, facing: Math.PI / 2 },
  ],
  loungeTable: { x: -10.0, z: 3.6 },
};

export function createTable(name, { length = 1.8, depth = 0.8, height = 0.75, screen = null } = {}) {
  const leg = 0.04;
  const table = addChildren(
    createNode(name),
    boxFrom('Top', [-length / 2, length / 2], [height - 0.04, height], [-depth / 2, depth / 2], FURNITURE_MATERIALS.tableTop),
    ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => boxFrom(
      `Leg${i}`,
      [sx * (length / 2 - 0.06) - leg / 2, sx * (length / 2 - 0.06) + leg / 2],
      [0, height - 0.04],
      [sz * (depth / 2 - 0.06) - leg / 2, sz * (depth / 2 - 0.06) + leg / 2],
      FURNITURE_MATERIALS.steel,
    )),
    boxFrom('Stretcher', [-length / 2 + 0.06, length / 2 - 0.06], [0.28, 0.32], [-0.02, 0.02], FURNITURE_MATERIALS.steel),
  );
  if (screen) {
    // Grey fabric privacy screen along one long edge, as on the window-side desks.
    const z = screen === 'm' ? depth / 2 : -depth / 2;
    table.children.push(boxFrom('Screen', [-length / 2, length / 2], [height, height + 0.42], [z - 0.025, z + 0.025], FURNITURE_MATERIALS.screen));
  }
  return table;
}

// Swivel chair: a post on a cross-shaped base, seat, and backrest behind the seat.
export function createChair(name, color) {
  const material = { color, specular: 0.2, shininess: 32 };
  return addChildren(
    createNode(name),
    mesh('Post', cylinder(0.03, 0.03, 0.4, 6), FURNITURE_MATERIALS.steel, { position: [0, 0.06, 0] }),
    boxFrom('BaseA', [-0.27, 0.27], [0.03, 0.07], [-0.025, 0.025], FURNITURE_MATERIALS.steel),
    boxFrom('BaseB', [-0.025, 0.025], [0.03, 0.07], [-0.27, 0.27], FURNITURE_MATERIALS.steel),
    boxFrom('Seat', [-0.23, 0.23], [0.45, 0.5], [-0.23, 0.23], material),
    boxFrom('Back', [-0.22, 0.22], [0.54, 0.9], [-0.27, -0.23], material),
    boxFrom('BackSupport', [-0.03, 0.03], [0.5, 0.56], [-0.25, -0.2], FURNITURE_MATERIALS.steel),
  );
}

export function createSofa(name, { length = 1.9, depth = 0.85 } = {}) {
  const seatTop = 0.45;
  return addChildren(
    createNode(name),
    boxFrom('Base', [-length / 2, length / 2], [0.08, 0.28], [-depth / 2, depth / 2], FURNITURE_MATERIALS.sofa),
    boxFrom('CushionLeft', [-length / 2 + 0.16, -0.01], [0.28, seatTop], [-depth / 2 + 0.22, depth / 2], FURNITURE_MATERIALS.sofaCushion),
    boxFrom('CushionRight', [0.01, length / 2 - 0.16], [0.28, seatTop], [-depth / 2 + 0.22, depth / 2], FURNITURE_MATERIALS.sofaCushion),
    boxFrom('Backrest', [-length / 2 + 0.16, length / 2 - 0.16], [0.28, 0.82], [-depth / 2, -depth / 2 + 0.22], FURNITURE_MATERIALS.sofa),
    boxFrom('ArmLeft', [-length / 2, -length / 2 + 0.16], [0.08, 0.62], [-depth / 2, depth / 2], FURNITURE_MATERIALS.sofa),
    boxFrom('ArmRight', [length / 2 - 0.16, length / 2], [0.08, 0.62], [-depth / 2, depth / 2], FURNITURE_MATERIALS.sofa),
  );
}

// Tables with their chairs, and the lounge. Groups follow docs/SCENE_GRAPH.md:
// WorkspaceFurniture → Tables, Chairs, Sofas.
export function createWorkspaceFurniture(layout = WORKSPACE_LAYOUT) {
  const tables = createNode('Tables');
  const chairs = createNode('Chairs');
  const sofas = createNode('Sofas');
  let chairIndex = 0;

  layout.tables.forEach((spec, i) => {
    tables.children.push(Object.assign(
      createTable(`Table${i}`, { ...spec, height: layout.tableHeight }),
      { position: [spec.x, 0, spec.z] },
    ));
    const perSide = Math.max(1, Math.round(spec.length / 1.0));
    spec.sides.forEach((side) => {
      for (let c = 0; c < perSide; c += 1) {
        const along = (c - (perSide - 1) / 2) * (spec.length / perSide);
        const offset = (spec.depth / 2 + 0.3) * (side === 'n' ? -1 : 1);
        const chair = createChair(`Chair${chairIndex}`, CHAIR_COLORS[chairIndex % CHAIR_COLORS.length]);
        chair.position = [spec.x + along, 0, spec.z + offset];
        chair.rotation = [0, side === 'n' ? 0 : Math.PI, 0]; // face the table
        chairs.children.push(chair);
        chairIndex += 1;
      }
    });
  });

  layout.sofas.forEach(({ name, x, z, facing }) => {
    const sofa = createSofa(name);
    sofa.position = [x, 0, z];
    sofa.rotation = [0, facing, 0];
    sofas.children.push(sofa);
  });
  const { x, z } = layout.loungeTable;
  sofas.children.push(
    boxFrom('LoungeRug', [x - 1.0, x + 1.0], [0, 0.012], [z - 0.8, z + 0.8], FURNITURE_MATERIALS.rug),
    Object.assign(createTable('LoungeTable', { length: 0.9, depth: 0.6, height: 0.42 }), { position: [x, 0, z] }),
  );

  const group = addChildren(createNode('WorkspaceFurniture'), tables, chairs, sofas);
  return group;
}
