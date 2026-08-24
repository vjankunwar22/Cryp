# Add Property Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-only Add Property page that uploads selected device photos to Supabase Storage and creates a property row.

**Architecture:** Keep the feature contained in the existing create tab route, using local form state and the authenticated Supabase client. Upload selected image assets to the `property-images` bucket with non-overwriting sanitized paths, resolve public URLs, insert into `properties` with `is_sold: false`, then route to the new detail screen.

**Tech Stack:** Expo Router, React Native, Expo ImagePicker SDK 54, Supabase JS v2, Clerk-authenticated Supabase client, NativeWind classes, `node:test`.

---

## File Structure

- `tests/add-property-page.test.js`: focused static regression tests matching the existing repository test style. In the current workspace this file has already been added and should be updated, not recreated.
- `app/(root)/(tabs)/create.tsx`: replace placeholder with the admin-only form, image picker, upload helpers, validation, and insert flow.

### Task 1: Static Regression Test

**Files:**
- Create or update: `tests/add-property-page.test.js`

- [ ] **Step 1: Write the failing test**

```js
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
  assert.match(source, /\.storage\s*\n?\s*\.from\("property-images"\)\s*\n?\s*\.upload/);
  assert.match(source, /\.storage\s*\n?\s*\.from\("property-images"\)\s*\n?\s*\.getPublicUrl/);
  assert.match(source, /contentType\s*=\s*asset\.mimeType\s*\?\?\s*"image\/jpeg"/);
  assert.match(source, /upsert:\s*false/);
  assert.match(source, /rawName\.replace/);
  assert.match(source, /\.from\("properties"\)\s*\n?\s*\.insert/);
  assert.match(source, /images:\s*imageUrls/);
  assert.match(source, /is_featured:\s*form\.isFeatured/);
  assert.match(source, /is_sold:\s*false/);
  assert.match(source, /router\.push\(`\/\(root\)\/property\/\$\{createdProperty\.id\}`\)/);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/add-property-page.test.js`

Expected: FAIL because `create.tsx` is still a placeholder and does not use ImagePicker, Supabase storage upload, insert, or admin validation.

### Task 2: Admin Guard and Form State

**Files:**
- Modify: `app/(root)/(tabs)/create.tsx`

- [ ] **Step 1: Write or update the failing assertions**

Run: `node --test tests/add-property-page.test.js`

Expected: FAIL until `create.tsx` imports `useUserStore`, calls `useSupbase()`, defines the form state shape, and renders the non-admin `Admin access required` state.

- [ ] **Step 2: Implement admin guard and form state**

Use `useUserStore` for `isAdmin`, `useSupbase()` for the authenticated Supabase client, and local state with `title`, `description`, `price`, `type`, `bedrooms`, `bathrooms`, `areaSqft`, `address`, `city`, `latitude`, `longitude`, and `isFeatured`. Non-admins render an access-denied screen.

- [ ] **Step 3: Run focused test**

Run: `node --test tests/add-property-page.test.js`

Expected: Remaining failures are only for picker/upload/insert behavior.

### Task 3: Photo Picker and Validation

- [ ] **Step 1: Add photo picking**

Use `ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, quality: 0.8 })`, append selected assets, and render thumbnails with remove buttons.

- [ ] **Step 2: Add validation helpers**

Validate required text fields, constrain type to `apartment`, `house`, `villa`, or `studio`, parse numeric fields, require price and area greater than 0, require whole-number bedrooms and bathrooms greater than or equal to 0, require latitude between -90 and 90, require longitude between -180 and 180, and require at least one selected image. Upload each image URI as a blob to `property-images`, using paths like `properties/<timestamp>-<index>-<safe-filename>`, `image/jpeg` as the MIME fallback, and `upsert: false`.

- [ ] **Step 3: Run focused test**

Run: `node --test tests/add-property-page.test.js`

Expected: Remaining failures are only for Supabase upload/insert behavior.

### Task 4: Supabase Upload, Insert, and Navigation

- [ ] **Step 1: Add upload helper**

Fetch each selected image URI, convert it to a blob, upload to `authSupabase.storage.from("property-images").upload(filePath, blob, { contentType, upsert: false })`, then call `getPublicUrl(data.path)`.

- [ ] **Step 2: Insert property and navigate**

Insert the payload into `properties` with trimmed text fields, parsed numeric fields, `images: imageUrls`, `is_featured: form.isFeatured`, and `is_sold: false`. Chain `.select("*").single()`, show success, reset loading, preserve values on failure, and navigate with `router.push(\`/(root)/property/${createdProperty.id}\`)` so the detail page has back history.

- [ ] **Step 3: Run focused test**

Run: `node --test tests/add-property-page.test.js`

Expected: PASS.

### Task 5: Verification

**Files:**
- Read: `package.json`
- Run existing targeted tests if practical.

- [ ] **Step 1: Run all local node tests**

Run: `node --test tests/*.test.js`

Expected: PASS.

- [ ] **Step 2: Run lint/type-oriented project check**

Run: `npm run lint`

Expected: PASS or report any pre-existing environment/configuration blockers.
