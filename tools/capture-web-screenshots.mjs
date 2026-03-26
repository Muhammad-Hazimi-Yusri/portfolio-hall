#!/usr/bin/env node
/**
 * Capture web screenshots for gallery painting thumbnails.
 * Output: public/thumbnails/{id}-{suffix}.webp (quality 85)
 *
 * Usage: node tools/capture-web-screenshots.mjs
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'thumbnails');

/** @type {Array<{id: string, url: string, suffix: number, width: number, height: number, deviceScaleFactor?: number, scrollY: number, waitMs: number, description: string, beforeCapture?: (page: any) => Promise<void>}>} */
const captures = [
  // eee-roadmap
  { id: 'eee-roadmap', url: 'https://eee-roadmap.muhammadhazimiyusri.uk', suffix: 1, width: 1920, height: 1080, scrollY: 0, waitMs: 3000, description: 'Landing with graph' },
  { id: 'eee-roadmap', url: 'https://eee-roadmap.muhammadhazimiyusri.uk', suffix: 2, width: 1920, height: 1080, scrollY: 1200, waitMs: 2000, description: 'Scrolled content' },
  { id: 'eee-roadmap', url: 'https://eee-roadmap.muhammadhazimiyusri.uk', suffix: 3, width: 390, height: 844, deviceScaleFactor: 2, scrollY: 0, waitMs: 3000, description: 'Mobile view' },

  // food-wars — click "Continue as Guest" to see seeded data
  { id: 'food-wars', url: 'https://food-wars.muhammadhazimiyusri.uk', suffix: 1, width: 1920, height: 1080, scrollY: 0, waitMs: 3000, description: 'Main inventory with data', beforeCapture: async (page) => {
    // Click "Continue as Guest" button to dismiss auth modal and load seeded data
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      const clicked = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const guest = btns.find(b => b.textContent.includes('Continue as Guest'));
        if (guest) { guest.click(); return true; }
        return false;
      });
      if (clicked) {
        await new Promise(r => setTimeout(r, 3000)); // wait for data to load
      }
    } catch { /* modal may not appear */ }
  }},
  { id: 'food-wars', url: 'https://food-wars.muhammadhazimiyusri.uk', suffix: 2, width: 1920, height: 1080, scrollY: 800, waitMs: 2000, description: 'Scrolled with data', beforeCapture: async (page) => {
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      const clicked = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const guest = btns.find(b => b.textContent.includes('Continue as Guest'));
        if (guest) { guest.click(); return true; }
        return false;
      });
      if (clicked) {
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch { /* modal may not appear */ }
  }},
  { id: 'food-wars', url: 'https://food-wars.muhammadhazimiyusri.uk', suffix: 3, width: 390, height: 844, deviceScaleFactor: 2, scrollY: 0, waitMs: 3000, description: 'Mobile view with data', beforeCapture: async (page) => {
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      const clicked = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const guest = btns.find(b => b.textContent.includes('Continue as Guest'));
        if (guest) { guest.click(); return true; }
        return false;
      });
      if (clicked) {
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch { /* modal may not appear */ }
  }},

  // portfolio-hall — click "Projects" nav link for shot 2 (scroll doesn't work on full-viewport layout)
  { id: 'portfolio-hall', url: 'https://muhammad-hazimi-yusri.github.io/portfolio-hall/', suffix: 1, width: 1920, height: 1080, scrollY: 0, waitMs: 4000, description: 'Tour intro' },
  { id: 'portfolio-hall', url: 'https://muhammad-hazimi-yusri.github.io/portfolio-hall/', suffix: 2, width: 1920, height: 1080, scrollY: 0, waitMs: 4000, description: 'Projects section', beforeCapture: async (page) => {
    try {
      const clicked = await page.evaluate(() => {
        const links = [...document.querySelectorAll('a, button, [role="tab"], nav a, nav button')];
        const proj = links.find(el => el.textContent.trim() === 'Projects');
        if (proj) { proj.click(); return true; }
        return false;
      });
      if (clicked) {
        await new Promise(r => setTimeout(r, 2000)); // wait for navigation/animation
      }
    } catch { /* ignore */ }
  }},
  { id: 'portfolio-hall', url: 'https://muhammad-hazimi-yusri.github.io/portfolio-hall/#explore', suffix: 3, width: 1920, height: 1080, scrollY: 0, waitMs: 5000, description: 'Free-roam 3D' },

  // avvr
  { id: 'avvr', url: 'https://chronohaxx.itch.io/avvr', suffix: 1, width: 1920, height: 1080, scrollY: 0, waitMs: 3000, description: 'Itch.io page' },

  // claude-refresher-orb
  { id: 'claude-refresher-orb', url: 'https://github.com/Muhammad-Hazimi-Yusri/claude-refresher-orb', suffix: 1, width: 1920, height: 1080, scrollY: 300, waitMs: 3000, description: 'GitHub README' },

  // medical-emg — from portfolio page
  { id: 'medical-emg', url: 'https://muhammadhazimiyusri.uk/projects/medical-emg-control-system', suffix: 1, width: 1920, height: 1080, scrollY: 0, waitMs: 3000, description: 'Portfolio page' },
  { id: 'medical-emg', url: 'https://muhammadhazimiyusri.uk/projects/medical-emg-control-system', suffix: 2, width: 1920, height: 1080, scrollY: 600, waitMs: 2000, description: 'Scrolled' },

  // interface-circuit — from portfolio page
  { id: 'interface-circuit', url: 'https://muhammadhazimiyusri.uk/projects/interface-circuit-accelerometer', suffix: 1, width: 1920, height: 1080, scrollY: 0, waitMs: 3000, description: 'Portfolio page' },
  { id: 'interface-circuit', url: 'https://muhammadhazimiyusri.uk/projects/interface-circuit-accelerometer', suffix: 2, width: 1920, height: 1080, scrollY: 600, waitMs: 2000, description: 'Scrolled' },

  // New projects — from portfolio pages
  { id: 'fpv-drone', url: 'https://muhammadhazimiyusri.uk/projects/fpv-drone-project', suffix: 1, width: 1920, height: 1080, scrollY: 0, waitMs: 3000, description: 'Portfolio page' },
  { id: 'fpv-drone', url: 'https://muhammadhazimiyusri.uk/projects/fpv-drone-project', suffix: 2, width: 1920, height: 1080, scrollY: 600, waitMs: 2000, description: 'Scrolled' },

  { id: 'slimevr', url: 'https://muhammadhazimiyusri.uk/projects/slimevr-full-body-tracking', suffix: 1, width: 1920, height: 1080, scrollY: 0, waitMs: 3000, description: 'Portfolio page' },
  { id: 'slimevr', url: 'https://muhammadhazimiyusri.uk/projects/slimevr-full-body-tracking', suffix: 2, width: 1920, height: 1080, scrollY: 600, waitMs: 2000, description: 'Scrolled' },

  { id: 'smart-home', url: 'https://muhammadhazimiyusri.uk/projects/smart-home-system', suffix: 1, width: 1920, height: 1080, scrollY: 0, waitMs: 3000, description: 'Portfolio page' },
  { id: 'smart-home', url: 'https://muhammadhazimiyusri.uk/projects/smart-home-system', suffix: 2, width: 1920, height: 1080, scrollY: 600, waitMs: 2000, description: 'Scrolled' },
];

// Common cookie/consent banner selectors to try removing
const BANNER_SELECTORS = [
  '[class*="cookie"]',
  '[class*="consent"]',
  '[id*="cookie"]',
  '[id*="consent"]',
  '[class*="Cookie"]',
  '[class*="Consent"]',
  '[class*="gdpr"]',
  '[class*="GDPR"]',
  '.cc-banner',
  '.cc-window',
  '#onetrust-consent-sdk',
  '.cky-consent-container',
];

async function dismissBanners(page) {
  try {
    await page.evaluate((selectors) => {
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      }
    }, BANNER_SELECTORS);
  } catch {
    // Ignore — banners may not exist
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`\n📸 Capturing ${captures.length} web screenshots...\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let success = 0;
  let failed = 0;

  for (const cap of captures) {
    const outFile = path.join(OUT_DIR, `${cap.id}-${cap.suffix}.webp`);
    const label = `[${cap.id}-${cap.suffix}] ${cap.description}`;

    try {
      console.log(`  Capturing ${label}...`);

      const page = await browser.newPage();
      await page.setViewport({
        width: cap.width,
        height: cap.height,
        deviceScaleFactor: cap.deviceScaleFactor || 1,
      });

      await page.goto(cap.url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for content to settle
      await new Promise((r) => setTimeout(r, cap.waitMs));

      // Run pre-capture hook (e.g. dismiss auth modals, click buttons)
      if (cap.beforeCapture) {
        await cap.beforeCapture(page);
      }

      // Try to dismiss cookie banners
      await dismissBanners(page);

      // Scroll if needed
      if (cap.scrollY > 0) {
        await page.evaluate((y) => window.scrollTo(0, y), cap.scrollY);
        await new Promise((r) => setTimeout(r, 500));
      }

      await page.screenshot({
        path: outFile,
        type: 'webp',
        quality: 85,
      });

      await page.close();
      console.log(`    ✓ Saved ${path.relative(ROOT, outFile)}`);
      success++;
    } catch (err) {
      console.error(`    ✗ Failed: ${err.message}`);
      failed++;
    }
  }

  await browser.close();

  console.log(`\nDone! ${success} captured, ${failed} failed.`);
  if (failed > 0) {
    console.log('Failed captures can be retried by running the script again.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
