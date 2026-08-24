const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = join(__dirname, "..");

test("search filter button opens the filter modal", () => {
  const source = readFileSync(join(projectRoot, "app/(root)/(tabs)/search.tsx"), "utf8");

  assert.match(source, /onPress=\{\(\)\s*=>\s*setShowFilters\(true\)\}/);
});

test("active filter count only includes selected filter values", () => {
  const source = readFileSync(join(projectRoot, "app/(root)/(tabs)/search.tsx"), "utf8");

  assert.match(source, /type\s*!==\s*null/);
  assert.match(source, /bedrooms\s*!==\s*null/);
  assert.match(source, /minPrice\s*!==\s*null/);
  assert.match(source, /maxPrice\s*!==\s*null/);
  assert.doesNotMatch(source, /type!\s*==\s*null/);
  assert.doesNotMatch(source, /minPrice!\s*==\s*null/);
});
