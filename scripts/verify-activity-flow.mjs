import { build } from "esbuild";

const bundled = await build({
  entryPoints: ["src/activityProposalFlow.test.mjs"],
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  write: false,
});

await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);
