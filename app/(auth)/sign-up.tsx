import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUp() {
  const router = useRouter();

  const {isSignedIn} = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const isLoading = fetchStatus === "fetching";

  if( signUp.status === "complete" || isSignedIn) {
    return null;
  }

  const handleSignUp = async () => {
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      lastName,
    });
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({code});

    if (signUp.status === "complete") {
      await signUp.finalize( {
        navigate:({decorateUrl}) => {
            const url = decorateUrl("/")
            router.replace(url as any)
        }
        
      });
    }
  };

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View className="flex-1 px-6 py-12 justify-center">
        <Image
          source={require("../../assets/images/logo.png")}
          className="w-32 h-16 mb-8"
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

        <TouchableOpacity onPress = {() => signUp.verifications.sendEmailCode()} className="py-2" >
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
          source={require("../../assets/images/logo.png")}
          className="w-32 h-16 mb-8"
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold mb-2 text-gray-800">
          Create an Account
        </Text>
        <Text className="text-gray-500 mb-8">Find your dream home today</Text>
        <View className="flex-row gap-3 mb-4">
          <TextInput
            className="px-4 py-3 border flex-1 border-gray-300 rounded-xl"
            placeholder="First Name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            className="px-4 py-3 border flex-1 border-gray-300 rounded-xl"
            placeholder="Last Name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <TextInput
          className="px-4 py-3 border mb-4 border-gray-300 rounded-xl"
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {errors.fields?.emailAddress && (
          <Text className="text-red-500 mb-2">
            {errors.fields.emailAddress.message}
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
          onPress={handleSignUp}
          className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Sign Up</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center gap-1">
          <Text className="text-gray-500">Already have an account?</Text>
          <Link href="/sign-in" className="text-blue-600 font-bold">
            Sign In
          </Link>
        </View>
        <View nativeID="clerk-captcha" />
      </View>
    </ScrollView>
  );
}
