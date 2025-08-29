import { FormStep } from "@/types/FormConfig";
import { residentialApartmentFields } from "./ResidentialAssetType/residentialApartmentConfig";
import { residentialVillaFields } from "./ResidentialAssetType/residentialVilla";
import { residentialVillamentFields } from "./ResidentialAssetType/residentialVillament";
import { residentialRowHouseFields } from "./ResidentialAssetType/residentialRowHouse";
import { residentialIndependentBuildingFields } from "./ResidentialAssetType/residentialIndependentBuilding";
import { residentialPlot } from "./ResidentialAssetType/residentialPlot";
import { commercialPlotFields } from "./CommercialAssetType/CommercialSpace/commercialPlot";
import { factoryFields } from "./CommercialAssetType/CommercialSpace/factory";
import { warehouseFields } from "./CommercialAssetType/CommercialSpace/warehouse";
import { industrialShedFields } from "./CommercialAssetType/CommercialSpace/industrialShed";
import { OtherFields } from "./CommercialAssetType/CommercialSpace/other";
import { pgGuestHouseFields } from "./CommercialAssetType/CommercialSpace/pg";
import { coWorkingSpaceFields } from "./CommercialAssetType/OfficeSpace/coWorkingSpace";
import { independentOfficeSpaceFields } from "./CommercialAssetType/OfficeSpace/independentOfficeSpace";
import { itParkFields } from "./CommercialAssetType/OfficeSpace/itPark";
import { commercialShopFields } from "./CommercialAssetType/RetailSpace/commercialShop";
import { showroomFields } from "./CommercialAssetType/RetailSpace/showRoom";

export const propertyDetailsStep: FormStep = {
  id: "propertyDetails",
  title: "Property Details",
  description: "Provide detailed information about your property",
  fields: [
    // ===== RESIDENTIAL APARTMENT FIELDS =====
    ...residentialApartmentFields,

    // ===== RESIDENTIAL VILLA FIELDS =====
    ...residentialVillaFields,

    // ===== RESIDENTIAL VILLAMENT FIELDS =====
    ...residentialVillamentFields,

    // ===== RESIDENTIAL INDEPENDENT BUILDING FIELDS =====
    ...residentialIndependentBuildingFields,

    // ===== RESIDENTIAL ROW HOUSE FIELDS =====
    ...residentialRowHouseFields,

    // ===== RESIDENTIAL PLOT FIELDS =====
    ...residentialPlot,

    // ===== COMMERCIAL PLOT FIELDS =====
    ...commercialPlotFields,

    // ===== FACTORY FIELDS =====
    ...factoryFields,

    // ===== WAREHOUSE FIELDS =====
    ...warehouseFields,

    // ===== INDUSTRIAL SHED FIELDS =====
    ...industrialShedFields,

    // ===== OTHER COMMERCIAL FIELDS =====
    ...OtherFields,

    // ===== PG / GUEST HOUSE FIELDS =====
    ...pgGuestHouseFields,

    // ===== CO-WORKING SPACE FIELDS =====
    ...coWorkingSpaceFields,

    // ===== INDEPENDENT OFFICE SPACE FIELDS =====
    ...independentOfficeSpaceFields,

    // ===== IT PARK FIELDS =====
    ...itParkFields,

    // ===== COMMERCIAL SHOP FIELDS =====
    ...commercialShopFields,

    // ===== SHOWROOM FIELDS =====
    ...showroomFields,
  ],
};
