import { identity, invert, lookAt, multiply, normalMatrix, ortho } from './mat4.js';
import { traverse } from './sceneNode.js';

// Three shader programs:
//   shadow – renders depth from the sun into a depth texture (shadow map),
//   sky    – full-screen gradient sky with sun disc and stars,
//   lit    – the scene: hemisphere ambient, sun (Lambert + Blinn-Phong, shadowed), point
//            lights, textures with bump from brightness, sky reflection on glass, emission.

export const MAX_POINT_LIGHTS = 8;
const SHADOW_SIZE = 2048;

const LIT_VS = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormalMatrix;
uniform mat4 uLightSpace;

out vec3 vWorldPosition;
out vec3 vNormal;
out vec2 vUv;
out vec4 vLightPosition;

void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vWorldPosition = world.xyz;
  vNormal = uNormalMatrix * aNormal;
  vUv = aUv;
  vLightPosition = uLightSpace * world;
  gl_Position = uProjection * uView * world;
}`;

const LIT_FS = `#version 300 es
precision highp float;
precision highp sampler2DShadow;

in vec3 vWorldPosition;
in vec3 vNormal;
in vec2 vUv;
in vec4 vLightPosition;

uniform vec3 uColor;
uniform float uSpecular;
uniform float uShininess;
uniform bool uUseTexture;
uniform bool uAlphaTest;
uniform sampler2D uTexture;
uniform vec2 uUvScale;
uniform float uBump;
uniform float uReflect;
uniform vec3 uEmissive;
uniform bool uEmissiveMask;

uniform vec3 uCameraPosition;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uGroundColor;
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;
uniform vec3 uFogColor;
uniform vec2 uFogRange;

uniform bool uShadows;
uniform sampler2DShadow uShadowMap;
uniform float uShadowTexel;

uniform int uPointCount;
uniform vec3 uPointPosition[${MAX_POINT_LIGHTS}];
uniform vec3 uPointColor[${MAX_POINT_LIGHTS}];
uniform float uPointRange[${MAX_POINT_LIGHTS}];

out vec4 outColor;

float luminance(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

// Bump mapping without tangents (Mikkelsen 2010): tilt the normal against the screen-space
// gradient of a height value, here the texture brightness in metres.
vec3 bumpNormal(vec3 n, vec3 position, float height) {
  vec3 dpdx = dFdx(position);
  vec3 dpdy = dFdy(position);
  float dhdx = dFdx(height);
  float dhdy = dFdy(height);
  vec3 r1 = cross(dpdy, n);
  vec3 r2 = cross(n, dpdx);
  float det = dot(dpdx, r1);
  vec3 gradient = sign(det) * (dhdx * r1 + dhdy * r2);
  return normalize(abs(det) * n - gradient);
}

// 3 × 3 percentage-closer filtering on the hardware depth comparison.
float sunVisibility(vec3 n) {
  vec3 p = vLightPosition.xyz / vLightPosition.w * 0.5 + 0.5;
  if (p.x <= 0.0 || p.x >= 1.0 || p.y <= 0.0 || p.y >= 1.0 || p.z >= 1.0) return 1.0;
  float bias = 0.0006 + 0.0018 * (1.0 - max(dot(n, uSunDirection), 0.0));
  float sum = 0.0;
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      sum += texture(uShadowMap, vec3(p.xy + vec2(x, y) * uShadowTexel, p.z - bias));
    }
  }
  return sum / 9.0;
}

void main() {
  vec3 base = uColor;
  float height = 0.0;
  if (uUseTexture) {
    vec4 texel = texture(uTexture, vUv * uUvScale);
    if (uAlphaTest && texel.a < 0.5) discard;
    base *= texel.rgb;
    height = luminance(texel.rgb) * uBump;
  }

  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  if (uUseTexture && uBump > 0.0) n = bumpNormal(n, vWorldPosition, height);
  vec3 toCamera = normalize(uCameraPosition - vWorldPosition);

  vec3 ambient = mix(uGroundColor, uSkyColor, n.y * 0.5 + 0.5);
  float sunDiffuse = max(dot(n, uSunDirection), 0.0);
  float visibility = uShadows && sunDiffuse > 0.0 ? sunVisibility(n) : 1.0;
  vec3 halfway = normalize(uSunDirection + toCamera);
  float sunSpecular = sunDiffuse > 0.0 ? pow(max(dot(n, halfway), 0.0), uShininess) : 0.0;
  vec3 diffuse = uSunColor * sunDiffuse * visibility;
  vec3 specular = uSunColor * sunSpecular * uSpecular * visibility;

  for (int i = 0; i < ${MAX_POINT_LIGHTS}; i++) {
    if (i >= uPointCount) break;
    vec3 toLight = uPointPosition[i] - vWorldPosition;
    float distance = length(toLight);
    toLight /= distance;
    float falloff = clamp(1.0 - distance / uPointRange[i], 0.0, 1.0);
    falloff *= falloff;
    float lambert = max(dot(n, toLight), 0.0);
    diffuse += uPointColor[i] * lambert * falloff;
    if (lambert > 0.0) {
      specular += uPointColor[i] * uSpecular * falloff * pow(max(dot(n, normalize(toLight + toCamera)), 0.0), uShininess);
    }
  }

  vec3 color = base * (ambient + diffuse) + specular;

  if (uReflect > 0.0) {
    float fresnel = pow(1.0 - max(dot(n, toCamera), 0.0), 3.0);
    vec3 r = reflect(-toCamera, n);
    vec3 skyReflection = mix(uSkyHorizon, uSkyZenith, clamp(r.y, 0.0, 1.0));
    color = mix(color, skyReflection, uReflect * (0.2 + 0.8 * fresnel));
  }

  // Masked glow lights only the dark (glass) parts of a texture, not the window frames.
  float glowMask = uEmissiveMask && uUseTexture ? pow(1.0 - luminance(base / max(uColor, vec3(0.001))), 2.0) : 1.0;
  color += uEmissive * glowMask;

  float fog = smoothstep(uFogRange.x, uFogRange.y, length(uCameraPosition - vWorldPosition));
  outColor = vec4(mix(color, uFogColor, fog), 1.0);
}`;

const SHADOW_VS = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 2) in vec2 aUv;
uniform mat4 uLightSpace;
uniform mat4 uModel;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = uLightSpace * uModel * vec4(aPosition, 1.0);
}`;

// Only alpha-tested materials (sign letters) need the fragment stage; everything else
// just writes depth.
const SHADOW_FS = `#version 300 es
precision mediump float;
in vec2 vUv;
uniform bool uAlphaTest;
uniform sampler2D uTexture;
uniform vec2 uUvScale;
void main() {
  if (uAlphaTest && texture(uTexture, vUv * uUvScale).a < 0.5) discard;
}`;

const SKY_VS = `#version 300 es
out vec2 vClip;
void main() {
  // One triangle that covers the whole screen.
  vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vClip = corner * 2.0 - 1.0;
  gl_Position = vec4(vClip, 1.0, 1.0);
}`;

const SKY_FS = `#version 300 es
precision highp float;
in vec2 vClip;
uniform mat4 uInverseViewProjection;
uniform vec3 uCameraPosition;
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;
uniform vec3 uSunDirection;
uniform vec3 uSunDiscColor;
uniform float uStars;
out vec4 outColor;

float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }

void main() {
  vec4 far = uInverseViewProjection * vec4(vClip, 1.0, 1.0);
  vec3 direction = normalize(far.xyz / far.w - uCameraPosition);
  float up = clamp(direction.y, 0.0, 1.0);
  vec3 color = mix(uSkyHorizon, uSkyZenith, pow(up, 0.55));
  float sun = max(dot(direction, uSunDirection), 0.0);
  color += uSunDiscColor * (smoothstep(0.99975, 0.9999, sun) * 4.0 + pow(sun, 256.0) * 0.5);
  vec3 cell = floor(direction * 260.0);
  color += vec3(step(0.9975, hash(cell)) * uStars * smoothstep(0.05, 0.3, direction.y));
  outColor = vec4(color, 1.0);
}`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

// Links a program and looks up every active uniform by name (array uniforms by their
// base name, e.g. "uPointColor").
function createProgram(gl, vertexSource, fragmentSource) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`);
  }
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i += 1) {
    const name = gl.getActiveUniform(program, i).name.replace(/\[0\]$/, '');
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, uniforms };
}

export function createRenderer(canvas, { shadowCenter = [0, 0, 0], shadowRadius = 50 } = {}) {
  const gl = canvas.getContext('webgl2', { antialias: true });
  if (!gl) throw new Error('WebGL2 is not available in this browser.');

  const lit = createProgram(gl, LIT_VS, LIT_FS);
  const shadow = createProgram(gl, SHADOW_VS, SHADOW_FS);
  const sky = createProgram(gl, SKY_VS, SKY_FS);
  const skyVao = gl.createVertexArray();
  const anisotropy = gl.getExtension('EXT_texture_filter_anisotropic');

  // Depth texture the sun renders into; sampled with hardware depth comparison.
  const shadowMap = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, shadowMap);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, SHADOW_SIZE, SHADOW_SIZE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
  const shadowFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowMap, 0);
  gl.drawBuffers([gl.NONE]);
  gl.readBuffer(gl.NONE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  // Unbind so the depth texture never sits on unit 0, where colour textures are sampled.
  gl.bindTexture(gl.TEXTURE_2D, null);

  const meshes = new Map();
  const textures = new Map();

  function uploadGeometry(geometry) {
    let entry = meshes.get(geometry);
    if (entry) return entry;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffers = [];
    [[geometry.positions, 3], [geometry.normals, 3], [geometry.uvs, 2]].forEach(([data, size], location) => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
      buffers.push(buffer);
    });
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
    buffers.push(indexBuffer);
    gl.bindVertexArray(null);
    entry = { vao, buffers, count: geometry.indices.length };
    meshes.set(geometry, entry);
    return entry;
  }

  // Colour textures always live on unit 0; unit 1 is reserved for the shadow map.
  function uploadImage(texture, image) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (anisotropy) {
      const max = gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
    }
  }

  // material.texture is either an image URL or a canvas. URL textures show a white
  // placeholder texel until the image finishes loading.
  function getTexture(material) {
    const source = material.texture;
    let texture = textures.get(source);
    if (texture) return texture;
    texture = gl.createTexture();
    textures.set(source, texture);
    if (typeof source === 'string') {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
      const image = new Image();
      image.onload = () => uploadImage(texture, image);
      image.onerror = () => console.error(`Failed to load texture ${source}`);
      image.src = source;
    } else {
      uploadImage(texture, source);
    }
    return texture;
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    return width / height;
  }

  // The sun "camera": an orthographic box around the scene, looking along the light.
  function lightSpaceMatrix(sunDirection) {
    const eye = shadowCenter.map((c, i) => c + sunDirection[i] * shadowRadius * 2);
    const up = Math.abs(sunDirection[1]) > 0.98 ? [0, 0, 1] : [0, 1, 0];
    const view = lookAt(eye, shadowCenter, up);
    const projection = ortho(-shadowRadius, shadowRadius, -shadowRadius, shadowRadius, 1, shadowRadius * 4);
    return multiply(projection, view);
  }

  function setTexture(uniforms, material, useTexture) {
    gl.uniform1i(uniforms.uUseTexture, useTexture ? 1 : 0);
    gl.uniform1i(uniforms.uAlphaTest, material.alphaTest ? 1 : 0);
    if (useTexture) {
      const [tileU, tileV] = material.tileSize ?? [1, 1];
      gl.uniform2f(uniforms.uUvScale, 1 / tileU, 1 / tileV);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, getTexture(material));
    }
  }

  // Flattens the hierarchy once per frame: every mesh with its world matrix.
  function collect(root) {
    const items = [];
    traverse(root, identity(), (node, world) => {
      if (node.mesh) items.push({ mesh: node.mesh, world });
    });
    return items;
  }

  function renderShadowPass(items, lightSpace) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
    gl.viewport(0, 0, SHADOW_SIZE, SHADOW_SIZE);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(2, 4);
    const { program, uniforms } = shadow;
    gl.useProgram(program);
    gl.uniformMatrix4fv(uniforms.uLightSpace, false, lightSpace);
    gl.uniform1i(uniforms.uTexture, 0);
    for (const { mesh, world } of items) {
      if (mesh.material.castShadow === false) continue;
      setTexture(uniforms, mesh.material, Boolean(mesh.material.alphaTest && mesh.material.texture));
      gl.uniformMatrix4fv(uniforms.uModel, false, world);
      const buffers = uploadGeometry(mesh.geometry);
      gl.bindVertexArray(buffers.vao);
      gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function renderSky(camera, environment) {
    const { program, uniforms } = sky;
    gl.useProgram(program);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.uniformMatrix4fv(uniforms.uInverseViewProjection, false, invert(multiply(camera.projection, camera.view)));
    gl.uniform3fv(uniforms.uCameraPosition, camera.cameraPosition);
    gl.uniform3fv(uniforms.uSkyZenith, environment.skyZenith);
    gl.uniform3fv(uniforms.uSkyHorizon, environment.skyHorizon);
    gl.uniform3fv(uniforms.uSunDirection, environment.sunDiscDirection);
    gl.uniform3fv(uniforms.uSunDiscColor, environment.sunDiscColor);
    gl.uniform1f(uniforms.uStars, environment.stars);
    gl.bindVertexArray(skyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
  }

  // camera: { projection, view, cameraPosition }
  // environment: sun, sky, fog and point lights for this frame (see world/dayNight.js)
  // options: { shadows, textures }
  function render(root, camera, environment, options) {
    const items = collect(root);
    const lightSpace = lightSpaceMatrix(environment.sunDirection);
    const shadows = options.shadows && environment.castShadows;
    if (shadows) renderShadowPass(items, lightSpace);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    renderSky(camera, environment);

    const { program, uniforms: u } = lit;
    gl.useProgram(program);
    gl.enable(gl.CULL_FACE);
    gl.uniformMatrix4fv(u.uProjection, false, camera.projection);
    gl.uniformMatrix4fv(u.uView, false, camera.view);
    gl.uniformMatrix4fv(u.uLightSpace, false, lightSpace);
    gl.uniform3fv(u.uCameraPosition, camera.cameraPosition);
    gl.uniform3fv(u.uSunDirection, environment.sunDirection);
    gl.uniform3fv(u.uSunColor, environment.sunColor);
    gl.uniform3fv(u.uSkyColor, environment.skyColor);
    gl.uniform3fv(u.uGroundColor, environment.groundColor);
    gl.uniform3fv(u.uSkyZenith, environment.skyZenith);
    gl.uniform3fv(u.uSkyHorizon, environment.skyHorizon);
    gl.uniform3fv(u.uFogColor, environment.skyHorizon);
    gl.uniform2fv(u.uFogRange, environment.fogRange);
    gl.uniform1i(u.uShadows, shadows ? 1 : 0);
    gl.uniform1f(u.uShadowTexel, 1 / SHADOW_SIZE);
    gl.uniform1i(u.uTexture, 0);
    gl.uniform1i(u.uShadowMap, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowMap);

    const lights = environment.pointLights.slice(0, MAX_POINT_LIGHTS);
    gl.uniform1i(u.uPointCount, lights.length);
    if (lights.length) {
      gl.uniform3fv(u.uPointPosition, lights.flatMap((light) => light.position));
      gl.uniform3fv(u.uPointColor, lights.flatMap((light) => light.color));
      gl.uniform1fv(u.uPointRange, lights.map((light) => light.range));
    }

    for (const { mesh, world } of items) {
      const { geometry, material } = mesh;
      gl.uniformMatrix4fv(u.uModel, false, world);
      gl.uniformMatrix3fv(u.uNormalMatrix, false, normalMatrix(world));
      // With textures switched off, a textured material shows its average colour instead.
      const textured = Boolean(material.texture && (options.textures || material.alphaTest));
      gl.uniform3fv(u.uColor, textured || !material.flatColor ? material.color : material.flatColor);
      gl.uniform1f(u.uSpecular, material.specular ?? 0.04);
      gl.uniform1f(u.uShininess, material.shininess ?? 32);
      gl.uniform1f(u.uBump, material.bump ?? 0);
      gl.uniform1f(u.uReflect, material.reflect ?? 0);
      const glow = material.glow ?? 0;
      // glowAlways: constant; glowDay: only by day (window panes seen from inside); default: lamps at night.
      const level = material.glowAlways ? 1 : material.glowDay ? 1 - environment.lampLevel : environment.lampLevel;
      const emissive = material.emissive ?? [0, 0, 0];
      gl.uniform3f(u.uEmissive, emissive[0] * glow * level, emissive[1] * glow * level, emissive[2] * glow * level);
      gl.uniform1i(u.uEmissiveMask, material.emissiveMask ? 1 : 0);
      setTexture(u, material, textured);
      const buffers = uploadGeometry(geometry);
      gl.bindVertexArray(buffers.vao);
      gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0);
    }
    gl.bindVertexArray(null);
  }

  function dispose() {
    for (const { vao, buffers } of meshes.values()) {
      gl.deleteVertexArray(vao);
      buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    }
    for (const texture of textures.values()) gl.deleteTexture(texture);
    meshes.clear();
    textures.clear();
    gl.deleteTexture(shadowMap);
    gl.deleteFramebuffer(shadowFramebuffer);
    gl.deleteVertexArray(skyVao);
    [lit, shadow, sky].forEach(({ program }) => gl.deleteProgram(program));
  }

  return { gl, resize, render, dispose };
}
