import {
  Mat3
} from "./matrix3.js";

const canvas =
  document.getElementById(
    "glCanvas"
  );

const gl =
  canvas.getContext(
    "webgl2"
  );

if (!gl) {
  throw new Error(
    "WebGL2 tidak tersedia."
  );
}

gl.viewport(
  0,
  0,
  canvas.width,
  canvas.height
);

const vertices =
  new Float32Array([
    -0.18, -0.15,
     0.18, -0.15,
     0.00,  0.22
  ]);

const axisVertices =
  new Float32Array([
    -1.0,  0.0,
     1.0,  0.0,
     0.0, -1.0,
     0.0,  1.0
  ]);

const pivotVertices =
  new Float32Array([
    0.0, 0.0
  ]);

const vertexShaderSource = `#version 300 es

in vec2 a_position;

uniform mat3 u_matrix;
uniform float u_pointSize;

void main() {
  vec3 p =
    u_matrix *
    vec3(
      a_position,
      1.0
    );

  gl_Position =
    vec4(
      p.xy,
      0.0,
      1.0
    );

  gl_PointSize =
    u_pointSize;
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor =
    u_color;
}
`;

function createShader(
  gl,
  type,
  source
) {
  const shader =
    gl.createShader(type);

  gl.shaderSource(
    shader,
    source
  );

  gl.compileShader(
    shader
  );

  const success =
    gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS
    );

  if (!success) {
    const info =
      gl.getShaderInfoLog(
        shader
      );

    gl.deleteShader(
      shader
    );

    throw new Error(
      "Shader compile error:\n" +
      info
    );
  }

  return shader;
}

function createProgram(
  gl,
  vertexShader,
  fragmentShader
) {
  const program =
    gl.createProgram();

  gl.attachShader(
    program,
    vertexShader
  );

  gl.attachShader(
    program,
    fragmentShader
  );

  gl.linkProgram(
    program
  );

  const success =
    gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    );

  if (!success) {
    const info =
      gl.getProgramInfoLog(
        program
      );

    gl.deleteProgram(
      program
    );

    throw new Error(
      "Program link error:\n" +
      info
    );
  }

  return program;
}

const vertexShader =
  createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
  );

const fragmentShader =
  createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

const program =
  createProgram(
    gl,
    vertexShader,
    fragmentShader
  );

gl.useProgram(
  program
);

function createBuffer(
  data
) {
  const buffer =
    gl.createBuffer();

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    data,
    gl.STATIC_DRAW
  );

  return buffer;
}

const positionBuffer =
  createBuffer(
    vertices
  );

const axisBuffer =
  createBuffer(
    axisVertices
  );

const pivotBuffer =
  createBuffer(
    pivotVertices
  );

const positionLocation =
  gl.getAttribLocation(
    program,
    "a_position"
  );

const matrixLocation =
  gl.getUniformLocation(
    program,
    "u_matrix"
  );

const colorLocation =
  gl.getUniformLocation(
    program,
    "u_color"
  );

const pointSizeLocation =
  gl.getUniformLocation(
    program,
    "u_pointSize"
  );

function degToRad(
  degree
) {
  return (
    degree *
    Math.PI /
    180
  );
}

const objectA = {
  x: -0.35,
  y: 0.0,

  rotation: 0.0,

  scaleX: 1.0,
  scaleY: 1.0
};

const colorA =
  new Float32Array([
    0.10,
    0.75,
    1.00,
    1.00
  ]);

const colorB =
  new Float32Array([
    1.00,
    0.55,
    0.10,
    1.00
  ]);

const axisColor =
  new Float32Array([
    0.32,
    0.42,
    0.55,
    1.00
  ]);

const pivotColor =
  new Float32Array([
    1.00,
    1.00,
    1.00,
    1.00
  ]);

function createTRSMatrix(
  transform
) {
  const t =
    Mat3.translation(
      transform.x,
      transform.y
    );

  const r =
    Mat3.rotation(
      degToRad(
        transform.rotation
      )
    );

  const s =
    Mat3.scaling(
      transform.scaleX,
      transform.scaleY
    );

  let matrix =
    Mat3.identity();

  matrix =
    Mat3.multiply(
      matrix,
      s
    );

  matrix =
    Mat3.multiply(
      matrix,
      r
    );

  matrix =
    Mat3.multiply(
      matrix,
      t
    );

  return matrix;
}

function createRTSMatrix(
  transform
) {
  const t =
    Mat3.translation(
      transform.x,
      transform.y
    );

  const r =
    Mat3.rotation(
      degToRad(
        transform.rotation
      )
    );

  const s =
    Mat3.scaling(
      transform.scaleX,
      transform.scaleY
    );

  let matrix =
    Mat3.identity();

  matrix =
    Mat3.multiply(
      matrix,
      s
    );

  matrix =
    Mat3.multiply(
      matrix,
      t
    );

  matrix =
    Mat3.multiply(
      matrix,
      r
    );

  return matrix;
}

function drawObject(
  buffer,
  mode,
  count,
  matrix,
  color,
  pointSize
) {
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
  );

  gl.enableVertexAttribArray(
    positionLocation
  );

  gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.uniformMatrix3fv(
    matrixLocation,
    false,
    matrix
  );

  gl.uniform4fv(
    colorLocation,
    color
  );

  gl.uniform1f(
    pointSizeLocation,
    pointSize
  );

  gl.drawArrays(
    mode,
    0,
    count
  );
}

let transformOrder =
  "TRS";

function createObjectBMatrix(
  seconds
) {
  const rotation =
    seconds * 70.0;

  const scale =
    1.0 +
    Math.sin(
      seconds * 2.0
    ) * 0.25;

  const transformB = {
    x: 0.42,
    y: 0.0,

    rotation,

    scaleX: scale,
    scaleY: scale
  };

  return createTRSMatrix(
    transformB
  );
}

function drawScene(
  seconds
) {
  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  );

  gl.clearColor(
    0.03,
    0.05,
    0.10,
    1.0
  );

  gl.clear(
    gl.COLOR_BUFFER_BIT
  );

  gl.useProgram(
    program
  );

  drawObject(
    axisBuffer,
    gl.LINES,
    4,
    Mat3.identity(),
    axisColor,
    1.0
  );

  const matrixA =
    transformOrder === "TRS"
      ? createTRSMatrix(objectA)
      : createRTSMatrix(objectA);

  const matrixB =
    createObjectBMatrix(
      seconds
    );

  drawObject(
    positionBuffer,
    gl.TRIANGLES,
    3,
    matrixA,
    colorA,
    1.0
  );

  drawObject(
    positionBuffer,
    gl.TRIANGLES,
    3,
    matrixB,
    colorB,
    1.0
  );

  drawObject(
    pivotBuffer,
    gl.POINTS,
    1,
    matrixA,
    pivotColor,
    9.0
  );

  drawObject(
    pivotBuffer,
    gl.POINTS,
    1,
    matrixB,
    pivotColor,
    9.0
  );
}

const keys = {};

window.addEventListener(
  "keydown",
  (event) => {
    keys[
      event.key.toLowerCase()
    ] = true;

    if (
      event.key.startsWith(
        "Arrow"
      )
    ) {
      event.preventDefault();
    }
  }
);

window.addEventListener(
  "keyup",
  (event) => {
    keys[
      event.key.toLowerCase()
    ] = false;
  }
);

function resetObjectA() {
  objectA.x = -0.35;
  objectA.y = 0.0;
  objectA.rotation = 0.0;
  objectA.scaleX = 1.0;
  objectA.scaleY = 1.0;
}

function applyPreset(
  preset
) {
  if (preset === "1") {
    objectA.x = -0.4;
    objectA.y = 0.2;
    objectA.rotation = 0.0;
    objectA.scaleX = 1.0;
    objectA.scaleY = 1.0;
  }

  if (preset === "2") {
    objectA.x = 0.0;
    objectA.y = 0.0;
    objectA.rotation = 45.0;
    objectA.scaleX = 1.5;
    objectA.scaleY = 1.5;
  }

  if (preset === "3") {
    objectA.x = 0.3;
    objectA.y = -0.2;
    objectA.rotation = 90.0;
    objectA.scaleX = 1.8;
    objectA.scaleY = 0.6;
  }
}

window.addEventListener(
  "keydown",
  (event) => {
    if (event.repeat) return;

    if (event.key.toLowerCase() === "r") {
      resetObjectA();
    }

    if (event.key.toLowerCase() === "t") {
      transformOrder =
        transformOrder === "TRS"
          ? "RTS"
          : "TRS";
    }

    if (["1", "2", "3"].includes(event.key)) {
      applyPreset(event.key);
    }
  }
);

const moveSpeed =
  0.65;

function updateTranslation(
  dt
) {
  if (keys["arrowleft"]) objectA.x -= moveSpeed * dt;
  if (keys["arrowright"]) objectA.x += moveSpeed * dt;
  if (keys["arrowup"]) objectA.y += moveSpeed * dt;
  if (keys["arrowdown"]) objectA.y -= moveSpeed * dt;
}

const rotationSpeed =
  100.0;

function updateRotation(
  dt
) {
  if (keys["q"]) objectA.rotation -= rotationSpeed * dt;
  if (keys["e"]) objectA.rotation += rotationSpeed * dt;
}

const scaleSpeed =
  0.8;

function updateUniformScale(
  dt
) {
  if (keys["+"] || keys["="]) {
    objectA.scaleX += scaleSpeed * dt;
    objectA.scaleY += scaleSpeed * dt;
  }

  if (keys["-"] || keys["_"]) {
    objectA.scaleX -= scaleSpeed * dt;
    objectA.scaleY -= scaleSpeed * dt;
  }
}

function updateNonUniformScale(
  dt
) {
  if (keys["z"]) objectA.scaleX -= scaleSpeed * dt;
  if (keys["x"]) objectA.scaleX += scaleSpeed * dt;
  if (keys["c"]) objectA.scaleY -= scaleSpeed * dt;
  if (keys["v"]) objectA.scaleY += scaleSpeed * dt;
}

function clampObjectA() {
  objectA.x = Math.max(-0.8, Math.min(0.8, objectA.x));
  objectA.y = Math.max(-0.75, Math.min(0.75, objectA.y));
  objectA.scaleX = Math.max(0.2, Math.min(2.5, objectA.scaleX));
  objectA.scaleY = Math.max(0.2, Math.min(2.5, objectA.scaleY));
}

function update(
  dt
) {
  updateTranslation(dt);
  updateRotation(dt);
  updateUniformScale(dt);
  updateNonUniformScale(dt);
  clampObjectA();
}

const positionInfo =
  document.getElementById(
    "positionInfo"
  );

const rotationInfo =
  document.getElementById(
    "rotationInfo"
  );

const scaleInfo =
  document.getElementById(
    "scaleInfo"
  );

const orderInfo =
  document.getElementById(
    "orderInfo"
  );

function updateHUD() {
  positionInfo.textContent =
    `(${objectA.x.toFixed(2)}, ` +
    `${objectA.y.toFixed(2)})`;

  rotationInfo.textContent =
    `${objectA.rotation.toFixed(1)}°`;

  scaleInfo.textContent =
    `(${objectA.scaleX.toFixed(2)}, ` +
    `${objectA.scaleY.toFixed(2)})`;

  orderInfo.textContent =
    transformOrder === "TRS"
      ? "Scale → Rotate → Translate"
      : "Scale → Translate → Rotate";
}

let lastTime = 0;

function render(
  time
) {
  let dt =
    (time - lastTime) *
    0.001;

  lastTime = time;

  dt =
    Math.min(
      dt,
      0.05
    );

  update(dt);
  drawScene(time * 0.001);
  updateHUD();

  requestAnimationFrame(
    render
  );
}

requestAnimationFrame(
  render
);
