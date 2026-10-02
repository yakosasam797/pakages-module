import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  FilterSelect,
  IconButton,
  LeadCell,
  Pagination,
  SearchField,
  StatusChip,
  type CheckboxState,
} from "@paryatech/design-system";
import {
  DONE_VENDOR_TASKS,
  OPEN_VENDOR_TASKS,
  TASK_STATUS_TONE,
  type TaskStatus,
  type VendorTask,
} from "../data/tasks";
import {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconClose,
  IconPlus,
  IconTaskCheck,
} from "../icons";
import { DashboardDataSheetFill } from "./DashboardDataSheet";
import "./TasksPanel.css";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "Open", label: "Open" },
  { value: "In progress", label: "In progress" },
  { value: "Blocked", label: "Blocked" },
];

const CREATE_STATUS_OPTIONS: TaskStatus[] = ["Open", "In progress", "Blocked", "Done"];
const PRIORITY_OPTIONS = ["P1", "P2", "P3"] as const;
const TASK_ASSIGNEES = [
  { name: "Anjali Menon", role: "Vendor desk", initials: "AM", tone: "pink" as const },
  { name: "Meera Joseph", role: "Operations", initials: "MJ", tone: "default" as const },
  { name: "Vrushabh Jain", role: "Owner", initials: "VJ", tone: "pink" as const },
];

export type TaskLinkOption = {
  id: string;
  label: string;
  meta?: string;
};

export type TaskLinkGroup = {
  id: string;
  label: string;
  recordLabel: string;
  options: TaskLinkOption[];
};

type TaskDraft = {
  title: string;
  description: string;
  linkedSection: string;
  linkedRecordId: string;
  status: TaskStatus;
  priority: (typeof PRIORITY_OPTIONS)[number];
  assignee: string;
  dueDate: string;
  dueTime: string;
};

function createEmptyTaskDraft(linkGroups: TaskLinkGroup[]): TaskDraft {
  const firstGroup = linkGroups[0];
  return {
    title: "",
    description: "",
    linkedSection: firstGroup?.id ?? "",
    linkedRecordId: firstGroup?.options[0]?.id ?? "",
    status: "Open",
    priority: "P2",
    assignee: TASK_ASSIGNEES[0].name,
    dueDate: "",
    dueTime: "",
  };
}

function nextTaskId(tasks: VendorTask[]) {
  const year = new Date().getFullYear();
  const largestSequence = tasks.reduce((largest, task) => {
    const match = task.id.match(/(\d+)$/);
    return match ? Math.max(largest, Number(match[1])) : largest;
  }, 0);
  return `TSK-${year}-${String(largestSequence + 1).padStart(6, "0")}`;
}

function formatTaskDue(dateValue: string, timeValue: string) {
  if (!dateValue) return "—";
  const date = new Date(`${dateValue}T${timeValue || "12:00"}:00`);
  if (Number.isNaN(date.getTime())) return "—";

  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const dateLabel = isToday
    ? "Today"
    : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
  if (!timeValue) return dateLabel;
  const timeLabel = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: timeValue.endsWith(":00") ? undefined : "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(/\s?(am|pm)$/i, (period) => ` ${period.trim().toUpperCase()}`);
  return `${dateLabel} ${timeLabel}`;
}

type TaskFormSelectOption = {
  value: string;
  label: string;
  meta?: string;
  avatar?: {
    initials: string;
    tone: "pink" | "default";
  };
};

function TaskFormSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: TaskFormSelectOption[];
  onChange: (value: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const selected = options.find((option) => option.value === value) ?? options[0];

  const openMenu = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuHeight = Math.min(288, options.length * 48 + 10);
    const roomBelow = window.innerHeight - rect.bottom - 12;
    const openAbove = roomBelow < Math.min(menuHeight, 220) && rect.top > roomBelow;
    setMenuStyle({
      left: rect.left,
      top: openAbove ? Math.max(12, rect.top - menuHeight - 6) : rect.bottom + 6,
      width: rect.width,
      maxHeight: Math.min(288, openAbove ? rect.top - 18 : roomBelow),
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const scrollParent = triggerRef.current?.closest(".task-create-modal__body");
    const closeOnLayoutChange = () => setOpen(false);
    document.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnLayoutChange);
    scrollParent?.addEventListener("scroll", closeOnLayoutChange);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnLayoutChange);
      scrollParent?.removeEventListener("scroll", closeOnLayoutChange);
    };
  }, [open]);

  return (
    <div className={`pt-mf task-form-select${open ? " is-open" : ""}`} ref={rootRef}>
      <span id={`${id}-label`} className="pt-mf__l">{label}</span>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="task-form-select__trigger"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!open) openMenu();
          }
        }}
      >
        <span className="task-form-select__value">
          {selected?.avatar ? (
            <Avatar tone={selected.avatar.tone} size={30} aria-hidden="true">
              {selected.avatar.initials}
            </Avatar>
          ) : null}
          <span id={`${id}-value`} className="task-form-select__copy">
            <strong>{selected?.label ?? "Choose"}</strong>
            {selected?.meta ? <small>{selected.meta}</small> : null}
          </span>
        </span>
        <IconChevronDown size={15} />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              className="task-form-select__menu"
              role="listbox"
              aria-labelledby={`${id}-label`}
              data-task-select-menu
              style={menuStyle}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  className={option.value === value ? "is-selected" : undefined}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                >
                  <span className="task-form-select__value">
                    {option.avatar ? (
                      <Avatar tone={option.avatar.tone} size={28} aria-hidden="true">
                        {option.avatar.initials}
                      </Avatar>
                    ) : null}
                    <span className="task-form-select__copy">
                      <strong>{option.label}</strong>
                      {option.meta ? <small>{option.meta}</small> : null}
                    </span>
                  </span>
                  {option.value === value ? <IconCheck size={14} /> : null}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function AddTaskPopover({
  taskId,
  vendorName,
  linkGroups,
  onClose,
  onCreate,
}: {
  taskId: string;
  vendorName: string;
  linkGroups: TaskLinkGroup[];
  onClose: () => void;
  onCreate: (task: VendorTask) => void;
}) {
  const titleId = useId();
  const popoverRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<TaskDraft>(() => createEmptyTaskDraft(linkGroups));
  const [showError, setShowError] = useState(false);
  const selectedLinkGroup = linkGroups.find((group) => group.id === draft.linkedSection) ?? linkGroups[0];
  const selectedLinkRecord = selectedLinkGroup?.options.find((option) => option.id === draft.linkedRecordId)
    ?? selectedLinkGroup?.options[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector("[data-task-select-menu]")) onClose();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-task-select-menu]")) return;
      if (!popoverRef.current?.contains(target)) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  const setField = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key === "title") setShowError(false);
  };

  const setLinkedSection = (sectionId: string) => {
    const nextGroup = linkGroups.find((group) => group.id === sectionId);
    setDraft((current) => ({
      ...current,
      linkedSection: sectionId,
      linkedRecordId: nextGroup?.options[0]?.id ?? "",
    }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setShowError(true);
      return;
    }
    const assignee = TASK_ASSIGNEES.find((person) => person.name === draft.assignee) ?? TASK_ASSIGNEES[0];
    const linkedSection = selectedLinkGroup?.label ?? "Overview";
    const linkedRecordName = selectedLinkRecord?.label ?? vendorName;
    onCreate({
      id: taskId,
      title,
      context: `${linkedSection} · ${linkedRecordName}`,
      linkedSection: selectedLinkGroup?.id,
      linkedRecordId: selectedLinkRecord?.id,
      linkedRecordName,
      description: draft.description.trim(),
      priority: draft.priority,
      assigneeName: assignee.name,
      assigneeRole: assignee.role,
      assigneeInitials: assignee.initials,
      assigneeTone: assignee.tone,
      due: formatTaskDue(draft.dueDate, draft.dueTime),
      status: draft.status,
    });
  };

  return (
      <form
        ref={popoverRef}
        id="task-create-popover"
        className="task-create-popover"
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        onSubmit={submit}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="pt-modal__head">
          <div className="pt-modal__head-copy">
            <h2 id={titleId} className="pt-modal__title">Add task</h2>
          </div>
          <IconButton className="pt-modal__close" label="Close task form" onClick={onClose}>
            <IconClose />
          </IconButton>
        </div>

        <div className="pt-modal__body task-create-modal__body">
          <div className="task-create-modal__identity-grid">
            <div className="pt-mf">
              <span id="task-id-label" className="pt-mf__l">Task ID</span>
              <output className="pt-mf__i task-create-modal__id" aria-labelledby="task-id-label">{taskId}</output>
            </div>
            <div className="pt-mf">
              <label className="pt-mf__l" htmlFor="task-title">Task name</label>
              <input
                id="task-title"
                className={`pt-mf__i${showError ? " is-invalid" : ""}`}
                value={draft.title}
                onChange={(event) => setField("title", event.target.value)}
                placeholder="What needs to be done?"
                aria-invalid={showError}
                aria-describedby={showError ? "task-title-error" : undefined}
                autoFocus
              />
              {showError ? <span id="task-title-error" className="task-create-modal__error">Enter a task name.</span> : null}
            </div>
          </div>

          <div className="task-create-modal__grid task-create-modal__link-fields">
            <TaskFormSelect
              id="task-link-section"
              label="Link task to"
              value={draft.linkedSection}
              options={linkGroups.map((group) => ({ value: group.id, label: group.label }))}
              onChange={setLinkedSection}
            />
            <TaskFormSelect
              id="task-link-record"
              label={selectedLinkGroup?.recordLabel ?? "Record"}
              value={draft.linkedRecordId}
              options={(selectedLinkGroup?.options ?? []).map((option) => ({
                value: option.id,
                label: option.label,
                meta: option.meta,
              }))}
              onChange={(value) => setField("linkedRecordId", value)}
            />
          </div>

          <div className="pt-mf">
            <label className="pt-mf__l" htmlFor="task-description">Description <span>Optional</span></label>
            <textarea
              id="task-description"
              className="pt-mf__i task-create-modal__textarea"
              value={draft.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Add useful context or the expected outcome"
              rows={3}
            />
          </div>

          <div className="task-create-modal__grid">
            <TaskFormSelect
              id="task-status"
              label="Status"
              value={draft.status}
              options={CREATE_STATUS_OPTIONS.map((status) => ({ value: status, label: status }))}
              onChange={(value) => setField("status", value as TaskStatus)}
            />
            <TaskFormSelect
              id="task-priority"
              label="Priority"
              value={draft.priority}
              options={PRIORITY_OPTIONS.map((priority) => ({ value: priority, label: priority }))}
              onChange={(value) => setField("priority", value as TaskDraft["priority"])}
            />
          </div>

          <TaskFormSelect
            id="task-assignee"
            label="Assignee"
            value={draft.assignee}
            options={TASK_ASSIGNEES.map((person) => ({
              value: person.name,
              label: person.name,
              meta: person.role,
              avatar: { initials: person.initials, tone: person.tone },
            }))}
            onChange={(value) => setField("assignee", value)}
          />

          <div className="pt-mf">
            <span className="pt-mf__l">Due date and time <span>Optional</span></span>
            <div className="task-create-modal__due">
              <label>
                <IconCalendar size={15} />
                <span className="visually-hidden">Due date</span>
                <input type="date" value={draft.dueDate} onChange={(event) => setField("dueDate", event.target.value)} />
              </label>
              <label>
                <IconClock size={15} />
                <span className="visually-hidden">Due time</span>
                <input type="time" value={draft.dueTime} onChange={(event) => setField("dueTime", event.target.value)} disabled={!draft.dueDate} />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-modal__foot task-create-modal__foot">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" type="submit">Create task</Button>
        </div>
      </form>
  );
}

function TaskSheet({
  tasks,
  ariaLabel,
  selected,
  onToggleAll,
  onToggleRow,
  onOpenTask,
  statusInteractive,
}: {
  tasks: VendorTask[];
  ariaLabel: string;
  selected: string[];
  onToggleAll: (state: CheckboxState) => void;
  onToggleRow: (id: string, state: CheckboxState) => void;
  onOpenTask: (task: VendorTask) => void;
  statusInteractive?: boolean;
}) {
  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === tasks.length && tasks.length > 0
        ? "on"
        : "indeterminate";

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks match"
        description="Try another search or status filter."
      />
    );
  }

  return (
    <div className="tasks-sheet-wrap dashboard-table-end">
      <DataSheet className="tasks-sheet" aria-label={ariaLabel}>
        <DataSheetHeader>
          <DataSheetCell check>
            <Checkbox
              state={headerState}
              onCheckedChange={onToggleAll}
              label={`Select all ${ariaLabel.toLowerCase()}`}
            />
          </DataSheetCell>
          <DataSheetCell>Task</DataSheetCell>
          <DataSheetCell>Assignee</DataSheetCell>
          <DataSheetCell>Due</DataSheetCell>
          <DataSheetCell>Status</DataSheetCell>
        </DataSheetHeader>
        {tasks.map((task) => (
          <DataSheetRow
            key={task.id}
            className="data-row--interactive"
            role="link"
            tabIndex={0}
            aria-label={`Open ${task.title}`}
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest("button, a, input, select, textarea")) return;
              onOpenTask(task);
            }}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenTask(task);
              }
            }}
          >
            <DataSheetCell check>
              <Checkbox
                state={selected.includes(task.id) ? "on" : "off"}
                onCheckedChange={(state) => onToggleRow(task.id, state)}
                label={`Select ${task.title}`}
              />
            </DataSheetCell>
            <DataSheetCell>
              <LeadCell
                align="start"
                icon={<IconTaskCheck size={15} />}
                title={task.title}
                subtitle={`${task.id} · ${task.context}`}
              />
            </DataSheetCell>
            <DataSheetCell>
              <div className="tasks-sheet__who">
                <Avatar tone={task.assigneeTone} size={28}>
                  {task.assigneeInitials}
                </Avatar>
                <div className="tasks-sheet__who-copy">
                  <span className="tasks-sheet__who-name">{task.assigneeName}</span>
                  <span className="tasks-sheet__who-role">{task.assigneeRole}</span>
                </div>
              </div>
            </DataSheetCell>
            <DataSheetCell>
              <span className="tasks-sheet__due">
                <IconCalendar size={13} />
                {task.due}
              </span>
            </DataSheetCell>
            <DataSheetCell>
              {statusInteractive ? (
                <label className="tasks-sheet__status-pick">
                  <span className="visually-hidden">Status for {task.title}</span>
                  <StatusChip tone={TASK_STATUS_TONE[task.status]}>
                    {task.status}
                  </StatusChip>
                </label>
              ) : (
                <StatusChip tone={TASK_STATUS_TONE[task.status]}>{task.status}</StatusChip>
              )}
            </DataSheetCell>
          </DataSheetRow>
        ))}
        <DashboardDataSheetFill columns={5} />
      </DataSheet>
      <Pagination
        rangeLabel={`Showing 1–${tasks.length} of ${tasks.length}`}
        page={1}
        pageCount={1}
        onPageChange={() => undefined}
      />
    </div>
  );
}

/**
 * Vendor Tasks tab — same Open / Completed sheet language as
 * booking fulfilment (Tasks) in new-direction-03.
 */
export function TasksPanel({
  canAddTask,
  vendorName,
  linkGroups,
  onOpenTaskCountChange,
}: {
  canAddTask: boolean;
  vendorName: string;
  linkGroups: TaskLinkGroup[];
  onOpenTaskCountChange?: (count: number) => void;
}) {
  const [openQuery, setOpenQuery] = useState("");
  const [doneQuery, setDoneQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openSelected, setOpenSelected] = useState<string[]>([]);
  const [doneSelected, setDoneSelected] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<VendorTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [openTasks, setOpenTasks] = useState<VendorTask[]>(OPEN_VENDOR_TASKS);
  const [doneTasks, setDoneTasks] = useState<VendorTask[]>(DONE_VENDOR_TASKS);
  const [activeList, setActiveList] = useState<"open" | "completed">("open");

  useEffect(() => {
    onOpenTaskCountChange?.(openTasks.length);
  }, [onOpenTaskCountChange, openTasks.length]);

  useEffect(() => {
    if (!activeTask) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveTask(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeTask]);

  const openFiltered = useMemo(() => {
    const q = openQuery.trim().toLowerCase();
    return openTasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== (statusFilter as TaskStatus)) {
        return false;
      }
      if (!q) return true;
      const hay = `${task.id} ${task.title} ${task.context} ${task.description ?? ""} ${task.assigneeName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [openQuery, openTasks, statusFilter]);

  const doneFiltered = useMemo(() => {
    const q = doneQuery.trim().toLowerCase();
    if (!q) return doneTasks;
    return doneTasks.filter((task) => {
      const hay = `${task.id} ${task.title} ${task.context} ${task.description ?? ""} ${task.assigneeName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [doneQuery, doneTasks]);

  const createTask = (task: VendorTask) => {
    if (task.status === "Done") {
      setDoneTasks((current) => [task, ...current]);
      setActiveList("completed");
    } else {
      setOpenTasks((current) => [task, ...current]);
      setActiveList("open");
    }
    setCreateOpen(false);
    setOpenQuery("");
    setStatusFilter("all");
  };

  const toggleOpenAll = (state: CheckboxState) => {
    setOpenSelected(state === "on" ? openFiltered.map((t) => t.id) : []);
  };
  const toggleDoneAll = (state: CheckboxState) => {
    setDoneSelected(state === "on" ? doneFiltered.map((t) => t.id) : []);
  };
  const toggleOpenRow = (id: string, state: CheckboxState) => {
    setOpenSelected((cur) =>
      state === "on" ? (cur.includes(id) ? cur : [...cur, id]) : cur.filter((x) => x !== id),
    );
  };
  const toggleDoneRow = (id: string, state: CheckboxState) => {
    setDoneSelected((cur) =>
      state === "on" ? (cur.includes(id) ? cur : [...cur, id]) : cur.filter((x) => x !== id),
    );
  };

  return (
    <div className="tasks-panel dashboard-table-panel">
      <div className="tasks-panel__list-tabs" role="tablist" aria-label="Task lists">
        <button type="button" id="tasks-open-tab" role="tab" aria-selected={activeList === "open"} aria-controls="tasks-open-panel" onClick={() => setActiveList("open")}>Open <span>{openTasks.length}</span></button>
        <button type="button" id="tasks-completed-tab" role="tab" aria-selected={activeList === "completed"} aria-controls="tasks-completed-panel" onClick={() => setActiveList("completed")}>Completed <span>{doneTasks.length}</span></button>
      </div>
      <section id="tasks-open-panel" className="tasks-panel__section" role="tabpanel" aria-labelledby="tasks-open-tab" hidden={activeList !== "open"}>
        <div className="tasks-panel__toolbar">
          <SearchField
            fullWidth
            className="tasks-panel__search"
            value={openQuery}
            onChange={(event) => {
              setOpenQuery(event.target.value);
              setOpenSelected([]);
            }}
            placeholder="Search task or assignee"
            aria-label="Search task or assignee"
          />
          <FilterSelect
            tip="Filter by status"
            label="Status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setOpenSelected([]);
            }}
          />
          {canAddTask ? (
            <div className="tasks-panel__create" onPointerDown={(event) => event.stopPropagation()}>
              <Button
                variant="primary"
                size="sm"
                aria-expanded={createOpen}
                aria-controls="task-create-popover"
                onClick={() => setCreateOpen((open) => !open)}
              >
                <IconPlus />
                Add task
              </Button>
              {createOpen ? (
                <AddTaskPopover
                  taskId={nextTaskId([...openTasks, ...doneTasks])}
                  vendorName={vendorName}
                  linkGroups={linkGroups}
                  onClose={() => setCreateOpen(false)}
                  onCreate={createTask}
                />
              ) : null}
            </div>
          ) : null}
        </div>
        <TaskSheet
          tasks={openFiltered}
          ariaLabel="Open tasks"
          selected={openSelected}
          onToggleAll={toggleOpenAll}
          onToggleRow={toggleOpenRow}
          onOpenTask={setActiveTask}
          statusInteractive
        />
      </section>
      <section id="tasks-completed-panel" className="tasks-panel__section" role="tabpanel" aria-labelledby="tasks-completed-tab" hidden={activeList !== "completed"}>
        <div className="tasks-panel__toolbar">
          <SearchField
            fullWidth
            className="tasks-panel__search"
            value={doneQuery}
            onChange={(event) => {
              setDoneQuery(event.target.value);
              setDoneSelected([]);
            }}
            placeholder="Search completed task"
            aria-label="Search completed task"
          />
        </div>
        <TaskSheet
          tasks={doneFiltered}
          ariaLabel="Completed tasks"
          selected={doneSelected}
          onToggleAll={toggleDoneAll}
          onToggleRow={toggleDoneRow}
          onOpenTask={setActiveTask}
        />
      </section>

      {activeTask ? (
        <div
          className="rc-modal-backdrop task-detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveTask(null);
          }}
        >
          <div className="rc-modal task-detail" role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
            <div className="task-detail__head">
              <div>
                <h2 id="task-detail-title" className="rc-modal__title">{activeTask.title}</h2>
              </div>
              <IconButton label="Close task" onClick={() => setActiveTask(null)} autoFocus>
                <IconClose />
              </IconButton>
            </div>
            <dl className="task-detail__meta">
              <div><dt>Task ID</dt><dd><code className="task-detail__id">{activeTask.id}</code></dd></div>
              <div><dt>Linked to</dt><dd>{activeTask.context}</dd></div>
              {activeTask.description ? <div><dt>Description</dt><dd>{activeTask.description}</dd></div> : null}
              {activeTask.priority ? <div><dt>Priority</dt><dd>{activeTask.priority}</dd></div> : null}
              <div><dt>Assignee</dt><dd>{activeTask.assigneeName}</dd></div>
              <div><dt>Team</dt><dd>{activeTask.assigneeRole}</dd></div>
              <div><dt>Due</dt><dd>{activeTask.due}</dd></div>
              <div><dt>Status</dt><dd><StatusChip tone={TASK_STATUS_TONE[activeTask.status]}>{activeTask.status}</StatusChip></dd></div>
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
