import { DocsToUpload, FileObject } from "@/app/types";
import UploadFiles from "@/assets/icons/svg/AddInventory/UploadFiles";
import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from "react-native";
import { Text } from "react-native";
import DocumentPicker, {
  DocumentPickerResponse,
  types,
} from "react-native-document-picker";
import { PermissionsAndroid } from "react-native";

interface FileUploadProps {
  docsToUpload: DocsToUpload;
  setDocsToUpload: React.Dispatch<React.SetStateAction<DocsToUpload>>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  docsToUpload,
  setDocsToUpload,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Request storage permission for Android
  const requestStoragePermission = async () => {
    return true;
    // if (Platform.OS !== "android") return true;

    // try {
    //   const granted = await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    //     {
    //       title: "Storage Permission",
    //       message: "App needs access to your storage to upload files",
    //       buttonNeutral: "Ask Me Later",
    //       buttonNegative: "Cancel",
    //       buttonPositive: "OK",
    //     }
    //   );
    //   setTimeout(() => {
    //     console.log(granted, "granted");
    //     return granted === PermissionsAndroid.RESULTS.GRANTED;
    //   }, 0) 
      
    // } catch (err) {
    //   console.log(err);
    //   return false;
    // }
  };

  const categorizeFile = (
    file: DocumentPickerResponse
  ): { category: string; fileObject: FileObject } => {
    const fileObject: FileObject = {
      name: file.name,
      size: file.size,
      uri: file.fileCopyUri,
      type: file.type,
    };

    if (file.type?.startsWith("image/")) {
      return { category: "photo", fileObject };
    } else if (file.type?.startsWith("video/")) {
      return { category: "video", fileObject };
    } else {
      return { category: "document", fileObject };
    }
  };

  const handleFilePick = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        "Storage permission is required to upload files"
      );
      return;
    }

    setIsUploading(true);

    try {
      // Launch document picker
      const results = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: [
          types.images,
          types.video,
          types.pdf,
          types.plainText,
          types.doc,
          types.docx,
          types.xls,
          types.xlsx,
        ],
        // 100MB in bytes
        copyTo: "cachesDirectory",
      });

      // Process each selected file
      const newDocsToUpload = { ...docsToUpload };

      console.log("results", results);

      results.forEach((file) => {
        // Check file size (100MB limit)
        if (file.size && file.size > 100 * 1024 * 1024) {
          Alert.alert("File too large", `${file.name} exceeds the 100MB limit`);
          return;
        }

        const { category, fileObject } = categorizeFile(file);
        newDocsToUpload[category].push(fileObject);
      });

      // Update state with new files
      setDocsToUpload(newDocsToUpload);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User canceled the picker
        console.log("User cancelled file picking");
      } else {
        // Error occurred
        console.error("Error picking documents:", err);
        Alert.alert("Error", "An error occurred while selecting files");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate total files
  const totalFiles =
    docsToUpload.photo.length +
    docsToUpload.video.length +
    docsToUpload.document.length;

  return (
    <View style={styles.container}>
      <View style={styles.static}>
        <UploadFiles circle={false} height={48} width={48} />
        <View style={styles.staticTextContainer}>
          <Text style={styles.staticText}>
            Choose a file or drag & drop it here
          </Text>
          <Text style={styles.staticSubText}>
            JPEG, PNG, PDF, and MP4 formats, up to 100MB
          </Text>
          {totalFiles > 0 && (
            <Text style={styles.fileCountText}>
              {totalFiles} file{totalFiles !== 1 ? "s" : ""} selected
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.buttonContainer, isUploading && styles.buttonDisabled]}
        onPress={handleFilePick}
        disabled={isUploading}
      >
        <Text style={styles.buttonText}>
          {isUploading ? "Uploading..." : "Browse Files"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderRadius: 8,
    borderWidth: 1.22,
    paddingTop: 12,
    paddingBottom: 24,
    borderColor: "#CBD0DC",
    borderStyle: "dashed",
    gap: 16,
  },
  static: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  staticTextContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    marginTop: 8,
  },
  staticText: {
    fontFamily: "sans-serif",
    fontWeight: "600",
    fontSize: 12,
    color: "#313534",
  },
  staticSubText: {
    fontFamily: "sans-serif",
    fontWeight: "400",
    fontSize: 10,
    color: "#A9ACB4",
  },
  fileCountText: {
    fontFamily: "sans-serif",
    fontWeight: "500",
    fontSize: 10,
    color: "#4A90E2",
    marginTop: 4,
  },
  buttonContainer: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#CCCBCB",
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: "#F5F5F5",
  },
  buttonText: {
    fontFamily: "sans-serif",
    fontWeight: "600",
    fontSize: 14,
    color: "#0A0B0A",
  },
});

export default FileUpload;
