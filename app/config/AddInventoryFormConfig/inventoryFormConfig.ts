import { FormConfig } from "@/types/FormConfig";
import { basicDetailsStep } from "./BasicDetailsStep/basicDetailsConfig";
import { propertyDetailsStep } from "./PropertyDetailsStep/propertyDetailsConfig";
import { pricingDetailsStep } from "./PricingDetailsStep/PricingDetailsConfig";
import { moreDetailsStep } from "./MoreDetailsStep/moreDetailsConfig";
import { mediaDetailsStep } from "./MediaDetailsStep/media";

export const inventoryFormConfig: FormConfig = {
  steps: [
    basicDetailsStep,
    propertyDetailsStep,
    pricingDetailsStep,
    moreDetailsStep,
    mediaDetailsStep,
  ],
};
