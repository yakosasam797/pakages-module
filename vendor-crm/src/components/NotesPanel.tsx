import { Button, IconButton } from "@paryatech/design-system";
import type { RateCardNote } from "../rateCard/types";
import { IconClose, IconPlus } from "../icons";
import "./NotesPanel.css";

export type NotesPanelNote = RateCardNote;

export function NotesPanel({
  open,
  title = "Rate card notes",
  notes,
  onClose,
}: {
  open: boolean;
  title?: string;
  notes: NotesPanelNote[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="notes-panel-overlay" role="presentation" onClick={onClose}>
      <aside
        className="notes-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-panel-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notes-panel__head">
          <div className="notes-panel__titles">
            <h2 id="notes-panel-title" className="notes-panel__title">
              {title}
            </h2>
          </div>
          <IconButton label="Close notes" onClick={onClose}>
            <IconClose />
          </IconButton>
        </div>

        <div className="notes-panel__list">
          {notes.length === 0 ? (
            <p className="notes-panel__empty">No notes yet. Use + on the notes strip to write one.</p>
          ) : (
            notes.map((n, i) => (
              <article key={`${n.when}-${i}`} className="notes-panel__note">
                <p className="notes-panel__body">{n.body}</p>
                <p className="notes-panel__meta">
                  {n.author} · {n.when}
                </p>
              </article>
            ))
          )}
        </div>

        <div className="notes-panel__foot">
          <Button variant="primary" size="sm">
            <IconPlus />
            Write note
          </Button>
        </div>
      </aside>
    </div>
  );
}
