import { Text, TouchableOpacity} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@clerk/expo'
import { useRouter } from 'expo-router';


export default function Profile() {

  const {signOut} = useAuth();
  const router = useRouter()

  const handleSignOut = async() =>{

    try{
      await signOut();
      router.replace("/sign-in")
    }
    catch(error){
      console.error("Error signing out:" ,error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Text>Profile</Text>


  <TouchableOpacity
            // disabled={isLoading}
            onPress={handleSignOut}
            className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4"
          >
           
              <Text className="text-white font-bold text-base"> Log Out</Text>
          </TouchableOpacity>
    </SafeAreaView>
  )
}
