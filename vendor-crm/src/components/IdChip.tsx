import { useState } from "react";
import { IconBookmark, IconCheck, IconCopy } from "../icons";
import "./IdChip.css";

/**
 * Booking-style record ID chip (`id-chip` + `bk-ref` from new-direction-03).
 * Soft-rect mono pill with bookmark mark and hover-revealed copy control.
 */
export function IdChip({
  id,
  tip = "Record reference",
  copyLabel = "Copy ID",
}: {
  id: string;
  tip?: string;
  copyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard may be blocked; leave UI unchanged */
    }
  };

  return (
    <span className="id-chip">
      <span className="id-chip__ref" title={tip}>
        <IconBookmark />
        {id}
      </span>
      <button
        type="button"
        className={`id-chip__copy${copied ? " id-chip__copy--done" : ""}`}
        onClick={copy}
        aria-label={copied ? "Copied" : copyLabel}
        data-tip={copied ? "Copied" : copyLabel}
      >
        {copied ? <IconCheck /> : <IconCopy />}
      </button>
    </span>
  );
}
