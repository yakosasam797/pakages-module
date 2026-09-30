import { fileURLToPath } from "node:url";

const hostSource = fileURLToPath(new URL("../src/", import.meta.url)).replaceAll("\\", "/");

// Keep original module selectors and specificity, including menus portalled to body.
// Vite applies this in development and production; the design system stays shared.
export function scopeModuleCss() {
  return {
    postcssPlugin: "workspace-module-styles",
    Once(root) {
      const file = root.source?.input.file?.replaceAll("\\", "/") ?? "";
      const owner = file.includes("/vendor-crm/src/") ? "vendors"
        : file.includes("/finance-module/src/") ? "finance" : null;
      const isHost = file.startsWith(hostSource) && !file.endsWith("/WorkspaceNotes.css");
      if (!owner && !isHost) return;
      const condition = owner ? `[data-workspace-module="${owner}"]` : ':not([data-workspace-module="vendors"])';
      root.walkRules((rule) => {
        for (let parent = rule.parent; parent; parent = parent.parent) {
          if (parent.type === "atrule" && parent.name.endsWith("keyframes")) return;
        }
        rule.selectors = rule.selectors.map((selector) => {
          if (/^(?:html|:root)(?=[\s.#:[>+~]|$)/.test(selector)) {
            return selector.replace(/^(html|:root)/, `$1:where(:has(body${condition}))`);
          }
          if (/^body(?=[\s.#:[>+~]|$)/.test(selector)) return selector.replace(/^body/, `body:where(${condition})`);
          return `:where(body${condition}) ${selector}`;
        });
      });
    },
  };
}
