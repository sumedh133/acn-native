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
    colspan: 6,
  },

  {
    id: "amenities",
    label: "Amenities",
    type: "multiselect",
    options: [
      { label: "Gym", value: "Gym" },
      { label: "Lifts", value: "Lifts" },
      { label: "Water Storage", value: "Water Storage" },
      { label: "Visitor Parking", value: "Visitor Parking" },
      { label: "Service Lifts", value: "Service Lifts" },
      { label: "Pool", value: "Pool" },
      { label: "CCTV Surveillance", value: "CCTV Surveillance" },
      { label: "Security", value: "Security" },

      { label: "Power Backup", value: "Power Backup" },

      {
        label: "Club-House",
        value: "Club-House",
      },
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
