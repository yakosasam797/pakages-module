import { useMemo, useState } from "react";
import type { DirectoryService, VendorServiceConnection } from "../data/vendorDirectory";
import type { Vendor } from "../data/vendors";
import {
  IconCalendar,
  IconCard,
  IconCheck,
  IconClose,
  IconPlus,
  IconUser,
} from "../icons";
import "./ServiceTestRate.css";

type ChildInput = {
  id: number;
  age: number;
  bed: "extra" | "none" | "existing" | "cot";
};

type VendorQuote = {
  connection: VendorServiceConnection;
  vendor: Vendor;
  total: number;
};

const ROOM_TYPES = [
  { id: "garden", label: "Garden View", base: 6900 },
  { id: "sea", label: "Sea View", base: 8600 },
  { id: "suite", label: "Luxury Suite", base: 11800 },
] as const;

const MEAL_PLANS = [
  { id: "ep", code: "EP", label: "Room only", add: 0 },
  { id: "cp", code: "CP", label: "With breakfast", add: 300 },
  { id: "map", code: "MAP", label: "Breakfast and dinner", add: 1400 },
  { id: "ap", code: "AP", label: "All meals", add: 2300 },
] as const;

const SUPPLIER_RATE_ADJUSTMENT: Record<VendorServiceConnection["supplierType"], number> = {
  "Direct supplier": -160,
  DMC: 420,
  Wholesaler: 210,
};

function stableRateOffset(id: string) {
  return (Array.from(id).reduce((total, character) => total + character.charCodeAt(0), 0) % 5) * 90;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function positiveInteger(value: string, fallback: number, max = 12) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(1, parsed)) : fallback;
}

function addDays(date: Date, count: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + count);
  return result;
}

export function ServiceTestRate({
  service,
  connections,
  vendors,
}: {
  service: DirectoryService;
  connections: VendorServiceConnection[];
  vendors: Vendor[];
}) {
  const [checkIn, setCheckIn] = useState("2026-10-12");
  const [nights, setNights] = useState(3);
  const [roomTypeId, setRoomTypeId] = useState<(typeof ROOM_TYPES)[number]["id"]>("garden");
  const [mealPlanId, setMealPlanId] = useState<(typeof MEAL_PLANS)[number]["id"]>("cp");
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [children, setChildren] = useState<ChildInput[]>([{ id: 1, age: 8, bed: "none" }]);

  const roomType = ROOM_TYPES.find((room) => room.id === roomTypeId) ?? ROOM_TYPES[0];
  const mealPlan = MEAL_PLANS.find((meal) => meal.id === mealPlanId) ?? MEAL_PLANS[1];

  const quotes = useMemo<VendorQuote[]>(() => {
    const startDate = new Date(`${checkIn}T12:00:00`);
    const includedAdults = rooms * 2;
    const extraAdults = Math.max(0, adults - includedAdults);

    return connections
      .map((connection) => {
        const vendor = vendors.find((item) => item.id === connection.vendorId);
        if (!vendor) return null;

        const supplierAdjustment =
          SUPPLIER_RATE_ADJUSTMENT[connection.supplierType] + stableRateOffset(connection.id);
        const childPerNight = children.reduce((total, child) => {
          if (child.age <= 1) return total + (child.bed === "cot" ? 350 : 0);
          if (child.age <= 5) return total + (child.bed === "extra" ? 900 : 0);
          return total + (child.bed === "extra" ? 1600 : child.bed === "none" ? 900 : 650);
        }, 0);
        const guestPerNight = extraAdults * 2200 + childPerNight;

        const roomTotal = Array.from({ length: nights }, (_, index) => {
          const date = addDays(startDate, index);
          const weekend = date.getDay() === 0 || date.getDay() === 6;
          return (roomType.base + mealPlan.add + supplierAdjustment + (weekend ? 550 : 0)) * rooms;
        }).reduce((total, amount) => total + amount, 0);
        const guestTotal = guestPerNight * nights;
        return {
          connection,
          vendor,
          total: roomTotal + guestTotal,
        } satisfies VendorQuote;
      })
      .filter((quote): quote is VendorQuote => Boolean(quote));
  }, [adults, checkIn, children, connections, mealPlan.add, nights, roomType.base, rooms, vendors]);

  const updateChild = (id: number, patch: Partial<ChildInput>) => {
    setChildren((current) => current.map((child) => (child.id === id ? { ...child, ...patch } : child)));
  };

  const reset = () => {
    setCheckIn("2026-10-12");
    setNights(3);
    setRoomTypeId("garden");
    setMealPlanId("cp");
    setAdults(2);
    setRooms(1);
    setChildren([{ id: 1, age: 8, bed: "none" }]);
  };

  return (
    <div className="service-test-rate">
      <section className="service-test-rate__inputs" aria-label={`Test price inputs for ${service.name}`}>
        <div className="service-test-rate__fields">
          <label className="service-test-rate__field">
            <span>Check-in</span>
            <span className="service-test-rate__control-icon">
              <IconCalendar size={15} />
              <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
            </span>
          </label>
          <label className="service-test-rate__field">
            <span>Nights</span>
            <input
              type="number"
              min="1"
              max="12"
              inputMode="numeric"
              value={nights}
              onChange={(event) => setNights(positiveInteger(event.target.value, 1))}
            />
          </label>
          <label className="service-test-rate__field">
            <span>Room type</span>
            <select value={roomTypeId} onChange={(event) => setRoomTypeId(event.target.value as typeof roomTypeId)}>
              {ROOM_TYPES.map((room) => <option key={room.id} value={room.id}>{room.label}</option>)}
            </select>
          </label>
          <label className="service-test-rate__field">
            <span>Meal plan</span>
            <select value={mealPlanId} onChange={(event) => setMealPlanId(event.target.value as typeof mealPlanId)}>
              {MEAL_PLANS.map((meal) => <option key={meal.id} value={meal.id}>{meal.code} — {meal.label}</option>)}
            </select>
          </label>
        </div>

        <div className="service-test-rate__travellers">
          <div className="service-test-rate__traveller-head">
            <div>
              <span>Travellers</span>
              <strong><IconUser size={14} />{adults} adults · {children.length} {children.length === 1 ? "child" : "children"} · {rooms} room{rooms === 1 ? "" : "s"}</strong>
            </div>
          </div>

          <div className="service-test-rate__fields service-test-rate__fields--travellers">
            <label className="service-test-rate__field">
              <span>Adults</span>
              <select value={adults} onChange={(event) => setAdults(Number(event.target.value))}>
                {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="service-test-rate__field">
              <span>Rooms</span>
              <select value={rooms} onChange={(event) => setRooms(Number(event.target.value))}>
                {Array.from({ length: 4 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>

          <div className="service-test-rate__children">
            {children.map((child, index) => (
              <div className="service-test-rate__child" key={child.id}>
                <span className="service-test-rate__child-label">Child {index + 1}</span>
                <select aria-label={`Child ${index + 1} age`} value={child.age} onChange={(event) => updateChild(child.id, { age: Number(event.target.value) })}>
                  {Array.from({ length: 12 }, (_, age) => age + 1).map((age) => <option key={age} value={age}>{age} yrs</option>)}
                </select>
                <select aria-label={`Child ${index + 1} bed`} value={child.bed} onChange={(event) => updateChild(child.id, { bed: event.target.value as ChildInput["bed"] })}>
                  <option value="extra">With extra bed</option>
                  <option value="none">No extra bed</option>
                  <option value="existing">Existing bed</option>
                  <option value="cot">Cot</option>
                </select>
                <button type="button" aria-label={`Remove child ${index + 1}`} onClick={() => setChildren((current) => current.filter((item) => item.id !== child.id))}>
                  <IconClose size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="service-test-rate__add-child"
              onClick={() => setChildren((current) => [...current, { id: Date.now(), age: 8, bed: "none" }])}
            >
              <IconPlus size={14} />Add child
            </button>
          </div>
        </div>

        <div className="service-test-rate__basis">
          <button type="button" onClick={reset}>Reset to defaults</button>
          <p><IconCheck size={13} />Prices use the selected service, room, meal, occupancy and each night of the stay.</p>
        </div>
      </section>

      <section className="service-test-rate__results" aria-label={`Vendor price comparison for ${service.name}`}>
        {quotes.length ? (
          <div className="service-test-rate__quote-picker" role="list" aria-label="Vendor prices">
            {quotes.map((quote) => (
              <div key={quote.connection.id} role="listitem">
                <span className="service-test-rate__avatar" aria-hidden="true">{quote.vendor.initials}</span>
                <span className="service-test-rate__quote-name">
                  <strong>{quote.vendor.name}</strong>
                  <span>{quote.connection.supplierType} · {quote.connection.rateCardName}</span>
                </span>
                <strong className="service-test-rate__quote-price">{currency(quote.total)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="service-test-rate__empty">
            <IconCard size={20} />
            <strong>No vendor pricing available</strong>
            <span>Link a current vendor price before testing this service.</span>
          </div>
        )}
      </section>
    </div>
  );
}
