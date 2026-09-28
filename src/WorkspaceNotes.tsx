import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button, NotesDrawer, NotesStrip } from "@paryatech/ui";
import "./WorkspaceNotes.css";

export type NotesMode = "browse" | "compose";
export type NotesModule = "packages" | "destination" | "finance" | "vendors";

interface Note {
  id: string;
  body: string;
  author: string;
  when: string;
  related: string;
  pinned: boolean;
  mine: boolean;
  taskCreated?: boolean;
}

const labels: Record<NotesModule, string> = {
  packages: "Package notes",
  destination: "Destination notes",
  finance: "Finance notes",
  vendors: "Vendor notes",
};

const relatedChoices: Record<NotesModule, string[]> = {
  packages: ["Package", "Proposal", "Itinerary day", "Service"],
  destination: ["Destination", "Region", "Package", "Vendor"],
  finance: ["Receivable", "Payable", "Transaction", "Expense"],
  vendors: ["Vendor", "Rate card", "Service", "Payment details"],
};

const storageKey = (module: NotesModule) => `paryatech-workspace-notes:${module}`;

function readNotes(module: NotesModule): Note[] {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(module)) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function WorkspaceNotes({ module, hideStrip = false, records = [] }: { module: NotesModule; hideStrip?: boolean; records?: string[] }) {
  const [notes, setNotes] = useState<Note[]>(() => readNotes(module));
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<NotesMode>("browse");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [related, setRelated] = useState("");
  const [pin, setPin] = useState(false);

  useEffect(() => setNotes(readNotes(module)), [module]);
  useEffect(() => {
    localStorage.setItem(storageKey(module), JSON.stringify(notes));
  }, [module, notes]);

  const openNotes = (nextMode: NotesMode) => {
    setMode(nextMode);
    setOpen(true);
  };

  useEffect(() => {
    if (!hideStrip) return;
    const listener = (event: Event) => openNotes((event as CustomEvent<NotesMode>).detail);
    window.addEventListener(`paryatech-open-${module}-notes`, listener);
    return () => window.removeEventListener(`paryatech-open-${module}-notes`, listener);
  }, [hideStrip, module]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".pt-nd")) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const save = () => {
    const body = draft.trim();
    if (!body) return;
    setNotes((current) => [{
      id: crypto.randomUUID(), body, author: "Vrushabh Jain", when: "just now",
      related: related.trim(), pinned: pin, mine: true,
    }, ...current]);
    setDraft("");
    setRelated("");
    setPin(false);
    setMode("browse");
    setFilter("all");
    setSearch("");
  };

  const updateNote = (id: string, change: Partial<Note>) =>
    setNotes((current) => current.map((note) => note.id === id ? { ...note, ...change } : note));
  const visible = notes.filter((note) => {
    if (filter === "pinned" && !note.pinned) return false;
    if (filter === "mine" && !note.mine) return false;
    const query = search.trim().toLowerCase();
    return !query || `${note.body} ${note.author} ${note.related}`.toLowerCase().includes(query);
  }).sort((a, b) => Number(b.pinned) - Number(a.pinned));
  const title = labels[module];

  return <>
    {!hideStrip && <NotesStrip
      label={title}
      badge={notes.filter((note) => note.pinned).length || undefined}
      onOpen={() => openNotes("browse")}
      onAdd={() => openNotes("compose")}
    />}
    {createPortal(<NotesDrawer
      className="workspace-notes-drawer"
      open={open}
      onClose={() => setOpen(false)}
      mode={mode}
      onModeChange={setMode}
      title={mode === "compose" ? "Write a note" : title}
      search={<input aria-label="Search notes" placeholder="Search notes" value={search} onChange={(event) => setSearch(event.target.value)} />}
      filters={[
        { id: "all", label: "All", active: filter === "all", onSelect: () => setFilter("all") },
        { id: "pinned", label: "Pinned", active: filter === "pinned", onSelect: () => setFilter("pinned") },
        { id: "mine", label: "Mine", active: filter === "mine", onSelect: () => setFilter("mine") },
      ]}
      compose={<>
        <textarea aria-label="Note" placeholder={`What should the team know about this ${module === "packages" ? "package" : module === "vendors" ? "vendor" : module === "finance" ? "finance record" : "destination"}?`} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <label className="workspace-notes-related">Related to
          <select value={related} onChange={(event) => setRelated(event.target.value)}>
            <option value="">Nothing specific</option>
            {records.map((record) => <option key={record} value={record}>{record}</option>)}
            {relatedChoices[module].map((choice) => <option key={choice} value={choice}>{choice}</option>)}
          </select>
        </label>
        <label className="workspace-notes-pin"><input type="checkbox" checked={pin} onChange={(event) => setPin(event.target.checked)} /> Pin to the top</label>
      </>}
      composeFooter={<>
        <Button variant="ghost" size="sm" onClick={() => setMode("browse")}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={save} disabled={!draft.trim()}>Save note</Button>
      </>}
    >
      {visible.length ? visible.map((note) => <article className="workspace-note" key={note.id}>
        <p>{note.pinned && <span className="workspace-note-pin" aria-label="Pinned">◆ </span>}{note.body}</p>
        <div className="workspace-note-meta"><strong>{note.author}</strong> · {note.when}{note.related && <> · <span>{note.related}</span></>}</div>
        <div className="workspace-note-actions">
          <button type="button" onClick={() => updateNote(note.id, { pinned: !note.pinned })}>{note.pinned ? "Unpin" : "Pin"}</button>
          <button type="button" disabled={note.taskCreated} onClick={() => updateNote(note.id, { taskCreated: true })}>{note.taskCreated ? "Task created" : "Create task"}</button>
          <button type="button" onClick={() => setNotes((current) => current.filter((item) => item.id !== note.id))}>Delete</button>
        </div>
      </article>) : <p className="workspace-note-empty">{notes.length ? "No notes match." : `No ${title.toLowerCase()} yet. Use + to write one.`}</p>}
    </NotesDrawer>, document.body)}
  </>;
}
