import { useAuth } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";

export default function RootLayout() {
  const {isSignedIn,isLoaded} = useAuth()

  // syn Clerk -> Supabase (we will build this later)

  if(!isLoaded) return null;

  if(!isSignedIn) return <Redirect href="/sign-in"/> ;
  

  return <Slot/>;
}
