# Profile Screen Design

## Goal

Replace the placeholder profile tab with a real account page that matches the provided reference while using the signed-in Clerk user's actual data.

## Design

The profile tab uses the existing Expo Router, Clerk, NativeWind, and Ionicons patterns already present in the app. The screen shows the user's avatar, display name, and primary email address centered near the top. A camera badge overlays the avatar and opens the device image library through `expo-image-picker`.

When the user selects an image, the screen reads the selected asset URI from `result.assets[0].uri` and calls Clerk's profile image update API. While the image is saving, the camera badge is disabled and shows a spinner.

Below the account summary, four profile actions are shown as full-width rows: Saved Properties, Notifications, Settings, and Help & Support. Saved Properties navigates to the existing saved tab. The remaining rows are presentational until dedicated routes exist.

The sign-out action remains wired to Clerk's `signOut()` and redirects to `/sign-in`. The button is positioned near the bottom of the content with muted red styling similar to the screenshot.

## Validation

Add a focused source-level regression test matching the existing test style. It should assert that the profile screen uses Clerk `useUser`, imports `expo-image-picker`, launches the image library, updates the user's profile image, navigates to saved properties, and signs out.
