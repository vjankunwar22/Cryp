import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, Image, View } from "react-native";

function InitialLoading() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={require("../assets/images/logo-tight.png")}
        style={{ width: 260, height: 112, marginBottom: 18 }}
        resizeMode="contain"
      />
      <ActivityIndicator color="#2563EB" />
    </View>
  );
}

export default function Index() {
  const {isSignedIn,isLoaded} = useAuth()

  if(!isLoaded) return <InitialLoading />;

  if(isSignedIn) return <Redirect href="/(root)/(tabs)"/> ;
  

  return <Redirect href="/sign-up" />;
}
