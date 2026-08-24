# Profile Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the real-data profile tab UI with avatar picking and sign-out.

**Architecture:** Keep all behavior inside `app/(root)/(tabs)/profile.tsx` because this is a single tab screen and the existing profile placeholder already owns sign-out. Add one source-level regression test under `tests/` to match the current lightweight test pattern.

**Tech Stack:** Expo SDK 54, Expo Router, Clerk Expo, React Native, NativeWind, Ionicons, `expo-image-picker`, Node test runner.

---

### Task 1: Profile Screen Regression Test

**Files:**
- Create: `tests/profile-screen.test.js`

- [ ] **Step 1: Write the failing test**

Assert that `profile.tsx` imports Clerk `useUser`, imports `expo-image-picker`, calls `launchImageLibraryAsync`, calls `user.setProfileImage`, navigates saved properties to `/(root)/(tabs)/saved`, and signs out through Clerk.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/profile-screen.test.js`

Expected: FAIL because the current placeholder profile screen does not use Clerk user data or Image Picker.

### Task 2: Real Profile Screen

**Files:**
- Modify: `app/(root)/(tabs)/profile.tsx`

- [ ] **Step 1: Implement profile UI and behavior**

Use `useUser()` for `user.fullName`, email, and `user.imageUrl`. Use `ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 })`; when not canceled, call `user.setProfileImage({ file: result.assets[0].uri })`.

- [ ] **Step 2: Run focused test**

Run: `node --test tests/profile-screen.test.js`

Expected: PASS.

- [ ] **Step 3: Run broader checks**

Run: `npm run lint`

Expected: no lint errors.
