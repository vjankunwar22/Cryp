import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
type ProfileUser = NonNullable<ReturnType<typeof useUser>["user"]>;

function ProfileRow({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center px-5 py-5"
    >
      <Ionicons name={icon} size={25} color="#8B8B8F" />
      <Text className="flex-1 ml-5 text-base font-semibold text-gray-700">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={22} color="#D1D5DB" />
    </Pressable>
  );
}

async function updateProfileImage(user: ProfileUser) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });

  const selectedAsset = result.canceled ? null : result.assets[0];
  if (!selectedAsset?.base64) return;

  const mimeType = selectedAsset.mimeType ?? "image/jpeg";
  await user.setProfileImage({
    file: `data:${mimeType};base64,${selectedAsset.base64}`,
  });
  await user.reload();
}

async function signOutUser(signOut: () => Promise<void>) {
  await signOut();
}

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [imageLoading, setImageLoading] = useState(false);

  const fullName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "User";

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    "No email address";

  const handlePickImage = () => {
    if (!user || imageLoading) return;

    setImageLoading(true);
    updateProfileImage(user)
      .catch((error) => {
        console.error("Error updating profile image:", error);
        Alert.alert("Image update failed", "Please try choosing another photo.");
      })
      .finally(() => setImageLoading(false));
  };

  const handleSignOut = () => {
    signOutUser(signOut)
      .then(() => router.replace("/sign-in"))
      .catch((error) => {
        console.error("Error signing out:", error);
        Alert.alert("Sign out failed", "Please try again.");
      });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 110 }}
      >
        <View className="flex-1 px-7 pt-16">
          <View className="items-center">
            <View>
              {user?.imageUrl ? (
                <Image
                  source={user.imageUrl}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View className="w-28 h-28 rounded-full bg-blue-100 items-center justify-center">
                  <Text className="text-4xl font-bold text-blue-600">
                    {fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={handlePickImage}
                disabled={imageLoading}
                className="absolute -right-1 bottom-2 w-10 h-10 rounded-full bg-blue-600 items-center justify-center border-4 border-white"
              >
                {imageLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="camera" size={19} color="#FFFFFF" />
                )}
              </Pressable>
            </View>

            <Text className="mt-5 text-2xl font-bold text-gray-900">
              {fullName}
            </Text>
            <Text className="mt-1 text-base font-medium text-gray-400">
              {email}
            </Text>
          </View>

          <View className="mt-12">
            <ProfileRow
              icon="heart-outline"
              label="Saved Properties"
              onPress={() => router.push("/(root)/(tabs)/saved")}
            />
            <ProfileRow icon="notifications-outline" label="Notifications" />
            <ProfileRow icon="settings-outline" label="Settings" />
            <ProfileRow icon="help-circle-outline" label="Help & Support" />
          </View>

          <View className="flex-1 justify-end pb-8">
            <Pressable
              onPress={handleSignOut}
              className="w-full flex-row items-center justify-center bg-red-50 border border-red-100 py-4 rounded-2xl"
            >
              <Ionicons name="log-out-outline" size={22} color="#B84A62" />
              <Text className="ml-3 text-base font-bold text-[#B84A62]">
                Sign Out
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#DBEAFE",
  },
});
