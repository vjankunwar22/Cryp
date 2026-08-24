const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = join(__dirname, "..");
const createScreenPath = join(projectRoot, "app/(root)/(tabs)/create.tsx");

test("add property page uploads selected device photos before inserting a property", () => {
  const source = readFileSync(createScreenPath, "utf8");

  assert.match(source, /expo-image-picker/);
  assert.match(source, /useSupbase/);
  assert.match(source, /launchImageLibraryAsync/);
  assert.match(source, /allowsMultipleSelection:\s*true/);
  assert.match(source, /base64:\s*true/);
  assert.match(source, /base64ToArrayBuffer/);
  assert.match(source, /uploadBody\.byteLength\s*===\s*0/);
  assert.match(source, /\.storage\s*\n?\s*\.from\("property-images"\)\s*\n?\s*\.upload/);
  assert.match(
    source,
    /\.storage\s*\n?\s*\.from\("property-images"\)\s*\n?\s*\.getPublicUrl/,
  );
  assert.match(source, /contentType\s*=\s*asset\.mimeType\s*\?\?\s*"image\/jpeg"/);
  assert.match(source, /upsert:\s*false/);
  assert.match(source, /rawName\.replace\(\/\[\^a-zA-Z0-9\._-\]\//);
  assert.match(source, /\.from\("properties"\)\s*\n?\s*\.insert/);
  assert.match(source, /images:\s*imageUrls/);
  assert.match(source, /is_featured:\s*form\.isFeatured/);
  assert.match(source, /is_sold:\s*false/);
  assert.match(
    source,
    /router\.replace\(`\/\(root\)\/property\/\$\{savedProperty\.id\}`\)/,
  );
});

test("add property page is guarded for admins and validates required fields", () => {
  const source = readFileSync(createScreenPath, "utf8");

  assert.match(source, /useUserStore/);
  assert.match(source, /if\s*\(\s*!isAdmin\s*\)/);
  assert.match(source, /Admin access required/);
  assert.match(source, /selectedImages\.length\s*===\s*0/);
  assert.match(source, /Number\.isNaN/);
  assert.match(source, /numericFields\.price\s*<=\s*0/);
  assert.match(source, /numericFields\.areaSqft\s*<=\s*0/);
  assert.match(source, /Number\.isInteger\(numericFields\.bedrooms\)/);
  assert.match(source, /numericFields\.latitude\s*<\s*-90/);
  assert.match(source, /numericFields\.longitude\s*>\s*180/);
  assert.match(source, /"apartment", "house", "villa", "studio"/);
  assert.match(source, /Alert\.alert\("Missing photos"/);
});

test("admin can edit every property field and photo list", () => {
  const createSource = readFileSync(createScreenPath, "utf8");
  const detailSource = readFileSync(
    join(projectRoot, "app/(root)/property/[id].tsx"),
    "utf8",
  );

  assert.match(detailSource, /Edit/);
  assert.match(detailSource, /pathname:\s*"\/\(root\)\/\(tabs\)\/create"/);
  assert.match(detailSource, /params:\s*\{\s*propertyId:\s*property\.id\s*\}/);

  assert.match(createSource, /useLocalSearchParams/);
  assert.match(createSource, /propertyId/);
  assert.match(createSource, /existingImageUrls/);
  assert.match(createSource, /setExistingImageUrls\(property\.images/);
  assert.match(createSource, /\.from\("properties"\)\s*\n?\s*\.update/);
  assert.match(createSource, /\.eq\("id", propertyId\)/);
  assert.match(createSource, /images:\s*allImageUrls/);
  assert.match(createSource, /is_sold:\s*form\.isSold/);
  assert.match(createSource, /Save Changes/);
});
