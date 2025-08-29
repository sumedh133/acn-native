import { FormStep } from "@/types/FormConfig";
import { rentalCommercialProperties } from "./CommercialProperties/rentalCommercialProperties";
import { rentalResidentialProperties } from "./ResidentialProperties/rentalResidentialProperties";
import { resaleResidentialProperties } from "./ResidentialProperties/resaleResidentialProperties";
import { resaleCommercialProperties } from "./CommercialProperties/resaleCommercialProperties";

export const moreDetailsStep: FormStep = {
  id: "More Details",
  title: "More Details",
  description: "Please Provide additional details related to property",
  fields: [
    // ===== RENTAL RESIDENTIAL PROPERTIES =====
    ...rentalResidentialProperties,

    // ===== RESALE RESIDENTIAL PROPERTIES =====
    ...resaleResidentialProperties,

    // ===== RENTAL COMMERCIAL PROPERTIES =====
    ...rentalCommercialProperties,

    // ===== RESALE COMMERCIAL PROPERTIES =====
    ...resaleCommercialProperties,
  ],
};
