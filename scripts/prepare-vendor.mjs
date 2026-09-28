import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const vendorRoot = join(projectRoot, "vendor-crm");
const vendorEntry = join(vendorRoot, "src", "main.tsx");
const vendorOutput = join(projectRoot, "public", "vendor-crm");
const vendorBuild = join(vendorRoot, "dist");
const bookingSource = join(projectRoot, "booking-module", "booking-redesign.html");
const bookingOutput = join(projectRoot, "public", "booking", "index.html");
const financeRoot = join(projectRoot, "finance-module");
const financeEntry = join(financeRoot, "src", "main.tsx");
const financeBuild = join(financeRoot, "dist");
const financeOutput = join(projectRoot, "public", "finance");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

if (!existsSync(bookingSource) || !existsSync(vendorEntry) || !existsSync(financeEntry)) {
  execFileSync("git", ["submodule", "update", "--init", "--recursive", "booking-module", "vendor-crm", "finance-module"], {
    cwd: projectRoot,
    stdio: "inherit",
  });
}

if (!existsSync(bookingSource) || !existsSync(vendorEntry) || !existsSync(financeEntry)) {
  throw new Error("Booking, Vendor CRM, or Finance source is missing after submodule initialization.");
}

if (!existsSync(join(vendorRoot, "node_modules", ".bin", process.platform === "win32" ? "vite.cmd" : "vite"))) {
  execFileSync(npm, ["ci"], { cwd: vendorRoot, stdio: "inherit", shell: process.platform === "win32" });
}

execFileSync(npm, ["run", "build", "--", "--base=/vendor-crm/"], {
  cwd: vendorRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (!existsSync(join(financeRoot, "node_modules", ".bin", process.platform === "win32" ? "vite.cmd" : "vite"))) {
  execFileSync(npm, ["ci"], { cwd: financeRoot, stdio: "inherit", shell: process.platform === "win32" });
}

execFileSync(npm, ["run", "build", "--", "--base=/finance/"], {
  cwd: financeRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});

mkdirSync(vendorOutput, { recursive: true });
cpSync(vendorBuild, vendorOutput, { recursive: true, force: true });
mkdirSync(join(projectRoot, "public", "booking"), { recursive: true });
cpSync(bookingSource, bookingOutput, { force: true });
cpSync(join(vendorRoot, "public", "brand"), join(projectRoot, "public", "brand"), {
  recursive: true,
  force: true,
});
mkdirSync(financeOutput, { recursive: true });
cpSync(financeBuild, financeOutput, { recursive: true, force: true });

console.log("Booking, Vendor CRM, and Finance are available at /booking/index.html, /vendor-crm/index.html, and /finance/index.html");
