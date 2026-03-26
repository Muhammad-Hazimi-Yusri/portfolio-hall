#!/usr/bin/env node
/**
 * Extract video frames from YouTube for gallery painting thumbnails.
 * Requires: yt-dlp, ffmpeg (on system PATH)
 * Output: public/thumbnails/{id}-{suffix}.webp (quality 85, scaled to 1920x1080)
 *
 * Usage: node tools/capture-video-frames.mjs
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'thumbnails');
const TMP_DIR = path.join(ROOT, '.tmp-video-capture');

/** @type {Array<{id: string, url: string, timestamp: string, suffix: number}>} */
const frames = [
  // petbot
  { id: 'petbot', url: 'https://youtu.be/3umn0yt_FcE', timestamp: '00:03', suffix: 1 },
  { id: 'petbot', url: 'https://youtu.be/3umn0yt_FcE', timestamp: '00:15', suffix: 2 },
  { id: 'petbot', url: 'https://youtu.be/3umn0yt_FcE', timestamp: '00:30', suffix: 3 },

  // diy-stereo-camera — pipeline demo
  { id: 'diy-stereo-camera', url: 'https://youtu.be/AcH3xw2EPmc', timestamp: '00:05', suffix: 1 },
  { id: 'diy-stereo-camera', url: 'https://youtu.be/AcH3xw2EPmc', timestamp: '00:20', suffix: 2 },
  { id: 'diy-stereo-camera', url: 'https://youtu.be/AcH3xw2EPmc', timestamp: '00:45', suffix: 3 },

  // diy-stereo-camera — VR demo
  { id: 'diy-stereo-camera', url: 'https://youtu.be/MtZ8gLKz6AU', timestamp: '00:10', suffix: 4 },

  // avvr — demo video (skip setup at start, grab from middle)
  { id: 'avvr', url: 'https://youtu.be/145bKaLvuXg', timestamp: '01:30', suffix: 2 },
  { id: 'avvr', url: 'https://youtu.be/145bKaLvuXg', timestamp: '02:30', suffix: 3 },
];

/**
 * Find a command on the system. On Windows, winget-installed binaries may not
 * be on the Git Bash PATH, so we also check common winget package locations.
 * Returns the full path to the binary, or null if not found.
 */
function findBinary(cmd) {
  // Try PATH first
  try {
    execSync(`${cmd} --version`, { stdio: 'pipe' });
    return cmd;
  } catch { /* not on PATH */ }

  // On Windows, try where.exe
  if (process.platform === 'win32') {
    try {
      const result = execSync(`where.exe ${cmd}`, { stdio: 'pipe', encoding: 'utf-8' });
      const first = result.trim().split(/\r?\n/)[0];
      if (first) return `"${first}"`;
    } catch { /* not found */ }

    // Search winget package dirs for the binary
    const wingetBase = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
    if (fs.existsSync(wingetBase)) {
      const exe = `${cmd}.exe`;
      for (const pkg of fs.readdirSync(wingetBase)) {
        const pkgDir = path.join(wingetBase, pkg);
        const found = findFileRecursive(pkgDir, exe, 3);
        if (found) return `"${found}"`;
      }
    }
  }

  return null;
}

/** Recursively search for a filename up to maxDepth levels deep */
function findFileRecursive(dir, filename, maxDepth) {
  if (maxDepth <= 0) return null;
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.toLowerCase() === filename.toLowerCase()) {
        return path.join(dir, entry.name);
      }
      if (entry.isDirectory()) {
        const result = findFileRecursive(path.join(dir, entry.name), filename, maxDepth - 1);
        if (result) return result;
      }
    }
  } catch { /* permission errors, etc */ }
  return null;
}

function urlHash(url) {
  return crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  // Find binaries (handles winget installs not on Git Bash PATH)
  const YTDLP = findBinary('yt-dlp');
  const FFMPEG = findBinary('ffmpeg');

  const missing = [];
  if (!YTDLP) missing.push('yt-dlp');
  if (!FFMPEG) missing.push('ffmpeg');

  if (missing.length > 0) {
    console.error(`ERROR: Missing required tools: ${missing.join(', ')}`);
    console.log('');
    console.log('Install them:');
    console.log('  yt-dlp:  pip install yt-dlp   (or: winget install yt-dlp)');
    console.log('  ffmpeg:  winget install ffmpeg  (or: choco install ffmpeg)');
    console.log('');
    console.log('Skipping video frame capture.');
    process.exit(0);
  }

  console.log(`Using yt-dlp: ${YTDLP}`);
  console.log(`Using ffmpeg: ${FFMPEG}`);

  console.log(`\n🎬 Capturing ${frames.length} video frames...\n`);

  let success = 0;
  let failed = 0;

  // Track downloaded videos to avoid re-downloading
  const downloaded = new Set();

  for (const frame of frames) {
    const outFile = path.join(OUT_DIR, `${frame.id}-${frame.suffix}.webp`);
    const videoFile = path.join(TMP_DIR, `${frame.id}-${urlHash(frame.url)}.mp4`);
    const label = `[${frame.id}-${frame.suffix}] @ ${frame.timestamp}`;

    try {
      console.log(`  Capturing ${label}...`);

      // Download video if not already cached
      if (!downloaded.has(videoFile) && !fs.existsSync(videoFile)) {
        console.log(`    Downloading ${frame.url}...`);
        execSync(
          `${YTDLP} -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" --merge-output-format mp4 -o "${videoFile}" "${frame.url}"`,
          { stdio: 'pipe' }
        );
        downloaded.add(videoFile);
      }

      // Extract frame at timestamp, scale to 1920x1080 with padding
      execSync(
        `${FFMPEG} -y -ss ${frame.timestamp} -i "${videoFile}" -frames:v 1 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" -quality 85 "${outFile}"`,
        { stdio: 'pipe' }
      );

      console.log(`    ✓ Saved public/thumbnails/${frame.id}-${frame.suffix}.webp`);
      success++;
    } catch (err) {
      console.error(`    ✗ Failed: ${err.message.split('\n')[0]}`);
      failed++;
    }
  }

  // Clean up temp video files
  console.log('\nCleaning up temp files...');
  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  console.log(`\nDone! ${success} captured, ${failed} failed.`);

  console.log('\n=== Manual capture needed ===');
  console.log('The following projects need manual screenshots (no public video/web source):\n');
  console.log('  medical-emg:');
  console.log('    - Save as: public/thumbnails/medical-emg-1.webp');
  console.log('    - Save as: public/thumbnails/medical-emg-2.webp\n');
  console.log('  stormed:');
  console.log('    - Save as: public/thumbnails/stormed-1.webp');
  console.log('    - Save as: public/thumbnails/stormed-2.webp\n');
  console.log('  home-server:');
  console.log('    - Save as: public/thumbnails/home-server-1.webp');
  console.log('    - Save as: public/thumbnails/home-server-2.webp\n');
  console.log('After adding manual screenshots, run: node tools/update-pois-thumbnails.mjs');
}

main();
