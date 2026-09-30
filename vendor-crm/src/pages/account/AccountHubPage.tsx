import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button } from "@paryatech/design-system";
import {
  IconBell,
  IconCheck,
  IconDevices,
  IconSettings,
  IconShield,
  IconUser,
} from "../../icons";
import {
  SettingsComingLater,
  SettingsCrumbs,
  SettingsPageHeader,
  SettingsSectionCard,
  UnsavedChangesBar,
} from "../../components/settings/SettingsPageChrome";
import "../../components/settings/settings.css";
import type { AccountDestinationId } from "../../settings/destinations";

type PersonalSection = {
  id: AccountDestinationId;
  label: string;
  Icon: typeof IconUser;
};

const PERSONAL_SECTIONS: PersonalSection[] = [
  { id: "profile", label: "Profile", Icon: IconUser },
  { id: "security", label: "Security and sign-in", Icon: IconShield },
  { id: "sessions", label: "Devices and sessions", Icon: IconDevices },
  { id: "preferences", label: "Personal preferences", Icon: IconSettings },
  { id: "workspaces", label: "Workspace role", Icon: IconUser },
];

export function AccountHubPage({
  id,
  onNavigate,
}: {
  id: AccountDestinationId | "notification-preferences";
  onNavigate?: (id: AccountDestinationId) => void;
}) {
  if (id === "notification-preferences") {
    return <NotificationPreferencesPage />;
  }

  return <PersonalAccountPage activeSection={id} onNavigate={onNavigate} />;
}

function PersonalAccountPage({
  activeSection,
  onNavigate,
}: {
  activeSection: AccountDestinationId;
  onNavigate?: (id: AccountDestinationId) => void;
}) {
  const initial = useMemo(
    () => ({
      name: "Vrushabh Jain",
      email: "vrushabh@paryatech.app",
      phone: "+91 98470 10001",
    }),
    [],
  );
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [currentSection, setCurrentSection] = useState(activeSection);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    },
    [photoUrl],
  );

  useEffect(() => {
    setCurrentSection(activeSection);
    const frame = window.requestAnimationFrame(() => {
      const target =
        activeSection === "profile"
          ? pageRef.current
          : pageRef.current?.querySelector<HTMLElement>(`#account-${activeSection}`);
      target?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeSection]);

  const moveToSection = (section: AccountDestinationId) => {
    setCurrentSection(section);
    if (onNavigate) {
      onNavigate(section);
      return;
    }
    pageRef.current
      ?.querySelector<HTMLElement>(`#account-${section}`)
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return (
    <div ref={pageRef} className="settings-page account-page">
      <SettingsCrumbs area="Account" page="Account settings" />

      <header className="account-page__header">
        <div className="account-page__identity">
          <Avatar tone="pink" size={48}>
            VJ
          </Avatar>
          <div>
            <h1>Account settings</h1>
            <p>{saved.name} · {saved.email}</p>
          </div>
        </div>
        <span className="account-page__role">
          <IconCheck size={12} /> Owner
        </span>
      </header>

      <div className="account-page__shell">
        <nav className="account-page__rail" aria-label="Account settings sections">
          {PERSONAL_SECTIONS.map(({ id: sectionId, label, Icon }) => (
            <button
              key={sectionId}
              type="button"
              className={currentSection === sectionId ? "is-active" : undefined}
              aria-current={currentSection === sectionId ? "location" : undefined}
              onClick={() => moveToSection(sectionId)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="account-page__content">
          <section id="account-profile" className="account-page__section" tabIndex={-1}>
            <SectionHeading
              title="Profile"
              description="Your name and contact details across ParyatechOS."
            />
            <div className="account-page__profile-row">
              {photoUrl ? (
                <img className="account-page__avatar-image" src={photoUrl} alt="Profile" />
              ) : (
                <Avatar tone="pink" size={56}>
                  VJ
                </Avatar>
              )}
              <div>
                <strong>{draft.name || "Your profile"}</strong>
                <span>PNG or JPG · maximum 5 MB</span>
              </div>
              <input
                ref={photoInputRef}
                className="account-page__photo-input"
                type="file"
                accept="image/png,image/jpeg"
                aria-label="Choose profile photo"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!file.type.match(/^image\/(png|jpeg)$/) || file.size > 5 * 1024 * 1024) {
                    window.alert("Choose a PNG or JPG smaller than 5 MB.");
                    event.target.value = "";
                    return;
                  }
                  setPhotoUrl(URL.createObjectURL(file));
                }}
              />
              <Button variant="brand" size="sm" onClick={() => photoInputRef.current?.click()}>
                Change photo
              </Button>
            </div>
            <div className="settings-grid-2">
              <label className="settings-field">
                <span className="settings-field__label">Full name</span>
                <input
                  className="settings-field__input"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label className="settings-field">
                <span className="settings-field__label">Email</span>
                <input
                  className="settings-field__input"
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label className="settings-field">
                <span className="settings-field__label">Phone</span>
                <input
                  className="settings-field__input"
                  type="tel"
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </label>
            </div>
          </section>

          <section id="account-security" className="account-page__section" tabIndex={-1}>
            <SectionHeading
              title="Security and sign-in"
              description="Password and two-factor authentication for this account."
            />
            <AccountSettingRow
              title="Password"
              detail="Last changed 84 days ago"
              action={<Button variant="brand" size="sm">Change password</Button>}
            />
            <AccountSettingRow
              title="Two-factor authentication"
              detail="Not enabled"
              action={<Button variant="primary" size="sm">Enable 2FA</Button>}
            />
          </section>

          <section id="account-sessions" className="account-page__section" tabIndex={-1}>
            <SectionHeading
              title="Devices and sessions"
              description="Review where your account is currently signed in."
            />
            <AccountSettingRow
              title="Windows · Chrome"
              detail="Kochi, India · Active now"
              status="This device"
            />
            <AccountSettingRow
              title="iPhone · Safari"
              detail="Kochi, India · 2 days ago"
              action={<Button variant="brand" size="sm">Sign out</Button>}
            />
          </section>

          <section id="account-preferences" className="account-page__section" tabIndex={-1}>
            <SectionHeading
              title="Personal preferences"
              description="Regional and display defaults used for your account."
            />
            <div className="settings-grid-2">
              <label className="settings-field">
                <span className="settings-field__label">Language</span>
                <select className="settings-field__select" defaultValue="en-IN">
                  <option value="en-IN">English (India)</option>
                  <option value="en-GB">English (UK)</option>
                </select>
              </label>
              <label className="settings-field">
                <span className="settings-field__label">Time zone</span>
                <select className="settings-field__select" defaultValue="Asia/Kolkata">
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="UTC">UTC</option>
                </select>
              </label>
            </div>
          </section>

          <section id="account-workspaces" className="account-page__section" tabIndex={-1}>
            <SectionHeading
              title="Workspace role and memberships"
              description="Workspaces you belong to and the access assigned to you."
            />
            <AccountSettingRow
              title="Paryatech"
              detail="Primary workspace"
              status="Owner"
            />
          </section>
        </div>
      </div>

      <UnsavedChangesBar
        dirty={dirty}
        onDiscard={() => setDraft(saved)}
        onSave={() => setSaved(draft)}
      />
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="account-page__section-head">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function AccountSettingRow({
  title,
  detail,
  status,
  action,
}: {
  title: string;
  detail: string;
  status?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="account-page__setting-row">
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      {status ? <span className="account-page__status">{status}</span> : action}
    </div>
  );
}

function NotificationPreferencesPage() {
  return (
    <div className="settings-page">
      <SettingsCrumbs area="Account" page="Notification preferences" />
      <SettingsPageHeader
        icon={<IconBell size={18} />}
        title="Notification preferences"
        description="Choose how you receive mentions, tasks, approvals and system notices."
      />
      <SettingsSectionCard title="Channels">
        <label className="settings-field">
          <span className="settings-field__label">In-app notifications</span>
          <select className="settings-field__select" defaultValue="all">
            <option value="all">All activity</option>
            <option value="important">Important only</option>
          </select>
        </label>
        <label className="settings-field">
          <span className="settings-field__label">Email notifications</span>
          <select className="settings-field__select" defaultValue="digest">
            <option value="digest">Daily digest</option>
            <option value="immediate">Immediate</option>
            <option value="off">Off</option>
          </select>
        </label>
        <label className="settings-field">
          <span className="settings-field__label">Push notifications</span>
          <select className="settings-field__select" defaultValue="mentions">
            <option value="mentions">Mentions and assignments</option>
            <option value="all">All</option>
            <option value="off">Off</option>
          </select>
        </label>
        <label className="settings-field">
          <span className="settings-field__label">WhatsApp notifications</span>
          <select className="settings-field__select" defaultValue="off">
            <option value="off">Off</option>
            <option value="urgent">Urgent only</option>
          </select>
        </label>
      </SettingsSectionCard>
      <SettingsSectionCard title="Timing">
        <div className="settings-grid-2">
          <label className="settings-field">
            <span className="settings-field__label">Digest frequency</span>
            <select className="settings-field__select" defaultValue="daily">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <label className="settings-field">
            <span className="settings-field__label">Quiet hours</span>
            <select className="settings-field__select" defaultValue="22-07">
              <option value="off">Off</option>
              <option value="22-07">22:00 – 07:00</option>
            </select>
          </label>
        </div>
      </SettingsSectionCard>
      <SettingsComingLater title="Advanced routing rules" />
    </div>
  );
}
