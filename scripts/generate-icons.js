/**
 * generate-icons.js
 * Genera icon-192.png e icon-512.png para el manifest PWA de HORMI.
 * Sin dependencias externas — usa solo Node.js built-ins (zlib).
 *
 * Uso: node scripts/generate-icons.js
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// ── CRC32 (necesario para el formato PNG) ─────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * Crea un PNG RGBA sólido con fondo `bg` y una "H" blanca centrada.
 * @param {number} size
 * @param {{ r, g, b }} bg  Color de fondo
 */
function createPNG(size, bg) {
  const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: ancho, alto, bit depth 8, color type 6 (RGBA)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  // bytes 10-12 ya son 0 (compression, filter, interlace)

  // ── Dibujar píxeles ──────────────────────────────────────────────────────────
  // Cada scanline: 1 byte filtro (0=None) + size*4 bytes RGBA
  const raw = Buffer.alloc(size * (1 + size * 4));

  // Parámetros de la "H" blanca centrada
  const strokeW = Math.max(2, Math.round(size * 0.08)); // grosor de trazo
  const letterH = Math.round(size * 0.55);
  const letterW = Math.round(size * 0.45);
  const startX = Math.round((size - letterW) / 2);
  const startY = Math.round((size - letterH) / 2);
  const midY = startY + Math.round(letterH / 2) - Math.round(strokeW / 2);
  const endX = startX + letterW - strokeW;
  const endY = startY + letterH;

  function isLetter(x, y) {
    // Pata izquierda
    if (x >= startX && x < startX + strokeW && y >= startY && y < endY) return true;
    // Pata derecha
    if (x >= endX && x < endX + strokeW && y >= startY && y < endY) return true;
    // Travesaño
    if (x >= startX && x < endX + strokeW && y >= midY && y < midY + strokeW) return true;
    return false;
  }

  // Radio de esquinas redondeadas del fondo (~18 % del tamaño, estilo iOS)
  const radius = Math.round(size * 0.18);

  function inRoundedRect(x, y) {
    // Verificar si el punto está dentro del cuadrado redondeado
    const cx = Math.min(Math.max(x, radius), size - 1 - radius);
    const cy = Math.min(Math.max(y, radius), size - 1 - radius);
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  for (let y = 0; y < size; y++) {
    const rowOffset = y * (1 + size * 4);
    raw[rowOffset] = 0; // filtro None

    for (let x = 0; x < size; x++) {
      const off = rowOffset + 1 + x * 4;
      const inside = inRoundedRect(x, y);

      if (!inside) {
        // Transparente (fuera del rounded rect)
        raw[off] = 0;
        raw[off + 1] = 0;
        raw[off + 2] = 0;
        raw[off + 3] = 0;
      } else if (isLetter(x, y)) {
        // Blanco
        raw[off] = 255;
        raw[off + 1] = 255;
        raw[off + 2] = 255;
        raw[off + 3] = 255;
      } else {
        // Fondo violeta
        raw[off] = bg.r;
        raw[off + 1] = bg.g;
        raw[off + 2] = bg.b;
        raw[off + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    PNG_SIGNATURE,
    chunk("IHDR", ihdrData),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const VIOLET = { r: 0x7f, g: 0x77, b: 0xdd }; // #7F77DD
const outDir = path.join(__dirname, "..", "frontend", "public", "icons");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const outPath = path.join(outDir, `icon-${size}.png`);
  const png = createPNG(size, VIOLET);
  fs.writeFileSync(outPath, png);
  console.log(`✓ ${outPath}  (${png.length} bytes)`);
}

console.log("Done. Update manifest.json to use .png icons.");
