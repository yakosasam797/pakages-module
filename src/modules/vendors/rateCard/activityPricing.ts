export type ActivityMethod = "person" | "booking" | "unit";
export type ActivityRateState = "priced" | "complimentary" | "on-request" | "missing" | "not-offered";
export type ActivityChargeTreatment = "included" | "additional" | "actuals" | "not-applicable" | "not-provided";

export interface ActivityOption {
  id: string;
  name: string;
  category: "Admission" | "Guided tour" | "Class/workshop" | "Cruise" | "Adventure" | "Rental";
  delivery: "shared" | "private" | "either";
  duration: string;
  capacity: number | null;
  session: string;
  minAge?: number | null;
  maxAge?: number | null;
  minParticipants?: number | null;
  sessions?: string[];
  availableSessions?: Array<{ date: string; session: string }>;
  unavailableSessions?: Array<{ date: string; session: string }>;
  includedComponents?: Array<"Transport" | "Admission" | "Meal" | "Equipment">;
  excludedComponents?: Array<"Transport" | "Admission" | "Meal" | "Equipment">;
}

interface BaseRate {
  id: string;
  optionId: string;
  state: ActivityRateState;
  amount: number | null;
}

export interface PersonRate extends BaseRate {
  category: string;
  minAge: number | null;
  maxAge: number | null;
  minGroup: number | null;
  maxGroup: number | null;
  minimumBill?: number | null;
}

export interface BookingRate extends BaseRate {
  minGroup: number;
  maxGroup: number;
  basisLabel: "Per booking" | "Per group";
}

export interface UnitRate extends BaseRate {
  unit: string;
  basis: "session" | "hour" | "day";
  duration: number | null;
  capacityPerUnit: number | null;
}

export interface ActivityCharge {
  id: string;
  name: string;
  optionIds: string[];
  allOptions?: boolean;
  participantCategory?: string;
  minAge?: number | null;
  maxAge?: number | null;
  capacity?: number | null;
  from?: string;
  to?: string;
  treatment: ActivityChargeTreatment;
  mandatory: boolean;
  basis: "booking" | "person" | "unit" | "hour";
  amount: number | null;
  taxProfileId: string | null;
  approvedTaxRate?: number | null;
  taxApprovalSource?: string;
}

export interface ActivityDateAdjustment {
  id: string;
  name: string;
  optionIds: string[];
  from: string;
  to: string;
  treatment: "replacement" | "additional" | "unavailable";
  amount: number | null;
  stacking: "combine" | "replace";
  personRateId?: string;
  bookingRateId?: string;
  unitRateId?: string;
}

export interface ActivityTariff {
  schemaVersion: 1;
  vendorId: string;
  serviceId: string;
  version: number;
  validFrom: string;
  validTo: string;
  sourceDocument: string;
  sourceConfirmed: boolean;
  methods: ActivityMethod[];
  personRates: PersonRate[];
  bookingRates: BookingRate[];
  unitRates: UnitRate[];
  charges: ActivityCharge[];
  adjustments: ActivityDateAdjustment[];
  minimumCharges?: Array<{ optionId: string; amount: number }>;
  taxMode: "inclusive" | "exclusive";
  taxProfileId: string | null;
  /** Resolved only from a separately approved supplier tax profile. */
  approvedTaxRate: number | null;
  taxApprovalSource?: string;
  commercialPolicy: string;
}

export interface ActivityQuoteInput {
  date: string;
  optionId: string;
  method: ActivityMethod;
  participants: Array<{ category: string; age: number | null; quantity: number }>;
  groupSize: number;
  unitRateId: string;
  unitQuantity: number;
  unitSelections?: Array<{ rateId: string; quantity: number; hours?: number; days?: number }>;
  session?: string;
  supplierAvailabilityConfirmed?: boolean;
  hours: number;
  days: number;
  selectedChargeIds: string[];
  transferCostedElsewhere: boolean;
  separateTransportConfirmed?: boolean;
  externalRequirementServiceIds?: Record<string, string>;
  confirmedOnRequestAmount?: number | null;
  confirmedOnRequestSource?: string;
  confirmedOnRequestValidUntil?: string;
  quoteAsOfDate?: string;
  confirmedOnRequestRates?: Record<string, { amount: number | null; source: string; validUntil?: string }>;
}

export interface ActivityQuoteLine { label: string; detail: string; amount: number | null; }
export interface ActivityQuoteResult {
  cardVersion: number;
  base: number | null;
  extras: number;
  tax: number | null;
  supplierTotal: number | null;
  lines: ActivityQuoteLine[];
  blockers: string[];
  actuals: string[];
  availability: "available" | "unavailable" | "unconfirmed";
  availabilityMessage: string;
  includedComponents: string[];
  externalRequirements: string[];
}

const spansOverlap = (aMin: number, aMax: number, bMin: number, bMax: number) => aMin <= bMax && bMin <= aMax;
const lower = (value: number | null) => value ?? 0;
const upper = (value: number | null) => value ?? Infinity;

export function applicableOnRequestRows(tariff: ActivityTariff, input: ActivityQuoteInput): Array<PersonRate | BookingRate | UnitRate> {
  if (input.method === "person") {
    const count = input.participants.reduce((sum, item) => sum + item.quantity, 0);
    return tariff.personRates.filter((rate) => rate.state === "on-request" && rate.optionId === input.optionId && input.participants.some((participant) => participant.quantity > 0 && participant.category === rate.category && (rate.minAge == null || participant.age != null && participant.age >= rate.minAge) && (rate.maxAge == null || participant.age != null && participant.age <= rate.maxAge) && (rate.minGroup == null || count >= rate.minGroup) && (rate.maxGroup == null || count <= rate.maxGroup)));
  }
  if (input.method === "booking") return tariff.bookingRates.filter((rate) => rate.state === "on-request" && rate.optionId === input.optionId && input.groupSize >= rate.minGroup && input.groupSize <= rate.maxGroup);
  const selected = new Set(input.unitSelections?.length ? input.unitSelections.map((item) => item.rateId) : [input.unitRateId]);
  return tariff.unitRates.filter((rate) => rate.state === "on-request" && rate.optionId === input.optionId && selected.has(rate.id));
}

export function validateActivityTariff(tariff: ActivityTariff, options: ActivityOption[], offeredServiceIds?: string[]): string[] {
  const errors: string[] = [];
  if (!tariff.vendorId || !tariff.serviceId) errors.push("Link a vendor and its offered activity.");
  if (offeredServiceIds && !offeredServiceIds.includes(tariff.serviceId)) errors.push("This activity is not offered by the selected supplier.");
  if (!tariff.validFrom || !tariff.validTo || tariff.validFrom > tariff.validTo) errors.push("Enter a valid date range.");
  if (!tariff.methods.length) errors.push("Select at least one pricing method.");
  if (tariff.sourceConfirmed && !tariff.sourceDocument.trim()) errors.push("Record the supplier tariff source before confirming prices.");
  const optionIds = new Set(options.map((option) => option.id));
  for (const method of tariff.methods) {
    const rates = method === "person" ? tariff.personRates : method === "booking" ? tariff.bookingRates : tariff.unitRates;
    if (!rates.length) errors.push(`Add at least one ${method === "person" ? "per-person" : method === "booking" ? "per-booking/group" : "per-unit"} rate, or remove that pricing method.`);
  }
  for (const rate of [...tariff.personRates, ...tariff.bookingRates, ...tariff.unitRates]) {
    if (!optionIds.has(rate.optionId)) errors.push(`Rate ${rate.id} references an unavailable service option.`);
    if (rate.state === "priced" && (rate.amount == null || !Number.isFinite(rate.amount) || rate.amount <= 0)) errors.push(`Enter a positive supplier amount for rate ${rate.id}; use Complimentary for a confirmed free rate.`);
    if (rate.state === "complimentary" && rate.amount !== 0) errors.push(`Confirm a zero amount for complimentary rate ${rate.id}.`);
  }
  for (const row of tariff.personRates) {
    if (row.category === "Everyone" && (row.minAge != null || row.maxAge != null)) errors.push(`Rate ${row.id}: Everyone applies to all ages.`);
    if (row.minAge != null && (row.minAge < 0 || row.maxAge != null && row.minAge > row.maxAge)) errors.push(`${row.category}: enter a valid age range.`);
    if (row.minGroup != null && (row.minGroup < 1 || row.maxGroup != null && row.minGroup > row.maxGroup)) errors.push(`${row.category}: enter a valid group-size tier.`);
  }
  for (const row of tariff.bookingRates) if (row.minGroup < 1 || row.minGroup > row.maxGroup) errors.push(`Rate ${row.id}: enter a valid supported group size.`);
  for (const row of tariff.unitRates) if (!row.unit.trim() || row.capacityPerUnit != null && row.capacityPerUnit < 1 || row.basis === "session" && (row.duration == null || row.duration <= 0)) errors.push(`Rate ${row.id}: enter a unit, session duration and valid capacity.`);
  for (const option of options) {
    if (option.includedComponents?.some((item) => option.excludedComponents?.includes(item))) errors.push(`${option.name}: a component cannot be both included and excluded.`);
    if (option.minAge != null && (option.minAge < 0 || option.maxAge != null && option.minAge > option.maxAge)) errors.push(`${option.name}: enter a valid eligibility age range.`);
    if (option.minParticipants != null && (option.minParticipants < 1 || option.capacity != null && option.minParticipants > option.capacity)) errors.push(`${option.name}: minimum participants exceed valid capacity.`);
    if (option.sessions && new Set(option.sessions).size !== option.sessions.length) errors.push(`${option.name}: session times must be unique.`);
    if (option.availableSessions?.some((available) => option.unavailableSessions?.some((unavailable) => available.date === unavailable.date && available.session === unavailable.session))) errors.push(`${option.name}: a session cannot be both available and unavailable.`);
    const people = tariff.personRates.filter((row) => row.optionId === option.id);
    if (people.some((row) => row.category === "Everyone") && people.some((row) => row.category !== "Everyone")) errors.push(`${option.name}: Everyone cannot overlap named participant categories.`);
    for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) {
      const a = people[i], b = people[j];
      if (spansOverlap(lower(a.minAge), upper(a.maxAge), lower(b.minAge), upper(b.maxAge)) && spansOverlap(lower(a.minGroup), upper(a.maxGroup), lower(b.minGroup), upper(b.maxGroup))) errors.push(`${option.name}: participant age or group-size bands overlap.`);
    }
    const groups = tariff.bookingRates.filter((row) => row.optionId === option.id);
    for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) {
      if (spansOverlap(groups[i].minGroup, groups[i].maxGroup, groups[j].minGroup, groups[j].maxGroup)) errors.push(`${option.name}: group-size bands overlap.`);
    }
    const units = tariff.unitRates.filter((row) => row.optionId === option.id);
    for (let i = 0; i < units.length; i++) for (let j = i + 1; j < units.length; j++) if (units[i].unit.trim().toLowerCase() === units[j].unit.trim().toLowerCase() && units[i].basis === units[j].basis && units[i].duration === units[j].duration) errors.push(`${option.name}: duplicate unit tariffs for ${units[i].unit}.`);
  }
  for (const charge of tariff.charges) {
    if (!charge.name.trim()) errors.push("Name every additional charge or inclusion.");
    if (charge.treatment === "additional" && (charge.amount == null || !Number.isFinite(charge.amount) || charge.amount < 0)) errors.push(`${charge.name}: enter an additional-charge amount.`);
    if (charge.optionIds.some((id) => !optionIds.has(id))) errors.push(`${charge.name}: select a valid service option.`);
    if (!charge.allOptions && !charge.optionIds.length) errors.push(`${charge.name}: select service options or explicitly select all options.`);
    if (charge.allOptions && charge.optionIds.length) errors.push(`${charge.name}: choose all options or selected options, not both.`);
    if (charge.capacity != null && charge.capacity < 1) errors.push(`${charge.name}: enter a valid capacity.`);
    if ((charge.from || charge.to) && (!charge.from || !charge.to || charge.from > charge.to)) errors.push(`${charge.name}: enter a valid charge date range.`);
    if (charge.minAge != null && charge.maxAge != null && charge.minAge > charge.maxAge) errors.push(`${charge.name}: enter a valid age range.`);
    if ((charge.participantCategory || charge.minAge != null || charge.maxAge != null) && charge.basis !== "person") errors.push(`${charge.name}: participant conditions require a per-person charging basis.`);
    if (charge.treatment === "additional" && charge.taxProfileId && charge.taxProfileId !== tariff.taxProfileId && (charge.approvedTaxRate == null || !charge.taxApprovalSource?.trim())) errors.push(`${charge.name}: record the approved tax exception rate and source.`);
  }
  for (const minimum of tariff.minimumCharges ?? []) {
    if (!optionIds.has(minimum.optionId) || !Number.isFinite(minimum.amount) || minimum.amount <= 0) errors.push("Enter a positive supplier minimum bill for a linked option.");
    if (!options.find((option) => option.id === minimum.optionId)?.minParticipants) errors.push("Set the option's minimum participation before entering a minimum bill.");
  }
  if (new Set((tariff.minimumCharges ?? []).map((item) => item.optionId)).size !== (tariff.minimumCharges ?? []).length) errors.push("Use one minimum-bill rule per option.");
  for (let i = 0; i < tariff.charges.length; i++) for (let j = i + 1; j < tariff.charges.length; j++) {
    const a = tariff.charges[i], b = tariff.charges[j];
    const sharedScope = a.allOptions || b.allOptions || a.optionIds.some((id) => b.optionIds.includes(id));
    if (a.name.trim().toLowerCase() === b.name.trim().toLowerCase() && sharedScope && a.treatment !== b.treatment) errors.push(`${a.name}: conflicting charge treatments apply to the same option.`);
  }
  for (const rule of tariff.adjustments) {
    if (rule.optionIds.some((id) => !optionIds.has(id))) errors.push(`${rule.name}: select a valid service option.`);
    if (!rule.from || !rule.to || rule.from > rule.to) errors.push(`${rule.name}: enter a valid date range.`);
    if (rule.treatment !== "unavailable" && (rule.amount == null || rule.amount < 0)) errors.push(`${rule.name}: enter an adjustment amount.`);
    if (rule.personRateId && !tariff.personRates.some((rate) => rate.id === rule.personRateId && (rule.optionIds.length === 0 || rule.optionIds.includes(rate.optionId)))) errors.push(`${rule.name}: select a person rate from the affected option.`);
    if (rule.bookingRateId && !tariff.bookingRates.some((rate) => rate.id === rule.bookingRateId && (rule.optionIds.length === 0 || rule.optionIds.includes(rate.optionId)))) errors.push(`${rule.name}: select a group rate from the affected option.`);
    if (rule.unitRateId && !tariff.unitRates.some((rate) => rate.id === rule.unitRateId && (rule.optionIds.length === 0 || rule.optionIds.includes(rate.optionId)))) errors.push(`${rule.name}: select a unit rate from the affected option.`);
    if (rule.treatment === "replacement" && [rule.personRateId, rule.bookingRateId, rule.unitRateId].filter(Boolean).length !== 1) errors.push(`${rule.name}: select exactly one base-rate row this price replaces.`);
  }
  if (tariff.approvedTaxRate != null && (!Number.isFinite(tariff.approvedTaxRate) || tariff.approvedTaxRate < 0 || tariff.approvedTaxRate > 1)) errors.push("Use the approved supplier tax profile's valid rate.");
  if ((tariff.taxProfileId || tariff.approvedTaxRate != null) && !tariff.taxApprovalSource?.trim()) errors.push("Record the approval source for this supplier tax profile.");
  for (let i = 0; i < tariff.adjustments.length; i++) for (let j = i + 1; j < tariff.adjustments.length; j++) {
    const a = tariff.adjustments[i], b = tariff.adjustments[j];
    const sameOptions = a.optionIds.length === 0 || b.optionIds.length === 0 || a.optionIds.some((id) => b.optionIds.includes(id));
    const aTarget = a.personRateId || a.bookingRateId || a.unitRateId;
    const bTarget = b.personRateId || b.bookingRateId || b.unitRateId;
    const sameTarget = !aTarget || !bTarget || aTarget === bTarget;
    if (sameOptions && sameTarget && a.from <= b.to && b.from <= a.to && (a.treatment === "unavailable" || b.treatment === "unavailable" || a.treatment === "replacement" && b.treatment === "replacement" || a.treatment === "additional" && b.treatment === "additional" && (a.stacking !== "combine" || b.stacking !== "combine"))) errors.push(`${a.name} and ${b.name}: overlapping date rules need an explicit combination.`);
  }
  return [...new Set(errors)];
}

export function calculateActivityQuote(tariff: ActivityTariff, options: ActivityOption[], input: ActivityQuoteInput): ActivityQuoteResult {
  const blockers: string[] = [];
  const lines: ActivityQuoteLine[] = [];
  const actuals: string[] = [];
  const option = options.find((item) => item.id === input.optionId);
  const selectedSession = input.session || (option?.sessions?.length ? "" : option?.session || "");
  const sessionListed = !option?.sessions?.length || option.sessions.includes(selectedSession);
  const sessionSoldOut = !!option?.unavailableSessions?.some((item) => item.date === input.date && item.session === selectedSession);
  const sessionAvailable = !!option?.availableSessions?.some((item) => item.date === input.date && item.session === selectedSession);
  const availability: ActivityQuoteResult["availability"] = !selectedSession ? "unconfirmed" : !sessionListed || sessionSoldOut ? "unavailable" : sessionAvailable || input.supplierAvailabilityConfirmed ? "available" : "unconfirmed";
  const availabilityMessage = !selectedSession ? "Select a session before confirming availability." : !sessionListed ? "The requested session is not offered; select an available session explicitly." : sessionSoldOut ? "The requested session is sold out. The price is only an estimate; select another session explicitly." : availability === "available" ? "Supplier availability is confirmed for this date and session." : "The price is an estimate until the supplier confirms this date and session.";
  if (!option) blockers.push("Select a service option linked to this activity.");
  if (option?.includedComponents?.some((item) => option.excludedComponents?.includes(item))) blockers.push(`${option.name}: the same component cannot be both included and excluded.`);
  if (!input.date || input.date < tariff.validFrom || input.date > tariff.validTo) blockers.push("Service date is outside this rate card's validity.");
  if (!tariff.methods.includes(input.method)) blockers.push("This pricing method is not configured for the offering.");
  if (!tariff.sourceConfirmed) blockers.push("Supplier rates have not been confirmed.");
  if (tariff.sourceConfirmed && !tariff.sourceDocument.trim()) blockers.push("Record the supplier tariff source.");
  if (input.participants.some((item) => !Number.isInteger(item.quantity) || item.quantity < 0 || item.age != null && (!Number.isInteger(item.age) || item.age < 0))) blockers.push("Enter valid participant quantities and ages.");
  if (!Number.isInteger(input.groupSize) || input.groupSize < 0) blockers.push("Enter a valid group size.");
  const participants = input.participants.filter((item) => item.quantity > 0);
  const count = input.method === "person" ? participants.reduce((sum, item) => sum + item.quantity, 0) : input.groupSize;
  const scopedPersonCharges = tariff.charges.filter((charge) => (charge.allOptions || charge.optionIds.includes(input.optionId)) && charge.basis === "person" && charge.treatment === "additional" && (charge.mandatory || input.selectedChargeIds.includes(charge.id)) && (!charge.from || input.date >= charge.from) && (!charge.to || input.date <= charge.to));
  if (input.method !== "person" && (scopedPersonCharges.length || option?.minAge != null || option?.maxAge != null) && participants.reduce((sum, item) => sum + item.quantity, 0) !== count) blockers.push("Enter participant categories for every traveller so eligibility and person-specific charges can be checked.");
  if (option?.minAge != null && participants.some((item) => item.age == null || item.age < option.minAge!)) blockers.push(`${option.name}: participants must be at least ${option.minAge} years old.`);
  if (option?.maxAge != null && participants.some((item) => item.age == null || item.age > option.maxAge!)) blockers.push(`${option.name}: participants must be no older than ${option.maxAge} years.`);
  if (option?.minParticipants != null && count < option.minParticipants && !tariff.minimumCharges?.some((item) => item.optionId === input.optionId)) blockers.push(`${option.name} requires at least ${option.minParticipants} participants; no minimum-charge arrangement is saved.`);
  if (option?.capacity != null && count > option.capacity && input.method !== "unit") blockers.push(`Group exceeds ${option.name}'s capacity of ${option.capacity}.`);
  let base: number | null = 0;
  const onRequestRows = applicableOnRequestRows(tariff, input);
  const resolve = (state: ActivityRateState, amount: number | null, label: string, rateId: string): number | null => {
    if (state === "complimentary") return 0;
    const confirmed = input.confirmedOnRequestRates?.[rateId] ?? (onRequestRows.length === 1 ? { amount: input.confirmedOnRequestAmount ?? null, source: input.confirmedOnRequestSource ?? "", validUntil: input.confirmedOnRequestValidUntil } : null);
    const asOfDate = input.quoteAsOfDate || new Date().toISOString().slice(0, 10);
    if (state === "on-request" && confirmed?.amount != null && Number.isFinite(confirmed.amount) && confirmed.amount >= 0 && confirmed.source.trim() && confirmed.validUntil && asOfDate <= confirmed.validUntil) return confirmed.amount;
    if (state === "on-request" && confirmed?.validUntil && asOfDate > confirmed.validUntil) blockers.push(`${label}: supplier quote expired before this proposal was priced.`);
    if (state === "on-request") blockers.push(`${label} is on request. Record the confirmed amount and source on this proposal.`);
    else if (state === "not-offered") blockers.push(`${label} is not offered by this supplier.`);
    else if (state === "missing") blockers.push(`${label} has no saved supplier price.`);
    else if (amount == null) blockers.push(`${label} has no saved supplier amount.`);
    return state === "priced" ? amount : null;
  };
  if (input.method === "person") {
    if (!participants.length) blockers.push("Enter participant quantities.");
    for (const participant of participants) {
      const matches = tariff.personRates.filter((rate) => rate.optionId === input.optionId && rate.category === participant.category && (rate.minAge == null || participant.age != null && participant.age >= rate.minAge) && (rate.maxAge == null || participant.age != null && participant.age <= rate.maxAge) && (rate.minGroup == null || count >= rate.minGroup) && (rate.maxGroup == null || count <= rate.maxGroup));
      if (matches.length !== 1) { blockers.push(`${participant.category}: ${matches.length ? "overlapping" : "no applicable"} rate for this party.`); base = null; continue; }
      const replacements = tariff.adjustments.filter((rule) => rule.treatment === "replacement" && rule.personRateId === matches[0].id && input.date >= rule.from && input.date <= rule.to && (rule.optionIds.length === 0 || rule.optionIds.includes(input.optionId)));
      if (replacements.length > 1) blockers.push(`${participant.category}: overlapping replacement prices need review.`);
      const unitAmount = replacements.length === 1 ? replacements[0].amount : resolve(matches[0].state, matches[0].amount, participant.category, matches[0].id);
      const amount = unitAmount == null ? null : unitAmount * participant.quantity;
      lines.push({ label: participant.category, detail: `${participant.quantity} × ${unitAmount ?? "unresolved"}${replacements.length === 1 ? ` · ${replacements[0].name}` : ""}`, amount });
      if (amount == null) base = null; else if (base != null) base += amount;
    }
  } else if (input.method === "booking") {
    if (input.groupSize < 1) blockers.push("Enter a group size.");
    const matches = tariff.bookingRates.filter((rate) => rate.optionId === input.optionId && input.groupSize >= rate.minGroup && input.groupSize <= rate.maxGroup);
    if (matches.length !== 1) { blockers.push(matches.length ? "Overlapping group-size fares." : "Group size exceeds or falls outside the supported fare band. Do not split it automatically."); base = null; }
    else { const rate = matches[0]; const replacements = tariff.adjustments.filter((rule) => rule.treatment === "replacement" && rule.bookingRateId === rate.id && input.date >= rule.from && input.date <= rule.to && (rule.optionIds.length === 0 || rule.optionIds.includes(input.optionId))); if (replacements.length > 1) blockers.push("Overlapping group replacement prices need review."); base = replacements.length === 1 ? replacements[0].amount : resolve(rate.state, rate.amount, rate.basisLabel, rate.id); lines.push({ label: rate.basisLabel, detail: `${rate.minGroup}–${rate.maxGroup} people · charged once${replacements.length === 1 ? ` · ${replacements[0].name}` : ""}`, amount: base }); }
  } else {
    const selections = input.unitSelections?.length ? input.unitSelections : [{ rateId: input.unitRateId, quantity: input.unitQuantity, hours: input.hours, days: input.days }];
    if (new Set(selections.map((item) => item.rateId)).size !== selections.length) blockers.push("Combine repeated unit types into one quantity row.");
    let capacity = 0;
    let hasUnitCapacity = false;
    if (!selections.length) { blockers.push("Select at least one unit tariff."); base = null; }
    for (const selection of selections) {
      const rate = tariff.unitRates.find((item) => item.id === selection.rateId && item.optionId === input.optionId);
      if (!rate) { blockers.push("Select a unit tariff for this option."); base = null; continue; }
      if (!Number.isInteger(selection.quantity) || selection.quantity < 1) blockers.push(`Enter the number of ${rate.unit} units required.`);
      if (rate.capacityPerUnit != null) hasUnitCapacity = true;
      capacity += (rate.capacityPerUnit ?? 0) * selection.quantity;
      const factor = rate.basis === "hour" ? selection.hours ?? input.hours : rate.basis === "day" ? selection.days ?? input.days : 1;
      if (!Number.isFinite(factor) || factor <= 0) blockers.push(`Enter chargeable ${rate.basis === "hour" ? "hours" : "days"} for ${rate.unit}.`);
      const replacements = tariff.adjustments.filter((rule) => rule.treatment === "replacement" && rule.unitRateId === rate.id && input.date >= rule.from && input.date <= rule.to && (rule.optionIds.length === 0 || rule.optionIds.includes(input.optionId)));
      if (replacements.length > 1) blockers.push(`${rate.unit}: overlapping replacement prices need review.`);
      const unitAmount = replacements.length === 1 ? replacements[0].amount : resolve(rate.state, rate.amount, rate.unit, rate.id);
      const amount = unitAmount == null ? null : unitAmount * selection.quantity * factor;
      if (amount == null) base = null; else if (base != null) base += amount;
      lines.push({ label: rate.unit, detail: `${selection.quantity} ${rate.unit}${selection.quantity === 1 ? "" : "s"} × ${rate.basis === "session" ? "one session" : `${factor} ${rate.basis}${factor === 1 ? "" : "s"}`}${replacements.length === 1 ? ` · ${replacements[0].name}` : ""}`, amount });
    }
    if (hasUnitCapacity && input.groupSize < 1) blockers.push("Enter the number of travellers so selected-unit capacity can be checked.");
    if (capacity && input.groupSize > capacity) blockers.push(`Selected units hold ${capacity} people; enter more units explicitly.`);
  }
  const rules = tariff.adjustments.filter((rule) => input.date >= rule.from && input.date <= rule.to && (rule.optionIds.length === 0 || rule.optionIds.includes(input.optionId)));
  if (rules.some((rule) => rule.treatment === "unavailable")) blockers.push("This option is unavailable on the selected date.");
  if (rules.length > 1 && rules.some((rule) => rule.stacking === "replace" && rule.treatment === "additional")) blockers.push("Overlapping date adjustments need review.");
  const minimum = tariff.minimumCharges?.find((item) => item.optionId === input.optionId);
  if (base != null && option?.minParticipants != null && count < option.minParticipants && minimum && minimum.amount > base) { lines.push({ label: "Supplier minimum bill", detail: `Minimum for fewer than ${option.minParticipants} participants`, amount: minimum.amount - base }); base = minimum.amount; }
  let extras = 0;
  let taxExceptionAmount = 0;
  let taxExceptionDue = 0;
  for (const rule of rules.filter((item) => item.treatment === "additional")) { if (rule.amount == null) blockers.push(`${rule.name} has no amount.`); else { extras += rule.amount; lines.push({ label: rule.name, detail: "Date surcharge", amount: rule.amount }); } }
  for (const charge of tariff.charges.filter((item) => (item.allOptions || item.optionIds.includes(input.optionId)) && (!item.from || input.date >= item.from) && (!item.to || input.date <= item.to))) {
    if (!charge.mandatory && !input.selectedChargeIds.includes(charge.id)) continue;
    if (charge.treatment === "included" || charge.treatment === "not-applicable") continue;
    if (charge.treatment === "actuals") { actuals.push(charge.name); continue; }
    if (charge.treatment === "not-provided") { blockers.push(`${charge.name} is not provided by this supplier.`); continue; }
    if (input.transferCostedElsewhere && /pickup|transfer/i.test(charge.name)) { blockers.push(`${charge.name} is already costed elsewhere in the itinerary.`); continue; }
    if (charge.amount == null) { blockers.push(`${charge.name} has no saved amount.`); continue; }
    if (charge.capacity != null && count > charge.capacity) { blockers.push(`${charge.name} supports at most ${charge.capacity} people.`); continue; }
    const matchingPeople = participants.filter((person) => (!charge.participantCategory || person.category === charge.participantCategory) && (charge.minAge == null || person.age != null && person.age >= charge.minAge) && (charge.maxAge == null || person.age != null && person.age <= charge.maxAge)).reduce((sum, person) => sum + person.quantity, 0);
    const multiplier = charge.basis === "person" ? matchingPeople : charge.basis === "unit" ? input.unitSelections?.reduce((sum, item) => sum + item.quantity, 0) ?? input.unitQuantity : charge.basis === "hour" ? input.hours : 1;
    const amount = charge.amount * multiplier;
    extras += amount;
    lines.push({ label: charge.name, detail: `${multiplier} × ${charge.participantCategory || charge.basis}`, amount });
    if (charge.taxProfileId && charge.taxProfileId !== tariff.taxProfileId) {
      taxExceptionAmount += amount;
      if (charge.approvedTaxRate == null || !Number.isFinite(charge.approvedTaxRate) || charge.approvedTaxRate < 0 || charge.approvedTaxRate > 1 || !charge.taxApprovalSource?.trim()) blockers.push(`${charge.name} needs an approved tax exception rate and source.`);
      else if (tariff.taxMode === "exclusive") taxExceptionDue += Math.round(amount * charge.approvedTaxRate);
    }
  }
  if (actuals.length) blockers.push("Actuals remain unresolved; this is base price plus actuals.");
  if (tariff.taxProfileId == null || tariff.approvedTaxRate == null || !tariff.taxApprovalSource?.trim()) blockers.push("Record an approved supplier tax profile, its rate and approval source before confirming the total.");
  const subtotal = base == null ? null : base + extras;
  const tax = subtotal != null && tariff.approvedTaxRate != null ? tariff.taxMode === "exclusive" ? Math.round((subtotal - taxExceptionAmount) * tariff.approvedTaxRate) + taxExceptionDue : 0 : null;
  return { cardVersion: tariff.version, base, extras, tax, supplierTotal: blockers.length || subtotal == null || tax == null ? null : subtotal + tax, lines, blockers: [...new Set(blockers)], actuals, availability, availabilityMessage, includedComponents: option?.includedComponents ?? [], externalRequirements: option?.excludedComponents ?? [] };
}

/** Accepted proposals/bookings store this value; master-card edits never mutate it. */
export function snapshotActivityQuote(tariff: ActivityTariff, input: ActivityQuoteInput, result: ActivityQuoteResult) {
  return structuredClone({ vendorId: tariff.vendorId, serviceId: tariff.serviceId, version: tariff.version, pricedAt: new Date().toISOString(), input, result });
}
