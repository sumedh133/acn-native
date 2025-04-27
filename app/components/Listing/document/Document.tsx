import { DocsToUpload } from "@/app/types";
import React from "react";
import { Text } from "react-native";

// Define the interface for the component props
interface DocumentProps {
  docsToUpload: DocsToUpload;
  setDocsToUpload: React.Dispatch<React.SetStateAction<DocsToUpload>>;
}

const Document: React.FC<DocumentProps> = ({
  docsToUpload,
  setDocsToUpload,
}) => {
  return <Text>DocumentUpload</Text>;
};

export default Document;
