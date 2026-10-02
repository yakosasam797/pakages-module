import { useMemo, useRef, useState } from "react";
import { Button, IconButton, Tooltip } from "@paryatech/design-system";
import {
  IconAttach,
  IconCheck,
  IconChevronLeft,
  IconClose,
  IconInbox,
  IconMail,
  IconModule,
  IconNotes,
  IconPlus,
} from "../icons";
import "./CommunicationPanel.css";

export type MailFolder = "all" | "inbox" | "sent";

export type MailRecord = {
  id: string;
  direction: "received" | "sent";
  subject: string;
  sender: string;
  preview: string;
  time: string;
  recipientName?: string;
  recipientEmail?: string;
};

export type MailContact = {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
};

export type MailTemplate = {
  id: string;
  title: string;
  description: string;
  subject: string;
  body: string;
};

const DEFAULT_TEMPLATES: MailTemplate[] = [
  {
    id: "request-rates",
    title: "Request updated rates",
    description: "Ask the vendor for current contracted pricing",
    subject: "Request for updated rates",
    body: "Hello,\n\nPlease share your latest contracted rates and validity dates for our records.\n\nThank you.",
  },
  {
    id: "request-documents",
    title: "Request documents",
    description: "Ask for pending vendor documents",
    subject: "Pending documents required",
    body: "Hello,\n\nPlease share the pending documents at your earliest convenience.\n\nThank you.",
  },
  {
    id: "confirm-service",
    title: "Confirm service details",
    description: "Confirm availability and service information",
    subject: "Service details confirmation",
    body: "Hello,\n\nPlease confirm the service details and availability discussed with our team.\n\nThank you.",
  },
];

const INITIAL_MAIL: MailRecord[] = [
  {
    id: "mail-1",
    direction: "sent",
    subject: "Updated contract and service checklist",
    sender: "Paryatech Travel",
    preview: "Hello, please find the updated contract and service checklist for your review.",
    time: "Yesterday",
  },
  {
    id: "mail-2",
    direction: "received",
    subject: "Re: Updated contract and service checklist",
    sender: "Vendor team",
    preview: "Received, thank you. We will upload the remaining documents today.",
    time: "Yesterday",
  },
];

type ComposeDraft = {
  recipientId: string;
  subject: string;
  message: string;
  attachment: File | null;
};

const EMPTY_DRAFT: ComposeDraft = { recipientId: "", subject: "", message: "", attachment: null };

function FolderIcon({ folder }: { folder: MailFolder }) {
  if (folder === "inbox") return <IconInbox />;
  if (folder === "sent") return <IconCheck />;
  return <IconMail />;
}

export function MailWorkspace({
  contactName,
  contactEmail,
  initials,
  contacts,
  canCompose = true,
  templates = DEFAULT_TEMPLATES,
  seedMail = INITIAL_MAIL,
  requestDraft,
}: {
  contactName: string;
  contactEmail: string;
  initials: string;
  contacts?: MailContact[];
  canCompose?: boolean;
  templates?: MailTemplate[];
  seedMail?: MailRecord[];
  requestDraft?: { id: number; body: string } | null;
}) {
  const availableContacts = useMemo<MailContact[]>(
    () => contacts?.length
      ? contacts
      : [{ id: "primary-contact", name: contactName, initials, role: "Primary contact", email: contactEmail }],
    [contactEmail, contactName, contacts, initials],
  );
  const [mail, setMail] = useState(seedMail);
  const [folder, setFolder] = useState<MailFolder>("all");
  const [isComposing, setIsComposing] = useState(Boolean(requestDraft?.body));
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ComposeDraft>(() =>
    requestDraft?.body
      ? { recipientId: "", subject: "Document request", message: requestDraft.body, attachment: null }
      : EMPTY_DRAFT,
  );
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(
    () => ({
      all: mail.length,
      inbox: mail.filter((item) => item.direction === "received").length,
      sent: mail.filter((item) => item.direction === "sent").length,
    }),
    [mail],
  );

  const visibleMail = useMemo(() => {
    if (folder === "inbox") return mail.filter((item) => item.direction === "received");
    if (folder === "sent") return mail.filter((item) => item.direction === "sent");
    return mail;
  }, [folder, mail]);
  const selectedMail = mail.find((item) => item.id === selectedMailId) ?? null;
  const selectedRecipient = availableContacts.find((contact) => contact.id === draft.recipientId) ?? null;

  const beginEmail = () => {
    setDraft(EMPTY_DRAFT);
    setNotice("");
    setIsTemplateOpen(false);
    setSelectedMailId(null);
    setIsComposing(true);
  };

  const discardEmail = () => {
    setDraft(EMPTY_DRAFT);
    setIsTemplateOpen(false);
    setIsComposing(false);
    setSelectedMailId(null);
  };

  const applyTemplate = (template: MailTemplate) => {
    setDraft((current) => ({ ...current, subject: template.subject, message: template.body }));
    setIsTemplateOpen(false);
  };

  const sendEmail = () => {
    const subject = draft.subject.trim();
    const message = draft.message.trim();
    if (!selectedRecipient || !subject || !message) return;

    setMail((items) => [
      {
        id: `mail-${Date.now()}`,
        direction: "sent",
        subject,
        sender: "Paryatech Travel",
        preview: message.replace(/\s+/g, " "),
        time: "Just now",
        recipientName: selectedRecipient.name,
        recipientEmail: selectedRecipient.email,
      },
      ...items,
    ]);
    setFolder("sent");
    setSelectedMailId(null);
    setDraft(EMPTY_DRAFT);
    setIsComposing(false);
    setNotice(`Email sent to ${selectedRecipient.name}`);
  };

  const folderLabel = folder === "all" ? "All mail" : folder === "inbox" ? "Inbox" : "Sent";

  return (
    <section className={`comm${isNavCollapsed ? " comm--nav-collapsed" : ""}`} aria-label="Email communication">
      <header className="comm-mail__header">
        <div className="comm-mail__identity">
          <Tooltip tip={isNavCollapsed ? "Show folders" : "Hide folders"}>
            <IconButton
              label={isNavCollapsed ? "Show folders" : "Hide folders"}
              onClick={() => setIsNavCollapsed((current) => !current)}
            >
              <IconModule />
            </IconButton>
          </Tooltip>
          <span className="comm-mail__avatar" aria-hidden="true">{initials}</span>
          <div className="comm-mail__contact">
            <strong>{contactName}</strong>
            <span>{availableContacts.length} {availableContacts.length === 1 ? "vendor contact" : "vendor contacts"}</span>
          </div>
        </div>
        {canCompose ? (
          <Button variant="primary" size="sm" onClick={beginEmail}>
            <IconPlus />
            New email
          </Button>
        ) : null}
      </header>

      <div className="comm-mail__workspace">
        <nav className="comm-folders" aria-label="Mail folders">
          {(["all", "inbox", "sent"] as MailFolder[]).map((item) => (
            <button
              key={item}
              type="button"
              className={`comm-folder${folder === item ? " comm-folder--active" : ""}`}
              onClick={() => {
                setFolder(item);
                setSelectedMailId(null);
                setIsComposing(false);
                setIsTemplateOpen(false);
              }}
              aria-current={folder === item ? "page" : undefined}
            >
              <span className="comm-folder__label">
                <FolderIcon folder={item} />
                {item === "all" ? "All mail" : item === "inbox" ? "Inbox" : "Sent"}
              </span>
              <span className="comm-folder__count">{counts[item]}</span>
            </button>
          ))}
        </nav>

        <main className="comm-mail__main">
          {notice ? (
            <div className="comm-mail__notice" role="status">
              <IconCheck />
              {notice}
              <button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>
                <IconClose size={13} />
              </button>
            </div>
          ) : null}

          {isComposing ? (
            <div className="comm-compose">
              <div className="comm-compose__fields">
                <div className="comm-compose__line">
                  <label htmlFor="comm-recipient">To</label>
                  <select
                    id="comm-recipient"
                    value={draft.recipientId}
                    required
                    aria-label="Select a vendor contact"
                    onChange={(event) => setDraft((current) => ({ ...current, recipientId: event.target.value }))}
                  >
                    <option value="">Select a vendor contact</option>
                    {availableContacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} · {contact.role} · {contact.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="comm-compose__line">
                  <label htmlFor="comm-subject">Subject</label>
                  <input
                    id="comm-subject"
                    value={draft.subject}
                    onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
                    placeholder="Add a subject"
                    autoFocus
                  />
                </div>
                <div className="comm-compose__message">
                  <label htmlFor="comm-message">Message</label>
                  <textarea
                    id="comm-message"
                    value={draft.message}
                    onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
                    placeholder="Write your email..."
                  />
                </div>
              </div>

              {draft.attachment ? (
                <div className="comm-compose__attachment">
                  <IconNotes size={15} />
                  <span>{draft.attachment.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${draft.attachment.name}`}
                    onClick={() => setDraft((current) => ({ ...current, attachment: null }))}
                  >
                    <IconClose size={13} />
                  </button>
                </div>
              ) : null}

              <footer className="comm-compose__footer">
                <div className="comm-compose__tools">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="comm-compose__file"
                    onChange={(event) => {
                      const attachment = event.target.files?.[0] ?? null;
                      setDraft((current) => ({ ...current, attachment }));
                      event.currentTarget.value = "";
                    }}
                  />
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <IconAttach />
                    Upload
                  </Button>
                  <div className="comm-template">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-expanded={isTemplateOpen}
                      onClick={() => setIsTemplateOpen((current) => !current)}
                    >
                      <IconNotes />
                      Template
                    </Button>
                    {isTemplateOpen ? (
                      <div className="comm-template__menu" role="menu">
                        {templates.map((template) => (
                          <button key={template.id} type="button" role="menuitem" onClick={() => applyTemplate(template)}>
                            <strong>{template.title}</strong>
                            <span>{template.description}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="comm-compose__actions">
                  <Button variant="ghost" size="sm" onClick={discardEmail}>Discard</Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!draft.recipientId || !draft.subject.trim() || !draft.message.trim()}
                    onClick={sendEmail}
                  >
                    Send
                  </Button>
                </div>
              </footer>
            </div>
          ) : selectedMail ? (
            <article className="comm-reading">
              <header className="comm-reading__header">
                <Button variant="ghost" size="sm" onClick={() => setSelectedMailId(null)}>
                  <IconChevronLeft />
                  {folderLabel}
                </Button>
                <span>{selectedMail.direction === "sent" ? "Sent" : "Received"}</span>
              </header>
              <div className="comm-reading__summary">
                <span className="comm-mail-row__avatar" aria-hidden="true">
                  {selectedMail.direction === "sent" ? "PT" : initials}
                </span>
                <div>
                  <h2>{selectedMail.subject}</h2>
                  <p>
                    {selectedMail.sender} · {selectedMail.direction === "sent"
                      ? `to ${selectedMail.recipientName ?? contactName} (${selectedMail.recipientEmail ?? contactEmail})`
                      : `from ${contactEmail}`}
                  </p>
                </div>
                <time>{selectedMail.time}</time>
              </div>
              <div className="comm-reading__body">{selectedMail.preview}</div>
              {selectedMail.direction === "received" && canCompose ? (
                <footer className="comm-reading__footer">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setDraft({
                        recipientId: availableContacts[0]?.id ?? "",
                        subject: selectedMail.subject.startsWith("Re:") ? selectedMail.subject : `Re: ${selectedMail.subject}`,
                        message: "",
                        attachment: null,
                      });
                      setSelectedMailId(null);
                      setIsComposing(true);
                    }}
                  >
                    Reply
                  </Button>
                </footer>
              ) : null}
            </article>
          ) : (
            <div className="comm-mailbox">
              <div className="comm-mailbox__heading">
                <div>
                  <h2>{folderLabel}</h2>
                  <span>{visibleMail.length} {visibleMail.length === 1 ? "message" : "messages"}</span>
                </div>
                <span>{availableContacts.length} {availableContacts.length === 1 ? "vendor contact" : "vendor contacts"}</span>
              </div>

              <div className="comm-mailbox__list">
                {visibleMail.length ? visibleMail.map((item) => (
                  <button key={item.id} type="button" className="comm-mail-row" onClick={() => setSelectedMailId(item.id)}>
                    <span className="comm-mail-row__avatar" aria-hidden="true">
                      {item.direction === "sent" ? "PT" : initials}
                    </span>
                    <span className="comm-mail-row__content">
                      <strong>{item.subject}</strong>
                      <span>{item.sender} · {item.direction === "sent" ? "Sent" : "Received"}</span>
                      <span>{item.preview}</span>
                    </span>
                    <span className="comm-mail-row__meta">
                      <time>{item.time}</time>
                      <span>{item.direction === "sent" ? "Sent" : "Received"}</span>
                    </span>
                  </button>
                )) : (
                  <div className="comm-mailbox__empty">
                    <IconMail size={20} />
                    <strong>No email here yet</strong>
                    <span>Messages in this folder will appear here.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

export function CommunicationPanel({
  contactName = "Vendor team",
  contactEmail = "vendor@example.com",
  initials = "VT",
  contacts,
  canCompose = true,
  requestDraft,
}: {
  contactName?: string;
  contactEmail?: string;
  initials?: string;
  contacts?: MailContact[];
  canCompose?: boolean;
  requestDraft?: { id: number; body: string } | null;
}) {
  return (
    <MailWorkspace
      contactName={contactName}
      contactEmail={contactEmail}
      initials={initials}
      contacts={contacts}
      canCompose={canCompose}
      requestDraft={requestDraft}
    />
  );
}
