import React from "react";
import { View, Image, Dimensions, TouchableOpacity, Text } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Video from "react-native-video";

const { width } = Dimensions.get("window");

interface MediaItem {
  uri: string;
  type: "image" | "video" | "document";
}

interface Props {
  media: MediaItem[];
  onDeleteFile?: (fileUrl: string, index: number) => void;
  canDeleteFile?: (index: number) => boolean;
}

const MediaCarousel: React.FC<Props> = ({ media, onDeleteFile, canDeleteFile }) => {
  return (
    <Carousel
      width={width}
      height={250}
      data={media}
      renderItem={({ item, index }) => (
        <View style={{ width: "100%", height: 250 }}>
          {item.type === "image" && (
            <Image
              source={{ uri: item.uri }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          )}
          {item.type === "video" && (
            <Video
              source={{ uri: item.uri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              repeat
              muted
            />
          )}
          {item.type === "document" && (
            <View className="flex items-center justify-center h-full bg-gray-200">
              <Text className="text-lg font-semibold">📄 Document</Text>
              <Text numberOfLines={1}>{item.uri.split("/").pop()}</Text>
            </View>
          )}

          {canDeleteFile && canDeleteFile(index) && onDeleteFile && (
            <TouchableOpacity
              onPress={() => onDeleteFile(item.uri, index)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: 8,
                borderRadius: 50,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
};

export default MediaCarousel;
