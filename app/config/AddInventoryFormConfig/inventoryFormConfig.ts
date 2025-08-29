import { FormConfig } from "@/types/FormConfig";
import { basicDetailsStep } from "./BasicDetailsStep/basicDetailsConfig";
import { propertyDetailsStep } from "./PropertyDetailsStep/propertyDetailsConfig";
import { pricingDetailsStep } from "./PricingDetailsStep/PricingDetailsConfig";
import { moreDetailsStep } from "./MoreDetailsStep/moreDetailsConfig";

export const inventoryFormConfig: FormConfig = {
  steps: [
    basicDetailsStep,
    propertyDetailsStep,
    pricingDetailsStep,
    moreDetailsStep,
    
    {
      id: "media",
      title: "Media",
      description: "Please upload required media files",
      fields: [],
    },
  ],
};
