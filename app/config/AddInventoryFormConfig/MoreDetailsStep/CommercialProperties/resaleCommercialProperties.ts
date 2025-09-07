import { FormField } from "@/types/FormConfig";

export const resaleCommercialProperties: FormField[] = [
  {
    id: "uds",
    label: "UDS",
    type: "number",
    placeholder: "Please enter UDS value",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  {
    id: "features.cornerUnit",
    label: "Corner Unit",
    type: "boolean",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 6,
  },

  {
    id: "features.exclusive",
    label: "Exclusive",
    type: "boolean",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 6,
  },

  {
    id: "features.ocReceived",
    label: "OC Received",
    type: "boolean",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 6,
  },

  {
    id: "legalInfo.eKhata",
    label: "E-Khata",
    type: "boolean",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 6,
  },

  {
    id: "leagalInfo.buildingKhata",
    label: "Building Khata",
    type: "select",
    placeholder: "Please select building khata type",
    options: [
      { label: "A-Khata", value: "A" },
      { label: "B-Khata", value: "B" },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  {
    id: "leagalInfo.landKhata",
    label: "Land Khata",
    type: "select",
    placeholder: "Please select land khata type",
    options: [
      { label: "A-Khata", value: "A" },
      { label: "B-Khata", value: "B" },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },

  {
    id: "legalInfo.biappaApproved",
    label: "BIAPPA Approved Khata",
    type: "boolean",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  {
    id: "legalInfo.bdaApproved",
    label: "BDA Approved Khata",
    type: "boolean",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  {
    id: "parking",
    label: "Parking",
    type: "showStepper",
    placeholder: "Enter number of parking slots",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },

  {
    id: "amenities",
    label: "Amenities",
    type: "multiselect",
    options: [
      { label: "Maintenance Staff", value: "maintenance staff" },
      { label: "Water Storage", value: "water storage" },
      { label: "Visitor Parking", value: "visitor parking" },
      { label: "ATM", value: "atm" },
      { label: "CCTV Surveillance", value: "cctv surveillance" },
      { label: "Cafeteria / Food Court", value: "cafeteria / food court" },
      { label: "Lifts", value: "lifts" },
      { label: "Security", value: "security" },
      { label: "Power Backup", value: "power backup" },
      { label: "Wheel-Chair Accessibility", value: "wheel-chair accessibility" },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },

  {
    id: "extraDetails",
    label: "Extra Details",
    type: "textarea",
    placeholder: "Enter any additional details",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
];
