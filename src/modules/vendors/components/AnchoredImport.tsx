import { useEffect, useRef, useState } from "react";
import { Button } from "@paryatech/design-system";
import { IconClose, IconDownload, IconFile, IconImport } from "../icons";
import "./AnchoredImport.css";

export function AnchoredImport({
  buttonLabel,
  title,
}: {
  buttonLabel: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnPointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnPointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const close = () => setOpen(false);
  const importTitle = title ?? buttonLabel;
  const importFile = () => {
    if (!file) return;
    setOpen(false);
    setFile(null);
  };

  return (
    <div className="anchored-import" ref={rootRef}>
      <Button
        variant="brand"
        size="sm"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IconImport />
        {buttonLabel}
      </Button>

      {open ? (
        <div className="anchored-import__popover" role="dialog" aria-label={`${buttonLabel} file`}>
          <div className="anchored-import__header">
            <h2>{importTitle}</h2>
            <button type="button" className="anchored-import__close" onClick={close} aria-label="Close import">
              <IconClose size={15} />
            </button>
          </div>

          <div className="anchored-import__body">
            <section className="anchored-import__step" aria-labelledby="import-template-title">
              <span className="anchored-import__step-number" aria-hidden="true">1</span>
              <div className="anchored-import__step-content">
                <div className="anchored-import__step-copy">
                  <strong id="import-template-title">Download a sample template</strong>
                  <span>Use the column format shown in the sample file.</span>
                </div>
                <div className="anchored-import__template-actions">
                  <Button variant="ghost" size="sm"><IconDownload />XLSX</Button>
                  <Button variant="ghost" size="sm"><IconDownload />CSV</Button>
                </div>
              </div>
            </section>

            <section className="anchored-import__step" aria-labelledby="import-upload-title">
              <span className="anchored-import__step-number" aria-hidden="true">2</span>
              <div className="anchored-import__step-content">
                <div className="anchored-import__step-copy">
                  <strong id="import-upload-title">Upload the completed file</strong>
                  <span>Choose an XLSX or CSV file from your computer.</span>
                </div>
                <label className={`anchored-import__file${file ? " is-selected" : ""}`}>
                  <span className="anchored-import__file-icon" aria-hidden="true"><IconFile size={18} /></span>
                  <span className="anchored-import__file-copy">
                    <strong>{file?.name ?? "Choose file from computer"}</strong>
                    <span>{file ? "Ready to import" : "XLSX or CSV · maximum 10 MB"}</span>
                  </span>
                  <span className="anchored-import__browse">{file ? "Replace" : "Browse"}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </section>
          </div>

          <div className="anchored-import__actions">
            <Button variant="ghost" size="sm" onClick={close}>Cancel</Button>
            <Button variant="primary" size="sm" disabled={!file} onClick={importFile}>
              <IconImport />Import file
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
