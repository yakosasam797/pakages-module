const pinIcon = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';

/** Adds only the cross-workspace navigation item; framed source apps remain untouched. */
export function connectDestinationNav(
  document: Document,
  source: "booking" | "vendor",
  onNavigate: () => void,
) {
  const inboxSelector = source === "booking"
    ? '.side .nav-item[data-tip="All inbox"]'
    : '.pt-side .pt-nav-item[data-tip="All inbox"]';

  const ensureItem = () => {
    const inbox = document.querySelector<HTMLElement>(inboxSelector);
    if (!inbox) return;
    const existing = document.querySelector<HTMLElement>("[data-workspace-destination]");
    if (existing?.previousElementSibling === inbox) return;
    existing?.remove();

    const item = inbox.cloneNode(true) as HTMLElement;
    item.dataset.tip = "Destination";
    item.dataset.workspaceDestination = "";
    item.setAttribute("aria-label", "Destination");
    item.removeAttribute("aria-current");
    item.classList.remove("active", "pt-nav-item--active");
    if (source === "booking") item.setAttribute("role", "button");

    const label = item.querySelector<HTMLElement>(source === "booking" ? ".nav-label" : ".pt-nav-item__label");
    if (label) label.textContent = "Destination";
    const svg = item.querySelector("svg");
    if (svg) svg.outerHTML = pinIcon;
    inbox.insertAdjacentElement("afterend", item);
  };

  const handleClick = (event: Event) => {
    if (!(event.target as Element | null)?.closest?.("[data-workspace-destination]")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    onNavigate();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (source !== "booking" || !["Enter", " "].includes(event.key)) return;
    if (!(event.target as Element | null)?.closest?.("[data-workspace-destination]")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    onNavigate();
  };

  ensureItem();
  const observer = new MutationObserver(ensureItem);
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("click", handleClick, { capture: true });
  document.addEventListener("keydown", handleKeyDown, { capture: true });

  return () => {
    observer.disconnect();
    document.removeEventListener("click", handleClick, { capture: true });
    document.removeEventListener("keydown", handleKeyDown, { capture: true });
  };
}
