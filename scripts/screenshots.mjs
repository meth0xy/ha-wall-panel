/**
 * Renders demo mode into docs/screenshots/ at the Sony Xperia XZ's viewport (640x360 CSS
 * pixels at 3x). The clock is fixed, so a rerun only changes the images when the UI changes.
 * Files are served from a fake origin and config.js is never served, so a private setup
 * cannot leak into a screenshot.
 */
import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);
const OUT = new URL("docs/screenshots/", ROOT);
const ORIGIN = "http://panel.test";
const NOW = new Date("2026-11-10T11:50:00Z");
const FILES = { "/index.html": "text/html", "/styles.css": "text/css", "/demo.js": "text/javascript", "/app.js": "text/javascript" };
const SHOTS = [
  { name: "panel" },
  { name: "lights", expand: "light.kitchen" },
  { name: "shutters", expand: "living" },
  { name: "tasks", tasks: true },
  { name: "finder", finder: true },
  { name: "night", at: "2026-11-10T23:12:00Z" },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const shot of SHOTS) {
  const context = await browser.newContext({
    viewport: { width: 640, height: 360 },
    deviceScaleFactor: 3,
    locale: "en-US",
    timezoneId: "UTC",
  });
  await context.route(`${ORIGIN}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (!FILES[path]) return route.fulfill({ status: 404 });
    route.fulfill({ body: await readFile(new URL(`.${path}`, ROOT)), contentType: FILES[path] });
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.setFixedTime(shot.at ? new Date(shot.at) : NOW);
  await page.goto(`${ORIGIN}/index.html?demo`);
  await page.waitForSelector("#tasks .task", { state: "attached" });
  if (shot.expand) await page.click(`[data-expand="${shot.expand}"]`);
  if (shot.tasks) await page.click("#switch");
  if (shot.finder) {
    await page.dblclick("#time");
    await page.waitForTimeout(600);
    await page.click("#finder .phone");
  }
  await page.waitForTimeout(1500);
  if (errors.length) throw new Error(`${shot.name}: ${errors.join("; ")}`);
  await page.screenshot({ path: new URL(`${shot.name}.png`, OUT).pathname });
  console.log(`docs/screenshots/${shot.name}.png`);
  await context.close();
}
await browser.close();
