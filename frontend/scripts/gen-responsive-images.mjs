// scripts/gen-responsive-images.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = path.resolve('src/assets/illustrations/iot');
const VALID_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];
// preferimos estas fuentes, en este orden:
const EXT_PREFERENCE = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];

const SIZES = [
  { suffix: 'mobile',  width: 1280 },
  { suffix: 'desktop', width: 2400 },
];

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function isVariant(name) {
  return name.endsWith('-mobile') || name.endsWith('-desktop');
}

function isValid(file) {
  const { name, ext } = path.parse(file);
  return VALID_EXTS.includes(ext.toLowerCase()) && !isVariant(name);
}

async function collectSources() {
  // agrupa por "basename" sin extensión y elige mejor candidato por preferencia
  const map = new Map(); // key: dir/name, value: { file, prefIdx }
  for await (const file of walk(SRC_DIR)) {
    if (!isValid(file)) continue;
    const { dir, name, ext } = path.parse(file);
    const key = path.join(dir, name);
    const prefIdx = EXT_PREFERENCE.indexOf(ext.toLowerCase());
    const current = map.get(key);
    if (!current || prefIdx < current.prefIdx) {
      map.set(key, { file, prefIdx });
    }
  }
  return [...map.values()].map(v => v.file);
}

async function outputsFor(src) {
  const parsed = path.parse(src);
  const outs = [];
  for (const { suffix } of SIZES) {
    outs.push(path.join(parsed.dir, `${parsed.name}-${suffix}.webp`));
    outs.push(path.join(parsed.dir, `${parsed.name}-${suffix}.png`));
  }
  return outs;
}

async function isUpToDate(src, outs) {
  try {
    const srcStat = await fs.stat(src);
    for (const o of outs) {
      try {
        const st = await fs.stat(o);
        // si algún output es más viejo que el src -> hay que regenerar
        if (st.mtimeMs < srcStat.mtimeMs) return false;
      } catch {
        // si falta algún output -> hay que regenerar
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

async function processOne(file) {
  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch {
    console.warn('⚠️  No pude leer metadata:', file);
    return;
  }

  const outs = await outputsFor(file);
  if (await isUpToDate(file, outs)) {
    // nada que hacer
    return;
  }

  for (const { suffix, width } of SIZES) {
    const targetWidth = Math.min(width, meta.width || width);
    const { dir, name } = path.parse(file);
    const base = path.join(dir, `${name}-${suffix}`);

    // WEBP
    await sharp(file)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(`${base}.webp`);

    // PNG fallback
    await sharp(file)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toFile(`${base}.png`);

    console.log('✅', path.relative(process.cwd(), `${base}.webp`));
  }
}

async function main() {
  try {
    const sources = await collectSources();
    let count = 0;
    for (const src of sources) {
      await processOne(src);
      count++;
    }
    console.log(`\n🎉 Listo: procesadas ${count} imágenes base (deduplicadas) en ${SRC_DIR}`);
  } catch (e) {
    console.error('❌ Error generando imágenes:', e);
    process.exitCode = 1;
  }
}

main();
