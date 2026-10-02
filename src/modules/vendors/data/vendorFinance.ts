import type { StatusTone } from "@paryatech/design-system";

export interface FinanceMetric {
  id: string;
  label: string;
  value: string;
  note: string;
  tone?: "warn" | "ok";
}

export type PayableStatus = "overdue" | "part-paid" | "due" | "paid";

export interface PayableRow {
  id: string;
  vendorId: string;
  bookingId: string;
  serviceId?: string;
  serviceName: string;
  invoice: string;
  booking: string;
  bookingDetail: string;
  invoiced: string;
  due: string;
  amount: string;
  balance: string;
  balanceTone?: "warn" | "bad" | "muted";
  dueTone?: "warn" | "bad";
  status: PayableStatus;
  action: "pay-now" | "pay-balance" | "schedule" | "receipt";
}

export interface AccountTransaction {
  id: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
}

export type DocStatus = "expired" | "expiring" | "awaiting" | "verified";

export interface ComplianceDoc {
  id: string;
  name: string;
  file: string;
  reference: string;
  validTo: string;
  validUntil?: string;
  validTone?: "warn" | "bad";
  ownerName: string;
  ownerInitials: string;
  status: DocStatus;
  statusLabel: string;
  action: "request-renewal" | "chase" | "view";
}

export const FINANCE_META = "Net 30 · credit limit ₹2,00,000";

/** Trip-summary strip — 4×2 matrix of vendor finance KPIs */
export const FINANCE_METRICS: FinanceMetric[] = [
  {
    id: "billed",
    label: "Billed to date",
    value: "₹4,20,100",
    note: "8 invoices raised by this supplier",
  },
  {
    id: "settled",
    label: "Settled",
    value: "₹2,81,300",
    note: "67% of everything billed",
    tone: "ok",
  },
  {
    id: "outstanding",
    label: "Outstanding",
    value: "₹1,38,800",
    note: "3 invoices open · 5 settled",
  },
  {
    id: "overdue",
    label: "Overdue",
    value: "₹30,000",
    note: "1 invoice · 19 days past Net 30",
    tone: "warn",
  },
  {
    id: "credit-limit",
    label: "Credit limit",
    value: "₹2,00,000",
    note: "Agreed at onboarding, Mar 2021",
  },
  {
    id: "headroom",
    label: "Credit headroom",
    value: "₹61,200",
    note: "69% of the limit is committed",
    tone: "ok",
  },
  {
    id: "advance",
    label: "Advance held",
    value: "₹40,000",
    note: "Deposit against December room block",
  },
  {
    id: "margin",
    label: "Margin on their services",
    value: "22.4%",
    note: "Blended across 6 live packages",
  },
];

export const PAYABLE_STATUS_LABEL: Record<PayableStatus, string> = {
  overdue: "Unpaid",
  "part-paid": "Part-paid",
  due: "Unpaid",
  paid: "Paid",
};

export const PAYABLE_STATUS_TONE: Record<PayableStatus, StatusTone> = {
  overdue: "blocked",
  "part-paid": "open",
  due: "progress",
  paid: "done",
};

export const PAYABLE_ACTION_LABEL: Record<PayableRow["action"], string> = {
  "pay-now": "Pay now",
  "pay-balance": "Pay balance",
  schedule: "Schedule",
  receipt: "Receipt",
};

export const PAYABLES: PayableRow[] = [
  {
    id: "p1",
    vendorId: "exhosp",
    bookingId: "vb1",
    serviceId: "svc-lake",
    serviceName: "Example Lake Resort",
    invoice: "INV-2026-0412",
    booking: "XYZ Family · Dubai",
    bookingDetail: "Lake Resort · 2 rooms · 3N",
    invoiced: "28 Jul 2026",
    due: "27 Aug 2026",
    amount: "₹30,000",
    balance: "₹30,000 due",
    balanceTone: "bad",
    dueTone: "bad",
    status: "overdue",
    action: "pay-now",
  },
  {
    id: "p2",
    vendorId: "exhosp",
    bookingId: "vb2",
    serviceName: "Premium houseboat",
    invoice: "INV-2026-0398",
    booking: "Kapoor group · Alleppey",
    bookingDetail: "Houseboat · 1 cabin · 2N",
    invoiced: "12 Jul 2026",
    due: "11 Aug 2026",
    amount: "₹48,000",
    balance: "₹36,000 due",
    balanceTone: "warn",
    dueTone: "warn",
    status: "part-paid",
    action: "pay-balance",
  },
  {
    id: "p3",
    vendorId: "exhosp",
    bookingId: "vb3",
    serviceId: "svc-hill",
    serviceName: "Hill Retreat",
    invoice: "INV-2026-0381",
    booking: "Mehta honeymoon",
    bookingDetail: "Hill Retreat · 1 suite · 4N",
    invoiced: "2 Aug 2026",
    due: "1 Sep 2026",
    amount: "₹72,800",
    balance: "₹72,800 due",
    balanceTone: "warn",
    dueTone: "warn",
    status: "due",
    action: "schedule",
  },
  {
    id: "p4",
    vendorId: "coastal",
    bookingId: "vb4",
    serviceName: "Garden Villa",
    invoice: "INV-2026-0355",
    booking: "Singh family · Kochi",
    bookingDetail: "Lake Resort · 3 rooms · 2N",
    invoiced: "18 Jun 2026",
    due: "18 Jul 2026",
    amount: "₹41,200",
    balance: "settled",
    balanceTone: "muted",
    status: "paid",
    action: "receipt",
  },
  {
    id: "p5",
    vendorId: "exhosp",
    bookingId: "vb5",
    serviceId: "svc-hill",
    serviceName: "Hill Retreat",
    invoice: "INV-2026-0330",
    booking: "Corporate retreat · Munnar",
    bookingDetail: "Hill Retreat · 8 rooms · 3N",
    invoiced: "4 Jun 2026",
    due: "4 Jul 2026",
    amount: "₹1,12,000",
    balance: "settled",
    balanceTone: "muted",
    status: "paid",
    action: "receipt",
  },
  {
    id: "p6",
    vendorId: "exhosp",
    bookingId: "vb6",
    serviceId: "svc-lake",
    serviceName: "Example Lake Resort",
    invoice: "INV-2026-0294",
    booking: "Nair anniversary",
    bookingDetail: "Lake Resort · 1 suite · 2N",
    invoiced: "22 May 2026",
    due: "21 Jun 2026",
    amount: "₹28,500",
    balance: "settled",
    balanceTone: "muted",
    status: "paid",
    action: "receipt",
  },
  {
    id: "p7",
    vendorId: "spice-route",
    bookingId: "vb7",
    serviceName: "Spice lodge",
    invoice: "INV-2026-0261",
    booking: "Desai group · Thekkady",
    bookingDetail: "Spice lodge · 4 rooms · 2N",
    invoiced: "9 May 2026",
    due: "8 Jun 2026",
    amount: "₹54,000",
    balance: "settled",
    balanceTone: "muted",
    status: "paid",
    action: "receipt",
  },
  {
    id: "p8",
    vendorId: "coastal",
    bookingId: "vb8",
    serviceName: "Cliff stay",
    invoice: "INV-2026-0218",
    booking: "Iyer family · Varkala",
    bookingDetail: "Cliff stay · 2 rooms · 3N",
    invoiced: "28 Apr 2026",
    due: "28 May 2026",
    amount: "₹33,600",
    balance: "settled",
    balanceTone: "muted",
    status: "paid",
    action: "receipt",
  },
  {
    id: "p9",
    vendorId: "trailmakers",
    bookingId: "vb13",
    serviceId: "svc-trek-munnar",
    serviceName: "Munnar ridge trek",
    invoice: "TM-INV-2026-104",
    booking: "Rao family · Munnar",
    bookingDetail: "Guided ridge trek · 4 guests",
    invoiced: "15 Sep 2026",
    due: "15 Oct 2026",
    amount: "₹18,000",
    balance: "₹18,000 due",
    status: "due",
    action: "pay-now",
  },
  {
    id: "p10",
    vendorId: "trailmakers",
    bookingId: "vb14",
    serviceId: "svc-kayak",
    serviceName: "Backwater kayak",
    invoice: "TM-INV-2026-097",
    booking: "Patel group · Alleppey",
    bookingDetail: "Backwater kayak · 6 guests",
    invoiced: "03 Sep 2026",
    due: "03 Oct 2026",
    amount: "₹24,000",
    balance: "₹12,000 due",
    status: "part-paid",
    action: "pay-balance",
  },
  {
    id: "p11",
    vendorId: "trailmakers",
    bookingId: "vb15",
    serviceId: "svc-trek-munnar",
    serviceName: "Munnar ridge trek",
    invoice: "TM-INV-2026-082",
    booking: "Mehta team · Munnar",
    bookingDetail: "Guided ridge trek · 8 guests",
    invoiced: "12 Aug 2026",
    due: "11 Sep 2026",
    amount: "₹36,000",
    balance: "settled",
    status: "paid",
    action: "receipt",
  },
];

/** Vendor ledger used by the statement-of-account view. Debits are supplier invoices. */
export const ACCOUNT_TRANSACTIONS: AccountTransaction[] = [
  {
    id: "txn-1",
    date: "2026-04-28",
    reference: "INV-2026-0218",
    description: "Iyer family · Varkala",
    debit: 33600,
    credit: 0,
  },
  {
    id: "txn-2",
    date: "2026-05-02",
    reference: "PAY-2026-0108",
    description: "Payment against INV-2026-0218",
    debit: 0,
    credit: 33600,
  },
  {
    id: "txn-3",
    date: "2026-05-09",
    reference: "INV-2026-0261",
    description: "Desai group · Thekkady",
    debit: 54000,
    credit: 0,
  },
  {
    id: "txn-4",
    date: "2026-05-13",
    reference: "PAY-2026-0129",
    description: "Payment against INV-2026-0261",
    debit: 0,
    credit: 54000,
  },
  {
    id: "txn-5",
    date: "2026-05-22",
    reference: "INV-2026-0294",
    description: "Nair anniversary",
    debit: 28500,
    credit: 0,
  },
  {
    id: "txn-6",
    date: "2026-05-25",
    reference: "PAY-2026-0144",
    description: "Payment against INV-2026-0294",
    debit: 0,
    credit: 28500,
  },
  {
    id: "txn-7",
    date: "2026-06-04",
    reference: "INV-2026-0330",
    description: "Corporate retreat · Munnar",
    debit: 112000,
    credit: 0,
  },
  {
    id: "txn-8",
    date: "2026-06-10",
    reference: "PAY-2026-0162",
    description: "Payment against INV-2026-0330",
    debit: 0,
    credit: 112000,
  },
  {
    id: "txn-9",
    date: "2026-06-18",
    reference: "INV-2026-0355",
    description: "Singh family · Kochi",
    debit: 41200,
    credit: 0,
  },
  {
    id: "txn-10",
    date: "2026-06-20",
    reference: "PAY-2026-0175",
    description: "Payment against INV-2026-0355",
    debit: 0,
    credit: 41200,
  },
  {
    id: "txn-11",
    date: "2026-07-12",
    reference: "INV-2026-0398",
    description: "Kapoor group · Alleppey",
    debit: 48000,
    credit: 0,
  },
  {
    id: "txn-12",
    date: "2026-07-18",
    reference: "PAY-2026-0201",
    description: "Part payment against INV-2026-0398",
    debit: 0,
    credit: 12000,
  },
  {
    id: "txn-13",
    date: "2026-07-28",
    reference: "INV-2026-0412",
    description: "XYZ Family · Dubai",
    debit: 30000,
    credit: 0,
  },
  {
    id: "txn-14",
    date: "2026-08-02",
    reference: "INV-2026-0381",
    description: "Mehta honeymoon",
    debit: 72800,
    credit: 0,
  },
];

export const DOC_STATUS_TONE: Record<DocStatus, StatusTone> = {
  expired: "blocked",
  expiring: "progress",
  awaiting: "open",
  verified: "done",
};

export const DOC_ACTION_LABEL: Record<ComplianceDoc["action"], string> = {
  "request-renewal": "Request renewal",
  chase: "Chase",
  view: "View",
};

export const COMPLIANCE_ALERT =
  "Public liability insurance expires on 28 Sep 2026 (13 days). The 2026–27 rate agreement is still unsigned — both block new confirmations under your compliance policy.";

export const COMPLIANCE_DOCS: ComplianceDoc[] = [
  {
    id: "d1",
    name: "Public liability insurance",
    file: "icici-lom-8841.pdf",
    reference: "POL/8841/26",
    validTo: "28 Sep 2026",
    validUntil: "2026-09-28",
    validTone: "warn",
    ownerName: "Deepa Thomas",
    ownerInitials: "DT",
    status: "expiring",
    statusLabel: "Expiring · 13 days",
    action: "request-renewal",
  },
  {
    id: "d2",
    name: "Rate agreement 2026–27",
    file: "eh-rate-agreement-26.pdf",
    reference: "AGR/2026/EH",
    validTo: "31 Mar 2027",
    validUntil: "2027-03-31",
    ownerName: "Rahul Sharma",
    ownerInitials: "RS",
    status: "awaiting",
    statusLabel: "Awaiting signature",
    action: "chase",
  },
  {
    id: "d3",
    name: "GST registration certificate",
    file: "gst-32AABCE1234F1Z5.pdf",
    reference: "GST/32AABCE",
    validTo: "— no expiry",
    ownerName: "Deepa Thomas",
    ownerInitials: "DT",
    status: "verified",
    statusLabel: "Verified",
    action: "view",
  },
  {
    id: "d4",
    name: "PAN card",
    file: "pan-aabce1234f.pdf",
    reference: "PAN/AABCE",
    validTo: "— no expiry",
    ownerName: "Ravi Nair",
    ownerInitials: "RN",
    status: "verified",
    statusLabel: "Verified",
    action: "view",
  },
  {
    id: "d5",
    name: "Cancellation policy",
    file: "eh-cancel-policy-2026.pdf",
    reference: "POL/CANCEL/26",
    validTo: "31 Mar 2027",
    validUntil: "2027-03-31",
    ownerName: "Ravi Nair",
    ownerInitials: "RN",
    status: "verified",
    statusLabel: "Verified",
    action: "view",
  },
  {
    id: "d6",
    name: "Cancelled cheque",
    file: "eh-cancelled-cheque.pdf",
    reference: "BANK/ICICI/8841",
    validTo: "— no expiry",
    ownerName: "Deepa Thomas",
    ownerInitials: "DT",
    status: "verified",
    statusLabel: "Verified",
    action: "view",
  },
  {
    id: "d7",
    name: "Fire safety certificate",
    file: "fire-safety-kochi-2025.pdf",
    reference: "FSC/KKD/1182",
    validTo: "14 Jan 2027",
    validUntil: "2027-01-14",
    ownerName: "Ravi Nair",
    ownerInitials: "RN",
    status: "verified",
    statusLabel: "Verified",
    action: "view",
  },
  {
    id: "d8",
    name: "Trade licence",
    file: "trade-licence-eh-2026.pdf",
    reference: "TL/KOC/4421",
    validTo: "31 Dec 2026",
    validUntil: "2026-12-31",
    ownerName: "Deepa Thomas",
    ownerInitials: "DT",
    status: "verified",
    statusLabel: "Verified",
    action: "view",
  },
];
