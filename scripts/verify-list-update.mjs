import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL ?? "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const consoleErrors = [];

page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Packages", exact: true }).waitFor();

if ((await page.getByText("Recently updated", { exact: true }).count()) !== 0) {
  throw new Error("Recently updated control should be removed");
}
if ((await page.getByText("9 packages", { exact: true }).count()) !== 0) {
  throw new Error("Toolbar package result count should be removed");
}

await page.getByRole("button", { name: "All package types" }).click();
const serviceTypeCount = await page.getByRole("option").count();
if (serviceTypeCount < 12) throw new Error(`Expected the full service type catalog, found ${serviceTypeCount} options`);
await page.keyboard.press("Escape");

await page.getByRole("button", { name: "All regions" }).click();
await page.getByRole("option", { name: "Oceania", exact: true }).waitFor();
await page.keyboard.press("Escape");

const packageRows = page.locator(".packages-sheet .pt-sheet__row:not(.pt-sheet__head)");
const desktopRowCount = await packageRows.count();
if (desktopRowCount < 1 || desktopRowCount >= 9) {
  throw new Error(`Expected viewport pagination to show fewer than all 9 rows, found ${desktopRowCount}`);
}

const desktopOverflow = await page.locator(".packages-sheet .pt-sheet__scroll").evaluate((element) => ({
  clientWidth: element.clientWidth,
  scrollWidth: element.scrollWidth,
  clientHeight: element.clientHeight,
  scrollHeight: element.scrollHeight,
}));
if (desktopOverflow.scrollWidth > desktopOverflow.clientWidth + 1) {
  throw new Error(`Package table has horizontal overflow: ${JSON.stringify(desktopOverflow)}`);
}

await page.getByRole("combobox", { name: "Search packages or regions" }).fill("Bangalore");
await page.getByRole("option", { name: /Bengaluru, Karnataka/ }).waitFor();
await page.getByRole("option", { name: /Bengaluru, Karnataka/ }).click();
await page.getByText("Bangalore city discovery", { exact: true }).waitFor();
if ((await packageRows.count()) !== 2) throw new Error("Bangalore region selection should return two matching packages");
await page.screenshot({ path: "design-qa-region-search.png", fullPage: true });

await page.getByRole("combobox", { name: "Search packages or regions" }).fill("");
await page.getByRole("tab", { name: /Proposals/ }).click();
await page.getByRole("heading", { name: "Proposals", exact: true }).waitFor();
const proposalOverflow = await page.locator(".proposals-sheet .pt-sheet__scroll").evaluate((element) => ({
  clientWidth: element.clientWidth,
  scrollWidth: element.scrollWidth,
}));
if (proposalOverflow.scrollWidth > proposalOverflow.clientWidth + 1) {
  throw new Error(`Proposal table has horizontal overflow: ${JSON.stringify(proposalOverflow)}`);
}
await page.screenshot({ path: "design-qa-proposals-responsive.png", fullPage: true });

await page.getByRole("tab", { name: /Packages/ }).click();
await page.setViewportSize({ width: 820, height: 900 });
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Packages", exact: true }).waitFor();
const narrowRowCount = await packageRows.count();
if (narrowRowCount !== 1) throw new Error(`Expected one responsive card row at narrow width, found ${narrowRowCount}`);
const narrowOverflow = await page.locator(".packages-sheet .pt-sheet__scroll").evaluate((element) => ({
  clientWidth: element.clientWidth,
  scrollWidth: element.scrollWidth,
}));
if (narrowOverflow.scrollWidth > narrowOverflow.clientWidth + 1) {
  throw new Error(`Narrow package cards have horizontal overflow: ${JSON.stringify(narrowOverflow)}`);
}
await page.screenshot({ path: "design-qa-list-narrow.png", fullPage: true });

await page.setViewportSize({ width: 1655, height: 977 });
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Packages", exact: true }).waitFor();
await page.screenshot({ path: "design-qa-packages-source-size.png", fullPage: true });
await page.getByRole("combobox", { name: "Search packages or regions" }).fill("Bangalore");
await page.getByRole("option", { name: /Bengaluru, Karnataka/ }).waitFor();
await page.screenshot({ path: "design-qa-region-suggestions.png", fullPage: true });

await page.setViewportSize({ width: 1508, height: 979 });
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("tab", { name: /Proposals/ }).click();
await page.getByRole("heading", { name: "Proposals", exact: true }).waitFor();
await page.screenshot({ path: "design-qa-proposals-source-size.png", fullPage: true });

if (consoleErrors.length > 0) throw new Error(`Console errors:\n${consoleErrors.join("\n")}`);

console.log(JSON.stringify({
  desktopRowCount,
  narrowRowCount,
  serviceTypeCount,
  desktopOverflow,
  proposalOverflow,
  narrowOverflow,
  screenshots: [
    "design-qa-region-search.png",
    "design-qa-proposals-responsive.png",
    "design-qa-list-narrow.png",
    "design-qa-packages-source-size.png",
    "design-qa-region-suggestions.png",
    "design-qa-proposals-source-size.png",
  ],
  consoleErrors,
}, null, 2));

await browser.close();
