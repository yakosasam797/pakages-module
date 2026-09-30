import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Avatar,
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  EmptyState,
  IconButton,
  LeadCell,
  Pagination,
  SearchField,
  Tooltip,
  type CheckboxState,
} from "@paryatech/design-system";
import { DashboardDataSheetFill } from "./DashboardDataSheet";
import {
  COMPLIANCE_DOCS,
  DOC_ACTION_LABEL,
  DOC_STATUS_TONE,
  type ComplianceDoc,
  type DocStatus,
} from "../data/vendorFinance";
import {
  IconCheck,
  IconClose,
  IconFile,
  IconFilter,
  IconImport,
  IconMore,
  IconSend,
  IconTrash,
  IconWarn,
} from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import "./VendorFinancePanel.css";

interface OpenDocMenu {
  id: string;
  top: number;
  left: number;
}

interface DisplayDocument extends ComplianceDoc {
  objectUrl?: string;
  mimeType?: string;
  sizeLabel?: string;
}

interface UploadDraft {
  file: File;
  name: string;
  reference: string;
  validity: "none" | "expires";
  validUntil: string;
}

type DocumentStatusFilter = "all" | DocStatus;

const DOCUMENT_STATUS_FILTERS: Array<{ value: DocumentStatusFilter; label: string }> = [
  { value: "all", label: "All documents" },
  { value: "verified", label: "Verified" },
  { value: "expiring", label: "Expiring" },
  { value: "expired", label: "Expired" },
  { value: "awaiting", label: "Awaiting signature" },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function daysUntilDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const targetUtc = Date.UTC(year, month - 1, day);
  return Math.round((targetUtc - todayUtc) / DAY_MS);
}

function displayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return `${String(day).padStart(2, "0")} ${MONTH_LABELS[month - 1]} ${year}`;
}

function applyDocumentLifecycle(document: DisplayDocument): DisplayDocument {
  if (document.status === "awaiting") return document;
  if (!document.validUntil) {
    return {
      ...document,
      validTo: "— no expiry",
      validTone: undefined,
      status: "verified",
      statusLabel: "Verified",
      action: "view",
    };
  }

  const days = daysUntilDate(document.validUntil);
  if (days < 0) {
    const elapsed = Math.abs(days);
    return {
      ...document,
      validTo: displayDate(document.validUntil),
      validTone: "bad",
      status: "expired",
      statusLabel: `Expired · ${elapsed} ${elapsed === 1 ? "day" : "days"} ago`,
      action: "request-renewal",
    };
  }
  if (days <= 30) {
    return {
      ...document,
      validTo: displayDate(document.validUntil),
      validTone: "warn",
      status: "expiring",
      statusLabel: days === 0 ? "Expires today" : `Expiring · ${days} ${days === 1 ? "day" : "days"}`,
      action: "request-renewal",
    };
  }
  return {
    ...document,
    validTo: displayDate(document.validUntil),
    validTone: undefined,
    status: "verified",
    statusLabel: "Verified",
    action: "view",
  };
}

function documentTitle(fileName: string) {
  const stem = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return stem ? `${stem.charAt(0).toUpperCase()}${stem.slice(1)}` : "Uploaded document";
}

function fileSizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VendorDocsPanel({
  onRequestDocuments,
  canEdit = false,
}: {
  onRequestDocuments?: (documentName?: string, action?: "request-renewal" | "chase") => void;
  canEdit?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [documentRows, setDocumentRows] = useState<DisplayDocument[]>(() =>
    COMPLIANCE_DOCS.map((row) => ({ ...row })),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<OpenDocMenu | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [uploadDraft, setUploadDraft] = useState<UploadDraft | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const uploadedUrlsRef = useRef<string[]>([]);

  const displayRows = useMemo(
    () => documentRows.map(applyDocumentLifecycle),
    [documentRows],
  );

  const docs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return displayRows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.file.toLowerCase().includes(q) ||
        row.reference.toLowerCase().includes(q) ||
        row.ownerName.toLowerCase().includes(q)
      );
    });
  }, [displayRows, query, statusFilter]);

  const documentToDelete = documentRows.find((row) => row.id === deleteId) ?? null;
  const previewDocument = displayRows.find((row) => row.id === previewId) ?? null;
  const openMenuDocument = displayRows.find((row) => row.id === openMenu?.id) ?? null;
  const uploadLifecycle = uploadDraft
    ? applyDocumentLifecycle({
        id: "upload-preview",
        name: uploadDraft.name,
        file: uploadDraft.file.name,
        reference: uploadDraft.reference,
        validTo: "— no expiry",
        validUntil: uploadDraft.validity === "expires" ? uploadDraft.validUntil || undefined : undefined,
        ownerName: "Priya Nair",
        ownerInitials: "PN",
        status: "verified",
        statusLabel: "Verified",
        action: "view",
      })
    : null;
  const canAddUpload = Boolean(
    uploadDraft?.name.trim() &&
      uploadDraft.reference.trim() &&
      (uploadDraft.validity === "none" || uploadDraft.validUntil),
  );

  useEffect(() => {
    const uploadedUrls = uploadedUrlsRef.current;
    return () => uploadedUrls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (!filterOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) setFilterOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filterOpen]);

  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!deleteId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDeleteId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteId]);

  useEffect(() => {
    if (!previewId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewId]);

  useEffect(() => {
    if (!uploadDraft) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUploadDraft(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [uploadDraft]);

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === docs.length && docs.length > 0
        ? "on"
        : "indeterminate";

  const toggleAll = (state: CheckboxState) => {
    setSelected(state === "on" ? docs.map((row) => row.id) : []);
  };

  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((current) =>
      state === "on"
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id),
    );
  };

  const showRowMenu = (id: string, button: HTMLButtonElement) => {
    if (openMenu?.id === id) {
      setOpenMenu(null);
      return;
    }
    const rect = button.getBoundingClientRect();
    const menuWidth = 188;
    const row = displayRows.find((document) => document.id === id);
    const menuHeight = row?.action !== "view" ? 82 : 48;
    const gap = 6;
    const left = Math.max(12, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12));
    const top =
      rect.bottom + gap + menuHeight <= window.innerHeight
        ? rect.bottom + gap
        : rect.top - menuHeight - gap;
    setOpenMenu({ id, top, left });
  };

  const deleteDocument = () => {
    if (!deleteId) return;
    setDocumentRows((rows) => rows.filter((row) => row.id !== deleteId));
    setSelected((ids) => ids.filter((id) => id !== deleteId));
    setDeleteId(null);
  };

  const prepareDocumentUpload = (file: File | null) => {
    if (!file) return;
    setUploadDraft({
      file,
      name: documentTitle(file.name),
      reference: `UPL/${new Date().getFullYear()}/${String(documentRows.length + 1).padStart(3, "0")}`,
      validity: "none",
      validUntil: "",
    });
  };

  const addUploadedDocument = () => {
    if (!uploadDraft || !canAddUpload) return;
    const id = `d-upload-${Date.now()}`;
    const objectUrl = URL.createObjectURL(uploadDraft.file);
    uploadedUrlsRef.current.push(objectUrl);
    const uploaded: DisplayDocument = {
      id,
      name: uploadDraft.name.trim(),
      file: uploadDraft.file.name,
      reference: uploadDraft.reference.trim(),
      validTo: "— no expiry",
      validUntil: uploadDraft.validity === "expires" ? uploadDraft.validUntil : undefined,
      ownerName: "Priya Nair",
      ownerInitials: "PN",
      status: "verified",
      statusLabel: "Verified",
      action: "view",
      objectUrl,
      mimeType: uploadDraft.file.type,
      sizeLabel: fileSizeLabel(uploadDraft.file.size),
    };
    setDocumentRows((rows) => [uploaded, ...rows]);
    setUploadDraft(null);
    setQuery("");
    setPage(1);
    setPreviewId(id);
  };

  return (
    <div className="vendor-finance dashboard-table-panel">
      <section className="vendor-finance__section dashboard-table-panel" aria-labelledby="docs-title">
        <div className="vendor-finance__section-head">
          <h2 id="docs-title" className="vendor-finance__title">
            Compliance documents
          </h2>
        </div>

        <div className="vendor-finance__toolbar">
          <SearchField
            fullWidth
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
              setSelected([]);
            }}
            placeholder="Search document"
            aria-label="Search document"
          />
          <div className="vendor-finance__tools">
            <div className="docs-filter" ref={filterRef}>
              <Tooltip tip="Filter">
                <IconButton
                  className={statusFilter === "all" ? undefined : "is-active"}
                  label={`Filter documents${
                    statusFilter === "all"
                      ? ""
                      : `: ${
                          DOCUMENT_STATUS_FILTERS.find((option) => option.value === statusFilter)
                            ?.label ?? statusFilter
                        }`
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={filterOpen}
                  onClick={() => {
                    setFilterOpen((open) => !open);
                    setOpenMenu(null);
                  }}
                >
                  <IconFilter />
                </IconButton>
              </Tooltip>
              {filterOpen ? (
                <div className="docs-filter__menu" role="menu" aria-label="Filter documents by status">
                  {DOCUMENT_STATUS_FILTERS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={statusFilter === option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setSelected([]);
                        setPage(1);
                        setFilterOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {statusFilter === option.value ? <IconCheck /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {canEdit ? (
              <>
                <Button variant="brand" size="sm" onClick={() => onRequestDocuments?.()}>
                  <IconSend />
                  Request
                </Button>
                <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <IconImport />
                  Upload file
                </Button>
                <input
                  ref={fileInputRef}
                  className="docs-upload-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(event) => {
                    prepareDocumentUpload(event.target.files?.[0] ?? null);
                    event.target.value = "";
                  }}
                />
              </>
            ) : null}
          </div>
        </div>

        {statusFilter !== "all" ? (
          <div className="docs-filter-result" role="status">
            Showing {
              DOCUMENT_STATUS_FILTERS.find((option) => option.value === statusFilter)?.label.toLowerCase()
            } documents
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setSelected([]);
                setPage(1);
              }}
            >
              Clear filter
            </button>
          </div>
        ) : null}

        <div className="vendor-finance__sheet dashboard-table-end">
          {docs.length === 0 ? (
            <EmptyState
              title="No documents match this view"
              description="Clear the filter or try another document name, owner, or reference."
            />
          ) : (
            <>
              <DataSheet className="docs-sheet" aria-label="Compliance documents">
                <DataSheetHeader>
                  <DataSheetCell check>
                    <Checkbox
                      state={headerState}
                      onCheckedChange={toggleAll}
                      label="Select all documents"
                    />
                  </DataSheetCell>
                  <DataSheetCell>Document</DataSheetCell>
                  <DataSheetCell>Reference</DataSheetCell>
                  <DataSheetCell>Valid to</DataSheetCell>
                  <DataSheetCell>Owner</DataSheetCell>
                  <DataSheetCell>Status</DataSheetCell>
                  <DataSheetCell>Action</DataSheetCell>
                </DataSheetHeader>
                {docs.map((row) => (
                  <DataSheetRow
                    key={row.id}
                    className="data-row--interactive"
                    role="link"
                    tabIndex={0}
                    aria-label={`Open ${row.name}`}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button, a, input, select, textarea")) return;
                      setPreviewId(row.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setPreviewId(row.id);
                      }
                    }}
                  >
                    <DataSheetCell check>
                      <Checkbox
                        state={selected.includes(row.id) ? "on" : "off"}
                        onCheckedChange={(state) => toggleRow(row.id, state)}
                        label={`Select ${row.name}`}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <LeadCell icon={<IconFile size={15} />} title={row.name} subtitle={row.file} />
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="docs-sheet__ref pt-mono">{row.reference}</span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span
                        className={
                          row.validTone === "bad"
                            ? "docs-sheet__valid docs-sheet__valid--bad"
                            : row.validTone === "warn"
                            ? "docs-sheet__valid docs-sheet__valid--warn"
                            : "docs-sheet__valid"
                        }
                      >
                        {row.validTo}
                      </span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <span className="docs-sheet__owner">
                        <Avatar tone="pink" size={26}>
                          {row.ownerInitials}
                        </Avatar>
                        {row.ownerName}
                      </span>
                    </DataSheetCell>
                    <DataSheetCell>
                      <StatusChipWithDot tone={DOC_STATUS_TONE[row.status]}>
                        {row.statusLabel}
                      </StatusChipWithDot>
                    </DataSheetCell>
                    <DataSheetCell>
                      <div className="docs-sheet__actions">
                        {canEdit ? (
                          <IconButton
                            className="docs-sheet__more"
                            label={`More actions for ${row.name}`}
                            aria-haspopup="menu"
                            aria-expanded={openMenu?.id === row.id}
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={(event) => showRowMenu(row.id, event.currentTarget)}
                          >
                            <IconMore />
                          </IconButton>
                        ) : null}
                      </div>
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
                <DashboardDataSheetFill columns={7} />
              </DataSheet>
              <Pagination
                rangeLabel={`Showing 1–${docs.length} of ${docs.length} documents`}
                page={page}
                pageCount={1}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </section>

      {uploadDraft
        ? createPortal(
            <div
              className="rc-modal-backdrop docs-upload-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setUploadDraft(null);
              }}
            >
              <form
                className="rc-modal docs-upload-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="docs-upload-title"
                aria-describedby="docs-upload-description"
                onSubmit={(event) => {
                  event.preventDefault();
                  addUploadedDocument();
                }}
              >
                <div className="docs-upload-modal__head">
                  <div>
                    <h2 id="docs-upload-title" className="rc-modal__title">
                      Add document details
                    </h2>
                    <p id="docs-upload-description" className="docs-upload-modal__description">
                      These details control how validity and expiry appear in the table.
                    </p>
                  </div>
                  <IconButton label="Close upload details" onClick={() => setUploadDraft(null)}>
                    <IconClose />
                  </IconButton>
                </div>

                <div className="docs-upload-modal__file">
                  <span aria-hidden="true"><IconFile size={17} /></span>
                  <div>
                    <strong>{uploadDraft.file.name}</strong>
                    <small>{fileSizeLabel(uploadDraft.file.size)}</small>
                  </div>
                </div>

                <div className="docs-upload-modal__grid">
                  <label className="docs-upload-field">
                    <span>Document name</span>
                    <input
                      value={uploadDraft.name}
                      onChange={(event) =>
                        setUploadDraft((current) =>
                          current ? { ...current, name: event.target.value } : current,
                        )
                      }
                      autoFocus
                      required
                    />
                  </label>
                  <label className="docs-upload-field">
                    <span>Reference</span>
                    <input
                      value={uploadDraft.reference}
                      onChange={(event) =>
                        setUploadDraft((current) =>
                          current ? { ...current, reference: event.target.value } : current,
                        )
                      }
                      required
                    />
                  </label>
                </div>

                <fieldset className="docs-upload-validity">
                  <legend>Validity</legend>
                  <p>Choose whether this document needs renewal.</p>
                  <div className="docs-upload-validity__choices">
                    <label>
                      <input
                        type="radio"
                        name="document-validity"
                        checked={uploadDraft.validity === "none"}
                        onChange={() =>
                          setUploadDraft((current) =>
                            current ? { ...current, validity: "none", validUntil: "" } : current,
                          )
                        }
                      />
                      <span><strong>No expiry</strong><small>For permanent records</small></span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="document-validity"
                        checked={uploadDraft.validity === "expires"}
                        onChange={() =>
                          setUploadDraft((current) =>
                            current ? { ...current, validity: "expires" } : current,
                          )
                        }
                      />
                      <span><strong>Expires on</strong><small>Track renewal automatically</small></span>
                    </label>
                  </div>
                </fieldset>

                {uploadDraft.validity === "expires" ? (
                  <label className="docs-upload-field docs-upload-field--date">
                    <span>Valid to</span>
                    <input
                      type="date"
                      value={uploadDraft.validUntil}
                      onChange={(event) =>
                        setUploadDraft((current) =>
                          current ? { ...current, validUntil: event.target.value } : current,
                        )
                      }
                      required
                    />
                  </label>
                ) : null}

                <div
                  className={`docs-upload-lifecycle${
                    uploadDraft.validity === "expires" && !uploadDraft.validUntil
                      ? ""
                      : uploadLifecycle?.status === "expired"
                        ? " docs-upload-lifecycle--bad"
                        : uploadLifecycle?.status === "expiring"
                          ? " docs-upload-lifecycle--warn"
                          : " docs-upload-lifecycle--ok"
                  }`}
                  role="status"
                >
                  <strong>Table result</strong>
                  <span>
                    {uploadDraft.validity === "expires" && !uploadDraft.validUntil
                      ? "Choose a date to calculate the document status."
                      : `${uploadLifecycle?.validTo} · ${uploadLifecycle?.statusLabel}`}
                  </span>
                </div>

                <div className="docs-upload-modal__actions">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setUploadDraft(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" disabled={!canAddUpload}>
                    Add document
                  </Button>
                </div>
              </form>
            </div>,
            document.body,
          )
        : null}

      {openMenu
        ? createPortal(
            <div
              className="docs-row-menu"
              role="menu"
              aria-label="Document actions"
              style={{ top: openMenu.top, left: openMenu.left }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              {openMenuDocument && openMenuDocument.action !== "view" ? (
                  <button
                    type="button"
                    className="docs-row-menu__item"
                    role="menuitem"
                    autoFocus
                    onClick={() => {
                      const action = openMenuDocument.action;
                      if (action !== "view") onRequestDocuments?.(openMenuDocument.name, action);
                      setOpenMenu(null);
                    }}
                  >
                    <IconSend />
                    {DOC_ACTION_LABEL[openMenuDocument.action]}
                  </button>
                ) : null}
              <button
                type="button"
                className="docs-row-menu__item docs-row-menu__item--danger"
                role="menuitem"
                autoFocus={openMenuDocument?.action === "view"}
                onClick={() => {
                  setDeleteId(openMenu.id);
                  setOpenMenu(null);
                }}
              >
                <IconTrash />
                Delete document
              </button>
            </div>,
            document.body,
          )
        : null}

      {documentToDelete
        ? createPortal(
            <div
              className="rc-modal-backdrop docs-delete-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setDeleteId(null);
              }}
            >
              <div
                className="rc-modal docs-delete-confirm"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-doc-title"
                aria-describedby="delete-doc-description"
              >
                <div className="docs-delete-confirm__head">
                  <span className="docs-delete-confirm__icon" aria-hidden="true">
                    <IconWarn />
                  </span>
                  <IconButton label="Close" onClick={() => setDeleteId(null)}>
                    <IconClose />
                  </IconButton>
                </div>
                <h2 id="delete-doc-title" className="rc-modal__title">
                  Delete document?
                </h2>
                <p id="delete-doc-description" className="docs-delete-confirm__description">
                  <strong>{documentToDelete.name}</strong> and its uploaded file will be removed from
                  this vendor. This action cannot be undone.
                </p>
                <div className="docs-delete-confirm__actions">
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)}>
                    Cancel
                  </Button>
                  <Button
                    className="docs-delete-confirm__button"
                    variant="primary"
                    size="sm"
                    onClick={deleteDocument}
                    autoFocus
                  >
                    Delete document
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {previewDocument
        ? createPortal(
            <div
              className="rc-modal-backdrop docs-preview-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setPreviewId(null);
              }}
            >
              <div
                className="rc-modal docs-preview"
                role="dialog"
                aria-modal="true"
                aria-labelledby="docs-preview-title"
              >
                <div className="docs-preview__head">
                  <div className="docs-preview__titles">
                    <span className="docs-preview__file-icon" aria-hidden="true">
                      <IconFile size={18} />
                    </span>
                    <div>
                      <h2 id="docs-preview-title" className="rc-modal__title">
                        {previewDocument.name}
                      </h2>
                      <p>{previewDocument.file}</p>
                    </div>
                  </div>
                  <IconButton label="Close preview" onClick={() => setPreviewId(null)} autoFocus>
                    <IconClose />
                  </IconButton>
                </div>

                <div className="docs-preview__canvas">
                  {previewDocument.objectUrl && previewDocument.mimeType?.startsWith("image/") ? (
                    <img src={previewDocument.objectUrl} alt={`Preview of ${previewDocument.name}`} />
                  ) : previewDocument.objectUrl && previewDocument.mimeType === "application/pdf" ? (
                    <iframe src={previewDocument.objectUrl} title={`Preview of ${previewDocument.name}`} />
                  ) : (
                    <div className="docs-preview__placeholder">
                      <IconFile size={30} />
                      <strong>{previewDocument.file}</strong>
                      <span>
                        {previewDocument.objectUrl
                          ? "This file is ready and attached to the vendor."
                          : "Document preview is available in the connected file store."}
                      </span>
                    </div>
                  )}
                </div>

                <dl className="docs-preview__meta">
                  <div>
                    <dt>Reference</dt>
                    <dd>{previewDocument.reference}</dd>
                  </div>
                  <div>
                    <dt>Owner</dt>
                    <dd>{previewDocument.ownerName}</dd>
                  </div>
                  <div>
                    <dt>Valid to</dt>
                    <dd>{previewDocument.validTo}</dd>
                  </div>
                  {previewDocument.sizeLabel ? (
                    <div>
                      <dt>File size</dt>
                      <dd>{previewDocument.sizeLabel}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
