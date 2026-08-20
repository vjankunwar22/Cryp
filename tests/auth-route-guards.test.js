const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = join(__dirname, "..");

test("signed-out users are sent to sign-up from the entry route", () => {
  const source = readFileSync(join(projectRoot, "app/index.tsx"), "utf8");

  assert.match(
    source,
    /if\s*\(\s*!isSignedIn\s*\)\s*return\s*<Redirect\s+href="\/sign-up"\s*\/>/,
  );
  assert.match(
    source,
    /return\s*<Redirect\s+href="\/\(root\)\/\(tabs\)"\s*\/>/,
  );
});

test("signed-in users are redirected away from auth routes", () => {
  const source = readFileSync(join(projectRoot, "app/(auth)/_layout.tsx"), "utf8");

  assert.match(
    source,
    /if\s*\(\s*isSignedIn\s*\)\s*return\s*<Redirect\s+href="\/\(root\)\/\(tabs\)"\s*\/>/,
  );
  assert.match(source, /return\s*<Stack\s+screenOptions=\{\{\s*headerShown:\s*false\s*\}\}\s*\/>/);
});
