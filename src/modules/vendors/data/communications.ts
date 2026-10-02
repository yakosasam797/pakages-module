export type ConvoChannel = "Email";

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  avatarTone: "pink" | "ok" | "warn" | "info";
  role: string;
  channel: ConvoChannel;
  time: string;
  preview: string;
  unread: boolean;
}

export interface ThreadMessage {
  dir: "in" | "out";
  body: string;
  meta: string;
  attachTitle?: string;
  attachFile?: string;
}

/** Vendor-context conversations following new-direction-03 Communication layout. */
export const VENDOR_CONVERSATIONS: Conversation[] = [
  {
    id: "cv1",
    name: "Anjali Menon",
    initials: "AM",
    avatarTone: "pink",
    role: "Vendor desk · Example Hospitality",
    channel: "Email",
    time: "11:42",
    preview: "Net rate column confirmed for Lake Resort 2026–27.",
    unread: true,
  },
  {
    id: "cv2",
    name: "Meera Iyer",
    initials: "MI",
    avatarTone: "warn",
    role: "Operations",
    channel: "Email",
    time: "Yesterday",
    preview: "Hill Retreat winter rates still not released.",
    unread: true,
  },
  {
    id: "cv3",
    name: "Example Lake Resort",
    initials: "LR",
    avatarTone: "ok",
    role: "Property · accommodation",
    channel: "Email",
    time: "2 Sep",
    preview: "Gala dinner supplements attached for festive window.",
    unread: false,
  },
  {
    id: "cv4",
    name: "Atlas Visa Services",
    initials: "AV",
    avatarTone: "info",
    role: "Vendor · visa",
    channel: "Email",
    time: "28 Aug",
    preview: "UAE biometrics fee for 90-day product still pending.",
    unread: false,
  },
];

export const VENDOR_MESSAGES: Record<string, ThreadMessage[]> = {
  cv1: [
    {
      dir: "in",
      body: "Can you confirm we should cost from the net column only?",
      meta: "Anjali Menon · 10:15",
    },
    {
      dir: "out",
      body: "Yes — net is the only column we cost from. Published is the resort’s retail figure.",
      meta: "You · Vendor desk · 10:20",
    },
    {
      dir: "in",
      body: "Net rate column confirmed for Lake Resort 2026–27.",
      meta: "Anjali Menon · 11:42",
      attachTitle: "Tariff excerpt — Lake Resort",
      attachFile: "lake-resort-net-rates.pdf · not saved to Documents yet",
    },
  ],
  cv2: [
    {
      dir: "out",
      body: "Meera, we still need winter rates for Hill Retreat before we can publish.",
      meta: "You · Operations · 08:30",
    },
    {
      dir: "in",
      body: "Hill Retreat winter rates still not released. Leaving unpriced — do not carry season forward.",
      meta: "Meera Iyer · Yesterday 21:10",
    },
  ],
  cv3: [
    {
      dir: "out",
      body: "Following up on Christmas Eve and New Year gala supplements.",
      meta: "You · Vendor desk · 2 Sep 14:05",
    },
    {
      dir: "in",
      body: "Gala dinner supplements attached for festive window. Both are mandatory per adult.",
      meta: "Example Lake Resort · 2 Sep 17:40",
      attachTitle: "Festive gala schedule",
      attachFile: "lake-resort-galas-2026.pdf · saved to Documents",
    },
  ],
  cv4: [
    {
      dir: "in",
      body: "UAE biometrics fee for 90-day product still pending on the announced season.",
      meta: "Atlas Visa Services · 28 Aug 18:05",
    },
    {
      dir: "out",
      body: "Noted — we’ll leave that cell missing until you confirm.",
      meta: "You · Vendor desk · 28 Aug 18:20",
    },
  ],
};
