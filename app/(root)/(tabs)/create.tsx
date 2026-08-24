import { supabase } from "@/lib/supabase";
import { useSupbase } from "@/lib/useSupabase";
import { useUserStore } from "@/store/userStore";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardTypeOptions,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ImageAsset = ImagePicker.ImagePickerAsset;
type PropertyType = "apartment" | "house" | "villa" | "studio";

type PropertyForm = {
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  bedrooms: string;
  bathrooms: string;
  areaSqft: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
  isSold: boolean;
};

type NumericPropertyFields = {
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  latitude: number;
  longitude: number;
};

const initialForm: PropertyForm = {
  title: "",
  description: "",
  price: "",
  type: "house",
  bedrooms: "",
  bathrooms: "",
  areaSqft: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  isFeatured: false,
  isSold: false,
};

const propertyTypes: PropertyType[] = ["apartment", "house", "villa", "studio"];

function parseNumber(value: string) {
  return Number(value.trim());
}

function getRequiredTextError(form: PropertyForm) {
  const requiredFields: (keyof Omit<
    PropertyForm,
    "isFeatured" | "isSold"
  >)[] = [
    "title",
    "description",
    "price",
    "type",
    "bedrooms",
    "bathrooms",
    "areaSqft",
    "address",
    "city",
    "latitude",
    "longitude",
  ];

  return requiredFields.find((field) => form[field].trim().length === 0);
}

function parseNumericFields(form: PropertyForm): NumericPropertyFields | null {
  const numericFields = {
    price: parseNumber(form.price),
    bedrooms: parseNumber(form.bedrooms),
    bathrooms: parseNumber(form.bathrooms),
    areaSqft: parseNumber(form.areaSqft),
    latitude: parseNumber(form.latitude),
    longitude: parseNumber(form.longitude),
  };

  if (Object.values(numericFields).some((value) => Number.isNaN(value))) {
    return null;
  }

  const hasInvalidRange =
    numericFields.price <= 0 ||
    numericFields.areaSqft <= 0 ||
    numericFields.bedrooms < 0 ||
    numericFields.bathrooms < 0 ||
    !Number.isInteger(numericFields.bedrooms) ||
    !Number.isInteger(numericFields.bathrooms) ||
    numericFields.latitude < -90 ||
    numericFields.latitude > 90 ||
    numericFields.longitude < -180 ||
    numericFields.longitude > 180;

  if (hasInvalidRange) return null;

  return numericFields;
}

function getStoragePath(asset: ImageAsset, index: number) {
  const rawName = asset.fileName ?? `property-image-${index}.jpg`;
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-");

  return `properties/${Date.now()}-${index}-${safeName}`;
}

function base64ToArrayBuffer(base64: string) {
  const binaryString = globalThis.atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return bytes.buffer;
}

async function getImageUploadBody(asset: ImageAsset) {
  if (asset.base64) {
    return base64ToArrayBuffer(asset.base64);
  }

  const response = await fetch(asset.uri);
  const isRemoteAsset = asset.uri.startsWith("http");
  if (isRemoteAsset && !response.ok) {
    throw new Error("Could not read the selected image.");
  }

  const uploadBody = await response.arrayBuffer();
  if (uploadBody.byteLength === 0) {
    throw new Error("Selected image was empty. Please choose it again.");
  }

  return uploadBody;
}

async function uploadPropertyImage(
  authSupabase: ReturnType<typeof useSupbase>,
  asset: ImageAsset,
  index: number,
) {
  const uploadBody = await getImageUploadBody(asset);
  const filePath = getStoragePath(asset, index);
  const contentType = asset.mimeType ?? "image/jpeg";

  const { data, error } = await authSupabase.storage
    .from("property-images")
    .upload(filePath, uploadBody, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = authSupabase.storage
    .from("property-images")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

async function createPropertyWithImages(
  authSupabase: ReturnType<typeof useSupbase>,
  form: PropertyForm,
  numericFields: NumericPropertyFields,
  selectedImages: ImageAsset[],
) {
  const imageUrls = await Promise.all(
    selectedImages.map((asset, index) =>
      uploadPropertyImage(authSupabase, asset, index),
    ),
  );

  const { data: createdProperty, error } = await authSupabase
    .from("properties")
    .insert({
      title: form.title.trim(),
      description: form.description.trim(),
      price: numericFields.price,
      type: form.type,
      bedrooms: numericFields.bedrooms,
      bathrooms: numericFields.bathrooms,
      area_sqft: numericFields.areaSqft,
      address: form.address.trim(),
      city: form.city.trim(),
      latitude: numericFields.latitude,
      longitude: numericFields.longitude,
      images: imageUrls,
      is_featured: form.isFeatured,
      is_sold: false,
    })
    .select("*")
    .single();

  if (error) throw error;
  if (!createdProperty) throw new Error("Property was not created.");

  return createdProperty;
}

async function updatePropertyWithImages(
  authSupabase: ReturnType<typeof useSupbase>,
  propertyId: string,
  form: PropertyForm,
  numericFields: NumericPropertyFields,
  existingImageUrls: string[],
  selectedImages: ImageAsset[],
) {
  const newImageUrls = await Promise.all(
    selectedImages.map((asset, index) =>
      uploadPropertyImage(authSupabase, asset, index),
    ),
  );
  const allImageUrls = [...existingImageUrls, ...newImageUrls];

  const { data: updatedProperty, error } = await authSupabase
    .from("properties")
    .update({
      title: form.title.trim(),
      description: form.description.trim(),
      price: numericFields.price,
      type: form.type,
      bedrooms: numericFields.bedrooms,
      bathrooms: numericFields.bathrooms,
      area_sqft: numericFields.areaSqft,
      address: form.address.trim(),
      city: form.city.trim(),
      latitude: numericFields.latitude,
      longitude: numericFields.longitude,
      images: allImageUrls,
      is_featured: form.isFeatured,
      is_sold: form.isSold,
    })
    .eq("id", propertyId)
    .select("*")
    .single();

  if (error) throw error;
  if (!updatedProperty) throw new Error("Property was not updated.");

  return updatedProperty;
}

function getFormFromProperty(property: Property): PropertyForm {
  return {
    title: property.title ?? "",
    description: property.description ?? "",
    price: `${property.price ?? ""}`,
    type: propertyTypes.includes(property.type as PropertyType)
      ? (property.type as PropertyType)
      : "house",
    bedrooms: `${property.bedrooms ?? ""}`,
    bathrooms: `${property.bathrooms ?? ""}`,
    areaSqft: `${property.area_sqft ?? ""}`,
    address: property.address ?? "",
    city: property.city ?? "",
    latitude: `${property.latitude ?? ""}`,
    longitude: `${property.longitude ?? ""}`,
    isFeatured: property.is_featured ?? false,
    isSold: property.is_sold ?? false,
  };
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        className={`bg-white border border-gray-200 rounded-xl px-4 text-gray-900 ${
          multiline ? "min-h-28 py-3" : "h-12"
        }`}
      />
    </View>
  );
}

function HeaderBackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center"
    >
      <Ionicons name="arrow-back" size={20} color="#111827" />
    </Pressable>
  );
}

export default function AddPropertyScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const authSupabase = useSupbase();
  const isAdmin = useUserStore((state) => state.isAdmin);
  const [form, setForm] = useState<PropertyForm>(initialForm);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const isEditMode = typeof propertyId === "string" && propertyId.length > 0;

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setExistingImageUrls([]);
    setSelectedImages([]);
  }, []);

  useEffect(() => {
    if (!isAdmin || !isEditMode || !propertyId) return;

    let isMounted = true;
    setLoadingProperty(true);

    async function loadProperty() {
      try {
        const { data: property, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", propertyId)
          .single();

        if (!isMounted) return;
        if (error || !property) {
          Alert.alert("Property not found", "Unable to load this property.");
          router.replace("/(root)/(tabs)");
          return;
        }

        setForm(getFormFromProperty(property));
        setExistingImageUrls(property.images ?? []);
        setSelectedImages([]);
      } catch (error) {
        if (!isMounted) return;
        console.error("Error loading property:", error);
        Alert.alert("Load failed", "Please try opening this property again.");
      } finally {
        if (isMounted) setLoadingProperty(false);
      }
    }

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, isEditMode, propertyId, router]);

  useEffect(() => {
    if (isEditMode) return;

    resetForm();
    setLoadingProperty(false);
  }, [isEditMode, resetForm]);

  const updateForm = <Field extends keyof PropertyForm>(
    field: Field,
    value: PropertyForm[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImages((current) => [...current, ...result.assets]);
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages((current) =>
      current.filter((image) => image.uri !== uri),
    );
  };

  const removeExistingImage = (uri: string) => {
    setExistingImageUrls((current) => current.filter((image) => image !== uri));
  };

  const validateForm = () => {
    const missingField = getRequiredTextError(form);
    if (missingField) {
      Alert.alert("Missing details", "Please fill in every property field.");
      return null;
    }

    if (existingImageUrls.length + selectedImages.length === 0) {
      Alert.alert("Missing photos", "Please choose at least one property photo.");
      return null;
    }

    const numericFields = parseNumericFields(form);
    if (!numericFields) {
      Alert.alert("Invalid numbers", "Please enter valid property numbers.");
      return null;
    }

    return numericFields;
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const numericFields = validateForm();
    if (!numericFields) return;

    setSubmitting(true);

    const saveProperty =
      isEditMode && propertyId
        ? updatePropertyWithImages(
            authSupabase,
            propertyId,
            form,
            numericFields,
            existingImageUrls,
            selectedImages,
          )
        : createPropertyWithImages(
            authSupabase,
            form,
            numericFields,
            selectedImages,
          );

    saveProperty
      .then((savedProperty) => {
        Alert.alert(
          isEditMode ? "Property updated" : "Property created",
          isEditMode
            ? "The listing changes were saved."
            : "The new property is now listed.",
        );
        resetForm();
        if (isEditMode && router.canGoBack()) {
          router.back();
          return;
        }

        router.replace(`/(root)/property/${savedProperty.id}`);
      })
      .catch((error) => {
        console.error("Error creating property:", error);
        Alert.alert("Create failed", "Please check the details and try again.");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (isEditMode && propertyId) {
      router.replace(`/(root)/property/${propertyId}`);
      return;
    }

    router.replace("/(root)/(tabs)");
  };

  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Ionicons name="lock-closed-outline" size={42} color="#9CA3AF" />
        <Text className="mt-4 text-xl font-bold text-gray-900">
          Admin access required
        </Text>
        <Text className="mt-2 text-center text-gray-500">
          Only admins can create new property listings.
        </Text>
      </SafeAreaView>
    );
  }

  if (loadingProperty) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-gray-500">Loading property...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        <View className="mb-6 flex-row items-start gap-3">
          <HeaderBackButton onPress={handleBack} />
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Property" : "Add Property"}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {isEditMode
                ? "Update listing details, status, and photos."
                : "Create a listing with photos, location, and pricing."}
            </Text>
          </View>
        </View>

        <FormField
          label="Title"
          value={form.title}
          onChangeText={(value) => updateForm("title", value)}
          placeholder="Modern family home"
        />
        <FormField
          label="Description"
          value={form.description}
          onChangeText={(value) => updateForm("description", value)}
          placeholder="Describe the property"
          multiline
        />

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {propertyTypes.map((type) => {
              const selected = form.type === type;

              return (
                <Pressable
                  key={type}
                  onPress={() => updateForm("type", type)}
                  className={`px-4 py-2 rounded-full border ${
                    selected
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold capitalize ${
                      selected ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField
              label="Price"
              value={form.price}
              onChangeText={(value) => updateForm("price", value)}
              placeholder="450000"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <FormField
              label="Area"
              value={form.areaSqft}
              onChangeText={(value) => updateForm("areaSqft", value)}
              placeholder="1800"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField
              label="Bedrooms"
              value={form.bedrooms}
              onChangeText={(value) => updateForm("bedrooms", value)}
              placeholder="3"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <FormField
              label="Bathrooms"
              value={form.bathrooms}
              onChangeText={(value) => updateForm("bathrooms", value)}
              placeholder="2"
              keyboardType="numeric"
            />
          </View>
        </View>

        <FormField
          label="Address"
          value={form.address}
          onChangeText={(value) => updateForm("address", value)}
          placeholder="123 Main Street"
        />
        <FormField
          label="City"
          value={form.city}
          onChangeText={(value) => updateForm("city", value)}
          placeholder="Kathmandu"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField
              label="Latitude"
              value={form.latitude}
              onChangeText={(value) => updateForm("latitude", value)}
              placeholder="27.7172"
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <FormField
              label="Longitude"
              value={form.longitude}
              onChangeText={(value) => updateForm("longitude", value)}
              placeholder="85.3240"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View className="mb-5 flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
          <View>
            <Text className="text-sm font-semibold text-gray-700">
              Featured listing
            </Text>
            <Text className="text-xs text-gray-400">
              Show this property in the featured row.
            </Text>
          </View>
          <Switch
            value={form.isFeatured}
            onValueChange={(value) => updateForm("isFeatured", value)}
          />
        </View>

        {isEditMode && (
          <View className="mb-5 flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
            <View>
              <Text className="text-sm font-semibold text-gray-700">
                Sold
              </Text>
              <Text className="text-xs text-gray-400">
                Mark this property as sold.
              </Text>
            </View>
            <Switch
              value={form.isSold}
              onValueChange={(value) => updateForm("isSold", value)}
            />
          </View>
        )}

        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Photos
          </Text>
          <Pressable
            onPress={pickImages}
            className="h-14 flex-row items-center justify-center gap-2 bg-white border border-dashed border-blue-300 rounded-xl"
          >
            <Ionicons name="images-outline" size={20} color="#2563EB" />
            <Text className="text-blue-600 font-bold">Choose photos</Text>
          </Pressable>

          {existingImageUrls.length > 0 && (
            <View className="mt-3 flex-row flex-wrap gap-3">
              {existingImageUrls.map((uri) => (
                <View key={uri} className="relative">
                  <Image
                    source={{ uri }}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 12,
                      backgroundColor: "#E5E7EB",
                    }}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => removeExistingImage(uri)}
                    className="absolute -right-2 -top-2 w-7 h-7 rounded-full bg-gray-900 items-center justify-center"
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {selectedImages.length > 0 && (
            <View className="mt-3 flex-row flex-wrap gap-3">
              {selectedImages.map((asset) => (
                <View key={asset.uri} className="relative">
                  <Image
                    source={{ uri: asset.uri }}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 12,
                      backgroundColor: "#E5E7EB",
                    }}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => removeImage(asset.uri)}
                    className="absolute -right-2 -top-2 w-7 h-7 rounded-full bg-gray-900 items-center justify-center"
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className={`h-14 rounded-xl flex-row items-center justify-center gap-2 ${
            submitting ? "bg-blue-300" : "bg-blue-600"
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons name="add-circle-outline" size={21} color="#FFFFFF" />
          )}
          <Text className="text-white text-base font-bold">
            {submitting
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save Changes"
                : "Create Property"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
