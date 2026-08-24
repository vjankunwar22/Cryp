import FeaturedCard from "@/components/FeaturedCard";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/supabase";
import { Property } from "@/types";
import { useUser } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);

  const [loading, setLoading] = useState(true);

  // console.log(featured,recommended)

  const fetchProperities = async () => {
    setLoading(true);
    const { data: featuredData } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });

    const { data: recommendedData } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", false)
      .order("created_at", { ascending: false });

    setFeatured(featuredData ?? []);
    setRecommended(recommendedData ?? []);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProperities();
    }, []),
  );
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}

        showsVerticalScrollIndicator={false}

        ListHeaderComponent={
          <View>
            {/* Header  */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
              <Image
                source={require("../../../assets/images/logo.png")}
                style={{ width: 90, height: 36 }}

                resizeMode="contain"
              />

              <View className="items-end">
                <Text>Good Morning 👋</Text>
                <Text className="text-gray-900 text-base font-bold">
                  {user?.firstName ?? "User"}
                </Text>
              </View>
            </View>

            {/* Search */}

            <TouchableOpacity
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
              className="mb-6 flex-row justify-center items-center  bg-white rounded-2xl px-4 py-3 gap-3 mx-5"
              onPress={() => router.push("/(root)/(tabs)/search")}
            >
              <Ionicons name="search-outline" size={22} color="#9CA3AF" />

              <Text className="text-gray-400 flex-1 text-sm">
                Seach properties, cities...
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push("/(root)/(tabs)/search?openFilters=true")
                }
                className="bg-blue-500 p-1 rounded-lg items-center justify-center"
              >
                <Ionicons name="options-outline" size={18} color={"white"} />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Featured */}
            <View className="mb-6">
              <Text className="px-5  text-lg font-bold mb-4 text-gray-900">
                Featured
              </Text>
           

            {loading ?(
              <ActivityIndicator size="small" color="#2563EB" className=" py-10"/>
            ):(
              <FlatList
              data={featured}
              keyExtractor={(item) =>item.id}
              renderItem={({item}) => <FeaturedCard property={item}/>}
              horizontal
              showsHorizontalScrollIndicator = {false}
              contentContainerStyle ={{paddingHorizontal:20}}

              />
            )}
            </View>

            {/* Recommended  */}

            <Text className="px-5 text-lg font-bold mb-4 text-gray-900">
              Recommended
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-5" >
            <PropertyCard property={item}  />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
