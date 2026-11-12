import { addChildren, createNode } from '../../webgl/sceneNode.js';
import { INTERIOR_LAYOUT } from '../interior/interior.js';
import { createMotorcycle } from './motorcycle.js';
import { createRobotArm } from './robotArm.js';
import { createTrain } from './train.js';

// Innovation exhibition: places the three exhibits in the east half of the hall. Positions are
// ESTIMATED placements (x, z in world metres on the floor), not measured. The train stands
// against the east wall with its long side facing the hall (−X), leaving a gap towards the
// entrance side (+Z) to see its end; the motorcycle and the robot arm have their own platforms.
const floorY = INTERIOR_LAYOUT.floorY;

export const EXHIBITION_LAYOUT = {
  train: { x: INTERIOR_LAYOUT.halfLength - 1.55, z: -0.9 },
  motorcycle: { x: 5.8, z: -3.2, turn: -0.5 }, // turn: rotation about Y in radians
  robot: { x: 6.2, z: 3.0 },
};

export function createExhibition(layout = EXHIBITION_LAYOUT) {
  const train = createTrain();
  // The train is modelled with its visible side on local +Z; turning −90° about Y points that side at −X.
  train.root.position = [layout.train.x, floorY, layout.train.z];
  train.root.rotation = [0, -Math.PI / 2, 0];

  const motorcycle = createMotorcycle();
  motorcycle.root.position = [layout.motorcycle.x, floorY, layout.motorcycle.z];
  motorcycle.root.rotation = [0, layout.motorcycle.turn, 0];

  const robot = createRobotArm();
  robot.root.position = [layout.robot.x, floorY, layout.robot.z];

  const root = addChildren(createNode('InnovationExhibition'), train.root, motorcycle.root, robot.root);
  return {
    root,
    train,
    motorcycle,
    robot,
    update(delta, { animate = true } = {}) {
      train.update(delta);
      motorcycle.update(delta, { spin: animate });
      robot.update(delta);
    },
  };
}
