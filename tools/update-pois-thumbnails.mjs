#!/usr/bin/env node
/**
 * Scan public/thumbnails/ for {poi-id}-{n}.webp files and update pois.json.
 *
 * Updates:
 *   content.thumbnail  → first image path
 *   content.thumbnails → sorted array of all matches
 *
 * Usage:
 *   node tools/update-pois-thumbnails.mjs            # apply changes
 *   node tools/update-pois-thumbnails.mjs --dry-run   # preview only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const THUMBS_DIR = path.join(ROOT, 'public', 'thumbnails');
const POIS_PATH = path.join(ROOT, 'src', 'data', 'pois.json');

const dryRun = process.argv.includes('--dry-run');

// Scan thumbnails directory for {id}-{n}.webp files
const files = fs.readdirSync(THUMBS_DIR).filter((f) => f.endsWith('.webp'));

// Group by POI ID: { "eee-roadmap": [1, 2, 3], ... }
const groups = new Map();
const pattern = /^(.+)-(\d+)\.webp$/;

for (const file of files) {
  const match = file.match(pattern);
  if (!match) continue;
  const [, id, numStr] = match;
  if (!groups.has(id)) groups.set(id, []);
  groups.get(id).push(parseInt(numStr, 10));
}

// Sort each group numerically
for (const [, nums] of groups) {
  nums.sort((a, b) => a - b);
}

// Read pois.json
const poisData = JSON.parse(fs.readFileSync(POIS_PATH, 'utf-8'));
const paintingIds = poisData.pois
  .filter((p) => p.type === 'painting')
  .map((p) => p.id);

console.log(`\n🖼  Thumbnail updater${dryRun ? ' (DRY RUN)' : ''}\n`);
console.log(`Found ${files.length} .webp files for ${groups.size} POI(s).\n`);

let updated = 0;

for (const poi of poisData.pois) {
  const nums = groups.get(poi.id);
  if (!nums || nums.length === 0) continue;

  const thumbPaths = nums.map((n) => `/thumbnails/${poi.id}-${n}.webp`);
  const firstThumb = thumbPaths[0];

  const oldThumb = poi.content.thumbnail;
  const oldThumbs = poi.content.thumbnails;

  const thumbChanged = oldThumb !== firstThumb;
  const thumbsChanged =
    !oldThumbs ||
    oldThumbs.length !== thumbPaths.length ||
    oldThumbs.some((t, i) => t !== thumbPaths[i]);

  if (thumbChanged || thumbsChanged) {
    console.log(`  ${poi.id}:`);
    if (thumbChanged) {
      console.log(`    thumbnail: ${oldThumb} → ${firstThumb}`);
    }
    if (thumbsChanged) {
      console.log(
        `    thumbnails: [${(oldThumbs || []).length} items] → [${thumbPaths.length} items]`
      );
      for (const tp of thumbPaths) {
        console.log(`      ${tp}`);
      }
    }

    if (!dryRun) {
      poi.content.thumbnail = firstThumb;
      poi.content.thumbnails = thumbPaths;
    }
    updated++;
  }
}

// Report paintings with no screenshots
const missing = paintingIds.filter((id) => !groups.has(id));
if (missing.length > 0) {
  console.log(`\n  No screenshots found for ${missing.length} painting(s):`);
  for (const id of missing) {
    console.log(`    - ${id}`);
  }
}

if (!dryRun && updated > 0) {
  fs.writeFileSync(POIS_PATH, JSON.stringify(poisData, null, 2) + '\n', 'utf-8');
  console.log(`\n✓ Updated ${updated} POI(s) in pois.json.`);
} else if (dryRun && updated > 0) {
  console.log(`\n(dry run) Would update ${updated} POI(s).`);
} else {
  console.log(`\nNo changes needed.`);
}
