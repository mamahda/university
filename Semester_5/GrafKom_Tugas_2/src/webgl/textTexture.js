// Draws signage text onto a transparent canvas for use as an alpha-tested texture.
export function createTextTexture(lines, { color, fontWeight = 800, align = 'center', width = 1024, height = 512 }) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const lineHeight = height / lines.length;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.font = `${fontWeight} ${Math.floor(lineHeight * 0.82)}px "Arial Narrow", Arial, sans-serif`;
  const x = align === 'right' ? width - 8 : align === 'left' ? 8 : width / 2;
  lines.forEach((line, i) => ctx.fillText(line, x, lineHeight * (i + 0.5), width - 16));
  return canvas;
}
