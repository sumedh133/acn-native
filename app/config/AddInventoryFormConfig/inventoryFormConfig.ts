import { FormConfig } from "@/types/FormConfig";
import { basicDetailsStep } from "./BasicDetailsStep/basicDetailsConfig";
import { propertyDetailsStep } from "./PropertyDetailsStep/propertyDetailsConfig";
import { pricingDetailsStep } from "./PricingDetailsStep/PricingDetailsConfig";

export const inventoryFormConfig: FormConfig = {
  steps: [
    basicDetailsStep,
    propertyDetailsStep,
    pricingDetailsStep,
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
      fields: [],
    },
  ],
};
