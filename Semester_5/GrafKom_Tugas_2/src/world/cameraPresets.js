// Camera viewpoints. The photo views roughly match where each reference photo was taken
// (found by placing the model next to the photo); the phone's ultra-wide lens is imitated
// with a wide field of view. Angles in radians, distances in metres.
const deg = (value) => (value * Math.PI) / 180;

// View given by an eye position and the point it looks at, converted to the orbit camera's
// { target, yaw, pitch, distance }: eye = target + distance · (cos p · sin y, sin p, cos p · cos y).
function viewFromTo(eye, target, fov) {
  const [dx, dy, dz] = eye.map((value, i) => value - target[i]);
  const distance = Math.hypot(dx, dy, dz);
  return { target, yaw: Math.atan2(dx, dz), pitch: Math.asin(dy / distance), distance, fov };
}

export const CAMERA_PRESETS = {
  awal: { label: 'Awal', target: [-3, 3.2, 3], yaw: -0.6, pitch: 0.14, distance: 31, fov: deg(50) },
  fasadKiri: { label: 'Fasad, sudut kiri', photo: 'eksterior-fasad-serong-kiri', target: [0, 3.2, 5], yaw: -0.98, pitch: 0.08, distance: 18, fov: deg(72) },
  fasadKanan: { label: 'Fasad, sudut kanan', photo: 'eksterior-fasad-serong-kanan', target: [0, 3.2, 5], yaw: 0.98, pitch: 0.08, distance: 18, fov: deg(72) },
  pintuUtama: { label: 'Pintu masuk', photo: 'eksterior-fasad-pintu-utama', target: [-0.5, 2.4, 6.5], yaw: 0.5, pitch: 0.06, distance: 11, fov: deg(58) },
  sisiCoworking: { label: 'Sisi co-working', photo: 'eksterior-coworking-gable-kanopi', target: [-12.5, 3, 1.5], yaw: -1.1, pitch: 0.06, distance: 11, fov: deg(72) },
  kanopiDepan: { label: 'Kanopi, depan', photo: 'eksterior-kanopi-depan', target: [-19.6, 3.6, -0.45], yaw: -Math.PI / 2, pitch: -0.28, distance: 5.5, fov: deg(75) },
  hierarki: { label: 'Dari atas', target: [-4, 2, 0], yaw: 0.55, pitch: 0.75, distance: 52, fov: deg(50) },
  // Interior views: the eye is inside the hall. Eye and target are in world metres and are
  // estimates, like the layout itself. `interior: true` marks them for the page.
  interiorLorong: { label: 'Interior: lorong', interior: true, photo: 'interior-lorong-ruang-kerja', ...viewFromTo([-3.5, 2.1, 0.2], [10, 1.9, 0], deg(78)) },
  interiorKerja: { label: 'Interior: ruang kerja', interior: true, photo: 'interior-ruang-kerja-mural', ...viewFromTo([3.5, 2.2, 0.8], [-10, 2.3, 0], deg(75)) },
  interiorKafe: { label: 'Interior: kafe', interior: true, photo: 'interior-meja-kasir-kantin', ...viewFromTo([-3.8, 1.9, 3.2], [-9, 1.3, -3.6], deg(78)) },
  pameran: { label: 'Pameran', interior: true, photo: 'interior-pameran-kereta', ...viewFromTo([1.2, 2.2, 0.0], [8, 1.5, 0], deg(80)) },
  pameranRobot: { label: 'Lengan robot', interior: true, ...viewFromTo([3.4, 1.9, 5.0], [6.4, 1.3, 3.0], deg(68)) },
  pameranMotor: { label: 'Motor listrik', interior: true, ...viewFromTo([3.4, 1.4, -0.6], [5.8, 0.95, -3.1], deg(68)) },
  potongan: { label: 'Potongan (atap dibuka)', cutaway: true, target: [0, 0.6, 0], yaw: 0.5, pitch: 1.0, distance: 30, fov: deg(50) },
};
