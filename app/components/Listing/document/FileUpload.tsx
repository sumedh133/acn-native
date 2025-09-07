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
import * as DocumentPicker from "expo-document-picker";
import { PermissionsAndroid } from "react-native";
import { showErrorToast, showToast } from "@/utils/toastUtils";

interface FileUploadProps {
  docsToUpload: DocsToUpload;
  setDocsToUpload: (docsToUpload: DocsToUpload) => void;
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
    //     return granted === PermissionsAndroid.RESULTS.GRANTED;
    //   }, 0)

    // } catch (err) {
    //   console.log(err);
    //   return false;
    // }
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
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: ["application/pdf", "application/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const newDocsToUpload = { ...docsToUpload };

      for (const asset of result.assets || []) {
        // Check if the file type is allowed (documents only)
        const mimeType = asset.mimeType || "";
        const isValidType =
          mimeType.startsWith("application/") ||
          mimeType.includes("pdf") ||
          mimeType.includes("document");

        if (!isValidType) {
          showToast("error", `Invalid file type of ${asset.name}`);
          continue;
        }

        // Check file size (documents only - 50MB limit for PDFs)
        const maxSizeInMB = 50;

        if (asset.size && asset.size > maxSizeInMB * 1024 * 1024) {
          showToast(
            "error",
            `${asset.name} exceeds the ${maxSizeInMB}MB limit`
          );
          continue;
        }

        const fileObject: FileObject = {
          name: asset.name,
          size: asset.size,
          uri: asset.uri,
        };

        // All validated files are documents
        const category = "document";

        newDocsToUpload[category].push(fileObject);
      }

      setDocsToUpload(newDocsToUpload);
    } catch (err) {
      // Error occurred
      showToast("error", "An error occurred while selecting files");
    } finally {
      setIsUploading(false);
    }
  };

  const totalFiles = React.useMemo(
    () => docsToUpload.document.length,
    [docsToUpload]
  );

  return (
    <View style={styles.container}>
      <View style={styles.static}>
        <UploadFiles circle={false} height={48} width={48} />
        <View style={styles.staticTextContainer}>
          <Text style={styles.staticText}>
            Choose a file or drag & drop it here
          </Text>
          <Text style={styles.staticSubText}>PDFs and Documents only</Text>
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
