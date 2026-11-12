import { normalize } from '../webgl/mat4.js';

// Day–night cycle: turns a clock time (0–24 h) into everything the renderer needs for that
// moment: sun or moon direction and colour, ambient sky and ground colours, sky gradient,
// fog distance, and how strongly lamps and lit windows glow. The sun path is a stylised arc
// (rises at +X, sets at −X, leaning towards the front facade); it is not an astronomical
// calculation for Surabaya.

const mix = (a, b, t) => a.map((value, i) => value + (b[i] - value) * t);
const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const SKY = {
  day: { zenith: [0.33, 0.55, 0.85], horizon: [0.78, 0.86, 0.93], ambient: [0.55, 0.6, 0.68], ground: [0.36, 0.34, 0.31] },
  dusk: { zenith: [0.3, 0.34, 0.56], horizon: [0.98, 0.63, 0.4], ambient: [0.45, 0.4, 0.42], ground: [0.3, 0.25, 0.22] },
  night: { zenith: [0.015, 0.025, 0.07], horizon: [0.06, 0.08, 0.15], ambient: [0.08, 0.1, 0.17], ground: [0.04, 0.04, 0.05] },
};

// Direction towards a body on the arc; angle 0 = rising, π/2 = highest, π = setting.
function arcDirection(angle) {
  return normalize([Math.cos(angle), Math.sin(angle) * 0.9, 0.45]);
}

export function formatClock(hour) {
  const minutes = Math.round(hour * 60) % (24 * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function environmentAt(hour) {
  const dayAngle = ((hour - 6) / 12) * Math.PI;
  const elevation = Math.sin(dayAngle);
  const day = smoothstep(-0.12, 0.2, elevation);
  const dusk = Math.exp(-((elevation / 0.2) ** 2));
  const lampLevel = 1 - smoothstep(-0.08, 0.12, elevation);

  const sunDirection = arcDirection(dayAngle);
  const moonDirection = arcDirection(dayAngle - Math.PI);
  const sunUp = elevation > 0;
  const lightDirection = sunUp ? sunDirection : moonDirection;
  const sunColor = mix([1.0, 0.52, 0.28], [1.0, 0.95, 0.86], smoothstep(0.0, 0.5, elevation)).map((c) => c * 0.9 * smoothstep(0.0, 0.18, elevation));
  const moonColor = [0.32, 0.38, 0.55].map((c) => c * 0.32 * smoothstep(0.0, 0.18, -elevation));

  const blend = (key) => mix(mix(SKY.night[key], SKY.day[key], day), SKY.dusk[key], dusk * 0.8);

  return {
    hour,
    sunDirection: lightDirection,
    sunColor: sunUp ? sunColor : moonColor,
    castShadows: true,
    skyColor: blend('ambient'),
    groundColor: blend('ground'),
    skyZenith: blend('zenith'),
    skyHorizon: blend('horizon'),
    sunDiscDirection: lightDirection,
    sunDiscColor: sunUp ? mix([1.0, 0.6, 0.35], [1.0, 0.97, 0.9], smoothstep(0, 0.4, elevation)) : [0.55, 0.58, 0.65],
    stars: 1 - day,
    fogRange: [70 + 60 * day, 180 + 60 * day],
    lampLevel,
    pointLights: [],
  };
}
