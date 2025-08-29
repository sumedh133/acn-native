import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { UploadFileIcon } from "../../../../assets/icons/svg/PropertyListing/UploadFileIcon";
const { width } = Dimensions.get("window");

interface PropertyImagesProps {
  images?: string[];
  onAddImages?: () => void;
}

export const PropertyImages: React.FC<PropertyImagesProps> = ({
  images = [],
  onAddImages,
}) => {
  return (
    <View className="rounded-[16px] bg-white overflow-hidden">
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
          className="w-full"
        >
          <View className="flex flex-col items-center justify-center space-y-4 px-3 py-2">
            <Image
              source={require("../../../../assets/icons/no-image-icon.webp")}
              className="w-24 h-24"
            />
            <View className="flex flex-col items-center justify-center space-y-1 pb-3">
              <Text className="text-sm font-bold text-black">
                No Images Found
              </Text>
              <Text className="text-sm font-medium text-[#757575]">
                The listing doesn't have any images yet.
              </Text>
              <TouchableOpacity
                onPress={onAddImages}
                className="bg-[#2D5A52] px-4 py-[9px] rounded-lg flex-row items-center space-x-2"
                activeOpacity={0.8}
              >
                <UploadFileIcon size={18} color="white" />
                <Text className="text-white font-semibold text-sm">
                  Add Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      )}
    </View>
  );
};
