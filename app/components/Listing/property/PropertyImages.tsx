import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from 'expo-document-picker';
import { UploadFileIcon } from "../../../../assets/icons/svg/PropertyListing/UploadFileIcon";
import { 
  MultipleFilesUploadService,
  SelectedFile, 
  UploadResult, 
  MediaUploadData,
  FilePickerResult,
  MultipleUploadConfig 
} from "../../../services/media_services/imageService";

const { width } = Dimensions.get("window");
const TUS_ENDPOINT = "https://tus-x-gcp-protocol-test-1.onrender.com/files";

interface PropertyImagesProps {
  images?: string[];
  onMediaUpdate?: (media: MediaUploadData) => void;
  currentMedia?: MediaUploadData;
  propId?: string;
  agentData?: any;
}

export const PropertyImages: React.FC<PropertyImagesProps> = ({
  images = [],
  onMediaUpdate,
  currentMedia = { photos: [], videos: [], documents: [] },
  propId = 'temp-prop-id',
  agentData,
}) => {
  const [uploading, setUploading] = useState(false);

  // Combine legacy images with current media photos for display
  const displayImages = [...images, ...currentMedia.photos];

  const openFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files: FilePickerResult[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name || `file_${Date.now()}`,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
        }));
        
        uploadFiles(files);
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick files');
    }
  };

  const uploadFiles = async (files: FilePickerResult[]) => {
    if (files.length === 0) return;

    // Validate files first
    const validationErrors: string[] = [];
    const validFiles: FilePickerResult[] = [];

    files.forEach(file => {
      const validation = MultipleFilesUploadService.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        validationErrors.push(validation.error!);
      }
    });

    if (validationErrors.length > 0) {
      Alert.alert('Invalid Files', validationErrors.join('\n'));
      if (validFiles.length === 0) return;
    }

    setUploading(true);

    try {
      const uploadService = new MultipleFilesUploadService();
      const categorizedFiles = MultipleFilesUploadService.categorizeFilesByType(validFiles);

      // Prepare all files for upload with proper IDs
      const allFilesToUpload: Array<{
        file: FilePickerResult;
        type: keyof MediaUploadData;
      }> = [];

      Object.entries(categorizedFiles).forEach(([type, fileList]) => {
        fileList.forEach(file => {
          allFilesToUpload.push({
            file,
            type: type as keyof MediaUploadData
          });
        });
      });

      // Prepare files for TUS upload
      const selectedFiles: SelectedFile[] = allFilesToUpload.map(({ file, type }, index) => ({
        uri: file.uri,
        name: file.name,
        type: file.type,
        size: file.size,
        id: `${propId}-${type}-${file.name || Date.now()}-${index}`,
      }));

      // Configure upload
      const uploadConfig: MultipleUploadConfig = {
        endpoint: TUS_ENDPOINT,
        chunkSize: 2 * 1024 * 1024, // 2MB chunks
        maxConcurrent: 5,
        strategy: "parallel",
        resumable: true,
        retryAttempts: 2,
        metadata: {
          propId,
          userId: agentData?.cpId || "unknown",
        },
      };

      // Start the upload
      const results = await uploadService.startBatchUpload(selectedFiles, uploadConfig);

      // Process results and categorize successful uploads
      const successfulUploads: MediaUploadData = {
        photos: [],
        videos: [],
        documents: [],
      };

      results.forEach((result: UploadResult, index: number) => {
        if (result.success && result.uploadUrl) {
          const { type } = allFilesToUpload[index];
          successfulUploads[type].push(result.uploadUrl);
        } else {
          console.error(`Failed to upload ${selectedFiles[index].name}:`, result.error?.message || 'Unknown error');
        }
      });

      // Update media in form data
      if (onMediaUpdate) {
        const updatedMedia: MediaUploadData = {
          photos: [...currentMedia.photos, ...successfulUploads.photos],
          videos: [...currentMedia.videos, ...successfulUploads.videos],
          documents: [...currentMedia.documents, ...successfulUploads.documents],
        };
        onMediaUpdate(updatedMedia);
      }

      // Show success message
      const totalSuccess = Object.values(successfulUploads).reduce((sum, arr) => sum + arr.length, 0);
      const totalFailed = validFiles.length - totalSuccess;
      
      if (totalSuccess > 0) {
        const message = totalSuccess === validFiles.length 
          ? `All ${totalSuccess} files uploaded successfully!`
          : `${totalSuccess} files uploaded successfully`;
        Alert.alert('Upload Successful', message);
      }

      if (totalFailed > 0) {
        Alert.alert('Upload Issues', `${totalFailed} files failed to upload. Please try again.`);
      }

    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="rounded-[16px] bg-white overflow-hidden">
      {displayImages.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          className="h-64"
        >
          {displayImages.map((image, index) => (
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
                The listing doesn't have any media yet.
              </Text>
              <TouchableOpacity
                onPress={openFilePicker}
                className="bg-[#2D5A52] px-4 py-[9px] rounded-lg flex-row items-center space-x-2"
                activeOpacity={0.8}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <UploadFileIcon size={18} color="white" />
                )}
                <Text className="text-white font-semibold text-sm">
                  {uploading ? 'Uploading...' : 'Add Files'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      )}
      
      {/* Add button when images exist */}
      {displayImages.length > 0 && (
        <View className="absolute top-4 right-4">
          <TouchableOpacity
            onPress={openFilePicker}
            className="bg-[#2D5A52] bg-opacity-80 px-3 py-2 rounded-lg flex-row items-center space-x-1"
            activeOpacity={0.8}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <UploadFileIcon size={16} color="white" />
            )}
            <Text className="text-white font-semibold text-xs">
              {uploading ? 'Uploading...' : 'Add More'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};