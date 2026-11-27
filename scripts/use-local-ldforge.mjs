// Explicit preview override: never writes package.json or a lockfile and never publishes.
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.resolve(
  process.argv[2] || path.join(root, "../../LDMax/LDForge")
);
const destination = mkdtempSync(path.join(tmpdir(), "sparnatural-ldforge-"));
execFileSync("npm", ["run", "build", "-w", "@ldforge/editor"], {
  cwd: source,
  stdio: "inherit",
});
const packed = JSON.parse(
  execFileSync(
    "npm",
    ["pack", "./packages/editor", "--pack-destination", destination, "--json"],
    { cwd: source, encoding: "utf8" }
  )
);
execFileSync(
  "npm",
  [
    "install",
    "--no-save",
    "--package-lock=false",
    path.join(destination, packed[0].filename),
  ],
  { cwd: root, stdio: "inherit" }
);
console.log(
  `Archive: ${path.join(destination, packed[0].filename)}\nIntegrity: ${
    packed[0].integrity
  }`
);
console.log(
  "Local editor archive installed for preview only. Restart the dev server. Run npm install to restore registry dependencies."
);
