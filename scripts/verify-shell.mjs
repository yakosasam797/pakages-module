import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL ?? "http://127.0.0.1:5174";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];

page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Packages", exact: true }).waitFor();

const notesButtonCount = await page.getByRole("button", { name: /Package notes/ }).count();
const addNoteButtonCount = await page.getByRole("button", { name: "Write a note" }).count();
const callLogButtonCount = await page.getByRole("button", { name: "Call logs" }).count();

if (notesButtonCount !== 1) throw new Error(`Expected 1 package-notes button, found ${notesButtonCount}`);
if (addNoteButtonCount !== 1) throw new Error(`Expected 1 add-note button, found ${addNoteButtonCount}`);
if (callLogButtonCount !== 0) throw new Error(`Expected no call-log button, found ${callLogButtonCount}`);

await page.getByRole("button", { name: /Package notes/ }).click();
await page.getByText("Package notes opened").waitFor();
await page.getByRole("button", { name: "New package" }).click();
await page.getByRole("heading", { name: "Create package", exact: true }).waitFor();
const builderCallLogButtonCount = await page.getByRole("button", { name: "Call logs" }).count();
if (builderCallLogButtonCount !== 0) {
  throw new Error(`Expected no builder call-log button, found ${builderCallLogButtonCount}`);
}
await page.getByRole("button", { name: "Back to packages" }).click();
await page.getByRole("heading", { name: "Packages", exact: true }).waitFor();
await page.screenshot({ path: "design-qa-shell.png", fullPage: true });

if (consoleErrors.length > 0) throw new Error(`Console errors:\n${consoleErrors.join("\n")}`);

console.log(JSON.stringify({ notesButtonCount, addNoteButtonCount, callLogButtonCount, builderCallLogButtonCount, consoleErrors }, null, 2));
await browser.close();
