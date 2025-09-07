import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

import { DocsToUpload } from "@/app/types";

import FileUpload from "./FileUpload";
import FilePreview from "./FilePreview";

// icons
import UploadFiles from "@/assets/icons/svg/PropertyListing/ListingFlow/UploadFiles.svg";

interface DocumentProps {
  docsToUpload: DocsToUpload;
  setDocsToUpload: (docsToUpload: DocsToUpload) => void;
}

const Document: React.FC<DocumentProps> = ({
  docsToUpload,
  setDocsToUpload,
}) => {
  return (
    <View style={styles.container}>
      <View
        style={styles.header}
      >
        <View style={styles.header}>
          <View className="border border-[#CBD0DC] rounded-full p-[7px]">
            <UploadFiles />
          </View>
          <Text style={styles.headerText}>Upload files</Text>
        </View>
        <Text style={styles.headerText}>{docsToUpload.document.length}</Text>
      </View>

      <FileUpload
        docsToUpload={docsToUpload}
        setDocsToUpload={setDocsToUpload}
      />

      <FilePreview
        docsToUpload={docsToUpload}
        setDocsToUpload={setDocsToUpload}
      />
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
    borderWidth: 1,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderColor: "#E3E3E3",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F6F7",
    gap: 12,
  },
  headerIcon: {
    height: 30,
    width: 30,
    borderWidth: 1,
    borderColor: "#CBD0DC",
    borderRadius: 15, // To make it a circle (half of width/height)
    padding: 1,
  },
  headerText: {
    fontFamily: "Montserrat_600SemiBold",
    fontWeight: "600", // semibold
    fontSize: 14,
    lineHeight: 18,
    color: "#313534",
  },
});

export default Document;
