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
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

if (!existsSync(bookingSource) || !existsSync(vendorEntry)) {
  execFileSync("git", ["submodule", "update", "--init", "--recursive", "booking-module", "vendor-crm"], {
    cwd: projectRoot,
    stdio: "inherit",
  });
}

if (!existsSync(bookingSource) || !existsSync(vendorEntry)) {
  throw new Error("Booking or Vendor CRM source is missing after submodule initialization.");
}

if (!existsSync(join(vendorRoot, "node_modules", ".bin", process.platform === "win32" ? "vite.cmd" : "vite"))) {
  execFileSync(npm, ["ci"], { cwd: vendorRoot, stdio: "inherit", shell: process.platform === "win32" });
}

execFileSync(npm, ["run", "build", "--", "--base=/vendor-crm/"], {
  cwd: vendorRoot,
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

console.log("Booking and Vendor CRM are available at /booking/index.html and /vendor-crm/index.html");
