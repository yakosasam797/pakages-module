import { Avatar, Button, EmptyState } from "@paryatech/design-system";
import {
  KEY_CONTACTS,
  operatingHistoryForVendor,
  type KeyContact,
} from "../data/vendorOverview";
import type { Vendor } from "../data/vendors";
import { ActivityPanel, type ActivityRow } from "./ActivityPanel";
import {
  IconBookings,
  IconCalendar,
  IconClock,
  IconGlobe,
  IconMail,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconWarn,
} from "../icons";
import { SummaryStrip } from "./SummaryStrip";
import { VendorSetupChecklist } from "./VendorSetupChecklist";
import "./VendorOverview.css";

function contactsForVendor(vendor: Vendor): KeyContact[] {
  if (vendor.id === "exhosp") return KEY_CONTACTS;
  if (vendor.contacts?.length) {
    return vendor.contacts.map((contact) => ({
      ...contact,
      whatsapp: contact.phone || undefined,
    }));
  }
  if (!vendor.contactName && !vendor.phone && !vendor.email) return [];

  return [
    {
      id: `${vendor.id}-primary-contact`,
      name: vendor.contactName || "Primary contact",
      initials: (vendor.contactName || vendor.name)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
      role: "Primary contact",
      phone: vendor.phone,
      email: vendor.email,
      whatsapp: vendor.phone || undefined,
    },
  ];
}

const OPERATING_HISTORY_ICONS = {
  relationship: <IconCalendar size={15} />,
  fulfilled: <IconBookings size={15} />,
  "last-fulfilled": <IconClock size={15} />,
  exceptions: <IconWarn size={15} />,
  activity: <IconClock size={15} />,
  scope: <IconGlobe size={15} />,
  updated: <IconRefresh size={15} />,
} as const;

export function VendorOverview({
  vendor,
  flash,
  canEdit = false,
  onJumpTab,
  onEditProfile,
  activity = [],
  onRemoveActivity,
  onOpenRelated,
}: {
  vendor?: Vendor;
  flash?: string | null;
  canEdit?: boolean;
  onJumpTab: (tab: string) => void;
  onEditProfile?: () => void;
  activity?: ActivityRow[];
  onRemoveActivity?: (id: string) => void;
  onOpenRelated?: (row: ActivityRow) => void;
}) {
  if (!vendor) {
    return flash ? (
      <div className="vendor-setup__flash" role="status" style={{ marginTop: 20 }}>
        {flash}
      </div>
    ) : null;
  }

  if (vendor.status === "Draft") {
    const draftFields = [
      ["Service categories", vendor.categories.join(" · ")],
      ["Base location", vendor.location],
      ["Internal owner", vendor.owner],
      ["Primary contact", vendor.contactName],
      ["Phone", vendor.phone],
      ["WhatsApp", vendor.whatsapp],
      ["Email", vendor.email],
      ["Labels", vendor.labels.join(" · ")],
      ["Legal name", vendor.legalName],
      ["GSTIN", vendor.gstin],
      ["PAN", vendor.pan],
      [
        "Address",
        vendor.address || vendor.state || vendor.postalCode
          ? [vendor.address, vendor.city, vendor.state, vendor.postalCode, vendor.country]
              .filter(Boolean)
              .join(", ")
          : "",
      ],
      ["DMC scope", vendor.dmcScope],
      ["Specialisations", vendor.specializations],
      ["Reservations email", vendor.reservationsEmail],
      ["Emergency phone", vendor.emergencyPhone],
      ["Confirmation SLA", vendor.confirmationSla],
      ["Confirmation channel", vendor.confirmationChannel],
      ["Payment terms", vendor.paymentTerms],
      ["Internal notes", vendor.internalNotes],
    ].filter((field): field is [string, string] => Boolean(field[1]));

    return (
      <div className="vendor-overview vendor-overview--draft">
        {flash ? <div className="vendor-setup__flash" role="status">{flash}</div> : null}

        <section className="vo-panel vo-draft-profile" aria-labelledby="vo-draft-profile-title">
          <div className="vo-panel__head">
            <div>
              <h2 id="vo-draft-profile-title" className="vo-panel__title">Profile details</h2>
              <p className="vo-draft-profile__note">Saved from Add vendor</p>
            </div>
          </div>
          <div className="vo-panel__body">
            <dl className="vo-profile">
              {draftFields.map(([label, value]) => (
                <div className="vo-profile__field" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <EmptyState
          className="vendor-draft-overview__empty"
          title="No services yet"
          description="Add the first service to start building this vendor record."
          action={
            canEdit ? (
              <Button variant="primary" size="sm" onClick={() => onJumpTab("services")}>
                <IconPlus />
                Add services
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const contacts = contactsForVendor(vendor);
  const recentActivity = activity.slice(0, 4);
  const operatingHistory = operatingHistoryForVendor(vendor).map((field) => ({
    ...field,
    icon: OPERATING_HISTORY_ICONS[field.id as keyof typeof OPERATING_HISTORY_ICONS],
  }));
  return (
    <div className="vendor-overview">
      <div className="vo-history">
        <SummaryStrip
          title="Operating history"
          columns={4}
          fields={operatingHistory}
          variant="icon-leading"
        />
      </div>

      <VendorSetupChecklist
        vendor={vendor}
        flash={flash}
        canEdit={canEdit}
        onJumpTab={onJumpTab}
        onEditProfile={() => onEditProfile?.()}
      />

      <div className="vo-panels">
        <div className="vo-panels__layout">
          <section className="vo-panel" aria-labelledby="vo-profile-title">
            <div className="vo-panel__head">
              <h2 id="vo-profile-title" className="vo-panel__title">
                Profile
              </h2>
            </div>
            <div className="vo-panel__body">
              <dl className="vo-profile">
                <div className="vo-profile__field">
                  <dt>Vendor / business name</dt>
                  <dd>{vendor.name}</dd>
                </div>
                <div className="vo-profile__field">
                  <dt>Vendor ID</dt>
                  <dd className="pt-mono">{vendor.code}</dd>
                </div>
                <div className="vo-profile__field">
                  <dt>Service categories</dt>
                  <dd>{vendor.categories.join(" · ") || "Not set"}</dd>
                </div>
                <div className="vo-profile__field">
                  <dt>Base location</dt>
                  <dd>{vendor.location}</dd>
                </div>
                <div className="vo-profile__field">
                  <dt>Internal owner</dt>
                  <dd className="vo-profile__owner">
                    <Avatar tone="pink" size={26}>
                      {vendor.ownerInitials}
                    </Avatar>
                    <span>{vendor.owner}</span>
                  </dd>
                </div>
                <div className="vo-profile__field">
                  <dt>Country</dt>
                  <dd>{vendor.country}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="vo-panel" aria-labelledby="vo-contacts-title">
            <div className="vo-panel__head">
              <h2 id="vo-contacts-title" className="vo-panel__title">
                Vendor contacts
              </h2>
              <span className="vendor-overview__count pt-mono">
                {contacts.length} contact{contacts.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="vo-panel__body">
              {contacts.length === 0 ? (
                <EmptyState
                  title="No vendor contacts"
                  description="Add a primary contact from Edit vendor."
                />
              ) : (
                <ul className="vo-contacts">
                  {contacts.map((contact) => (
                    <li key={contact.id} className="vo-contact">
                      <div className="vo-contact__who">
                        <Avatar tone="pink" size={32}>
                          {contact.initials}
                        </Avatar>
                        <div className="vo-contact__copy">
                          <div className="vo-contact__name">{contact.name}</div>
                          <div className="vo-contact__role">{contact.role}</div>
                        </div>
                      </div>
                      <div className="vo-contact__acts">
                        {contact.phone ? (
                          <a
                            className="vo-contact__act"
                            href={`tel:${contact.phone.replace(/\s/g, "")}`}
                            aria-label={`Call ${contact.name}`}
                          >
                            <IconPhone size={14} />
                            Call
                          </a>
                        ) : null}
                        {contact.email ? (
                          <a
                            className="vo-contact__act"
                            href={`mailto:${contact.email}`}
                            aria-label={`Email ${contact.name}`}
                          >
                            <IconMail size={14} />
                            Email
                          </a>
                        ) : null}
                        {contact.whatsapp ? (
                          <a
                            className="vo-contact__act"
                            href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`WhatsApp ${contact.name}`}
                          >
                            WhatsApp
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="vendor-overview__section" aria-labelledby="vo-recent-activity-title">
        <div className="vendor-overview__section-head">
          <h2 id="vo-recent-activity-title" className="vendor-overview__title">
            Recent activities
          </h2>
          <div className="vendor-overview__section-actions">
            <span className="vendor-overview__count pt-mono">
              {recentActivity.length} recent event{recentActivity.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              className="vendor-overview__view-all"
              onClick={() => onJumpTab("activity")}
            >
              View all
            </button>
          </div>
        </div>
        <ActivityPanel
          rows={recentActivity}
          vendorName={vendor.name}
          ariaLabel="Recent vendor activity in overview"
          variant="timeline"
          searchPlaceholder="Search recent activity"
          onRemoveActivity={onRemoveActivity}
          onOpenRelated={onOpenRelated}
          showPagination={false}
        />
      </section>

    </div>
  );
}
