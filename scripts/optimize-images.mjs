/**
 * Image Optimization Script
 * Converts uploaded JPG/PNG images to WebP format
 * Runs automatically before builds
 */
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const IMAGES_DIR = 'public/images';
const MAX_WIDTH = 1400;
const QUALITY = 80;

async function optimizeImages() {
  const files = await readdir(IMAGES_DIR);
  let converted = 0;

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const inputPath = join(IMAGES_DIR, file);
    const outputName = basename(file, ext) + '.webp';
    const outputPath = join(IMAGES_DIR, outputName);

    // Skip if webp already exists and is newer
    try {
      const inputStat = await stat(inputPath);
      const outputStat = await stat(outputPath);
      if (outputStat.mtimeMs >= inputStat.mtimeMs) continue;
    } catch { /* webp doesn't exist yet */ }

    await sharp(inputPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    converted++;
    console.log(`  ✓ ${file} → ${outputName}`);
  }

  if (converted > 0) {
    console.log(`\n  ${converted} Bild(er) optimiert.`);
  } else {
    console.log('  Alle Bilder sind aktuell.');
  }
}

console.log('Bilder optimieren...');
optimizeImages().catch(console.error);
