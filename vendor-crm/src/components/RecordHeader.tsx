import type { ReactNode } from "react";
import { IdChip } from "./IdChip";
import "./RecordHeader.css";

/**
 * Booking-style record header from new-direction-03 (`.record`).
 * Title + status tags on the first row; meta row with optional date + IdChip;
 * aside for owner / actions. Reusable for bookings, rate cards, vendors.
 */
export function RecordHeader({
  title,
  titleNode,
  tags,
  date,
  recordId,
  idTip,
  metaExtra,
  aside,
  children,
}: {
  title: string;
  /** When editing — replace the h1 */
  titleNode?: ReactNode;
  tags?: ReactNode;
  date?: ReactNode;
  recordId?: string;
  idTip?: string;
  metaExtra?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="record-header">
      <div className="record-header__main">
        <div className="record-header__title-row">
          {titleNode ?? (
            <h1 className="record-header__title" title={title}>
              {title}
            </h1>
          )}
          {tags ? <div className="record-header__tags">{tags}</div> : null}
        </div>
        {(date || recordId || metaExtra) && (
          <div className="record-header__meta">
            {date}
            {date && recordId ? (
              <span className="record-header__sep" aria-hidden="true">
                ·
              </span>
            ) : null}
            {recordId ? <IdChip id={recordId} tip={idTip} copyLabel={`Copy ${recordId}`} /> : null}
            {metaExtra}
          </div>
        )}
        {children}
      </div>
      {aside ? <div className="record-header__aside">{aside}</div> : null}
    </header>
  );
}
