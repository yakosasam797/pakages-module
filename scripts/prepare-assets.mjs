import { cpSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const path = (relative) => fileURLToPath(new URL(relative, root));

// Booking is a preserved executable HTML prototype, not a separately built app.
mkdirSync(path("public/booking/"), { recursive: true });
cpSync(path("booking-module/booking-redesign.html"), path("public/booking/index.html"));
cpSync(path("vendor-crm/public/brand/"), path("public/brand/"), { recursive: true });
cpSync(path("vendor-crm/public/icons.svg"), path("public/icons.svg"));
cpSync(path("vendor-crm/public/favicon.svg"), path("public/favicon.svg"));
console.log("Shared assets and Booking HTML prepared. No nested installs or builds.");
