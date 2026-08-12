import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const targets = [
  { name: "root", url: "http://127.0.0.1:4173/" },
];

const outDir = path.resolve("playwright-artifacts");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const target of targets) {
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  const logs = [];

  page.on("console", (msg) => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === "error") errors.push(text);
  });

  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${err.message}`);
  });

  page.on("requestfailed", (req) => {
    failedRequests.push(`${req.method()} ${req.url()} :: ${req.failure()?.errorText ?? "unknown"}`);
  });

  await page.goto(target.url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, `${target.name}.png`), fullPage: true });

  const report = [
    `Target: ${target.url}`,
    "",
    "Console logs:",
    ...(logs.length ? logs : ["(none)"]),
    "",
    "Errors:",
    ...(errors.length ? errors : ["(none)"]),
    "",
    "Failed requests:",
    ...(failedRequests.length ? failedRequests : ["(none)"]),
    "",
  ].join("\n");

  await fs.writeFile(path.join(outDir, `${target.name}.log`), report, "utf8");
  await page.close();
}

await browser.close();
console.log(`Wrote artifacts to ${outDir}`);
