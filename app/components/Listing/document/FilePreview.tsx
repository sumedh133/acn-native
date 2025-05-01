import { DocsToUpload, FileObject } from "@/app/types";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import RNFS from "react-native-fs";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import TrashIcon from "@/assets/icons/svg/Common/TrashIcon";

interface FilePreviewProps {
  docsToUpload: DocsToUpload;
  setDocsToUpload: React.Dispatch<React.SetStateAction<DocsToUpload>>;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  docsToUpload,
  setDocsToUpload,
}) => {
  const cleanUpDocument = async (uri: string) => {
    if (await RNFS.exists(uri)) {
      await RNFS.unlink(uri);
    }
  };
  const handleRemoveFile = async (type: string, index: number) => {
    const updatedDocs = { ...docsToUpload };
    if (updatedDocs?.[type]?.[index]?.uri) {
      cleanUpDocument(updatedDocs?.[type]?.[index]?.uri);
    }
    updatedDocs[type] = [
      ...updatedDocs[type].slice(0, index),
      ...updatedDocs[type].slice(index + 1),
    ];

    setDocsToUpload(updatedDocs);
  };

  const getFileIcon = useCallback((fileType: string | null | undefined) => {
    if (fileType?.startsWith("photo"))
      return <FontAwesome6 name="file-image" size={24} color="black" />;
    else if (fileType?.startsWith("video"))
      return <FontAwesome6 name="file-video" size={24} color="black" />;
    else return <FontAwesome6 name="file-pdf" size={24} color="black" />;
  }, []);

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return "0 KB";

    if (bytes < 1000000) {
      return `${(bytes / 1000).toFixed(1)} KB`;
    } else {
      return `${(bytes / 1000000).toFixed(1)} MB`;
    }
  };

  // Function to handle file preview
  const handleFilePress = (file: FileObject) => {
    //   if (!file.uri) return;
    return;
  };

  const renderDocs = useCallback(() => {
    return ["photo", "video", "document"].map(
      (type) =>
        docsToUpload[type]?.length > 0 && (
          <View key={type} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Files
            </Text>

            <View style={styles.fileListContainer}>
              {docsToUpload[type].map((file, index) => (
                <View key={index} style={styles.fileContainer}>
                  <View style={styles.fileContent}>
                    <View style={styles.iconContainer}>
                      {getFileIcon(type)}
                    </View>

                    <View style={styles.fileDetails}>
                      <TouchableOpacity onPress={() => handleFilePress(file)}>
                        <Text
                          style={styles.fileName}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {file.name || "Unnamed file"}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.fileSize}>
                        {formatFileSize(file.size)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleRemoveFile(type, index)}
                    >
                      <TrashIcon width={18} height={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )
    );
  }, [docsToUpload]);

  return <View style={styles.container}>{renderDocs()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  sectionContainer: {
    marginBottom: 16,
    width: "100%",
  },
  sectionTitle: {
    fontFamily: "sans-serif",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "left",
  },
  fileListContainer: {
    width: "100%",
    gap: 8,
  },
  fileContainer: {
    backgroundColor: "#DAFBEA",
    borderRadius: 8,
    padding: 12,
    width: "100%",
  },
  fileContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  fileDetails: {
    flex: 1,
    justifyContent: "center",
  },
  fileName: {
    fontWeight: "500",
    fontSize: 12,
    color: "#292D32",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 10,
    color: "#A9ACB4",
  },
  deleteButton: {
    padding: 4,
  },
});

export default FilePreview;
