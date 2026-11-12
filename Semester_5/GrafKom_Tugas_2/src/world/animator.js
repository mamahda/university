// Time-based animation of the CCWS scene. Every animated object is a pivot node in the
// scene graph; the animator only changes that pivot's local rotation or position, and the
// renderer's parent × local multiplication carries the change down to all its children.
// All motion is an interpretation for the demo, not a record of how the site behaves.

// Doors open only when people walk in or out (see peopleMotion.js); windows and bin lids
// stay closed.
export function createAnimator(building, environment, updatePeople) {
  const { explode } = building;
  const { crowns, fronds } = environment;
  const explodeBase = explode.map(({ node }) => [...node.position]);
  const frondBase = fronds.map((frond) => [...frond.rotation]);
  let explodeAmount = 0;
  let explodeTarget = 0;

  function animateObjects(time) {

    // Wind: tree crowns sway around the top of the trunk, palm fronds flutter.
    crowns.forEach((crown, i) => {
      crown.rotation[0] = Math.sin(time * 0.7 + i * 1.3) * 0.025;
      crown.rotation[2] = Math.cos(time * 0.55 + i * 0.9) * 0.03;
    });
    fronds.forEach((frond, i) => {
      frond.rotation[0] = frondBase[i][0] + Math.sin(time * 1.8 + i * 0.7) * 0.07;
    });
  }

  // Exploded view: glide towards the target and offset each part from its parent.
  function animateExplode(delta) {
    explodeAmount += (explodeTarget - explodeAmount) * Math.min(1, delta * 3);
    const ease = explodeAmount * explodeAmount * (3 - 2 * explodeAmount);
    explode.forEach(({ node, offset }, i) => {
      node.position = explodeBase[i].map((value, axis) => value + offset[axis] * ease);
    });
  }

  return {
    // `time` is the animation clock (it stops while paused); the exploded view always runs.
    update(time, delta, { animateObjects: objectsOn, viewer = null }) {
      // People and doors always update: with animation paused the clock stands still, so
      // people freeze, but doors still open for the walk-mode camera.
      updatePeople(time, delta, viewer);
      if (objectsOn) animateObjects(time);
      animateExplode(delta);
    },
    setExploded(on) {
      explodeTarget = on ? 1 : 0;
    },
  };
}
