const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = join(__dirname, "..");

test("profile screen uses real Clerk data and image picker", () => {
  const source = readFileSync(
    join(projectRoot, "app/(root)/(tabs)/profile.tsx"),
    "utf8",
  );

  assert.match(source, /useUser/);
  assert.match(source, /expo-image-picker/);
  assert.match(source, /launchImageLibraryAsync/);
  assert.match(source, /setProfileImage/);
  assert.match(source, /imageUrl/);
  assert.match(source, /primaryEmailAddress/);
});

test("profile actions navigate saved properties and sign out", () => {
  const source = readFileSync(
    join(projectRoot, "app/(root)/(tabs)/profile.tsx"),
    "utf8",
  );

  assert.match(source, /router\.push\("\/\(root\)\/\(tabs\)\/saved"\)/);
  assert.match(source, /await\s+signOut\(\)/);
  assert.match(source, /router\.replace\("\/sign-in"\)/);
});
