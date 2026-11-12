import { cross, dot, normalize, subtract } from './mat4.js';

// Builds flat-shaded geometry from convex polygons. Each face gets its own normal and
// UVs measured in metres from the face's lower-left corner, so a material can tile a
// texture by real-world size.
function fromPolygons(polygons) {
  const all = polygons.flat();
  const center = all.reduce((sum, p) => [sum[0] + p[0], sum[1] + p[1], sum[2] + p[2]], [0, 0, 0])
    .map((value) => value / all.length);
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (const source of polygons) {
    const polygon = [...source];
    let normal = normalize(cross(subtract(polygon[1], polygon[0]), subtract(polygon[2], polygon[0])));
    const faceCenter = polygon.reduce((sum, p) => [sum[0] + p[0], sum[1] + p[1], sum[2] + p[2]], [0, 0, 0])
      .map((value) => value / polygon.length);
    if (dot(normal, subtract(faceCenter, center)) < 0) {
      polygon.reverse();
      normal = normal.map((value) => -value);
    }

    const uAxis = Math.abs(normal[1]) > 0.99 ? [1, 0, 0] : normalize(cross([0, 1, 0], normal));
    const vAxis = cross(normal, uAxis);
    const faceUvs = polygon.map((p) => [dot(p, uAxis), dot(p, vAxis)]);
    const minU = Math.min(...faceUvs.map((uv) => uv[0]));
    const minV = Math.min(...faceUvs.map((uv) => uv[1]));

    const base = positions.length / 3;
    polygon.forEach((p, i) => {
      positions.push(...p);
      normals.push(...normal);
      uvs.push(faceUvs[i][0] - minU, faceUvs[i][1] - minV);
    });
    for (let i = 1; i < polygon.length - 1; i += 1) indices.push(base, base + i, base + i + 1);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}

// Box centred on the origin.
export function box(width, height, depth) {
  const x = width / 2;
  const y = height / 2;
  const z = depth / 2;
  return fromPolygons([
    [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]],
    [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]],
    [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]],
    [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]],
    [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]],
    [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]],
  ]);
}

// Vertical cylinder with its base on y = 0.
export function cylinder(radiusBottom, radiusTop, height, segments = 10) {
  const ring = (radius, y) => Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2;
    return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  });
  const bottom = ring(radiusBottom, 0);
  const top = ring(radiusTop, height);
  const sides = bottom.map((p, i) => {
    const next = (i + 1) % segments;
    return [p, bottom[next], top[next], top[i]];
  });
  return fromPolygons([bottom, top, ...sides]);
}

// Convex polygon given as [x, z] points, extruded upwards from y = 0 to `height`.
export function extrudedPolygon(points, height) {
  const bottom = points.map(([x, z]) => [x, 0, z]);
  const top = points.map(([x, z]) => [x, height, z]);
  const sides = bottom.map((p, i) => {
    const next = (i + 1) % points.length;
    return [p, bottom[next], top[next], top[i]];
  });
  return fromPolygons([bottom, top, ...sides]);
}

// Low-poly sphere centred on the origin; flat shading gives a faceted foliage look.
export function sphere(radius, segments = 9, rings = 6) {
  const point = (ring, segment) => {
    const phi = (ring / rings) * Math.PI;
    const theta = (segment / segments) * Math.PI * 2;
    return [radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)];
  };
  const polygons = [];
  for (let r = 0; r < rings; r += 1) {
    for (let s = 0; s < segments; s += 1) {
      const a = point(r, s);
      const b = point(r, s + 1);
      const c = point(r + 1, s + 1);
      const d = point(r + 1, s);
      if (r === 0) polygons.push([a, c, d]);
      else if (r === rings - 1) polygons.push([a, b, d]);
      else polygons.push([a, b, c, d]);
    }
  }
  return fromPolygons(polygons);
}

// Convex profile given as [z, y] points, extruded along X and centred on x = 0.
export function profilePrism(profile, length) {
  const x = length / 2;
  const left = profile.map(([z, y]) => [-x, y, z]);
  const right = profile.map(([z, y]) => [x, y, z]);
  const sides = left.map((p, i) => {
    const next = (i + 1) % profile.length;
    return [p, left[next], right[next], right[i]];
  });
  return fromPolygons([left, right, ...sides]);
}

// Gable prism: triangular profile in the YZ plane (base on y = 0, apex at y = height),
// extruded along X and centred on x = 0, z = 0.
export function gablePrism(length, depth, height) {
  return profilePrism([[-depth / 2, 0], [depth / 2, 0], [0, height]], length);
}
