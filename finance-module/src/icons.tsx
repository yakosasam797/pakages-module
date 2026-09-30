import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconHome = (props: IconProps) => <Icon {...props}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></Icon>;
export const IconInbox = (props: IconProps) => <Icon {...props}><path d="M4 4h16l2 9v7H2v-7Z"/><path d="M2 13h5l2 3h6l2-3h5"/></Icon>;
export const IconNews = (props: IconProps) => <Icon {...props}><path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11h8M8 15h5"/></Icon>;
export const IconTasks = (props: IconProps) => <Icon {...props}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 2 2 5-5M8 18h8"/></Icon>;
export const IconQueries = (props: IconProps) => <Icon {...props}><path d="M4 4h16v13H7l-3 3Z"/><path d="M8 8h8M8 12h5"/></Icon>;
export const IconPackages = (props: IconProps) => <Icon {...props}><path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></Icon>;
export const IconDestination = (props: IconProps) => <Icon {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></Icon>;
export const IconBookings = (props: IconProps) => <Icon {...props}><path d="M3 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3Z"/><path d="M21 4h-5a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h5Z"/></Icon>;
export const IconCustomers = (props: IconProps) => <Icon {...props}><circle cx="12" cy="9" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>;
export const IconVendors = (props: IconProps) => <Icon {...props}><path d="M4 10v10h16V10M3 10l2-6h14l2 6"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></Icon>;
export const IconFinance = (props: IconProps) => <Icon {...props}><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/></Icon>;
export const IconTeam = (props: IconProps) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></Icon>;
export const IconAutomations = (props: IconProps) => <Icon {...props}><path d="m13 2-9 12h8l-1 8 9-12h-8Z"/></Icon>;
export const IconReports = (props: IconProps) => <Icon {...props}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></Icon>;
export const IconSettings = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></Icon>;

export const IconSearch = (props: IconProps) => <Icon {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></Icon>;
export const IconBell = (props: IconProps) => <Icon {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></Icon>;
export const IconHelp = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 3.6 2.6c-.8.4-1.1.9-1.1 1.9M12 17h.01"/></Icon>;
export const IconChevronDown = (props: IconProps) => <Icon {...props}><path d="m6 9 6 6 6-6"/></Icon>;
export const IconChevronRight = (props: IconProps) => <Icon {...props}><path d="m9 18 6-6-6-6"/></Icon>;
export const IconClose = (props: IconProps) => <Icon {...props}><path d="m6 6 12 12M18 6 6 18"/></Icon>;
export const IconPlus = (props: IconProps) => <Icon {...props}><path d="M12 5v14M5 12h14"/></Icon>;
export const IconCalendar = (props: IconProps) => <Icon {...props}><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Icon>;
export const IconArrowIn = (props: IconProps) => <Icon {...props}><path d="M12 3v14M7 8l5-5 5 5"/><path d="M5 21h14"/></Icon>;
export const IconArrowOut = (props: IconProps) => <Icon {...props}><path d="M12 21V7M7 16l5 5 5-5"/><path d="M5 3h14"/></Icon>;
export const IconReceipt = (props: IconProps) => <Icon {...props}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="M9 8h6M9 12h6"/></Icon>;
export const IconWarning = (props: IconProps) => <Icon {...props}><path d="M10.3 4.1 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></Icon>;
export const IconBank = (props: IconProps) => <Icon {...props}><path d="m3 10 9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/></Icon>;
export const IconCheck = (props: IconProps) => <Icon {...props}><path d="m5 12 4 4L19 6"/></Icon>;
export const IconFilter = (props: IconProps) => <Icon {...props}><path d="M3 5h18M7 12h10M10 19h4"/></Icon>;
export const IconDownload = (props: IconProps) => <Icon {...props}><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/></Icon>;
export const IconDots = (props: IconProps) => <Icon {...props}><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></Icon>;
