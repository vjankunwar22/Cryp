# Edit Property Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin edit support for every property field and photo list.

**Architecture:** Reuse `app/(root)/(tabs)/create.tsx` as create/edit form based on `propertyId` query param. Add an Edit action in `app/(root)/property/[id].tsx` that routes admins into edit mode.

**Tech Stack:** Expo Router, React Native, Expo ImagePicker SDK 54, Supabase JS v2, Clerk-authenticated Supabase client.

---

## Tasks

- [ ] Add static regression checks for edit mode in `tests/add-property-page.test.js`.
- [ ] Update detail admin actions to include an Edit button that pushes `/(root)/(tabs)/create` with `propertyId`.
- [ ] Update create screen to read `propertyId`, fetch the property, prefill form state, and track existing image URLs separately from selected local images.
- [ ] Update validation to require at least one total image.
- [ ] Add update helper that uploads only new local images and updates the row with combined image URLs.
- [ ] Switch UI copy and submit behavior between Create Property and Save Changes.
