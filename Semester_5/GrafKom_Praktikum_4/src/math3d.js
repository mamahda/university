export const Vec3 = {
  subtract(a, b) {
    return [
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    ];
  },

  cross(a, b) {
    return [
      a[1] * b[2] -
      a[2] * b[1],

      a[2] * b[0] -
      a[0] * b[2],

      a[0] * b[1] -
      a[1] * b[0]
    ];
  },

  normalize(v) {
    const length =
      Math.hypot(
        v[0],
        v[1],
        v[2]
      );

    if (
      length <
      0.000001
    ) {
      return [
        0,
        0,
        0
      ];
    }

    return [
      v[0] / length,
      v[1] / length,
      v[2] / length
    ];
  },

  dot(a, b) {
    return (
      a[0] * b[0] +
      a[1] * b[1] +
      a[2] * b[2]
    );
  }
};

// Seluruh matrix disimpan column-major (format yang diharapkan
// gl.uniformMatrix4fv dengan transpose = false).
export const Mat4 = {
  identity() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  },

  translation(
    tx,
    ty,
    tz
  ) {
    return new Float32Array([
      1,  0,  0,  0,
      0,  1,  0,  0,
      0,  0,  1,  0,
      tx, ty, tz, 1
    ]);
  },

  rotationX(rad) {
    const c =
      Math.cos(rad);

    const s =
      Math.sin(rad);

    return new Float32Array([
      1, 0,  0, 0,
      0, c,  s, 0,
      0, -s, c, 0,
      0, 0,  0, 1
    ]);
  },

  rotationY(rad) {
    const c =
      Math.cos(rad);

    const s =
      Math.sin(rad);

    return new Float32Array([
       c, 0, -s, 0,
       0, 1,  0, 0,
       s, 0,  c, 0,
       0, 0,  0, 1
    ]);
  },

  scaling(
    sx,
    sy,
    sz
  ) {
    return new Float32Array([
      sx, 0,  0,  0,
      0,  sy, 0,  0,
      0,  0,  sz, 0,
      0,  0,  0,  1
    ]);
  },

  // Convention: multiply(a, b) menerapkan a terlebih dahulu,
  // kemudian b (secara matematis b × a).
  multiply(a, b) {
    const out =
      new Float32Array(16);

    for (
      let row = 0;
      row < 4;
      row++
    ) {
      for (
        let col = 0;
        col < 4;
        col++
      ) {
        let sum = 0;

        for (
          let i = 0;
          i < 4;
          i++
        ) {
          sum +=
            b[i * 4 + col] *
            a[row * 4 + i];
        }

        out[
          row * 4 + col
        ] = sum;
      }
    }

    return out;
  },

  lookAt(
    position,
    target,
    up
  ) {
    const forward =
      Vec3.normalize(
        Vec3.subtract(
          target,
          position
        )
      );

    const right =
      Vec3.normalize(
        Vec3.cross(
          forward,
          up
        )
      );

    const correctedUp =
      Vec3.cross(
        right,
        forward
      );

    return new Float32Array([
       right[0],
       correctedUp[0],
      -forward[0],
       0,

       right[1],
       correctedUp[1],
      -forward[1],
       0,

       right[2],
       correctedUp[2],
      -forward[2],
       0,

      -Vec3.dot(
        right,
        position
      ),

      -Vec3.dot(
        correctedUp,
        position
      ),

       Vec3.dot(
         forward,
         position
       ),

       1
    ]);
  },

  perspective(
    fovRad,
    aspect,
    near,
    far
  ) {
    const f =
      1.0 /
      Math.tan(
        fovRad / 2
      );

    const rangeInv =
      1.0 /
      (near - far);

    return new Float32Array([
      f / aspect,
      0,
      0,
      0,

      0,
      f,
      0,
      0,

      0,
      0,
      (near + far) *
        rangeInv,
      -1,

      0,
      0,
      2 * near * far *
        rangeInv,
      0
    ]);
  },

  orthographic(
    left,
    right,
    bottom,
    top,
    near,
    far
  ) {
    return new Float32Array([
      2 / (right - left),
      0,
      0,
      0,

      0,
      2 / (top - bottom),
      0,
      0,

      0,
      0,
      -2 / (far - near),
      0,

      -(right + left) /
        (right - left),

      -(top + bottom) /
        (top - bottom),

      -(far + near) /
        (far - near),

      1
    ]);
  }
};
