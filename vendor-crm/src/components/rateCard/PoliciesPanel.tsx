import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
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
  type CheckboxState,
} from "@paryatech/design-system";
import type { PolicyDocument, PolicyRow } from "../../rateCard/types";
import { IconAttach, IconBookmark, IconClose, IconFile, IconPlus } from "../../icons";
import { DashboardDataSheetFill } from "../DashboardDataSheet";
import { StatusChipWithDot } from "../StatusChipWithDot";
import "../VendorFormModal.css";
import "./PoliciesPanel.css";

const STATUS_LABEL: Record<PolicyRow["status"], string> = {
  ok: "Resolved",
  unresolved: "Unresolved",
  none: "None",
};

const STATUS_TONE: Record<PolicyRow["status"], "done" | "progress" | "open"> = {
  ok: "done",
  unresolved: "progress",
  none: "open",
};

const POLICY_CATEGORIES = [
  "Cancellation",
  "Stay rules",
  "Tax",
  "Payment",
  "Currency",
  "Other",
] as const;

type ComposeMode = "policy" | "document" | null;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToDoc(file: File): PolicyDocument {
  return {
    name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    file: file.name,
    size: formatSize(file.size),
  };
}

/** Demo conversion — real OCR/extract would replace this. */
function extractTextFromFile(file: File, titleHint: string) {
  return (
    `Extracted from ${file.name}\n\n` +
    `${titleHint || "Policy"} — draft text generated from the uploaded document.\n\n` +
    `Review and edit this copy before saving. Attachments stay optional after conversion.`
  );
}

export function PoliciesPanel({ policies: seed }: { policies: PolicyRow[] }) {
  const [policies, setPolicies] = useState(seed);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [compose, setCompose] = useState<ComposeMode>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(POLICY_CATEGORIES[0]);
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docError, setDocError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    setPolicies(seed);
  }, [seed]);

  useEffect(() => {
    if (!compose && !openId) return;
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [compose, openId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return policies;
    return policies.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        (p.document?.name.toLowerCase().includes(q) ?? false) ||
        (p.document?.file.toLowerCase().includes(q) ?? false),
    );
  }, [policies, query]);

  const open = openId ? policies.find((p) => p.id === openId) ?? null : null;

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === filtered.length && filtered.length > 0
        ? "on"
        : "indeterminate";

  const resetCompose = () => {
    setCompose(null);
    setTitle("");
    setCategory(POLICY_CATEGORIES[0]);
    setSummary("");
    setBody("");
    setDocFile(null);
    setDocError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const openCompose = (mode: ComposeMode) => {
    resetCompose();
    setCompose(mode);
  };

  const onPickFile = (file: File | null) => {
    setDocError("");
    setDocFile(file);
    if (!file) return;
    if (compose === "document") {
      const hint = title.trim() || file.name.replace(/\.[^.]+$/, "");
      setTitle((t) => t || hint);
      setBody(extractTextFromFile(file, hint));
      setSummary((s) => s || `Imported from ${file.name}`);
    }
  };

  const savePolicy = () => {
    if (compose === "document" && !docFile) {
      setDocError("Choose a document to convert into policy text.");
      return;
    }
    if (!title.trim()) {
      setDocError("Give this policy a title.");
      return;
    }
    if (!body.trim()) {
      setDocError(
        compose === "document"
          ? "Converted text is empty — upload a document or paste the policy copy."
          : "Enter the policy text, or attach an optional document.",
      );
      return;
    }

    const row: PolicyRow = {
      id: `pol-new-${Date.now()}`,
      title: title.trim(),
      category,
      summary: summary.trim() || body.trim().split("\n").find((l) => l.trim())?.slice(0, 80) || "New policy",
      body: body.trim(),
      document: docFile ? fileToDoc(docFile) : null,
      status: "unresolved",
    };
    setPolicies((cur) => [row, ...cur]);
    resetCompose();
    setOpenId(row.id);
  };

  return (
    <div className="pol dashboard-table-panel">
      <div className="pol-toolbar">
        <SearchField
          fullWidth
          className="pol-toolbar__search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected([]);
          }}
          placeholder="Search policy or document"
          aria-label="Search policy or document"
        />
        <div className="pol-toolbar__actions">
          <Button variant="brand" size="sm" onClick={() => openCompose("document")}>
            <IconAttach />
            Add document
          </Button>
          <Button variant="primary" size="sm" onClick={() => openCompose("policy")}>
            <IconPlus />
            Add a policy
          </Button>
        </div>
      </div>

      <div className="pol-sheet-wrap dashboard-table-end">
        {filtered.length === 0 ? (
          <EmptyState
            title="No policies match"
            description="Try another search, or add a policy / document to this rate card."
          />
        ) : (
          <>
            <DataSheet className="pol-sheet" aria-label="Terms and conditions">
              <DataSheetHeader>
                <DataSheetCell check>
                  <Checkbox
                    state={headerState}
                    label="Select all policies"
                    onCheckedChange={(state) => {
                      if (state === "on") setSelected(filtered.map((p) => p.id));
                      else setSelected([]);
                    }}
                  />
                </DataSheetCell>
                <DataSheetCell>Policy</DataSheetCell>
                <DataSheetCell>Document</DataSheetCell>
                <DataSheetCell>Status</DataSheetCell>
              </DataSheetHeader>

              {filtered.map((p) => (
                <DataSheetRow
                  key={p.id}
                  className="data-row--interactive"
                  role="link"
                  tabIndex={0}
                  aria-label={`Open ${p.title}`}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("button, a, input, select, textarea")) return;
                    setOpenId(p.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setOpenId(p.id);
                    }
                  }}
                >
                  <DataSheetCell check>
                    <Checkbox
                      state={selected.includes(p.id) ? "on" : "off"}
                      label={`Select ${p.title}`}
                      onCheckedChange={(state) => {
                        setSelected((cur) =>
                          state === "on" ? [...cur, p.id] : cur.filter((id) => id !== p.id),
                        );
                      }}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <LeadCell align="start" icon={<IconBookmark size={15} />} title={p.title} subtitle={p.summary} />
                  </DataSheetCell>
                  <DataSheetCell>
                    {p.document ? (
                      <LeadCell
                        align="start"
                        icon={<IconFile size={15} />}
                        title={p.document.name}
                        subtitle={`${p.document.file} · ${p.document.size}`}
                      />
                    ) : (
                      <span className="pol-doc-empty">No document</span>
                    )}
                  </DataSheetCell>
                  <DataSheetCell>
                    <StatusChipWithDot tone={STATUS_TONE[p.status]}>
                      {STATUS_LABEL[p.status]}
                    </StatusChipWithDot>
                  </DataSheetCell>
                </DataSheetRow>
              ))}
              <DashboardDataSheetFill columns={4} />
            </DataSheet>

            <Pagination
              rangeLabel={
                filtered.length === 0
                  ? "Showing 0 of 0"
                  : `Showing 1–${filtered.length} of ${filtered.length}`
              }
              page={1}
              pageCount={1}
              onPageChange={() => undefined}
            />
          </>
        )}
      </div>

      {open ? (
        <div className="pt-modal-overlay open" role="presentation" onClick={() => setOpenId(null)}>
          <div
            className="pt-modal pt-modal--wide pol-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pol-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-modal__head pol-modal__head">
              <div className="pol-modal__head-text">
                <h2 id="pol-modal-title" className="pt-modal__title">
                  {open.title}
                </h2>
              </div>
              <IconButton label="Close policy" onClick={() => setOpenId(null)}>
                <IconClose />
              </IconButton>
            </div>

            <div className="pt-modal__body pol-modal__body">
              <div className="pol-modal__text" tabIndex={0}>
                {open.body.split("\n").map((line, i) =>
                  line.trim() === "" ? (
                    <br key={i} />
                  ) : (
                    <p key={i}>{line}</p>
                  ),
                )}
              </div>

              <aside className="pol-modal__doc" aria-label="Attached document">
                <h3 className="pol-modal__doc-title">Attached document</h3>
                {open.document ? (
                  <div className="pol-modal__doc-card">
                    <LeadCell
                      align="start"
                      icon={<IconFile size={18} />}
                      title={open.document.name}
                      subtitle={`${open.document.file} · ${open.document.size}`}
                    />
                    <Button variant="brand" size="sm">
                      Open file
                    </Button>
                  </div>
                ) : (
                  <p className="pol-modal__doc-empty">
                    No source document was uploaded for this policy. The readable text above is the
                    working copy on this rate card.
                  </p>
                )}
              </aside>
            </div>

            <div className="pt-modal__foot">
              <Button variant="brand" size="sm" onClick={() => setOpenId(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {compose ? (
        <div className="pt-modal-overlay open" role="presentation" onClick={resetCompose}>
          <div
            className="pt-modal pt-modal--wide pol-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-modal__head pol-modal__head">
              <div className="pol-modal__head-text">
                <h2 id={titleId} className="pt-modal__title">
                  {compose === "document" ? "Add document" : "Add a policy"}
                </h2>
              </div>
              <IconButton label="Close" onClick={resetCompose}>
                <IconClose />
              </IconButton>
            </div>

            <div className="pt-modal__body">
              {docError ? (
                <div className="pt-mf__errors" role="alert">
                  <p>{docError}</p>
                </div>
              ) : null}

              {compose === "document" ? (
                <div className="pt-mf">
                  <span className="pt-mf__l">Document</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.rtf,image/*"
                    className="pol-file"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="pt-mf__note">
                    Required. PDF, Word, or text — converted into the policy body below for editing.
                  </p>
                </div>
              ) : null}

              <div className="pt-mf-row">
                <div className="pt-mf">
                  <label className="pt-mf__l" htmlFor="pol-new-title">
                    Policy title
                  </label>
                  <input
                    id="pol-new-title"
                    className="pt-mf__i"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cancellation & refunds"
                  />
                </div>
                <div className="pt-mf">
                  <label className="pt-mf__l" htmlFor="pol-new-cat">
                    Category
                  </label>
                  <select
                    id="pol-new-cat"
                    className="pt-mf__i"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {POLICY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-mf">
                <label className="pt-mf__l" htmlFor="pol-new-summary">
                  Short summary
                </label>
                <input
                  id="pol-new-summary"
                  className="pt-mf__i"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="One line shown in the policies table"
                />
              </div>

              <div className="pt-mf">
                <label className="pt-mf__l" htmlFor="pol-new-body">
                  Policy text
                </label>
                <textarea
                  id="pol-new-body"
                  className="pt-mf__i pol-textarea"
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={
                    compose === "document"
                      ? "Converted text appears here after upload — edit freely."
                      : "Type the full policy copy…"
                  }
                />
              </div>

              {compose === "policy" ? (
                <div className="pt-mf">
                  <span className="pt-mf__l">Document (optional)</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.rtf,image/*"
                    className="pol-file"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="pt-mf__note">
                    Optional source file kept on the policy. Text above stays the working copy.
                  </p>
                  {docFile ? (
                    <div className="pol-modal__doc-card" style={{ marginTop: 10 }}>
                      <LeadCell
                        align="start"
                        icon={<IconFile size={18} />}
                        title={docFile.name}
                        subtitle={formatSize(docFile.size)}
                      />
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => {
                          setDocFile(null);
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {compose === "document" && docFile ? (
                <aside className="pol-modal__doc" aria-label="Uploaded document">
                  <h3 className="pol-modal__doc-title">Source document</h3>
                  <div className="pol-modal__doc-card">
                    <LeadCell
                      align="start"
                      icon={<IconFile size={18} />}
                      title={docFile.name}
                      subtitle={`${formatSize(docFile.size)} · converted to text`}
                    />
                  </div>
                </aside>
              ) : null}
            </div>

            <div className="pt-modal__foot">
              <Button variant="brand" size="sm" onClick={resetCompose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={savePolicy}>
                {compose === "document" ? "Save from document" : "Save policy"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
