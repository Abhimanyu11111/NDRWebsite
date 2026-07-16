import crypto from "crypto";
import zlib from "zlib";

const WIDTH = 160;
const HEIGHT = 50;

const GLYPHS = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  a: ["00000", "01110", "00001", "01111", "10001", "10011", "01101"],
  b: ["10000", "10000", "10110", "11001", "10001", "10001", "11110"],
  c: ["00000", "01111", "10000", "10000", "10000", "10000", "01111"],
  d: ["00001", "00001", "01101", "10011", "10001", "10001", "01111"],
  e: ["00000", "01110", "10001", "11111", "10000", "10000", "01111"],
  f: ["00110", "01001", "01000", "11100", "01000", "01000", "01000"],
  g: ["00000", "01111", "10001", "10001", "01111", "00001", "11110"],
  h: ["10000", "10000", "10110", "11001", "10001", "10001", "10001"],
  j: ["00010", "00000", "00110", "00010", "00010", "10010", "01100"],
  k: ["10000", "10010", "10100", "11000", "10100", "10010", "10001"],
  m: ["00000", "11010", "10101", "10101", "10101", "10101", "10101"],
  n: ["00000", "10110", "11001", "10001", "10001", "10001", "10001"],
  p: ["00000", "11110", "10001", "10001", "11110", "10000", "10000"],
  q: ["00000", "01111", "10001", "10001", "01111", "00001", "00001"],
  r: ["00000", "10111", "11000", "10000", "10000", "10000", "10000"],
  s: ["00000", "01111", "10000", "01110", "00001", "00001", "11110"],
  t: ["01000", "01000", "11100", "01000", "01000", "01001", "00110"],
  u: ["00000", "10001", "10001", "10001", "10001", "10011", "01101"],
  v: ["00000", "10001", "10001", "10001", "10001", "01010", "00100"],
  w: ["00000", "10001", "10001", "10101", "10101", "10101", "01010"],
  x: ["00000", "10001", "01010", "00100", "01010", "10001", "10001"],
  y: ["00000", "10001", "10001", "10001", "01111", "00001", "11110"],
  z: ["00000", "11111", "00010", "00100", "01000", "10000", "11111"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  "@": ["01110", "10001", "10111", "10101", "10111", "10000", "01110"],
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
  "$": ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "%": ["11001", "11010", "00100", "01000", "10110", "00110", "00000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
};

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const pngChunk = (type, data = Buffer.alloc(0)) => {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
};

const random = (min, max) => crypto.randomInt(min, max + 1);

const setPixel = (pixels, x, y, color) => {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || px >= WIDTH || py < 0 || py >= HEIGHT) return;
  const offset = (py * WIDTH + px) * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = 255;
};

const drawLine = (pixels, x0, y0, x1, y1, color) => {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let step = 0; step <= steps; step += 1) {
    const ratio = steps ? step / steps : 0;
    setPixel(pixels, x0 + (x1 - x0) * ratio, y0 + (y1 - y0) * ratio, color);
  }
};

const drawGlyph = (pixels, char, centerX) => {
  const glyph = GLYPHS[char];
  const scale = 3;
  const glyphWidth = 5 * scale;
  const glyphHeight = 7 * scale;
  const originX = centerX - glyphWidth / 2 + random(-2, 2);
  const originY = (HEIGHT - glyphHeight) / 2 + random(-4, 4);
  const angle = (random(-14, 14) * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const color = [[15, 23, 42], [30, 64, 175], [88, 28, 135], [120, 35, 35]][random(0, 3)];

  glyph.forEach((row, rowIndex) => {
    [...row].forEach((enabled, columnIndex) => {
      if (enabled !== "1") return;
      for (let dx = 0; dx < scale; dx += 1) {
        for (let dy = 0; dy < scale; dy += 1) {
          const localX = columnIndex * scale + dx - glyphWidth / 2;
          const localY = rowIndex * scale + dy - glyphHeight / 2;
          const x = centerX + localX * cos - localY * sin;
          const y = originY + glyphHeight / 2 + localX * sin + localY * cos;
          setPixel(pixels, x, y, color);
        }
      }
    });
  });
};

export const createCaptchaPng = (code) => {
  const pixels = Buffer.alloc(WIDTH * HEIGHT * 4);

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const shade = 242 + ((x + y) % 9);
      setPixel(pixels, x, y, [shade, Math.min(255, shade + 2), 255]);
    }
  }

  for (let index = 0; index < 6; index += 1) {
    drawLine(
      pixels,
      random(0, 30),
      random(3, HEIGHT - 4),
      random(WIDTH - 35, WIDTH - 1),
      random(3, HEIGHT - 4),
      [[148, 163, 184], [186, 156, 196], [125, 170, 190]][index % 3],
    );
  }

  for (let index = 0; index < 110; index += 1) {
    setPixel(pixels, random(0, WIDTH - 1), random(0, HEIGHT - 1), [random(100, 205), random(120, 210), random(145, 220)]);
  }

  [...code].forEach((char, index) => drawGlyph(pixels, char, 17 + index * 25));

  for (let x = 0; x < WIDTH; x += 1) {
    const y = 25 + Math.sin(x / 10) * 7;
    setPixel(pixels, x, y, [100, 116, 139]);
  }

  const raw = Buffer.alloc((WIDTH * 4 + 1) * HEIGHT);
  for (let row = 0; row < HEIGHT; row += 1) {
    const outputOffset = row * (WIDTH * 4 + 1);
    raw[outputOffset] = 0;
    pixels.copy(raw, outputOffset + 1, row * WIDTH * 4, (row + 1) * WIDTH * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header[8] = 8;
  header[9] = 6;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND"),
  ]);

  return `data:image/png;base64,${png.toString("base64")}`;
};
