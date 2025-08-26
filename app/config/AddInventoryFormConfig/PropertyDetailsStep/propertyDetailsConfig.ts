import { FormStep } from "@/types/FormConfig";
import { residentialApartmentFields } from "./ResidentialAssetType/residentialApartmentConfig";
import { residentialVillaFields } from "./ResidentialAssetType/residentialVilla";
import { residentialVillamentFields } from "./ResidentialAssetType/residentialVillament";
import { residentialRowHouseFields } from "./ResidentialAssetType/residentialRowHouse";
import { residentialIndependentBuildingFields } from "./ResidentialAssetType/residentialIndependentBuilding";
import { residentialPlot } from "./ResidentialAssetType/residentialPlot";

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

    // ===== RESIDENTIAL RAW HOUSE FIELDS =====
    ...residentialRowHouseFields,

    // ===== RESIDENTIAL PLOT FIELDS =====
    ...residentialPlot,

    // ===== COMMERCIAL OFFICE SPACE FIELDS =====
    {
      id: "sbua",
      label: "Super Built-up Area (sqft)",
      type: "number",
      required: true,
      placeholder: "Enter SBUA in square feet",
      validation: {
        min: 100,
        message: "SBUA must be at least 100 sqft",
      },
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Office Space"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "carpetArea",
      label: "Carpet Area (sqft)",
      type: "number",
      required: false,
      placeholder: "Enter carpet area in square feet",
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Office Space"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "noOfSeats",
      label: "Number of Seats",
      type: "number",
      required: true,
      placeholder: "Enter seating capacity",
      validation: {
        min: 1,
        message: "Seating capacity must be at least 1",
      },
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Office Space"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "floorNo",
      label: "Floor Number",
      type: "number",
      required: true,
      placeholder: "Enter floor number",
      validation: {
        min: 0,
        message: "Floor number must be 0 or higher",
      },
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Office Space"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "totalFloors",
      label: "Total Floors in Building",
      type: "number",
      required: false,
      placeholder: "Enter total floors",
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Office Space"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "facing",
      label: "Facing",
      type: "select",
      required: true,
      placeholder: "Select facing direction",
      options: [
        { label: "North", value: "North" },
        { label: "South", value: "South" },
        { label: "East", value: "East" },
        { label: "West", value: "West" },
      ],
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Office Space"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "furnishing",
      label: "Furnishing Status",
      type: "select",
      required: true,
      placeholder: "Select furnishing status",
      options: [
        { label: "Bare Shell", value: "Bare Shell" },
        { label: "Warm Shell", value: "Warm Shell" },
        { label: "Plug & Play", value: "Plug & Play" },
      ],
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Office Space"],
      },
      colspan: 6,
      conditional: true,
    },

    // ===== COMMERCIAL RETAIL SPACE FIELDS =====
    {
      id: "sbua",
      label: "Super Built-up Area (sqft)",
      type: "number",
      required: true,
      placeholder: "Enter SBUA in square feet",
      validation: {
        min: 100,
        message: "SBUA must be at least 100 sqft",
      },
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Retail Space"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "floor",
      label: "Floor Number",
      type: "number",
      required: true,
      placeholder: "Enter floor number",
      validation: {
        min: 0,
        message: "Floor number must be 0 or higher",
      },
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Retail Space"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "facing",
      label: "Facing",
      type: "select",
      required: true,
      placeholder: "Select facing direction",
      options: [
        { label: "North", value: "North" },
        { label: "South", value: "South" },
        { label: "East", value: "East" },
        { label: "West", value: "West" },
      ],
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Retail Space"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "furnishing",
      label: "Furnishing Status",
      type: "select",
      required: true,
      placeholder: "Select furnishing status",
      options: [
        { label: "Bare Shell", value: "Bare Shell" },
        { label: "Warm Shell", value: "Warm Shell" },
        { label: "Plug & Play", value: "Plug & Play" },
      ],
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Retail Space"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "suitableFor",
      label: "Suitable For",
      type: "text",
      required: false,
      placeholder: "Enter suitable business types",
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Retail Space"],
      },
      colspan: 6,
      conditional: true,
    },

    // ===== COMMERCIAL WAREHOUSE FIELDS =====
    {
      id: "sbua",
      label: "Super Built-up Area (sqft)",
      type: "number",
      required: true,
      placeholder: "Enter SBUA in square feet",
      validation: {
        min: 100,
        message: "SBUA must be at least 100 sqft",
      },
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Warehouse"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "suitableFor",
      label: "Suitable For",
      type: "select",
      required: true,
      placeholder: "Select warehouse type",
      options: [
        { label: "Godown", value: "Godown" },
        { label: "Dark Store", value: "Dark Store" },
        { label: "Industrial Warehouse", value: "Industrial Warehouse" },
        { label: "Cold Storage", value: "Cold Storage" },
      ],
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Warehouse"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "facing",
      label: "Facing",
      type: "select",
      required: true,
      placeholder: "Select facing direction",
      options: [
        { label: "North", value: "North" },
        { label: "South", value: "South" },
        { label: "East", value: "East" },
        { label: "West", value: "West" },
      ],
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Warehouse"],
      },
      colspan: 6,
      conditional: true,
    },

    // ===== COMMERCIAL FACTORY/INDUSTRIAL SHED FIELDS =====
    {
      id: "sbua",
      label: "Super Built-up Area (sqft)",
      type: "number",
      required: true,
      placeholder: "Enter SBUA in square feet",
      validation: {
        min: 100,
        message: "SBUA must be at least 100 sqft",
      },
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Factory", "Industrial Shed"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "plotArea",
      label: "Plot Area (sqft)",
      type: "number",
      required: true,
      placeholder: "Enter plot area",
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Factory", "Industrial Shed"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "facing",
      label: "Facing",
      type: "select",
      required: true,
      placeholder: "Select facing direction",
      options: [
        { label: "North", value: "North" },
        { label: "South", value: "South" },
        { label: "East", value: "East" },
        { label: "West", value: "West" },
      ],
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Factory", "Industrial Shed"],
      },
      colspan: 6,
      conditional: true,
    },

    // ===== COMMERCIAL PLOT FIELDS =====
    {
      id: "plotSize",
      label: "Plot Size (sqft)",
      type: "number",
      required: true,
      placeholder: "Enter plot size",
      validation: {
        min: 100,
        message: "Plot size must be at least 100 sqft",
      },
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Commercial Plot"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "plotLength",
      label: "Plot Length (ft)",
      type: "number",
      required: false,
      placeholder: "Enter plot length",
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Commercial Plot"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "plotBreadth",
      label: "Plot Breadth (ft)",
      type: "number",
      required: false,
      placeholder: "Enter plot breadth",
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Commercial Plot"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "oddSized",
      label: "Odd Sized Plot",
      type: "boolean",
      required: true,
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Commercial Plot"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "facing",
      label: "Facing",
      type: "select",
      required: true,
      placeholder: "Select facing direction",
      options: [
        { label: "North", value: "North" },
        { label: "South", value: "South" },
        { label: "East", value: "East" },
        { label: "West", value: "West" },
      ],
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["Commercial Plot"],
      },
      colspan: 6,
      conditional: true,
    },

    // ===== PG/GUEST HOUSE FIELDS =====
    {
      id: "structure",
      label: "Number of Floors",
      type: "number",
      required: true,
      placeholder: "Enter number of floors",
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["PG/Guest-House"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "totalRooms",
      label: "Total Rooms",
      type: "number",
      required: false,
      placeholder: "Enter total number of rooms",
      validation: {
        min: 1,
        message: "Total rooms must be at least 1",
      },
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["PG/Guest-House"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "waterSupply",
      label: "Water Supply",
      type: "boolean",
      required: true,
      dependsOn: {
        field: "commercialSpaceSubType",
        values: ["PG/Guest-House"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "typeOfWaterSupply",
      label: "Type of Water Supply",
      type: "select",
      required: true,
      placeholder: "Select water supply type",
      options: [
        { label: "Borewell", value: "Borewell" },
        { label: "Cauvery", value: "Cauvery" },
      ],
      dependsOn: {
        field: "waterSupply",
        values: [true],
      },
      colspan: 6,
      conditional: true,
    },

    // ===== COMMERCIAL COMMON FIELDS =====
    {
      id: "amenities",
      label: "Amenities",
      type: "multiselect",
      required: false,
      placeholder: "Select available amenities",
      options: [
        { label: "Power Backup", value: "Power Backup" },
        { label: "Security", value: "Security" },
        { label: "Lifts", value: "Lifts" },
        { label: "Water Storage", value: "Water Storage" },
        { label: "CCTV Surveillance", value: "CCTV Surveillance" },
        { label: "Visitor Parking", value: "Visitor Parking" },
        { label: "Cafeteria / Food Court", value: "Cafeteria / Food Court" },
        { label: "Maintenance Staff", value: "Maintenance Staff" },
        { label: "ATM", value: "ATM" },
        {
          label: "Wheel-Chair Accessibility",
          value: "Wheel-Chair Accessibility",
        },
      ],
      dependsOn: {
        field: "category",
        values: ["commercial"],
      },
      colspan: 12,
      conditional: true,
    },
    {
      id: "parking",
      label: "Parking Slots",
      type: "number",
      required: true,
      placeholder: "Enter number of parking slots",
      validation: {
        min: 0,
        message: "Parking slots cannot be negative",
      },
      dependsOn: {
        field: "category",
        values: ["commercial"],
      },
      colspan: 6,
      conditional: true,
    },

    // Commercial Khata
    {
      id: "khata.landKhata",
      label: "Land Khata",
      type: "select",
      required: false,
      placeholder: "Select land khata type",
      options: [
        { label: "A Khata", value: "A" },
        { label: "B Khata", value: "B" },
      ],
      dependsOn: {
        field: "category",
        values: ["commercial"],
      },
      colspan: 6,
      conditional: true,
    },
    {
      id: "khata.buildingKhata",
      label: "Building Khata",
      type: "select",
      required: false,
      placeholder: "Select building khata type",
      options: [
        { label: "A Khata", value: "A" },
        { label: "B Khata", value: "B" },
      ],
      dependsOn: {
        field: "category",
        values: ["commercial"],
      },
      colspan: 6,
      conditional: true,
    },

    // Commercial Property Classification
    {
      id: "type.cornerUnit",
      label: "Corner Unit",
      type: "boolean",
      required: true,
      dependsOn: {
        field: "category",
        values: ["commercial"],
      },
      colspan: 3,
      conditional: true,
    },
    {
      id: "type.exclusive",
      label: "Exclusive",
      type: "boolean",
      required: true,
      dependsOn: {
        field: "category",
        values: ["commercial"],
      },
      colspan: 3,
      conditional: true,
    },
    {
      id: "type.ocReceived",
      label: "OC Received",
      type: "boolean",
      required: true,
      dependsOn: {
        field: "category",
        values: ["commercial"],
      },
      colspan: 3,
      conditional: true,
    },
    {
      id: "type.eKhata",
      label: "E-Khata",
      type: "boolean",
      required: true,
      dependsOn: {
        field: "category",
        values: ["commercial"],
      },
      colspan: 3,
      conditional: true,
    },
  ],
};
