// One-time migration. Original bytes and index coverage are checked before Git metadata is removed.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const modules = ["booking-module", "finance-module", "vendor-crm"];
if (modules.some((module) => !existsSync(resolve(root, module, ".git")))) throw new Error("One-time migration requires the original nested Git pointers. Consolidation is already complete.");
const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
if (git(["branch", "--show-current"]).trim() !== "main") throw new Error("Migration must run on main.");
const snapshotPath = resolve(root, ".git/module-consolidation-files.json");
const snapshots = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, "utf8")) : modules.map((module) => {
  const files = git(["-C", module, "ls-files", "--cached", "--others", "--exclude-standard", "-z"]).split("\0").filter(Boolean);
  return {
    module,
    originalHead: git(["-C", module, "rev-parse", "HEAD"]).trim(),
    files: files.map((file) => {
      const path = `${module}/${file}`;
      return { path, sha256: createHash("sha256").update(readFileSync(resolve(root, path))).digest("hex") };
    }),
  };
});
writeFileSync(snapshotPath, JSON.stringify(snapshots, null, 2) + "\n");
// Explicit index entries bypass Git's refusal to add paths underneath nested repositories.
// This lets us prove root ownership while the original nested metadata is still intact.
const entries = [];
for (const snapshot of snapshots) {
  const modes = new Map(git(["-C", snapshot.module, "ls-files", "--stage", "-z"]).split("\0").filter(Boolean).map((entry) => {
    const [metadata, path] = entry.split("\t");
    return [path, metadata.split(" ")[0]];
  }));
  if (git(["ls-files", "--stage", "--", snapshot.module]).startsWith("160000 ")) git(["rm", "--cached", "--", snapshot.module]);
  for (const file of snapshot.files) {
    if (createHash("sha256").update(readFileSync(resolve(root, file.path))).digest("hex") !== file.sha256) throw new Error(`Source bytes changed: ${file.path}`);
    const mode = modes.get(file.path.slice(snapshot.module.length + 1)) ?? "100644";
    const blob = git(["hash-object", "-w", `--path=${file.path}`, file.path]).trim();
    entries.push(`${mode} ${blob}\t${file.path}\0`);
  }
}
execFileSync("git", ["update-index", "-z", "--index-info"], { cwd: root, input: entries.join(""), encoding: "utf8" });
const staged = git(["ls-files", "--stage", "-z"]).split("\0").filter(Boolean);
const index = new Map(staged.map((entry) => {
  const [metadata, path] = entry.split("\t");
  return [path, metadata.split(" ")];
}));
for (const snapshot of snapshots) {
  for (const file of snapshot.files) {
    const actual = createHash("sha256").update(readFileSync(resolve(root, file.path))).digest("hex");
    if (actual !== file.sha256) throw new Error(`Source bytes changed: ${file.path}`);
    const entry = index.get(file.path);
    if (!entry || !["100644", "100755"].includes(entry[0])) throw new Error(`Not root-tracked: ${file.path}`);
    const blob = git(["hash-object", `--path=${file.path}`, file.path]).trim();
    if (blob !== entry[1]) throw new Error(`Index differs from source: ${file.path}`);
  }
}
if (staged.some((entry) => entry.startsWith("160000 "))) throw new Error("A gitlink remains.");
console.log(JSON.stringify(snapshots.map(({ module, originalHead, files }) => ({ module, originalHead, verifiedFiles: files.length })), null, 2));
console.log("Original files verified in root index. Nested metadata may now be removed.");
