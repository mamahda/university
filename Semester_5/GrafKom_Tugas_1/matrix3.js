/*
5025241102 Kemas Muhammad Athariq
5025241134 Gilbran Mahdavikia Raja
*/

// Helper matriks 3x3 untuk transformasi 2D (column-major, multiply(a, b) = a x b)
export const Mat3 = {
  identity() {
    return new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ]);
  },

  // Koordinat piksel (y ke bawah) -> clip space (-1..1, y ke atas)
  projection(width, height) {
    return new Float32Array([
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1,
    ]);
  },

  translation(tx, ty) {
    return new Float32Array([
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ]);
  },

  // Sudut dalam radian
  rotation(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
      c, s, 0,
      -s, c, 0,
      0, 0, 1,
    ]);
  },

  scaling(sx, sy) {
    return new Float32Array([
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ]);
  },

  multiply(a, b) {
    const out = new Float32Array(9);
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        out[col * 3 + row] =
          a[0 * 3 + row] * b[col * 3 + 0] +
          a[1 * 3 + row] * b[col * 3 + 1] +
          a[2 * 3 + row] * b[col * 3 + 2];
      }
    }
    return out;
  },

  // Helper berantai: m x translation / rotation / scaling
  translate(m, tx, ty) {
    return Mat3.multiply(m, Mat3.translation(tx, ty));
  },

  rotate(m, angle) {
    return Mat3.multiply(m, Mat3.rotation(angle));
  },

  scale(m, sx, sy) {
    return Mat3.multiply(m, Mat3.scaling(sx, sy));
  },

  // Menerapkan matriks ke titik (x, y, 1)
  transformPoint(m, x, y) {
    return [
      m[0] * x + m[3] * y + m[6],
      m[1] * x + m[4] * y + m[7],
    ];
  },
};
