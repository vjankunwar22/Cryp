const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = join(__dirname, "..");

test("recommended property cards show the save icon", () => {
  const source = readFileSync(
    join(projectRoot, "app/(root)/(tabs)/index.tsx"),
    "utf8",
  );

  assert.match(source, /<PropertyCard\s+property=\{item\}\s+showSave\s*\/>/);
});
