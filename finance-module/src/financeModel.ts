export type PageId = "overview" | "receivables" | "payables" | "transactions" | "expenses" | "bank" | "reports" | "controls";
export type Tone = "open" | "progress" | "blocked" | "done";
export type Kind = "customer" | "supplier" | "reimbursement";

// Values are integer paise. These fixtures describe one agency scope at 26 Sep 2026.
export type Obligation = {
  id: string; kind: Kind; party: string; booking: string; item: string;
  amount: number; applied: number; postedAt: string; due: string; document: string;
  documentState: string; owner: string; note: string;
};
export type MoneyRecord = {
  id: string; type: "Receipt" | "Supplier payment" | "Agency payment" | "Transfer" | "Refund";
  party: string; amount: number; direction: "in" | "out" | "neutral";
  occurredAt: string; recordedAt: string; recordedBy: string; account: string;
  linked: string; verification: string; allocation: string; bankMatch: string; externalReference: string;
};
export type Expense = {
  id: string; category: string; payee: string; scope: string; incurred: string;
  due: string; amount: number; review: string; payment: string; evidence: string; linkedPayment?: string;
};
export type ActivityEvent = {
  id: string; event: string; category: "Money" | "Verification" | "Allocation" | "Review" | "Bank match";
  occurredAt: string; recordedAt: string; actor: string; recordId: string;
  party: string; context: string; detail: string;
};

export const REVIEW_DATE = "2026-09-26";
export const OBLIGATIONS: Obligation[] = [
  { id: "COL-00031", kind: "customer", party: "XYZ Family", booking: "BK-2026-000003", item: "Final instalment · Dubai", amount: 12_000_000, applied: 4_000_000, postedAt: "2026-09-01", due: "2026-09-30", document: "INV-2026-0084", documentState: "Issued", owner: "Anjali Menon", note: "Accepted booking price ₹1,20,000. The verified ₹40,000 receipt is applied; ₹80,000 remains." },
  { id: "COL-00029", kind: "customer", party: "Kapoor Group", booking: "BK-2026-000018", item: "Second instalment · Alleppey", amount: 1_200_000, applied: 0, postedAt: "2026-09-15", due: "2026-09-24", document: "INV-2026-0079", documentState: "Issued", owner: "Nisha Rao", note: "An existing ₹12,000 receipt awaits verification. It does not settle this balance yet." },
  { id: "PAY-00044", kind: "supplier", party: "Trailmakers Experiences", booking: "BK-2026-000003", item: "Hotel · Dubai", amount: 7_000_000, applied: 3_000_000, postedAt: "2026-09-18", due: "2026-09-28", document: "COM-2026-0094", documentState: "Bill not received", owner: "Anjali Menon", note: "The confirmed ₹70,000 hotel commitment includes the ₹30,000 already paid. A later bill documents this cost; it does not add it again." },
  { id: "PAY-00045", kind: "supplier", party: "Desert Wheels", booking: "BK-2026-000003", item: "Transfers · Dubai", amount: 2_500_000, applied: 0, postedAt: "2026-09-19", due: "2026-10-03", document: "COM-2026-0095", documentState: "Bill not received", owner: "Anjali Menon", note: "Confirmed transport commitment. Supplier confirmation remains a Booking service action." },
  { id: "CLM-2026-0012", kind: "reimbursement", party: "Meera Iyer", booking: "BK-2026-000021", item: "Trip incidentals · Kerala", amount: 700_000, applied: 0, postedAt: "2026-09-25", due: "2026-09-28", document: "EXP-2026-0030", documentState: "Claim approved", owner: "Finance team", note: "Approved staff claim: one expense and one unpaid reimbursement obligation, with no recorded cash payment yet." },
];
export const remaining = (item: Obligation) => item.amount - item.applied;
export const outstanding = (kind: Kind) => OBLIGATIONS.filter((item) => item.kind === kind).reduce((sum, item) => sum + remaining(item), 0);
export const bookingProjectedMargin = OBLIGATIONS.filter((item) => item.kind === "customer" && item.booking === "BK-2026-000003").reduce((sum, item) => sum + item.amount, 0) - OBLIGATIONS.filter((item) => item.kind === "supplier" && item.booking === "BK-2026-000003").reduce((sum, item) => sum + item.amount, 0);
export const CUSTOMER_ADVANCE = { id: "ADV-2026-0024", party: "Singh Family", amount: 1_000_000, recorded: "2026-09-20", receipt: "RCPT-2026-0072" };
export const REFUND = { id: "RFND-2026-0016", party: "Nair Family", amount: 1_800_000, due: "2026-09-29", booking: "BK-2026-000016", state: "Approved · payment due" };

export const TRANSACTIONS: MoneyRecord[] = [
  { id: "RCPT-2026-0081", type: "Receipt", party: "XYZ Family", amount: 4_000_000, direction: "in", occurredAt: "2026-09-25T10:34:00", recordedAt: "2026-09-25T11:12:00", recordedBy: "Anjali Menon", account: "HDFC Bank · 2163", linked: "BK-2026-000003 / INV-2026-0084", verification: "Verified", allocation: "₹40,000 applied", bankMatch: "Matched", externalReference: "HDFC-UTR-56824" },
  { id: "PAY-2026-0109", type: "Supplier payment", party: "Trailmakers Experiences", amount: 3_000_000, direction: "out", occurredAt: "2026-09-25T14:30:00", recordedAt: "2026-09-25T16:05:00", recordedBy: "Anjali Menon", account: "HDFC Bank · 2163", linked: "BK-2026-000003 / COM-2026-0094", verification: "Verified", allocation: "₹30,000 applied", bankMatch: "Matched", externalReference: "HDFC-UTR-56831" },
  { id: "RCPT-2026-0088", type: "Receipt", party: "Kapoor Group", amount: 1_200_000, direction: "in", occurredAt: "2026-09-26T09:10:00", recordedAt: "2026-09-26T09:42:00", recordedBy: "Nisha Rao", account: "HDFC Bank · 2163", linked: "BK-2026-000018 / INV-2026-0079", verification: "Awaiting verification", allocation: "Not applied", bankMatch: "Unmatched", externalReference: "UPI-904186" },
  { id: "PAY-2026-0108", type: "Agency payment", party: "Studio North", amount: 280_000, direction: "out", occurredAt: "2026-09-24T12:15:00", recordedAt: "2026-09-24T13:02:00", recordedBy: "Meera Iyer", account: "HDFC Bank · 2163", linked: "Agency / EXP-2026-0032", verification: "Verified", allocation: "Expense settled", bankMatch: "Matched", externalReference: "HDFC-UTR-56307" },
  { id: "RCPT-2026-0072", type: "Receipt", party: "Singh Family", amount: 1_000_000, direction: "in", occurredAt: "2026-09-20T10:20:00", recordedAt: "2026-09-20T11:04:00", recordedBy: "Nisha Rao", account: "HDFC Bank · 2163", linked: "Customer account / ADV-2026-0024", verification: "Verified", allocation: "Unallocated customer advance", bankMatch: "Matched", externalReference: "HDFC-UTR-55322" },
  { id: "PAY-2026-0091", type: "Agency payment", party: "MG Road Properties", amount: 7_500_000, direction: "out", occurredAt: "2026-09-05T13:15:00", recordedAt: "2026-09-05T14:08:00", recordedBy: "Meera Iyer", account: "HDFC Bank · 2163", linked: "Agency / EXP-2026-0031", verification: "Verified", allocation: "Expense settled", bankMatch: "Matched", externalReference: "HDFC-UTR-53830" },
  { id: "TRF-2026-0007", type: "Transfer", party: "HDFC Bank → Petty cash", amount: 100_000, direction: "neutral", occurredAt: "2026-09-23T15:00:00", recordedAt: "2026-09-23T15:22:00", recordedBy: "Meera Iyer", account: "HDFC Bank → Petty cash", linked: "Internal account transfer", verification: "Verified", allocation: "Not applicable", bankMatch: "Partially matched", externalReference: "CASH-TRANSFER-007" },
];
export const EXPENSES: Expense[] = [
  { id: "EXP-2026-0032", category: "Software subscription", payee: "Studio North", scope: "Agency · Operations", incurred: "2026-09-24", due: "2026-09-24", amount: 280_000, review: "Approved", payment: "Paid", evidence: "Invoice attached", linkedPayment: "PAY-2026-0108" },
  { id: "EXP-2026-0031", category: "Office rent", payee: "MG Road Properties", scope: "Agency · Kochi office", incurred: "2026-09-01", due: "2026-09-05", amount: 7_500_000, review: "Approved", payment: "Paid", evidence: "Receipt attached", linkedPayment: "PAY-2026-0091" },
  { id: "EXP-2026-0030", category: "Trip incidentals", payee: "Meera Iyer", scope: "BK-2026-000021 · Direct cost", incurred: "2026-09-22", due: "2026-09-28", amount: 700_000, review: "Approved", payment: "Reimbursement due", evidence: "4 receipts attached" },
];
export const ACCOUNTS = [
  { id: "hdfc", name: "HDFC Bank", meta: "Current account · ending 2163", recorded: 23_680_000, lastReview: "Reconciled through 25 Sep" },
  { id: "cash", name: "Petty cash", meta: "Kochi office · custodian Meera Iyer", recorded: 1_000_000, lastReview: "Count due today" },
] as const;
export const recordedCash = ACCOUNTS.reduce((sum, account) => sum + account.recorded, 0);
export const statementClosing = 23_755_000;
export const statementDifference = statementClosing - ACCOUNTS[0].recorded;
export const unmatchedStatementRow = 750_000;
export const unexplainedAfterVisibleRow = statementDifference - unmatchedStatementRow;

export const FORECAST = [
  { date: "27 Sep", source: "Trailmakers hotel balance", reference: "COM-2026-0094", amount: -4_000_000, basis: "Due" },
  { date: "28 Sep", source: "Meera Iyer reimbursement", reference: "CLM-2026-0012", amount: -700_000, basis: "Approved" },
  { date: "29 Sep", source: "Nair Family refund", reference: "RFND-2026-0016", amount: -1_800_000, basis: "Approved" },
  { date: "30 Sep", source: "Singh Family scheduled advance", reference: "ADV-SCHED-2026-0025", amount: 3_500_000, basis: "Payer confirmed · not received" },
  { date: "03 Oct", source: "Desert Wheels balance", reference: "COM-2026-0095", amount: -2_500_000, basis: "Due" },
  { date: "04 Oct", source: "XYZ Family final instalment", reference: "INV-2026-0084", amount: 8_000_000, basis: "Assumed" },
  { date: "06 Oct", source: "Agency bills", reference: "EXP-SCHEDULE-SEP", amount: -1_350_000, basis: "Scheduled" },
];
export const forecastClosing = recordedCash + FORECAST.reduce((sum, row) => sum + row.amount, 0);
export const forecastMinimum = FORECAST.reduce((state, row) => {
  const balance = state.balance + row.amount;
  return { balance, minimum: Math.min(state.minimum, balance) };
}, { balance: recordedCash, minimum: recordedCash }).minimum;

export const ACTIVITY: ActivityEvent[] = [
  { id: "EVT-00918", event: "Proof attached for review", category: "Review", occurredAt: "2026-09-26T09:43:00", recordedAt: "2026-09-26T09:43:00", actor: "Nisha Rao", recordId: "RCPT-2026-0088", party: "Kapoor Group", context: "BK-2026-000018", detail: "The existing receipt proof is queued for verification. This did not create another receipt or change the due date." },
  { id: "EVT-00917", event: "Receipt proof submitted", category: "Money", occurredAt: "2026-09-26T09:10:00", recordedAt: "2026-09-26T09:42:00", actor: "Nisha Rao", recordId: "RCPT-2026-0088", party: "Kapoor Group", context: "BK-2026-000018 · INV-2026-0079", detail: "The ₹12,000 receipt was recorded against the Kapoor Group instalment. Its debt remains outstanding until verification and application." },
  { id: "EVT-00911", event: "Supplier payment verified", category: "Verification", occurredAt: "2026-09-25T17:05:00", recordedAt: "2026-09-25T17:06:00", actor: "Finance reviewer", recordId: "PAY-2026-0109", party: "Trailmakers Experiences", context: "BK-2026-000003 · COM-2026-0094", detail: "The existing ₹30,000 supplier payment was verified; Booking, Vendor CRM and Agency Finance show its allocation." },
  { id: "EVT-00910", event: "Supplier payment allocated", category: "Allocation", occurredAt: "2026-09-25T16:08:00", recordedAt: "2026-09-25T16:08:00", actor: "Anjali Menon", recordId: "PAY-2026-0109", party: "Trailmakers Experiences", context: "BK-2026-000003 · COM-2026-0094", detail: "₹30,000 was applied to the confirmed hotel commitment; ₹40,000 remains due." },
  { id: "EVT-00909", event: "Supplier payment recorded", category: "Money", occurredAt: "2026-09-25T14:30:00", recordedAt: "2026-09-25T16:05:00", actor: "Anjali Menon", recordId: "PAY-2026-0109", party: "Trailmakers Experiences", context: "BK-2026-000003 · Hotel", detail: "An external bank transfer was recorded. Payment recording did not confirm the supplier service." },
  { id: "EVT-00907", event: "Customer receipt verified and applied", category: "Verification", occurredAt: "2026-09-25T11:40:00", recordedAt: "2026-09-25T11:42:00", actor: "Finance reviewer", recordId: "RCPT-2026-0081", party: "XYZ Family", context: "BK-2026-000003 · INV-2026-0084", detail: "The existing ₹40,000 receipt was verified and applied. The final customer balance is ₹80,000." },
  { id: "EVT-00906", event: "Customer receipt recorded", category: "Money", occurredAt: "2026-09-25T10:34:00", recordedAt: "2026-09-25T11:12:00", actor: "Anjali Menon", recordId: "RCPT-2026-0081", party: "XYZ Family", context: "BK-2026-000003", detail: "An external customer payment was entered using HDFC reference HDFC-UTR-56824." },
  { id: "EVT-00892", event: "Expense claim approved", category: "Review", occurredAt: "2026-09-25T09:15:00", recordedAt: "2026-09-25T09:16:00", actor: "Finance reviewer", recordId: "EXP-2026-0030", party: "Meera Iyer", context: "BK-2026-000021 · CLM-2026-0012", detail: "The ₹7,000 claim was approved. Reimbursement remains due; no cash payment was recorded." },
  { id: "EVT-00888", event: "Agency payment recorded", category: "Money", occurredAt: "2026-09-24T12:15:00", recordedAt: "2026-09-24T13:02:00", actor: "Meera Iyer", recordId: "PAY-2026-0108", party: "Studio North", context: "Agency · EXP-2026-0032", detail: "The software subscription payment was recorded once and linked to the existing expense." },
  { id: "EVT-00879", event: "Bank statement matched", category: "Bank match", occurredAt: "2026-09-24T13:12:00", recordedAt: "2026-09-24T13:14:00", actor: "Finance reviewer", recordId: "PAY-2026-0108", party: "Studio North", context: "HDFC Bank · EXP-2026-0032", detail: "An imported statement row was matched to the existing agency payment. No second payment was created." },
  { id: "EVT-00870", event: "Account transfer recorded", category: "Money", occurredAt: "2026-09-23T15:00:00", recordedAt: "2026-09-23T15:22:00", actor: "Meera Iyer", recordId: "TRF-2026-0007", party: "HDFC Bank → Petty cash", context: "Internal account transfer", detail: "₹1,000 was transferred between agency accounts. The transfer is neither customer income nor an agency expense." },
  { id: "EVT-00851", event: "Customer advance received", category: "Money", occurredAt: "2026-09-20T10:20:00", recordedAt: "2026-09-20T11:04:00", actor: "Nisha Rao", recordId: "RCPT-2026-0072", party: "Singh Family", context: "ADV-2026-0024 · customer account", detail: "₹10,000 was received as a party-owned advance. It is still unallocated and does not settle another customer's debt." },
  { id: "EVT-00818", event: "Office rent payment recorded", category: "Money", occurredAt: "2026-09-05T13:15:00", recordedAt: "2026-09-05T14:08:00", actor: "Meera Iyer", recordId: "PAY-2026-0091", party: "MG Road Properties", context: "Agency · EXP-2026-0031", detail: "The ₹75,000 office rent payment was linked to the existing expense. The expense was not counted twice." },
];

export function formatMoney(paise: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100); }
export function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value.slice(0, 10) + "T12:00:00")); }
export function formatDateTime(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(value)); }
export function dueLabel(due: string) {
  const days = Math.round((Date.parse(due) - Date.parse(REVIEW_DATE)) / 86_400_000);
  return days < 0 ? "Overdue by " + Math.abs(days) + " day" + (days === -1 ? "" : "s") : days === 0 ? "Due today" : "Due in " + days + " day" + (days === 1 ? "" : "s");
}
export function statusTone(status: string): Tone {
  const value = status.toLowerCase();
  if (value.includes("overdue") || value.includes("unmatched") || value.includes("variance") || value.includes("unexplained") || value.includes("rejected")) return "blocked";
  if (value === "paid" || value === "approved" || value === "verified" || value === "matched") return "done";
  if (value.includes("awaiting") || value.includes("not received") || value.includes("due")) return "open";
  return "progress";
}
