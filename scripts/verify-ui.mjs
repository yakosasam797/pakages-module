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
await page.getByRole("button", { name: "Back to Sales" }).waitFor();
await page.getByRole("button", { name: /Package notes/ }).waitFor();
await page.getByRole("button", { name: "Write a note" }).waitFor();
const callLogButtonCount = await page.getByRole("button", { name: "Call logs" }).count();
if (callLogButtonCount !== 0) throw new Error(`Expected no call-log button, found ${callLogButtonCount}`);

await page.getByRole("tab", { name: /Draft/ }).click();
const draftRows = await page.locator(".packages-sheet .pt-sheet__row:not(.pt-sheet__head)").count();
if (draftRows !== 4) throw new Error(`Expected 4 draft rows, found ${draftRows}`);

await page.getByRole("tab", { name: /All/ }).click();
await page.getByRole("searchbox", { name: "Search packages" }).fill("Southeast Asia");
const searchRows = await page.locator(".packages-sheet .pt-sheet__row:not(.pt-sheet__head)").count();
if (searchRows !== 2) throw new Error(`Expected 2 Southeast Asia rows from search, found ${searchRows}`);
await page.getByRole("searchbox", { name: "Search packages" }).fill("");

await page.getByRole("button", { name: "All regions" }).click();
await page.getByRole("option", { name: "Southeast Asia" }).click();
const regionRows = await page.locator(".packages-sheet .pt-sheet__row:not(.pt-sheet__head)").count();
if (regionRows !== 2) throw new Error(`Expected 2 Southeast Asia rows from filter, found ${regionRows}`);
await page.getByRole("button", { name: "Southeast Asia" }).click();
await page.getByRole("option", { name: "All regions" }).click();

const checkboxes = page.getByRole("checkbox");
const checkboxCount = await checkboxes.count();
if (checkboxCount !== 7) throw new Error(`Expected 7 package checkboxes, found ${checkboxCount}`);

await checkboxes.nth(1).click();
if ((await checkboxes.first().getAttribute("aria-checked")) !== "mixed") {
  throw new Error("Expected select-all checkbox to become indeterminate");
}

await checkboxes.first().click();
const selectedCheckboxes = await page.locator('[role="checkbox"][aria-checked="true"]').count();
if (selectedCheckboxes !== 7) throw new Error(`Expected all 7 checkboxes selected, found ${selectedCheckboxes}`);
await page.getByText("6 packages selected").waitFor();
await page.screenshot({ path: "design-qa-selection.png", fullPage: true });

await checkboxes.first().click();
if ((await page.locator('[role="checkbox"][aria-checked="true"]').count()) !== 0) {
  throw new Error("Expected select-all checkbox to clear every package selection");
}

await page.getByRole("button", { name: "New package" }).click();
await page.getByRole("heading", { name: "Set the trip foundation", exact: true }).waitFor();
if ((await page.locator(".builder-outline").count()) !== 0) throw new Error("Package outline should not render in the creation journey");
const firstStepBox = await page.locator(".builder-steps button").first().boundingBox();
const lastStepBox = await page.locator(".builder-steps button").last().boundingBox();
if (!firstStepBox || !lastStepBox || Math.abs(firstStepBox.y - lastStepBox.y) > 2) throw new Error("Creation steps should be horizontal");
await page.screenshot({ path: "design-qa-builder-foundation.png", fullPage: true });
await page.getByRole("button", { name: /Flexible dates/ }).click();
await page.getByRole("spinbutton", { name: "Itinerary length" }).waitFor();
await page.getByText("Exact dates are selected when used in a proposal.", { exact: true }).waitFor();
await page.getByRole("button", { name: /Fixed departure/ }).click();

await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("heading", { name: "Map the route and allocate nights", exact: true }).waitFor();
await page.getByText("Route is balanced", { exact: true }).waitFor();
await page.screenshot({ path: "design-qa-builder-route.png", fullPage: true });
await page.getByRole("button", { name: /Connect Ubud to Seminyak/ }).click();
await page.getByRole("dialog").waitFor();
await page.getByRole("heading", { name: "Add car", exact: true }).waitFor();
await page.getByText("Day 4 · Itinerary", { exact: true }).waitFor();
await page.screenshot({ path: "design-qa-builder-supply.png", fullPage: true });
await page.getByRole("button", { name: "Regional APIs", exact: true }).click();
await page.getByRole("searchbox", { name: "Search car or vendor" }).fill("TransferConnect");
await page.getByRole("option", { name: /Private regional transfer/ }).click();
if ((await page.getByRole("textbox", { name: "Car name" }).inputValue()) !== "Private regional transfer") {
  throw new Error("Expected the API car selection to populate the service form");
}
await page.getByRole("button", { name: "Cancel" }).click();

await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("heading", { name: "Build the itinerary day by day", exact: true }).waitFor();
const itineraryDayButtons = page.locator(".itinerary-builder__days button");
if ((await itineraryDayButtons.count()) !== 7) throw new Error("Expected a horizontal array of 7 itinerary days");
const firstDayBox = await itineraryDayButtons.first().boundingBox();
const lastDayBox = await itineraryDayButtons.last().boundingBox();
if (!firstDayBox || !lastDayBox || Math.abs(firstDayBox.y - lastDayBox.y) > 2) throw new Error("Itinerary days should be horizontal");
await page.getByRole("button", { name: "Add Activity", exact: true }).click();
await page.getByRole("dialog").waitFor();
await page.getByRole("textbox", { name: "Activity name", exact: true }).fill("Balinese cooking class");
await page.getByRole("textbox", { name: "Operational details", exact: true }).fill("16:00 · 3 hours · Hotel pickup included");
await page.screenshot({ path: "design-qa-builder-service.png", fullPage: true });
await page.getByRole("button", { name: "Add to Day 4" }).click();
await page.getByRole("heading", { name: "Balinese cooking class", exact: true }).waitFor();
await page.screenshot({ path: "design-qa-builder-itinerary.png", fullPage: true });

await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("heading", { name: "Build the commercial basis", exact: true }).waitFor();
await page.screenshot({ path: "design-qa-builder-pricing.png", fullPage: true });

await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("heading", { name: "Add package media", exact: true }).waitFor();
const initialMediaCount = await page.locator(".media-item").count();
if (initialMediaCount !== 3) throw new Error(`Expected 3 initial package media items, found ${initialMediaCount}`);
await page.locator('input[type="file"]').setInputFiles("src/assets/bali/nusa-penida.jpg");
await page.getByText("nusa-penida.jpg", { exact: true }).waitFor();
await page.screenshot({ path: "design-qa-builder-media.png", fullPage: true });

await page.getByRole("button", { name: "Continue" }).click();
await page.getByRole("heading", { name: "Review operational readiness", exact: true }).waitFor();
await page.screenshot({ path: "design-qa-builder-review.png", fullPage: true });
await page.getByRole("button", { name: "Create draft package" }).click();
await page.getByRole("heading", { name: "Bali family discovery", exact: true }).waitFor();
await page.getByRole("button", { name: "Back to packages" }).click();
await page.getByText("Bali family discovery", { exact: true }).waitFor();

await page.screenshot({ path: "design-qa-implementation.png", fullPage: true });

await page.locator(".packages-sheet .pt-sheet__row", { hasText: "Bali Indonesia" }).getByRole("button", { name: "Open" }).click();
await page.getByRole("heading", { name: "Bali Indonesia", exact: true }).waitFor();
await page.getByRole("tab", { name: "Itinerary", exact: true }).waitFor();
const itineraryDays = await page.locator(".itinerary-day").count();
if (itineraryDays !== 6) throw new Error(`Expected 6 itinerary days, found ${itineraryDays}`);
if ((await page.locator(".day-index").count()) !== 0) throw new Error("Expected the legacy day sidebar to be removed");
if ((await page.locator(".itinerary-day.is-open").count()) !== 1) throw new Error("Expected one itinerary day to be open by default");
if ((await page.locator(".package-story li").count()) !== 2) throw new Error("Expected a two-item package story preview");
await page.getByRole("button", { name: /Day 1/ }).click();
if ((await page.locator(".itinerary-day.is-open").count()) !== 0) throw new Error("Expected an open day to collapse");
await page.screenshot({ path: "design-qa-detail-collapsed.png", fullPage: true });
await page.getByRole("button", { name: "View all 3" }).click();
if ((await page.locator(".package-story li").count()) !== 3) throw new Error("Expected View all to reveal the complete package story");
await page.getByRole("button", { name: "Show less" }).click();
if ((await page.locator(".package-story li").count()) !== 2) throw new Error("Expected Show less to restore the compact package story");
await page.getByRole("button", { name: /Day 1/ }).click();
await page.getByText("Flight required: New Delhi to Denpasar", { exact: true }).waitFor();
if ((await page.locator(".flight-route").count()) !== 0) throw new Error("Package detail should not imply a fixed flight time");
await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0));
await page.screenshot({ path: "design-qa-detail-top.png", fullPage: true });

await page.getByRole("button", { name: /Day 4/ }).click();
await page.getByRole("heading", { name: "Nusa Penida island experience", exact: true, level: 3 }).waitFor();
if ((await page.locator(".itinerary-day.is-open").count()) !== 1) throw new Error("Expected the accordion to keep one day open at a time");
await page.screenshot({ path: "design-qa-detail-day-4.png", fullPage: true });

await page.getByRole("tab", { name: "Inclusions", exact: true }).click();
await page.getByRole("heading", { name: "Included in the trip", exact: true }).waitFor();
await page.getByRole("tab", { name: "Itinerary", exact: true }).click();
await page.getByRole("button", { name: "Add item" }).first().click();
await page.getByRole("dialog").waitFor();
await page.screenshot({ path: "design-qa-add-item.png", fullPage: true });
await page.getByRole("button", { name: "Cancel" }).click();

await page.getByRole("button", { name: "Back to packages" }).click();
await page.getByRole("heading", { name: "Packages", exact: true }).waitFor();

const packageNames = ["Bali Indonesia", "Bali Honeymoon", "Delight Himachal", "Rajasthan Heritage Trail", "Dubai City Break", "Kerala Slow Escape"];
for (const packageName of packageNames) {
  const row = page.locator(".packages-sheet .pt-sheet__row", { hasText: packageName });
  await row.getByRole("button", { name: "Open" }).click();
  await page.getByRole("heading", { name: packageName, exact: true }).waitFor();
  if ((await page.locator(".itinerary-day").count()) !== 6) {
    throw new Error(`Expected 6 itinerary days for ${packageName}`);
  }
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0));
  await page.getByRole("button", { name: "Back to packages" }).click();
}
const detailPagesVerified = packageNames.length;

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Packages", exact: true }).waitFor();
await page.screenshot({ path: "design-qa-mobile.png", fullPage: true });
await page.getByRole("button", { name: "New package" }).click();
await page.getByRole("heading", { name: "Set the trip foundation", exact: true }).waitFor();
await page.screenshot({ path: "design-qa-builder-mobile.png", fullPage: true });
await page.getByRole("button", { name: "Back to packages" }).click();
await page.locator(".packages-sheet .pt-sheet__row", { hasText: "Bali Indonesia" }).getByRole("button", { name: "Open" }).click();
await page.getByRole("heading", { name: "Bali Indonesia", exact: true }).waitFor();
await page.screenshot({ path: "design-qa-detail-mobile.png", fullPage: true });

if (consoleErrors.length > 0) {
  throw new Error(`Console errors:\n${consoleErrors.join("\n")}`);
}

console.log(JSON.stringify({
  desktop: "design-qa-implementation.png",
  builderFoundation: "design-qa-builder-foundation.png",
  builderRoute: "design-qa-builder-route.png",
  builderService: "design-qa-builder-service.png",
  builderSupply: "design-qa-builder-supply.png",
  builderItinerary: "design-qa-builder-itinerary.png",
  builderPricing: "design-qa-builder-pricing.png",
  builderMedia: "design-qa-builder-media.png",
  builderReview: "design-qa-builder-review.png",
  builderMobile: "design-qa-builder-mobile.png",
  selection: "design-qa-selection.png",
  mobile: "design-qa-mobile.png",
  detailTop: "design-qa-detail-top.png",
  detailCollapsed: "design-qa-detail-collapsed.png",
  detailDay4: "design-qa-detail-day-4.png",
  detailMobile: "design-qa-detail-mobile.png",
  addItem: "design-qa-add-item.png",
  draftRows,
  searchRows,
  regionRows,
  checkboxCount,
  itineraryDays,
  detailPagesVerified,
  createdPackage: "Bali family discovery",
  callLogButtonCount,
  consoleErrors,
}, null, 2));

await browser.close();
