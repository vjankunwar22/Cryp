# Edit Property Page Design

## Goal

Allow admins to edit every property field, including existing and newly added photos.

## Design

Reuse the existing add-property tab as an upsert form. The property detail page shows an admin-only Edit action that navigates to `/(root)/(tabs)/create?propertyId=<id>`. The create screen reads `propertyId` with Expo Router `useLocalSearchParams`; when present it loads that property from Supabase, pre-fills all fields, and switches copy/buttons from create mode to edit mode.

Images are split into two groups: existing public image URLs from the property row and new local image picker assets. Admins can remove either group from the form. On save, the app uploads only new local images, combines remaining existing URLs with new public URLs, and updates the property row. Removing an existing URL removes it from the row but does not delete the storage object.

## Behavior

Create mode remains unchanged for admins without `propertyId`. Edit mode updates `properties` with title, description, price, type, bedrooms, bathrooms, area, address, city, latitude, longitude, featured status, sold status, and images. At least one image is still required after removals. On success, the app navigates to the edited property detail page.
