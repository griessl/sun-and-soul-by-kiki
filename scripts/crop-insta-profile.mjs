#!/usr/bin/env node
// Crops Kiki's portraits into 1:1 squares for Instagram profile picture.
// Output: public/images/insta-profile-{hero,ocean}.jpg @ 1080x1080
//
// Run: node scripts/crop-insta-profile.mjs

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicImages = join(__dirname, '..', 'public', 'images');

// kiki-hero.jpg (1086×724): Kopf/Schulter zentriert, mit Canyon-Hintergrund.
// Kiki's face ist im Original ungefähr bei x=620, y=270.
await sharp(join(publicImages, 'kiki-hero.jpg'))
  .extract({ left: 370, top: 30, width: 500, height: 500 })
  .resize(1080, 1080)
  .jpeg({ quality: 90 })
  .toFile(join(publicImages, 'insta-profile-hero.jpg'));

// kiki-ocean.jpg (1200×800): Kopf/Schulter mit Ozean-Hintergrund.
// Kiki's face ist im Original ungefähr bei x=730, y=230.
await sharp(join(publicImages, 'kiki-ocean.jpg'))
  .extract({ left: 480, top: 0, width: 500, height: 500 })
  .resize(1080, 1080)
  .jpeg({ quality: 90 })
  .toFile(join(publicImages, 'insta-profile-ocean.jpg'));

console.log('✓ Profile-Crops erstellt:');
console.log('  public/images/insta-profile-hero.jpg');
console.log('  public/images/insta-profile-ocean.jpg');
