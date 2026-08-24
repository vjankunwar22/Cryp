import { useSignIn } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SignIn() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const isLoading = fetchStatus === "fetching";


  const handleSignIn = async () => {
    const { error } = await signIn.password({
      emailAddress: email,
      password,
    });
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    // if (!error) await signUp.verifications.sendEmailCode();

    if (signIn.status === "complete"){
      await signIn.finalize({
        navigate : ({session,decorateUrl}) =>{

          if (session ?.currentTask){
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as any)
        }

      });
    }else if (signIn.status === "needs_second_factor"){
      await signIn.mfa.sendPhoneCode()
    }else if (signIn.status === "needs_client_trust"){
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy ==="email_code",

      )
      if (emailCodeFactor){
        await signIn.mfa.sendEmailCode()
      }
    }
    else {
      console.error("Sign-in Attempt not complete: " ,signIn)
    }

  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({code});

    if (signIn.status === "complete") {
      await signIn.finalize( {
        navigate:({session,decorateUrl}) => {

          if(session?.currentTask){

            console.log(session?.currentTask)
            return;
          }
            const url = decorateUrl("/")
            router.replace(url as any)
        }
        
      });
    }
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <View className="flex-1 px-6 py-12 justify-center">
        <Image
          source={require("../../assets/images/logo-tight.png")}
          style={{ width: 248, height: 106, marginBottom: 32 }}
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold mb-2 text-gray-800">
          Verify your Account {""}
        </Text>
        <Text className="text-gray-500 mb-8">
          We have sent a verification code to your {email}
        </Text>
        <TextInput
          className="px-4 py-3 border mb-4 border-gray-300 rounded-xl w-full"
          placeholder="Enter verification code"
          placeholderTextColor="#9CA3AF"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        {errors.fields?.code && (
          <Text className="text-red-500 mb-2">
            {errors.fields.code.message}
          </Text>
        )}

        <TouchableOpacity
          disabled={isLoading}
          onPress={handleVerify}
          className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base"> Verify </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress = {() => signIn.mfa.sendEmailCode()} className="py-2" >
            <Text className="text-blue-500 font-bold">
              I need a new code
            </Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-white"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 px-6 py-12 justify-center">
        <Image
          source={require("../../assets/images/logo-tight.png")}
          style={{ width: 248, height: 106, marginBottom: 32 }}
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold mb-2 text-gray-800">
          Welcome Back
        </Text>
        <Text className="text-gray-500 mb-8">SignIn to your account</Text>
        
        <TextInput
          className="px-4 py-3 border mb-4 border-gray-300 rounded-xl"
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {errors.fields?.identifier && (
          <Text className="text-red-500 mb-2">
            {errors.fields.identifier.message}
          </Text>
        )}
        <View className="relative mb-4">
          <TextInput
            className="px-4 py-3 pr-12 border border-gray-300 rounded-xl"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-0 bottom-0 justify-center"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>
        {errors.fields?.password && (
          <Text className="text-red-500 mb-2">
            {errors.fields.password.message}
          </Text>
        )}

        <TouchableOpacity
          disabled={isLoading}
          onPress={handleSignIn}
          className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center gap-1">
          <Text className="text-gray-500">Don&apos;t have an account ?</Text>
          <Link href="/sign-up" className="text-blue-600 font-bold">
            Sign Up
          </Link>
        </View>
        <View nativeID="clerk-captcha" />
      </View>
    </ScrollView>
  );
}
