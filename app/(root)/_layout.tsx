import { useUserSync } from "@/hooks/useUserSync";
import { useAuth } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, Image, View } from "react-native";

function RootLoading() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={require("../../assets/images/logo-tight.png")}
        style={{ width: 260, height: 112, marginBottom: 18 }}
        resizeMode="contain"
      />
      <ActivityIndicator color="#2563EB" />
    </View>
  );
}

export default function RootLayout() {
  const {isSignedIn,isLoaded} = useAuth()

  useUserSync();

  if(!isLoaded) return <RootLoading />;

  if(!isSignedIn) return <Redirect href="/sign-in"/> ;
  

  return <Slot/>;
}
