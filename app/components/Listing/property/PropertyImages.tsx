import React from "react";
import { View, Text, ScrollView, Image, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const PropertyImages: React.FC<{ images?: string[] }> = ({ images = [] }) => {
  return (
    <View className="relative">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        className="h-64"
      >
        {images.length > 0 ? (
          images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              className="w-full h-64"
              style={{ width }}
              resizeMode="cover"
            />
          ))
        ) : (
          <View
            className="bg-gray-200 justify-center items-center h-64"
            style={{ width }}
          >
            <Text className="text-gray-500 text-lg">No Images</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
