# Add Property Page Design

## Goal

Build an admin-only Add Property tab where admins can create a property by entering listing details, selecting photos from the device, uploading those photos to Supabase Storage, and inserting the completed property row into Supabase.

## Scope

The page replaces the placeholder at `app/(root)/(tabs)/create.tsx`. The existing tab layout already exposes the create tab only to admins in normal navigation, but the route itself must also guard direct access and show a clear access-denied state for non-admin users.

## Form

The form collects the fields already used by the app's `Property` type and property detail screen: title, description, price, type, bedrooms, bathrooms, area in square feet, address, city, latitude, longitude, featured status, and images. `id` and `created_at` are database-generated, and the insert explicitly sets `is_sold: false`.

All text fields are required after trimming. Type is constrained to the current app filter values: `apartment`, `house`, `villa`, or `studio`. Numeric validation happens before any upload: price and area must be greater than 0, bedrooms and bathrooms must be whole numbers greater than or equal to 0, latitude must be between -90 and 90, and longitude must be between -180 and 180. At least one image is required.

## Photo Upload

Admins pick one or more images from the device with Expo ImagePicker. Expo SDK 54 supports `launchImageLibraryAsync` with `allowsMultipleSelection` and image assets that include a local `uri`, optional `fileName`, and optional `mimeType`. On submit, the screen uploads each selected image to a public Supabase Storage bucket named `property-images`, reads each uploaded file's public URL, and stores the public URLs in the `properties.images` array.

Upload paths use `properties/<timestamp>-<index>-<safe-filename>`, where the filename comes from `asset.fileName` when available and falls back to `property-image-<index>.jpg`. Filenames are sanitized to alphanumeric characters, dots, underscores, and hyphens. MIME type falls back to `image/jpeg`. Uploads use `upsert: false`; collisions should fail rather than overwrite an existing image.

## Data Flow

The page uses the authenticated Supabase client from `useSupbase()` so database/storage policies can enforce admin access. Submit uploads images first, then inserts the property into `properties`, selecting the inserted row so the app can navigate to `/(root)/property/[id]` on success.

Prerequisites are out of scope for the app code but required at runtime: Supabase must already have a public `property-images` storage bucket, storage policies that allow admins to upload to it, and table policies that allow admins to insert into `properties`.

## Error Handling

Validation errors use `Alert.alert` and keep the form intact. Upload or insert errors stop submission, show a failure alert, and leave the selected photos and entered form values in place so the admin can retry.

## Testing

Add a focused static regression test matching the project's existing `node:test` style. The test should require the create screen to use Expo ImagePicker with multiple selection, Supabase storage upload with public URLs, authenticated insertion into `properties`, admin route guarding, validation for images/numeric input, and navigation to the new property detail page.
