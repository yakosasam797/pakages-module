import type { ReactNode } from "react";
import "./SummaryStrip.css";

export interface SummaryField {
  id: string;
  label: string;
  value: ReactNode;
  note?: string;
  icon?: ReactNode;
  onClick?: () => void;
  /** Semantic colour on the primary value (ND03 money warn / ok). */
  tone?: "warn" | "ok";
}

/**
 * Trip-summary KPI strip from new-direction-03 — full-bleed property grid
 * with hairline dividers, uppercase labels, and icon + value rows.
 */
export function SummaryStrip({
  title = "Summary",
  meta,
  actions,
  fields,
  columns = 5,
  variant = "default",
}: {
  title?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  fields: SummaryField[];
  columns?: number;
  variant?: "default" | "icon-leading";
}) {
  return (
    <section className="summary-section" aria-labelledby="summary-strip-title">
      <div className="summary-section__head">
        <div className="summary-section__titles">
          <h2 id="summary-strip-title" className="summary-section__title">
            {title}
          </h2>
          {meta ? <p className="summary-section__meta">{meta}</p> : null}
        </div>
        {actions ? <div className="summary-section__actions">{actions}</div> : null}
      </div>
      <div
        className={`summary-strip summary-strip--cols-${columns} summary-strip--${variant}`}
        role="list"
      >
        {fields.map((field) => {
          const interactive = Boolean(field.onClick);
          const Tag = interactive ? "button" : "div";
          const toneClass =
            field.tone === "warn"
              ? " summary-strip__text--warn"
              : field.tone === "ok"
                ? " summary-strip__text--ok"
                : "";
          return (
            <Tag
              key={field.id}
              type={interactive ? "button" : undefined}
              className="summary-strip__field"
              role="listitem"
              onClick={field.onClick}
            >
              {variant === "icon-leading" && field.icon ? (
                <span className="summary-strip__icon" aria-hidden="true">
                  {field.icon}
                </span>
              ) : null}
              <div className="summary-strip__content">
                <div className="summary-strip__label">{field.label}</div>
                <div className="summary-strip__value">
                  {variant === "default" && field.icon ? (
                    <span className="summary-strip__icon" aria-hidden="true">
                      {field.icon}
                    </span>
                  ) : null}
                  <span className={`summary-strip__text pt-mono${toneClass}`}>
                    {field.value}
                  </span>
                </div>
              </div>
              {variant === "default" && field.note ? (
                <div className="summary-strip__note">{field.note}</div>
              ) : null}
            </Tag>
          );
        })}
      </div>
    </section>
  );
}
