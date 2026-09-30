import { useEffect, useId } from "react";
import { Button } from "@paryatech/design-system";
import type { Season } from "../../rateCard/types";
import { IconClose, IconPlus } from "../../icons";
import "../VendorFormModal.css";

type SeasonRange = { start: string; end: string };

type SeasonDraft = {
  mode: "add" | "edit";
  index?: number;
  name: string;
  priority: "Base" | "Override";
  ranges: SeasonRange[];
};

function nightsBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const a = new Date(start);
  const b = new Date(end);
  const n = Math.round((b.getTime() - a.getTime()) / 86400000);
  return n > 0 ? n : 0;
}

function formatRanges(ranges: SeasonRange[]): { dates: string; summary: string; nights: number } {
  const nights = ranges.reduce((t, r) => t + nightsBetween(r.start, r.end), 0);
  const filled = ranges.filter((r) => r.start && r.end);
  if (filled.length === 0) {
    return { dates: "Not set", summary: "Add date ranges", nights: 0 };
  }
  if (filled.length === 1) {
    const r = filled[0];
    return {
      dates: `${r.start} – ${r.end}`,
      summary: `1 range · ${nights} nights`,
      nights,
    };
  }
  return {
    dates: filled.map((r) => `${r.start} – ${r.end}`).join(" · "),
    summary: `${filled.length} ranges · ${nights} nights`,
    nights,
  };
}

export function SeasonEditorModal({
  open,
  draft,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  draft: SeasonDraft | null;
  onChange: (next: SeasonDraft) => void;
  onClose: () => void;
  onSave: (season: Season, mode: "add" | "edit", index?: number) => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open || !draft) return null;

  const canSave = draft.name.trim().length > 0;

  return (
    <div className="pt-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="pt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-modal__head">
          <h2 id={titleId} className="pt-modal__title">
            {draft.mode === "add" ? "Add season" : "Edit season"}
          </h2>
          <button type="button" className="pt-modal__icon-close" onClick={onClose} aria-label="Close">
            <IconClose size={15} />
          </button>
        </div>

        <div className="pt-modal__body">
          <label className="pt-mf">
            <span className="pt-mf__l">Season name</span>
            <input
              className="pt-mf__i"
              value={draft.name}
              placeholder="e.g. Shoulder"
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
            />
          </label>

          <div className="pt-mf">
            <span className="pt-mf__l">Date ranges</span>
            {draft.ranges.map((rg, ri) => (
              <div key={ri} className="pt-mf-row" style={{ marginTop: ri === 0 ? 0 : 8 }}>
                <input
                  className="pt-mf__i"
                  type="date"
                  value={rg.start}
                  aria-label={`Range ${ri + 1} start`}
                  onChange={(e) =>
                    onChange({
                      ...draft,
                      ranges: draft.ranges.map((x, i) =>
                        i === ri ? { ...x, start: e.target.value } : x,
                      ),
                    })
                  }
                />
                <input
                  className="pt-mf__i"
                  type="date"
                  value={rg.end}
                  aria-label={`Range ${ri + 1} end`}
                  onChange={(e) =>
                    onChange({
                      ...draft,
                      ranges: draft.ranges.map((x, i) =>
                        i === ri ? { ...x, end: e.target.value } : x,
                      ),
                    })
                  }
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Button
                variant="brand"
                size="sm"
                onClick={() =>
                  onChange({
                    ...draft,
                    ranges: [...draft.ranges, { start: "", end: "" }],
                  })
                }
              >
                <IconPlus />
                Add range
              </Button>
              {draft.ranges.length > 1 ? (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() =>
                    onChange({
                      ...draft,
                      ranges: draft.ranges.slice(0, -1),
                    })
                  }
                >
                  Remove last
                </Button>
              ) : null}
            </div>
          </div>

          <div className="pt-mf">
            <span className="pt-mf__l">Priority</span>
            <div className="pt-mf__chips">
              {(["Base", "Override"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`pt-mf__chip${draft.priority === p ? " is-on" : ""}`}
                  onClick={() => onChange({ ...draft, priority: p })}
                >
                  {p === "Override" ? "Overrides base" : "Base"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-modal__foot">
          <Button variant="brand" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              const meta = formatRanges(draft.ranges);
              const season: Season = {
                name: draft.name.trim(),
                colorToken: draft.priority === "Override" ? "pink" : "accent",
                dates: meta.dates,
                summary: meta.summary,
                nights: meta.nights,
                priority: draft.priority === "Override" ? "Overrides base" : "Base",
              };
              onSave(season, draft.mode, draft.index);
            }}
          >
            Save season
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { SeasonDraft };
