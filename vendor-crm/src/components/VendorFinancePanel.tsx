import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  EmptyState,
  FilterSelect,
  IconButton,
  Pagination,
  SearchField,
  StatusChip,
  Tooltip,
  type CheckboxState,
} from "@paryatech/design-system";
import {
  ACCOUNT_TRANSACTIONS,
  FINANCE_METRICS,
  PAYABLE_STATUS_LABEL,
  PAYABLE_STATUS_TONE,
  PAYABLES,
} from "../data/vendorFinance";
import {
  IconCalendar,
  IconCard,
  IconCheck,
  IconClose,
  IconCopy,
  IconDownload,
  IconFinance,
  IconMore,
  IconPlus,
  IconPencil,
  IconWarn,
} from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { SummaryStrip } from "./SummaryStrip";
import "./VendorFinancePanel.css";

const METRIC_ICONS = {
  billed: <IconCard size={15} />,
  settled: <IconCard size={15} />,
  outstanding: <IconCard size={15} />,
  overdue: <IconWarn size={15} />,
} as const;

type PayableFilter = "all" | "unpaid" | "part-paid" | "paid";

type BankAccount = {
  id: string;
  bankName: string;
  accountHolder: string;
  accountType: "" | "Current account" | "Savings account";
  accountNumber: string;
  routingCode: string;
  branch: string;
  preferred: boolean;
  updatedBy: string;
  updatedAt: string;
};

const INITIAL_BANK_ACCOUNT: BankAccount = {
  id: "bank-hdfc-primary",
  bankName: "HDFC Bank",
  accountHolder: "",
  accountType: "Current account",
  accountNumber: "50200018472163",
  routingCode: "HDFC0001234",
  branch: "Kochi · MG Road",
  preferred: true,
  updatedBy: "Anjali Menon",
  updatedAt: "2026-09-23T10:15:00+05:30",
};

const BANK_ACCOUNT_ACTOR = "Vrushabh Jain";

function bankStorageKey(vendorName: string) {
  return `paryatechos:vendor-bank-details:${vendorName.trim().toLowerCase()}`;
}

function initialBankAccounts(vendorName: string): BankAccount[] {
  const fallback = [{ ...INITIAL_BANK_ACCOUNT, accountHolder: vendorName }];
  try {
    const saved = window.localStorage.getItem(bankStorageKey(vendorName));
    if (!saved) return fallback;
    const parsed = JSON.parse(saved) as Array<Partial<BankAccount> & { primary?: boolean }>;
    if (!Array.isArray(parsed) || !parsed.length) return fallback;
    return parsed.map((account, index) => ({
      id: account.id || `bank-saved-${index}`,
      bankName: account.bankName || "",
      accountHolder: account.accountHolder || "",
      accountType: account.accountType === "Current account" || account.accountType === "Savings account" ? account.accountType : "",
      accountNumber: account.accountNumber || "",
      routingCode: account.routingCode || "",
      branch: account.branch || "",
      preferred: account.preferred ?? account.primary ?? false,
      updatedBy: account.updatedBy || "Anjali Menon",
      updatedAt: account.updatedAt || INITIAL_BANK_ACCOUNT.updatedAt,
    }));
  } catch {
    return fallback;
  }
}

function normalizedAccountNumber(value: string) {
  return value.replace(/[\s-]/g, "");
}

const PAYABLE_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "unpaid", label: "Unpaid" },
  { value: "part-paid", label: "Part-paid" },
  { value: "paid", label: "Paid" },
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const statementDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function VendorFinancePanel({ vendorId, vendorName, canEdit, onOpenBooking, onOpenService }: { vendorId: string; vendorName: string; canEdit: boolean; onOpenBooking: (id: string) => void; onOpenService: (id: string) => void }) {
  const bankDialogRef = useRef<HTMLDivElement>(null);
  const bankReturnFocusRef = useRef<HTMLElement | null>(null);
  const [payQuery, setPayQuery] = useState("");
  const [payFilter, setPayFilter] = useState<PayableFilter>("all");
  const [paySelected, setPaySelected] = useState<string[]>([]);
  const [payPage, setPayPage] = useState(1);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [payExported, setPayExported] = useState(false);
  const [payMenu, setPayMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [statementOpen, setStatementOpen] = useState(false);
  const [statementStart, setStatementStart] = useState("2026-04-01");
  const [statementEnd, setStatementEnd] = useState("2026-09-23");
  const [statementExported, setStatementExported] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => initialBankAccounts(vendorName));
  const [bankEditor, setBankEditor] = useState<"add" | "edit" | null>(null);
  const [bankPanelPosition, setBankPanelPosition] = useState<CSSProperties>();
  const [bankDraft, setBankDraft] = useState<BankAccount>({
    ...INITIAL_BANK_ACCOUNT,
    id: "",
    accountHolder: "",
    bankName: "",
    accountType: "",
    accountNumber: "",
    routingCode: "",
    branch: "",
    preferred: false,
    updatedBy: BANK_ACCOUNT_ACTOR,
    updatedAt: "",
  });
  const [bankError, setBankError] = useState<string | null>(null);

  const copyBankField = async (field: string, value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1400);
  };

  const openBankEditor = (mode: "add" | "edit", account?: BankAccount) => {
    bankReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setBankError(null);
    setBankEditor(mode);
    setBankDraft(account
      ? { ...account }
      : {
          ...INITIAL_BANK_ACCOUNT,
          id: "",
          accountHolder: "",
          bankName: "",
          accountType: "",
          accountNumber: "",
          routingCode: "",
          branch: "",
          preferred: false,
          updatedBy: BANK_ACCOUNT_ACTOR,
          updatedAt: "",
        });
  };

  const saveBankAccount = () => {
    const accountNumber = normalizedAccountNumber(bankDraft.accountNumber);
    const ifsc = bankDraft.routingCode.trim().toUpperCase();

    if (!bankDraft.bankName.trim() || !bankDraft.accountHolder.trim() || !accountNumber || !ifsc) {
      setBankError("Enter the account holder name, account number, IFSC code, and bank name.");
      return;
    }
    if (!/^\d{6,20}$/.test(accountNumber)) {
      setBankError("Enter a valid account number using 6 to 20 digits.");
      return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      setBankError("Enter a valid 11-character IFSC code, for example HDFC0001234.");
      return;
    }
    const isDuplicate = bankAccounts.some((account) =>
      account.id !== bankDraft.id &&
      normalizedAccountNumber(account.accountNumber) === accountNumber &&
      account.routingCode.trim().toUpperCase() === ifsc,
    );
    if (isDuplicate) {
      setBankError("This bank account is already saved for this vendor.");
      return;
    }

    const saved: BankAccount = {
      ...bankDraft,
      id: bankDraft.id || `bank-${Date.now()}`,
      bankName: bankDraft.bankName.trim(),
      accountHolder: bankDraft.accountHolder.trim(),
      accountNumber,
      routingCode: ifsc,
      branch: bankDraft.branch.trim(),
      updatedBy: BANK_ACCOUNT_ACTOR,
      updatedAt: new Date().toISOString(),
    };

    setBankAccounts((current) => {
      const next = bankEditor === "edit"
        ? current.map((account) => account.id === saved.id ? saved : account)
        : [...current, saved];
      return saved.preferred
        ? next.map((account) => ({ ...account, preferred: account.id === saved.id }))
        : next;
    });
    setBankEditor(null);
    setBankError(null);
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(bankStorageKey(vendorName), JSON.stringify(bankAccounts));
    } catch {
      // Keep the in-session record available when browser storage is unavailable.
    }
  }, [bankAccounts, vendorName]);

  const payables = useMemo(() => {
    const q = payQuery.trim().toLowerCase();
    return PAYABLES.filter((row) => {
      if (row.vendorId !== vendorId) return false;
      const matchesQuery =
        !q ||
        row.invoice.toLowerCase().includes(q) ||
        row.booking.toLowerCase().includes(q) ||
        row.bookingDetail.toLowerCase().includes(q) ||
        row.serviceName.toLowerCase().includes(q);
      const matchesStatus =
        payFilter === "all" ||
        (payFilter === "unpaid" ? row.status === "due" || row.status === "overdue" : row.status === payFilter);
      return matchesQuery && matchesStatus;
    });
  }, [payFilter, payQuery, vendorId]);

  useEffect(() => {
    if (!payMenu) return;
    const close = () => setPayMenu(null);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("scroll", close, true);
    };
  }, [payMenu]);

  const openingBalance = useMemo(
    () =>
      ACCOUNT_TRANSACTIONS.filter((row) => row.date < statementStart).reduce(
        (total, row) => total + row.debit - row.credit,
        0,
      ),
    [statementStart],
  );

  const statementRangeValid =
    Boolean(statementStart) && Boolean(statementEnd) && statementStart <= statementEnd;

  const statementRows = useMemo(() => {
    let balance = openingBalance;
    if (!statementRangeValid) return [];
    return ACCOUNT_TRANSACTIONS.filter(
      (row) => row.date >= statementStart && row.date <= statementEnd,
    ).map((row) => {
      balance += row.debit - row.credit;
      return { ...row, balance };
    });
  }, [openingBalance, statementEnd, statementRangeValid, statementStart]);

  const statementTotals = useMemo(
    () => ({
      debit: statementRows.reduce((total, row) => total + row.debit, 0),
      credit: statementRows.reduce((total, row) => total + row.credit, 0),
      closing: statementRows.at(-1)?.balance ?? openingBalance,
    }),
    [openingBalance, statementRows],
  );

  const statementPeriodLabel = statementRangeValid
    ? `${statementDate.format(new Date(`${statementStart}T12:00:00`))} – ${statementDate.format(
        new Date(`${statementEnd}T12:00:00`),
      )}`
    : "Select a valid date range";

  useEffect(() => {
    if (!statementOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStatementOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [statementOpen]);

  useEffect(() => {
    if (!bankEditor) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setBankEditor(null);
        return;
      }
      if (event.key !== "Tab" || !bankDialogRef.current) return;
      const focusable = [
        ...bankDialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      const returnTarget = bankReturnFocusRef.current;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => {
        if (returnTarget?.isConnected) returnTarget.focus();
      });
    };
  }, [bankEditor]);

  useLayoutEffect(() => {
    if (!bankEditor) return;

    const updatePosition = () => {
      const anchor = bankReturnFocusRef.current;
      if (!anchor) {
        setBankPanelPosition(undefined);
        return;
      }
      const rect = anchor.getBoundingClientRect();
      const viewportInset = 12;
      const gap = 8;
      const top = rect.bottom + gap;
      setBankPanelPosition({
        top,
        right: Math.max(viewportInset, window.innerWidth - rect.right),
        maxHeight: Math.max(240, window.innerHeight - top - viewportInset),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [bankEditor]);

  const payHeader: CheckboxState =
    paySelected.length === 0
      ? "off"
      : paySelected.length === payables.length && payables.length > 0
        ? "on"
        : "indeterminate";

  const togglePayAll = (state: CheckboxState) => {
    setPaySelected(state === "on" ? payables.map((r) => r.id) : []);
  };

  const togglePay = (id: string, state: CheckboxState) => {
    setPaySelected((current) =>
      state === "on"
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id),
    );
  };

  const exportPayables = () => {
    const selectedRows = paySelected.length
      ? payables.filter((row) => paySelected.includes(row.id))
      : payables;
    downloadCsv(`${vendorId}-payables-${statementEnd}.csv`, [
      ["Booking", "Service", "Vendor invoice", "Total payable", "Status"],
      ...selectedRows.map((row) => [
        row.booking,
        row.serviceName,
        row.invoice,
        row.amount,
        PAYABLE_STATUS_LABEL[row.status],
      ]),
    ]);
    setPayExported(true);
    window.setTimeout(() => setPayExported(false), 1600);
  };

  const exportStatement = () => {
    downloadCsv(`trailmakers-statement-${statementStart}-to-${statementEnd}.csv`, [
      ["Vendor", vendorName],
      ["Account number", "50200018472163"],
      ["Statement period", `${statementStart} to ${statementEnd}`],
      [],
      ["Date", "Reference", "Description", "Debit", "Credit", "Balance"],
      ["", "", "Opening balance", "", "", openingBalance],
      ...statementRows.map((row) => [
        row.date,
        row.reference,
        row.description,
        row.debit || "",
        row.credit || "",
        row.balance,
      ]),
    ]);
    setStatementExported(true);
    window.setTimeout(() => setStatementExported(false), 1600);
  };

  return (
    <div className="vendor-finance">
      <SummaryStrip
        title="Finance summary"
        columns={4}
        variant="icon-leading"
        actions={
          <Button variant="brand" size="sm" onClick={() => setStatementOpen(true)}>
            Statement of account
          </Button>
        }
        fields={FINANCE_METRICS.slice(0, 4).map((metric) => ({
          id: metric.id,
          label: metric.label,
          value: metric.value,
          tone: metric.tone,
          icon: METRIC_ICONS[metric.id as keyof typeof METRIC_ICONS],
        }))}
      />

      <section className="vendor-finance__section bank-details" aria-labelledby="bank-details-title">
        <div className="vendor-finance__section-head bank-details__head">
          <div className="vendor-finance__titles">
            <h2 id="bank-details-title" className="vendor-finance__title">Bank details</h2>
          </div>
          {canEdit ? (
            <div className="bank-details__actions">
              <Button
                variant="brand"
                size="sm"
                onClick={() => openBankEditor("edit", bankAccounts.find((account) => account.preferred) ?? bankAccounts[0])}
                disabled={bankAccounts.length === 0}
              >
                <IconPencil />
                Edit bank details
              </Button>
              <Button variant="primary" size="sm" onClick={() => openBankEditor("add")}>
                <IconPlus />
                Add another account
              </Button>
            </div>
          ) : null}
        </div>

        <div className="bank-details-grid-list" aria-label="Bank accounts">
          {bankAccounts.map((account) => (
            <article className="bank-details-grid" key={account.id}>
              <div className="bank-details-grid__field bank-details-grid__field--bank">
                <span className="bank-details-grid__label">Bank</span>
                <div className="bank-details-grid__bank">
                  <span className="bank-details-grid__icon" aria-hidden="true">
                    <IconFinance size={16} />
                  </span>
                  <div>
                    <strong>{account.bankName}</strong>
                    {account.preferred ? (
                      <StatusChip tone="done">Preferred account</StatusChip>
                    ) : (
                      <span>Additional account</span>
                    )}
                  </div>
                  {canEdit ? (
                    <IconButton
                      label={`Edit ${account.bankName} account`}
                      onClick={() => openBankEditor("edit", account)}
                    >
                      <IconPencil />
                    </IconButton>
                  ) : null}
                </div>
              </div>
              <div className="bank-details-grid__field">
                <span className="bank-details-grid__label">Account holder</span>
                <strong>{account.accountHolder}</strong>
              </div>
              <div className="bank-details-grid__field">
                <span className="bank-details-grid__label">Account type</span>
                <strong>{account.accountType || "Not provided"}</strong>
              </div>
              <div className="bank-details-grid__field">
                <span className="bank-details-grid__label">Branch</span>
                <strong>{account.branch || "Not provided"}</strong>
              </div>
              <div className="bank-details-grid__field">
                <span className="bank-details-grid__label">Account number</span>
                <span className="bank-details-grid__copy-value">
                  <span className="pt-mono">{account.accountNumber}</span>
                  <Tooltip tip={copiedField === `${account.id}-account` ? "Copied" : "Copy account number"}>
                    <IconButton label="Copy account number" onClick={() => void copyBankField(`${account.id}-account`, account.accountNumber)}>
                      <IconCopy />
                    </IconButton>
                  </Tooltip>
                </span>
              </div>
              <div className="bank-details-grid__field">
                <span className="bank-details-grid__label">IFSC code</span>
                <span className="bank-details-grid__copy-value">
                  <span className="pt-mono">{account.routingCode}</span>
                  <Tooltip tip={copiedField === `${account.id}-routing` ? "Copied" : "Copy IFSC code"}>
                    <IconButton label="Copy IFSC code" onClick={() => void copyBankField(`${account.id}-routing`, account.routingCode)}>
                      <IconCopy />
                    </IconButton>
                  </Tooltip>
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="vendor-finance__section" aria-labelledby="payables-title">
        <div className="vendor-finance__section-head">
          <div className="vendor-finance__titles">
            <h2 id="payables-title" className="vendor-finance__title">Payables</h2>
          </div>
        </div>

        <div className="vendor-finance__toolbar">
          <SearchField
            fullWidth
            value={payQuery}
            onChange={(event) => {
              setPayQuery(event.target.value);
              setPayPage(1);
              setPaySelected([]);
            }}
            placeholder="Search booking, service, or invoice"
            aria-label="Search booking, service, or invoice"
          />
          <div className="vendor-finance__tools">
            <FilterSelect
              tip="Filter by payment status"
              label="Status"
              options={PAYABLE_FILTER_OPTIONS}
              value={payFilter}
              onChange={(value) => {
                setPayFilter(value as PayableFilter);
                setPayPage(1);
                setPaySelected([]);
              }}
            />
            <Button
              variant="brand"
              size="sm"
              onClick={exportPayables}
              disabled={payables.length === 0}
            >
              {payExported ? <IconCheck /> : <IconDownload />}
              {payExported ? "Exported" : "Export"}
            </Button>
          </div>
        </div>

        <div className="vendor-finance__sheet">
          {payables.length === 0 ? (
            <EmptyState
              title="No invoices match this search"
              description="Try another booking, service, or invoice number."
            />
          ) : (
            <>
              <DataSheet className="payables-sheet" aria-label="Payables">
                <DataSheetHeader>
                  <DataSheetCell check>
                    <Checkbox
                      state={payHeader}
                      onCheckedChange={togglePayAll}
                      label="Select all invoices"
                    />
                  </DataSheetCell>
                  <DataSheetCell>Booking</DataSheetCell>
                  <DataSheetCell>Service</DataSheetCell>
                  <DataSheetCell>Vendor invoice</DataSheetCell>
                  <DataSheetCell>Total payable</DataSheetCell>
                  <DataSheetCell>Status</DataSheetCell>
                  <DataSheetCell className="payables-sheet__action">Action</DataSheetCell>
                </DataSheetHeader>
                {payables.map((row) => (
                  <DataSheetRow key={row.id}>
                    <DataSheetCell check>
                      <Checkbox
                        state={paySelected.includes(row.id) ? "on" : "off"}
                        onCheckedChange={(state) => togglePay(row.id, state)}
                        label={`Select ${row.invoice}`}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <button type="button" className="payables-sheet__link" onClick={() => onOpenBooking(row.bookingId)}>
                        <strong>{row.booking}</strong>
                        <small>{row.bookingDetail}</small>
                      </button>
                    </DataSheetCell>
                    <DataSheetCell>
                      {row.serviceId ? <button type="button" className="payables-sheet__link" onClick={() => onOpenService(row.serviceId!)}>{row.serviceName}</button> : <span>{row.serviceName}</span>}
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="payables-sheet__invoice pt-mono">{row.invoice}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <strong className="payables-sheet__amount pt-mono">{row.amount}</strong>
                    </DataSheetCell>
                    <DataSheetCell>
                      <StatusChipWithDot tone={PAYABLE_STATUS_TONE[row.status]}>
                        {PAYABLE_STATUS_LABEL[row.status]}
                      </StatusChipWithDot>
                    </DataSheetCell>
                    <DataSheetCell className="payables-sheet__action">
                      <IconButton label={`More actions for ${row.invoice}`} aria-haspopup="menu" aria-expanded={payMenu?.id === row.id} onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setPayMenu((current) => current?.id === row.id ? null : {
                          id: row.id,
                          top: Math.min(rect.bottom + 6, window.innerHeight - 122),
                          left: Math.max(12, Math.min(window.innerWidth - 202, rect.right - 190)),
                        });
                      }}><IconMore /></IconButton>
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
              </DataSheet>
              <Pagination
                rangeLabel={`Showing 1–${payables.length} of ${payables.length} invoices`}
                page={payPage}
                pageCount={1}
                onPageChange={setPayPage}
              />
            </>
          )}
        </div>
      </section>

      {payMenu ? createPortal(<div className="payables-sheet__menu" role="menu" aria-label="Payable actions" style={{ top: payMenu.top, left: payMenu.left }} onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" role="menuitem" onClick={() => { const row = PAYABLES.find((item) => item.id === payMenu.id); setPayMenu(null); if (row) onOpenBooking(row.bookingId); }}>Open booking</button>
        {PAYABLES.find((item) => item.id === payMenu.id)?.serviceId ? <button type="button" role="menuitem" onClick={() => { const row = PAYABLES.find((item) => item.id === payMenu.id); setPayMenu(null); if (row?.serviceId) onOpenService(row.serviceId); }}>Open service</button> : null}
        <button type="button" role="menuitem" onClick={() => { const row = PAYABLES.find((item) => item.id === payMenu.id); if (row) void navigator.clipboard?.writeText(row.invoice); setPayMenu(null); }}>Copy invoice number</button>
      </div>, document.body) : null}

      {bankEditor
        ? createPortal(
            <div
              className="rc-modal-backdrop bank-account-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setBankEditor(null);
              }}
            >
              <div
                ref={bankDialogRef}
                className="rc-modal bank-account-modal"
                style={bankPanelPosition}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bank-account-modal-title"
              >
                <div className="bank-account-modal__head">
                  <h2 id="bank-account-modal-title" className="rc-modal__title">{bankEditor === "add" ? "Add bank details" : "Edit bank details"}</h2>
                  <IconButton label="Close bank account form" onClick={() => setBankEditor(null)}><IconClose /></IconButton>
                </div>

                <div className="bank-account-form">
                  {bankError ? <div className="bank-account-form__error" role="alert">{bankError}</div> : null}
                  <div className="bank-account-form__grid">
                    <label><span>Bank name *</span><input value={bankDraft.bankName} onChange={(event) => setBankDraft((current) => ({ ...current, bankName: event.target.value }))} placeholder="e.g. HDFC Bank" autoFocus /></label>
                    <label><span>Account holder name—as on bank account *</span><input value={bankDraft.accountHolder} onChange={(event) => setBankDraft((current) => ({ ...current, accountHolder: event.target.value }))} placeholder="Enter the registered account name" /></label>
                    <label><span>Account number *</span><input value={bankDraft.accountNumber} onChange={(event) => setBankDraft((current) => ({ ...current, accountNumber: event.target.value }))} placeholder="Account number" inputMode="numeric" /></label>
                    <label><span>IFSC code *</span><input value={bankDraft.routingCode} onChange={(event) => setBankDraft((current) => ({ ...current, routingCode: event.target.value.toUpperCase() }))} placeholder="e.g. HDFC0001234" maxLength={11} /></label>
                    <label><span>Account type <small>Optional</small></span><select value={bankDraft.accountType} onChange={(event) => setBankDraft((current) => ({ ...current, accountType: event.target.value as BankAccount["accountType"] }))}><option value="">Select account type</option><option>Current account</option><option>Savings account</option></select></label>
                    <label><span>Branch <small>Optional</small></span><input value={bankDraft.branch} onChange={(event) => setBankDraft((current) => ({ ...current, branch: event.target.value }))} placeholder="City or branch name" /></label>
                  </div>

                  <label className="bank-account-form__preferred"><input type="checkbox" checked={bankDraft.preferred} onChange={(event) => setBankDraft((current) => ({ ...current, preferred: event.target.checked }))} /><span>Mark as preferred account</span></label>
                </div>

                <div className="bank-account-modal__foot">
                  <Button variant="ghost" size="sm" onClick={() => setBankEditor(null)}>Cancel</Button>
                  <Button variant="primary" size="sm" onClick={saveBankAccount}>Save bank details</Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {statementOpen
        ? createPortal(
            <div
              className="rc-modal-backdrop statement-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setStatementOpen(false);
              }}
            >
              <div
                className="rc-modal account-statement"
                role="dialog"
                aria-modal="true"
                aria-labelledby="account-statement-title"
              >
                <div className="account-statement__head">
                  <div className="account-statement__identity">
                    <span className="account-statement__mark" aria-hidden="true">
                      <IconFinance size={18} />
                    </span>
                    <div>
                      <h2 id="account-statement-title" className="rc-modal__title">
                        Statement of account
                      </h2>
                      <div className="account-statement__account-meta">
                        <span>{vendorName}</span>
                        <span>HDFC Bank</span>
                        <span className="pt-mono">Account ending 2163</span>
                      </div>
                    </div>
                  </div>
                  <IconButton label="Close statement" onClick={() => setStatementOpen(false)} autoFocus>
                    <IconClose />
                  </IconButton>
                </div>

                <div className="account-statement__period">
                  <div className="account-statement__period-copy">
                    <strong>Statement period</strong>
                    <span>Transactions and balances update with the selected dates.</span>
                  </div>
                  <div className="account-statement__filters" aria-label="Statement period">
                    <label>
                      <span>From</span>
                      <span className="account-statement__date-input">
                        <IconCalendar size={15} />
                        <input
                          type="date"
                          value={statementStart}
                          max={statementEnd}
                          onChange={(event) => setStatementStart(event.target.value)}
                        />
                      </span>
                    </label>
                    <span className="account-statement__date-separator" aria-hidden="true">to</span>
                    <label>
                      <span>To</span>
                      <span className="account-statement__date-input">
                        <IconCalendar size={15} />
                        <input
                          type="date"
                          value={statementEnd}
                          min={statementStart}
                          onChange={(event) => setStatementEnd(event.target.value)}
                        />
                      </span>
                    </label>
                  </div>
                </div>

                <dl className="account-statement__summary">
                  <div>
                    <dt>Opening balance</dt>
                    <dd>{inr.format(openingBalance)}</dd>
                    <dd className="account-statement__metric-note">Carried into this period</dd>
                  </div>
                  <div>
                    <dt>Invoiced</dt>
                    <dd>{inr.format(statementTotals.debit)}</dd>
                    <dd className="account-statement__metric-note">Total supplier debits</dd>
                  </div>
                  <div>
                    <dt>Paid</dt>
                    <dd className="account-statement__paid">{inr.format(statementTotals.credit)}</dd>
                    <dd className="account-statement__metric-note">Payments recorded</dd>
                  </div>
                  <div className="account-statement__closing">
                    <dt>Closing balance</dt>
                    <dd>{inr.format(statementTotals.closing)}</dd>
                    <dd className="account-statement__metric-note">Outstanding at period end</dd>
                  </div>
                </dl>

                <div className="account-statement__body">
                  {!statementRangeValid ? (
                    <EmptyState
                      title="Choose a valid date range"
                      description="The start date must be before the end date."
                    />
                  ) : statementRows.length === 0 ? (
                    <EmptyState
                      title="No transactions in this period"
                      description="Adjust the dates to include invoices or payments."
                    />
                  ) : (
                    <DataSheet className="statement-sheet" aria-label="Account statement transactions">
                      <DataSheetHeader>
                        <DataSheetCell>Date</DataSheetCell>
                        <DataSheetCell>Reference</DataSheetCell>
                        <DataSheetCell>Description</DataSheetCell>
                        <DataSheetCell className="statement-sheet__money">Debit</DataSheetCell>
                        <DataSheetCell className="statement-sheet__money">Credit</DataSheetCell>
                        <DataSheetCell className="statement-sheet__money">Balance</DataSheetCell>
                      </DataSheetHeader>
                      <DataSheetRow className="statement-sheet__opening-row">
                        <DataSheetCell><span className="statement-sheet__muted">—</span></DataSheetCell>
                        <DataSheetCell><span className="statement-sheet__muted">—</span></DataSheetCell>
                        <DataSheetCell><strong>Opening balance</strong></DataSheetCell>
                        <DataSheetCell className="statement-sheet__money"><span className="statement-sheet__muted">—</span></DataSheetCell>
                        <DataSheetCell className="statement-sheet__money"><span className="statement-sheet__muted">—</span></DataSheetCell>
                        <DataSheetCell className="statement-sheet__money"><strong>{inr.format(openingBalance)}</strong></DataSheetCell>
                      </DataSheetRow>
                      {statementRows.map((row) => (
                        <DataSheetRow key={row.id}>
                          <DataSheetCell>
                            <span className="statement-sheet__date">
                              {statementDate.format(new Date(`${row.date}T12:00:00`))}
                            </span>
                          </DataSheetCell>
                          <DataSheetCell>
                            <span
                              className={`statement-sheet__reference${
                                row.credit ? " statement-sheet__reference--payment" : ""
                              }`}
                            >
                              {row.reference}
                            </span>
                          </DataSheetCell>
                          <DataSheetCell>{row.description}</DataSheetCell>
                          <DataSheetCell className="statement-sheet__money">
                            {row.debit ? inr.format(row.debit) : <span className="statement-sheet__muted">—</span>}
                          </DataSheetCell>
                          <DataSheetCell className="statement-sheet__money">
                            <span className={row.credit ? "statement-sheet__credit" : undefined}>
                              {row.credit ? inr.format(row.credit) : <span className="statement-sheet__muted">—</span>}
                            </span>
                          </DataSheetCell>
                          <DataSheetCell className="statement-sheet__money statement-sheet__balance">
                            <strong>{inr.format(row.balance)}</strong>
                          </DataSheetCell>
                        </DataSheetRow>
                      ))}
                    </DataSheet>
                  )}
                </div>

                <div className="account-statement__foot">
                  <div className="account-statement__foot-meta">
                    <strong>{statementRows.length} transactions</strong>
                    <span>{statementPeriodLabel}</span>
                  </div>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => setStatementOpen(false)}>
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={exportStatement}
                      disabled={statementRows.length === 0 || !statementRangeValid}
                    >
                      {statementExported ? <IconCheck /> : <IconDownload />}
                      {statementExported ? "Downloaded" : "Download CSV"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

    </div>
  );
}
