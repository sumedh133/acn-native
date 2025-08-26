import { FormConfig } from "@/types/FormConfig";
import { basicDetailsStep } from "./basicDetailsConfig";
import { propertyDetailsStep } from "./propertyDetailsConfig";


export const inventoryFormConfig: FormConfig = {
  steps: [
    basicDetailsStep,
    propertyDetailsStep,
    {
      id: "pricingDetails",
      title: "Pricing Details",
      description: "Provide the pricing details",
      dependsOn: {
        field: "propertyType",
        values: ["residential"],
      },
      fields: [],
    },
    {
      id: "moreDetails",
      title: "More Details",
      description: "Please Provide additional details related to property",
      dependsOn: {
        field: "propertyType",
        values: ["commercial"],
      },
      fields: [],
    },
    {
      id: "media",
      title: "Media",
      description: "Please upload required media files",
      dependsOn: {
        field: "propertyType",
        values: ["commercial"],
      },
      fields: [],
    },
  ],
};
