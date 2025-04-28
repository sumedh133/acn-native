import { types } from "@react-native-documents/picker";

export const addInventoryDocumentTypes = {
  allowedTypes: [types.images, types.video, types.pdf],
  allowedSizes: [
    { type: "video/", maxFileSizesInMB: 100 },
    { type: "public.movie", maxFileSizesInMB: 100 },
    { type: "application/pdf", maxFileSizesInMB: 50 },
    { type: "com.adobe.pdf", maxFileSizesInMB: 50 },
  ],
};
