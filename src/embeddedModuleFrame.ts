export type EmbeddedModuleKind = "booking" | "finance";

export interface EmbeddedModuleHandle {
  openNotes: (mode: "browse" | "compose") => void;
  clickChrome: (label: string) => void;
  goBackLocal: () => boolean;
}

/** Lets an embedded page's back control retrace tab selections before leaving it. */
export function connectFrameTabHistory(document: Document, interceptBack = false) {
  const trail: Array<{ group: HTMLElement; tab: HTMLElement }> = [];
  let restoring = false;

  const selectedTab = (group: HTMLElement) => group.querySelector<HTMLElement>(
    '[role="tab"][aria-selected="true"], button.is-active, button.active',
  );

  const goBack = () => {
    while (trail.length) {
      const previous = trail.pop()!;
      if (!previous.group.isConnected || !previous.tab.isConnected || !previous.tab.getClientRects().length) continue;
      restoring = true;
      previous.tab.click();
      restoring = false;
      return true;
    }
    return false;
  };

  const onClick = (event: Event) => {
    const target = event.target as Element | null;
    if (interceptBack && target?.closest('.pt-topbar button[aria-label^="Back"]') && goBack()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (restoring) return;
    const tab = target?.closest<HTMLElement>('[role="tab"], .finance-subnav > button, .package-detail__tabs > button');
    const group = tab?.closest<HTMLElement>('[role="tablist"], .finance-subnav, .package-detail__tabs');
    if (!tab || !group) return;
    const active = selectedTab(group);
    if (active && active !== tab) trail.push({ group, tab: active });
  };

  document.addEventListener("click", onClick, { capture: true });
  return { goBack, disconnect: () => document.removeEventListener("click", onClick, { capture: true }) };
}

const bookingLayout = `
  html, body { height: 100%; overflow: hidden; }
  .frame, .frame.collapsed {
    width: 100% !important;
    height: 100vh !important;
    padding: 0 !important;
    gap: 0 !important;
    grid-template-columns: minmax(0, 1fr) !important;
    background: var(--surface) !important;
  }
  .frame > .side, .workspace > .topbar { display: none !important; }
  .frame > .workspace {
    min-width: 0 !important;
    width: 100% !important;
    height: 100vh !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  .workspace > .scroll { min-width: 0; height: 100%; }
`;

const financeLayout = `
  html, body, #root { height: 100%; overflow: hidden; }
  .pt-frame, .pt-frame--collapsed {
    width: 100% !important;
    height: 100vh !important;
    padding: 0 !important;
    gap: 0 !important;
    grid-template-columns: minmax(0, 1fr) !important;
    background: var(--surface) !important;
  }
  .pt-frame > .pt-side, .pt-workspace > .pt-topbar { display: none !important; }
  .pt-frame > .pt-workspace {
    min-width: 0 !important;
    width: 100% !important;
    height: 100vh !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  .pt-workspace > .pt-scroll { min-width: 0; height: 100%; }
  /* The embedded viewport excludes the shared 250px sidebar. Keep Finance's
     desktop composition until the outer window reaches its own breakpoints. */
  @media (min-width: 900px) {
    .metrics { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .metric:nth-child(2) { border-right: 1px solid var(--line); }
    .metric:nth-child(-n+2) { border-bottom: 0; }
    .cash-ribbon { grid-template-columns: 1fr auto 1.15fr auto 1fr; }
    .cash-bridge { min-width: 98px; border: 0; border-left: 1px solid var(--line); border-right: 1px solid var(--line); }
    .cash-node--closing { grid-column: auto; }
    .contract-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    .contract-grid > div { border-bottom: 0; }
    .contract-grid > div:nth-child(3) { border-right: 1px solid var(--line); }
    .contract-grid__cash { grid-column: auto; }
  }
`;

/** Shows an unchanged module's content inside the platform's single shared shell. */
export function connectEmbeddedModuleFrame(document: Document, kind: EmbeddedModuleKind) {
  if (!document.querySelector('style[data-paryatech-integration="shared-shell"]')) {
    const style = document.createElement("style");
    style.dataset.paryatechIntegration = "shared-shell";
    style.textContent = kind === "booking" ? bookingLayout : financeLayout;
    document.head.appendChild(style);
  }

  const focusWorkspaceSearch = (event: KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
    event.preventDefault();
    window.document.querySelector<HTMLInputElement>(".pt-topbar .pt-search input")?.focus();
  };
  document.addEventListener("keydown", focusWorkspaceSearch);
  return () => document.removeEventListener("keydown", focusWorkspaceSearch);
}
