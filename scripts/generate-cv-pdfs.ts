/**
 * Generate CV PDFs from themed views using Playwright.
 *
 * Usage:
 *   pnpm tsx scripts/generate-cv-pdfs.ts          # auto-builds + starts server
 *   CV_BASE_URL=http://localhost:3000 pnpm tsx scripts/generate-cv-pdfs.ts  # use running server
 *   make cv:pdf
 *
 * Output: public/cv/{theme}/resume_reebal_sami.pdf
 */

import { chromium } from "@playwright/test";
import { execSync, spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PDF_FILENAME = "resume_reebal_sami.pdf";
const OUTPUT_DIR = path.resolve(process.cwd(), "public", "cv");
const PORT = 3099;

const themes = [
  { id: "portfolio-gallery", folder: "portfolio" },
  { id: "canva-elegant", folder: "elegant" },
  { id: "soulful", folder: "soulful" },
];

const HIDE_SITE_CHROME_CSS = `
  header, footer, .skip-link, nav,
  [class*="chat-widget"], [class*="ChatWidget"],
  [class*="cv-download-fab"], [class*="CvDownloadFab"],
  [class*="print:hidden"] {
    display: none !important;
  }
  main {
    padding: 0 !important;
    margin: 0 !important;
  }
  body {
    min-height: auto !important;
    background: oklch(0.985 0.001 90) !important;
  }
  .cv-print-mode, .cv-theme-wrapper {
    max-width: none !important;
  }
`;

async function waitForServer(url: string, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not ready
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function generatePdfs() {
  let baseUrl = process.env.CV_BASE_URL || "";
  let serverProcess: ChildProcess | null = null;

  if (!baseUrl) {
    console.log("🔨 Building...");
    execSync("pnpm build", { stdio: "inherit" });

    console.log("🚀 Starting production server on port", PORT, "...");
    serverProcess = spawn("pnpm", ["start", "-p", String(PORT)], {
      stdio: "pipe",
      detached: false,
    });

    baseUrl = `http://localhost:${PORT}`;
    await waitForServer(`${baseUrl}/en/cv`);
    console.log("✅ Server ready\n");
  }

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      colorScheme: "light",
      locale: "en-US",
    });

    for (const theme of themes) {
      const themeDir = path.join(OUTPUT_DIR, theme.folder);
      fs.mkdirSync(themeDir, { recursive: true });

      const page = await context.newPage();
      const url = `${baseUrl}/en/cv?theme=${theme.id}&print=true`;

      console.log(`📄 Generating ${theme.folder}/${PDF_FILENAME}...`);

      await page.goto(url, { waitUntil: "networkidle" });
      await page.addStyleTag({ content: HIDE_SITE_CHROME_CSS });
      await page.waitForTimeout(1000);

      const outputPath = path.join(themeDir, PDF_FILENAME);

      await page.pdf({
        path: outputPath,
        format: "A4",
        margin: {
          top: "1.5cm",
          right: "1cm",
          bottom: "1.5cm",
          left: "1cm",
        },
        printBackground: true,
        preferCSSPageSize: false,
      });

      const size = fs.statSync(outputPath).size;
      console.log(`   ✅ ${theme.folder}/${PDF_FILENAME} (${(size / 1024).toFixed(0)} KB)`);

      await page.close();
    }

    await browser.close();
    console.log(`\n🎉 All ${themes.length} PDFs generated in ${OUTPUT_DIR}/`);
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

generatePdfs().catch((err) => {
  console.error("❌ PDF generation failed:", err);
  process.exit(1);
});
