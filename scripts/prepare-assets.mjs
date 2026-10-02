import { cpSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const path = (relative) => fileURLToPath(new URL(relative, root));

// Booking is a preserved executable HTML prototype, not a separately built app.
mkdirSync(path("public/booking/"), { recursive: true });
cpSync(path("src/modules/bookings/booking-redesign.html"), path("public/booking/index.html"));
console.log("Booking HTML prepared. Shared static assets are tracked in public/.");
