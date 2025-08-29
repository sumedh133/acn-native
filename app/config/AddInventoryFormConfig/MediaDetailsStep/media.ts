import { FormStep } from "@/types/FormConfig";

export const mediaDetailsStep: FormStep = {
  id: "mediaDetails",
  title: "Media Details",
  description: "Please upload required media files",
  fields: [
    {
      id: "photos",
      label: "Photos",
      type: "photos/videos",
      required: true,
      placeholder: "Upload property photos",
      colspan: 12,
    },
    {
      id: "documents",
      label: "Documents",
      type: "documents",
      required: true,
      placeholder: "Upload property documents",
      colspan: 12,
    },
  ],
};
