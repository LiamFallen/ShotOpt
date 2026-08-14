/* ShotOpt smoke test.
   Serves the repo root, drives the app in headless Chromium, and fails on any
   console error or broken core flow. Run with `npm test` (see CONTRIBUTING). */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml",
               ".webmanifest": "application/manifest+json", ".jpg": "image/jpeg" };

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  const file = path.join(ROOT, url === "/" ? "index.html" : url);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(8123, r));

const fails = [];
const ok = (name, cond) => {
  console.log(`${cond ? "  ok" : "FAIL"}  ${name}`);
  if (!cond) fails.push(name);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e.message)));

await page.goto("http://127.0.0.1:8123/", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });

// boot
ok("app boots with a rendered preview", await page.evaluate(() =>
  document.getElementById("preview").width > 100));

// load an image through the app's own pipeline
await page.evaluate(async () => {
  const c = document.createElement("canvas");
  c.width = 1200; c.height = 800;
  const x = c.getContext("2d");
  x.fillStyle = "#123456"; x.fillRect(0, 0, 1200, 800);
  x.fillStyle = "#fff"; x.fillRect(50, 50, 1100, 100);
  const blob = await new Promise(r => c.toBlob(r, "image/png"));
  loadFiles([new File([blob], "smoke.png", { type: "image/png" })]);
});
await page.waitForTimeout(700);
ok("image loads into slot 0", await page.evaluate(() => !!IMGS[0]));

// every tab opens
for (const t of ["layout", "frame", "fx", "motion", "mockup"]) {
  await page.click(`#ptabs button[data-tab="${t}"]`);
  ok(`tab "${t}" opens`, await page.evaluate(
    n => !document.getElementById("tab-" + n).hidden, t));
}

// core controls
await page.evaluate(() => setKey("style", "macD"));
await page.evaluate(() => setKey("bg", "gradient-ocean"));
await page.evaluate(() => setKey("shadow", "diffuse"));
await page.evaluate(() => applyPreset(7));
await page.waitForTimeout(600);
ok("style/background/shadow/preset apply", await page.evaluate(() =>
  S.style === "macD" && S.bg === "gradient-ocean" && S.preset === 7));

// stable auto frame: presets must not resize the canvas
const wh1 = await page.evaluate(() => { const F = frameLayout(); return F.W + "x" + F.H; });
await page.evaluate(() => applyPreset(2));
await page.waitForTimeout(600);
const wh2 = await page.evaluate(() => { const F = frameLayout(); return F.W + "x" + F.H; });
ok("auto frame is stable across layout presets", wh1 === wh2);

// undo
await page.evaluate(() => setKey("grain", 77));
await page.waitForTimeout(600);
await page.evaluate(() => undo());
ok("undo restores state", await page.evaluate(() => S.grain !== 77));

// templates modal
await page.click("#tplBtn");
ok("templates modal opens with cards", await page.evaluate(() =>
  !tplModal.hidden && document.querySelectorAll(".tpl").length > 10));
await page.keyboard.press("Escape");

// annotation
await page.evaluate(() => {
  S.annots = S.annots.concat([{ t: "arrow", c: "#ff4757", w: .006, p: [[.2, .2], [.5, .5]] }]);
  update();
});
ok("annotation stored", await page.evaluate(() => S.annots.length === 1));

// PNG export produces a real file (Export opens a popover; Download lives inside)
const dl = page.waitForEvent("download", { timeout: 30000 });
await page.click("#exportBtn");
await page.click("#expGo");
const download = await dl;
const tmp = path.join(ROOT, "tests", ".smoke-export.png");
await download.saveAs(tmp);
const size = fs.statSync(tmp).size;
fs.unlinkSync(tmp);
ok("PNG export is non-trivial (" + size + " bytes)", size > 20000);

ok("no console errors", errors.length === 0);
if (errors.length) console.log("   errors:\n   " + errors.join("\n   "));

await browser.close();
server.close();

if (fails.length) {
  console.error(`\n${fails.length} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
