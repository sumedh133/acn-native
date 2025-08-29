import React from "react";
import { View, Text, ScrollView, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export const PropertyImages: React.FC<{ images?: string[] }> = ({ images = [] }) => {
  return (
    <View className="border border-[#CCCBCB] rounded-lg bg-white  overflow-hidden">
      {images.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          className="h-64"
        >
          {images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              className="w-full h-64"
              style={{ width }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <LinearGradient
          colors={["#E0F7F4", "#FFFFFF"]}
          locations={[0.0891, 0.7814]}
          className="w-full border-b border-[#CCCBCB]"
        >
          <View className="flex flex-col items-center justify-center h-52 space-y-3">
            <Image
              source={require("../../../../assets/icons/no-image-icon.webp")}
              className="w-24 h-24"
            />
            <View className="flex flex-col items-center justify-center">
              <Text className="text-sm font-bold">No Images Found</Text>
              <Text className="text-sm font-medium text-[#757575]">
                The listing doesn't have any images yet.
              </Text>
            </View>
          </View>
        </LinearGradient>
      )}
    </View>
  );
};
