# Packages module

Standalone React + Vite module for managing marketed travel packages and reusable trip templates.

The app consumes `@paryatech/ui` from the Direction 03 design-system repository. The sidebar, top bar, shell, tokens, and shared UI controls are imported from the package rather than recreated locally.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run build
node ../design-system/scripts/check-local-shell.mjs .
```
