import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React from "react";
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
  const { signUp, errors, fetchStatus } = useSignUp();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const isLoading = fetchStatus === "fetching";

  
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
        <TextInput
          className="px-4 py-3 border mb-4 border-gray-300 rounded-xl"
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errors.fields?.password && (
          <Text className="text-red-500 mb-2">
            {errors.fields.password.message}
          </Text>
        )}

        <TouchableOpacity
          disabled={isLoading}
          
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
        <View nativeID="clerk-captcha"/>
      </View>
    </ScrollView>
  );
}
