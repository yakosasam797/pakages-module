import type { PrivateTransportTariff, PrivateTransportTemplate, VehicleOffering } from "../rateCard/privateTransport";

export const VEHICLE_OFFERINGS: VehicleOffering[] = [
  { id: "city-sedan", vendorId: "cityride", serviceIds: ["cityride-fixed"], label: "Sedan", category: "Sedan", model: "Dzire or equivalent", passengerSeats: 3, mediumBags: 2, airConditioned: true },
  { id: "city-muv", vendorId: "cityride", serviceIds: ["cityride-fixed"], label: "MUV", category: "MUV", model: "Innova or equivalent", passengerSeats: 6, mediumBags: 3, airConditioned: true },
  { id: "city-van", vendorId: "cityride", serviceIds: ["cityride-fixed"], label: "Van", category: "Tempo Traveller", model: "12-seat AC van", passengerSeats: 12, mediumBags: 10, airConditioned: true },
  { id: "city-coach", vendorId: "cityride", serviceIds: ["cityride-fixed"], label: "Coach", category: "Coach", model: "35-seat AC coach", passengerSeats: 35, mediumBags: 30, airConditioned: true },
  { id: "local-sedan", vendorId: "kochi-local-cabs", serviceIds: ["kochi-local-duty"], label: "Sedan", category: "Sedan", model: "Dzire or equivalent", passengerSeats: 3, mediumBags: 2, airConditioned: true },
  { id: "local-muv", vendorId: "kochi-local-cabs", serviceIds: ["kochi-local-duty"], label: "MUV", category: "MUV", model: "Innova or equivalent", passengerSeats: 6, mediumBags: 3, airConditioned: true },
  { id: "local-van", vendorId: "kochi-local-cabs", serviceIds: ["kochi-local-duty"], label: "Van", category: "Tempo Traveller", model: "12-seat AC van", passengerSeats: 12, mediumBags: 10, airConditioned: true },
  { id: "local-coach", vendorId: "kochi-local-cabs", serviceIds: ["kochi-local-duty"], label: "Coach", category: "Coach", model: "27-seat AC coach", passengerSeats: 27, mediumBags: 20, airConditioned: true },
  { id: "jaipur-muv", vendorId: "jaipur-local-cabs", serviceIds: ["jaipur-local-duty"], label: "MUV", category: "MUV", model: "Innova or equivalent", passengerSeats: 6, mediumBags: 3, airConditioned: true },
  { id: "bengaluru-muv", vendorId: "bengaluru-city-rides", serviceIds: ["bengaluru-local-duty"], label: "MUV", category: "MUV", model: "Innova or equivalent", passengerSeats: 6, mediumBags: 3, airConditioned: true },
  { id: "road-sedan", vendorId: "kerala-road-trips", serviceIds: ["kerala-road-hire"], label: "Sedan", category: "Sedan", model: "Dzire or equivalent", passengerSeats: 3, mediumBags: 2, airConditioned: true },
  { id: "road-muv", vendorId: "kerala-road-trips", serviceIds: ["kerala-road-hire"], label: "MUV", category: "MUV", model: "Innova or equivalent", passengerSeats: 6, mediumBags: 3, airConditioned: true },
  { id: "road-van", vendorId: "kerala-road-trips", serviceIds: ["kerala-road-hire"], label: "Van", category: "Tempo Traveller", model: "12-seat AC van", passengerSeats: 12, mediumBags: 10, airConditioned: true },
  { id: "road-coach", vendorId: "kerala-road-trips", serviceIds: ["kerala-road-hire"], label: "Coach", category: "Coach", model: "27-seat AC coach", passengerSeats: 27, mediumBags: 20, airConditioned: true },
  { id: "coast-van", vendorId: "south-coast-coaches", serviceIds: ["south-coast-daily"], label: "Van", category: "Tempo Traveller", model: "12-seat AC van", passengerSeats: 12, mediumBags: 10, airConditioned: true },
  { id: "coast-coach", vendorId: "south-coast-coaches", serviceIds: ["south-coast-daily"], label: "Coach", category: "Coach", model: "35-seat AC coach", passengerSeats: 35, mediumBags: 30, airConditioned: true },
  { id: "trail-sedan", vendorId: "trailmakers", serviceIds: ["trail-fixed", "trail-local", "trail-outstation", "trail-daily"], label: "Sedan", category: "Sedan", model: "Dzire or equivalent", passengerSeats: 3, mediumBags: 2, airConditioned: true },
  { id: "trail-muv", vendorId: "trailmakers", serviceIds: ["trail-fixed", "trail-local", "trail-outstation", "trail-daily"], label: "MUV", category: "MUV", model: "Innova or equivalent", passengerSeats: 6, mediumBags: 3, airConditioned: true },
  { id: "trail-van", vendorId: "trailmakers", serviceIds: ["trail-fixed", "trail-local", "trail-outstation", "trail-daily"], label: "Van", category: "Tempo Traveller", model: "12-seat AC van", passengerSeats: 12, mediumBags: 10, airConditioned: true },
  { id: "trail-coach", vendorId: "trailmakers", serviceIds: ["trail-fixed", "trail-local", "trail-outstation", "trail-daily"], label: "Coach", category: "Coach", model: "27-seat AC coach", passengerSeats: 27, mediumBags: 20, airConditioned: true },
].map((vehicle) => ({
  ...vehicle,
  largeBags: vehicle.category === "Sedan" ? 2 : vehicle.category === "MUV" ? 4 : vehicle.category === "Coach" ? 25 : 8,
  cabinBags: vehicle.category === "Sedan" ? 2 : vehicle.category === "MUV" ? 3 : vehicle.category === "Coach" ? 30 : 10,
  combinedBagUnits: vehicle.category === "Sedan" ? 5 : vehicle.category === "MUV" ? 10 : vehicle.category === "Coach" ? 60 : 25,
}));

const packageList = [
  { id: "half", name: "4 hr / 40 km", hours: 4, km: 40 },
  { id: "full", name: "8 hr / 80 km", hours: 8, km: 80 },
  { id: "extended", name: "12 hr / 120 km", hours: 12, km: 120 },
];
const localNumbers = [[1800, 3000, 4200, 20, 300], [2500, 4200, 6000, 25, 400], [4000, 6500, 8500, 30, 500], [7000, 11000, 15000, 50, 800]];
const outstationNumbers = [[14, 250, 400], [20, 250, 500], [22, 250, 500], [45, 300, 800]];
const dailyNumbers = [[5000, 150, 10, 20, 300], [6500, 150, 10, 25, 400], [10000, 200, 10, 30, 500], [16000, 200, 10, 50, 800]];

function tariff(template: PrivateTransportTemplate, vendorId: string, serviceId: string, vehicleIds: string[]): PrivateTransportTariff {
  return {
    schemaVersion: 1, template, vendorId, serviceId, vehicleIds,
    validFrom: "2026-10-01", validTo: "2027-03-31", sourceDocument: "Demo tariff — replace with supplier-approved prices before live use",
    sourceConfirmed: false, illustrative: true, status: "Draft", version: 1, taxMode: "inclusive", taxProfileId: null,
    coverageAreas: vendorId === "south-coast-coaches" ? ["Kochi", "Bengaluru", "Mysuru", "Coorg"] : ["Kochi", "Fort Kochi", "Munnar", "Thekkady", "Alleppey", "Kerala"],
    requiredChargeNames: template === "fixed-transfer" ? ["Night pickup", "Fuel", "Toll", "Parking", "Permit"] : ["Fuel", "Toll", "Parking", "Permit"],
    routes: [], packages: [], packagePrices: {}, outstationPrices: {}, dailyPrices: {}, excessPrices: {},
    rules: { minimumMethod: "pooled", distanceBasis: "Customer pickup to final drop", billableDayMethod: "calendar", timezone: "Asia/Kolkata", garageKm: 0, emptyReturnKm: 0, roundKmUp: true, fuelIncluded: true, carryUnusedKm: false, carryUnusedHours: false, excessMethod: "both" },
    charges: [],
  };
}

function fixed(vendorId: string, serviceId: string, vehicleIds: string[]): PrivateTransportTariff {
  const result = tariff("fixed-transfer", vendorId, serviceId, vehicleIds);
  const rows = [
    ["Kochi Airport", "Kochi Hotel", [1500, 2000, 3500, 7000]],
    ["Kochi Airport", "Munnar", [4500, 5500, 8500, 14000]],
    ["Munnar", "Thekkady", [3500, 4500, 7000, 12000]],
  ] as const;
  result.routes = rows.map(([from, to, prices], index) => ({ id: `route-${index + 1}`, from, to, prices: Object.fromEntries(vehicleIds.map((id, position) => [id, prices[position] ?? null])) }));
  result.routes.push(
    { id: "route-fort-kochi", from: "Kochi Airport", to: "Fort Kochi hotel", prices: Object.fromEntries(vehicleIds.map((id, position) => [id, [1800, 2400, 4000, 7500][position] ?? null])) },
    { id: "route-resort", from: "Kochi Airport", to: "Kochi Resort", prices: Object.fromEntries(vehicleIds.map((id, position) => [id, [2200, 2900, 4800, 8000][position] ?? null])) },
    { id: "route-return", from: "Kochi Hotel", to: "Kochi Airport", prices: Object.fromEntries(vehicleIds.map((id, position) => [id, [1500, 2000, 3500, 7000][position] ?? null])) },
  );
  result.charges = [
    { id: "night", name: "Night pickup", appliesTo: "All routes", treatment: "fixed", amount: 500, chargedPer: "vehicle", trigger: "night-pickup", triggerStart: "22:00", triggerEnd: "06:00" },
    { id: "toll", name: "Toll", appliesTo: "Intercity routes", routeIds: ["route-2", "route-3"], treatment: "actual", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "fuel", name: "Fuel", appliesTo: "All routes", treatment: "included", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "parking", name: "Parking", appliesTo: "Airport routes", treatment: "included", amount: null, chargedPer: "hire", trigger: "always", routeIds: ["route-1", "route-2", "route-fort-kochi", "route-resort"] },
    { id: "permit", name: "Permit", appliesTo: "Intercity routes", treatment: "not-applicable", amount: null, chargedPer: "hire", trigger: "always", routeIds: ["route-2", "route-3"] },
    { id: "toll-local", name: "Toll", appliesTo: "Other routes", routeIds: ["route-1", "route-fort-kochi", "route-resort", "route-return"], treatment: "not-applicable", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "parking-other", name: "Parking", appliesTo: "Other routes", routeIds: ["route-3", "route-return"], treatment: "not-applicable", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "permit-local", name: "Permit", appliesTo: "Other routes", routeIds: ["route-1", "route-fort-kochi", "route-resort", "route-return"], treatment: "not-applicable", amount: null, chargedPer: "hire", trigger: "always" },
  ];
  return result;
}
function local(vendorId: string, serviceId: string, vehicleIds: string[]): PrivateTransportTariff {
  const result = tariff("local-package", vendorId, serviceId, vehicleIds);
  result.packages = structuredClone(packageList);
  vehicleIds.forEach((id, index) => {
    const values = localNumbers[index];
    result.packagePrices[id] = Object.fromEntries(packageList.map((pkg, position) => [pkg.id, values[position]]));
    result.excessPrices[id] = { extraKm: values[3], extraHour: values[4] };
  });
  result.charges = [
    { id: "parking", name: "Parking", appliesTo: "Local duty", treatment: "actual", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "toll", name: "Toll", appliesTo: "Local duty", treatment: "actual", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "fuel", name: "Fuel", appliesTo: "Local duty", treatment: "included", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "permit", name: "Permit", appliesTo: "Local duty", treatment: "not-applicable", amount: null, chargedPer: "hire", trigger: "always" },
  ];
  return result;
}
function outstation(vendorId: string, serviceId: string, vehicleIds: string[]): PrivateTransportTariff {
  const result = tariff("outstation-km", vendorId, serviceId, vehicleIds);
  vehicleIds.forEach((id, index) => { const [ratePerKm, minKmPerDay, driverPerDay] = outstationNumbers[index]; result.outstationPrices[id] = { ratePerKm, minKmPerDay, driverPerDay }; });
  result.charges = [
    { id: "permit", name: "Permit", appliesTo: "Outstation trip", treatment: "actual", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "toll", name: "Toll", appliesTo: "Outstation trip", treatment: "actual", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "parking", name: "Parking", appliesTo: "Outstation trip", treatment: "actual", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "fuel", name: "Fuel", appliesTo: "Outstation trip", treatment: "included", amount: null, chargedPer: "hire", trigger: "always" },
  ];
  return result;
}
function daily(vendorId: string, serviceId: string, vehicleIds: string[]): PrivateTransportTariff {
  const result = tariff("daily-hire", vendorId, serviceId, vehicleIds);
  vehicleIds.forEach((id, position) => {
    const index = vehicleIds.length === 2 ? position + 2 : position;
    const [pricePerDay, includedKmPerDay, includedHoursPerDay, extraKm, extraHour] = dailyNumbers[index];
    result.dailyPrices[id] = { pricePerDay, includedKmPerDay, includedHoursPerDay };
    result.excessPrices[id] = { extraKm, extraHour };
  });
  result.charges = [
    { id: "toll", name: "Toll", appliesTo: "Daily hire", treatment: "actual", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "parking", name: "Parking", appliesTo: "Daily hire", treatment: "actual", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "permit", name: "Permit", appliesTo: "Daily hire", treatment: "not-applicable", amount: null, chargedPer: "hire", trigger: "always" },
    { id: "fuel", name: "Fuel", appliesTo: "Daily hire", treatment: "included", amount: null, chargedPer: "hire", trigger: "always" },
  ];
  return result;
}

function cityLocal(vendorId: string, serviceId: string, vehicleId: string, city: string): PrivateTransportTariff {
  const result = local(vendorId, serviceId, [vehicleId]);
  result.coverageAreas = [city];
  result.packagePrices[vehicleId] = { half: 2500, full: 4200, extended: 6000 };
  result.excessPrices[vehicleId] = { extraKm: 25, extraHour: 400 };
  return result;
}

function trailFixed(): PrivateTransportTariff {
  const result = fixed("trailmakers", "trail-fixed", ["trail-sedan", "trail-muv", "trail-van", "trail-coach"]);
  result.routes.find((route) => route.id === "route-2")!.prices["trail-muv"] = 5200;
  return result;
}

export interface PrivateTransportFixture { id: string; ref: string; name: string; vendorId: string; vendorName: string; serviceId: string; serviceName: string; tariff: PrivateTransportTariff; }
export const PRIVATE_TRANSPORT_FIXTURES: PrivateTransportFixture[] = [
  { id: "rc-cityride-fixed", ref: "RC-CITY-FIXED", name: "Kochi airport and intercity transfers", vendorId: "cityride", vendorName: "CityRide Transfers", serviceId: "cityride-fixed", serviceName: "Kochi fixed transfers", tariff: fixed("cityride", "cityride-fixed", ["city-sedan", "city-muv", "city-van", "city-coach"]) },
  { id: "rc-local-cabs", ref: "RC-LOCAL-DUTY", name: "Kochi local duty packages", vendorId: "kochi-local-cabs", vendorName: "Kochi Local Cabs", serviceId: "kochi-local-duty", serviceName: "Kochi local sightseeing", tariff: local("kochi-local-cabs", "kochi-local-duty", ["local-sedan", "local-muv", "local-van", "local-coach"]) },
  { id: "rc-jaipur-local", ref: "RC-JAIPUR-LOCAL", name: "Jaipur local sightseeing tariff", vendorId: "jaipur-local-cabs", vendorName: "Jaipur Local Cabs", serviceId: "jaipur-local-duty", serviceName: "Jaipur local sightseeing", tariff: cityLocal("jaipur-local-cabs", "jaipur-local-duty", "jaipur-muv", "Jaipur") },
  { id: "rc-bengaluru-local", ref: "RC-BENGALURU-LOCAL", name: "Bengaluru local sightseeing tariff", vendorId: "bengaluru-city-rides", vendorName: "Bengaluru City Rides", serviceId: "bengaluru-local-duty", serviceName: "Bengaluru local sightseeing", tariff: cityLocal("bengaluru-city-rides", "bengaluru-local-duty", "bengaluru-muv", "Bengaluru") },
  { id: "rc-road-trips", ref: "RC-ROAD-KM", name: "Kerala outstation kilometre tariff", vendorId: "kerala-road-trips", vendorName: "Kerala Road Trips", serviceId: "kerala-road-hire", serviceName: "Kerala outstation transport", tariff: outstation("kerala-road-trips", "kerala-road-hire", ["road-sedan", "road-muv", "road-van", "road-coach"]) },
  { id: "rc-south-coast", ref: "RC-COAST-DAILY", name: "South India coach day hire", vendorId: "south-coast-coaches", vendorName: "South Coast Coaches", serviceId: "south-coast-daily", serviceName: "Van and coach daily hire", tariff: daily("south-coast-coaches", "south-coast-daily", ["coast-van", "coast-coach"]) },
  { id: "rc-trail-fixed", ref: "RC-TRAIL-FIXED", name: "Kochi fixed-transfer tariff", vendorId: "trailmakers", vendorName: "Trailmakers Experiences", serviceId: "trail-fixed", serviceName: "Kochi fixed transfers", tariff: trailFixed() },
  { id: "rc-trail-local", ref: "RC-TRAIL-LOCAL", name: "Kochi local-package tariff", vendorId: "trailmakers", vendorName: "Trailmakers Experiences", serviceId: "trail-local", serviceName: "Kochi local sightseeing", tariff: local("trailmakers", "trail-local", ["trail-sedan", "trail-muv", "trail-van", "trail-coach"]) },
  { id: "rc-trail-km", ref: "RC-TRAIL-KM", name: "Kerala outstation per-km tariff", vendorId: "trailmakers", vendorName: "Trailmakers Experiences", serviceId: "trail-outstation", serviceName: "Kerala outstation transport", tariff: outstation("trailmakers", "trail-outstation", ["trail-sedan", "trail-muv", "trail-van", "trail-coach"]) },
  { id: "rc-trail-daily", ref: "RC-TRAIL-DAILY", name: "Kerala daily-hire tariff", vendorId: "trailmakers", vendorName: "Trailmakers Experiences", serviceId: "trail-daily", serviceName: "Kerala daily vehicle hire", tariff: daily("trailmakers", "trail-daily", ["trail-sedan", "trail-muv", "trail-van", "trail-coach"]) },
];
