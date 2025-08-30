import { FormField } from "@/types/FormConfig";

export const resaleResidentialProperties: FormField[] = [
  {
    id: "uds",
    label: "UDS",
    type: "number",
    placeholder: "1500",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["residential"] },
        {
          field: "assetType",
          values: [
            "apartment",
            "villa",
            "villament",
            "independent house",
            "row house",
          ],
        },
      ],
      logicOperator: "AND",
    },
    keyBoardType: "numeric",
    suffix: "Sqft",
    colspan: 12,
  },
  {
    id: "features.cornerUnit",
    label: "Corner Unit",
    type: "boolean",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["residential"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  {
    id: "features.exclusive",
    label: "Exclusive",
    type: "boolean",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["residential"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  {
    id: "features.ocReceived",
    label: "OC Received",
    type: "boolean",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["residential"] },
        {
          field: "assetType",
          values: [
            "apartment",
            "villa",
            "villament",
            "independent house",
            "row house",
          ],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  {
    id: "leagalInfo.buildingKhata",
    label: "Building Khata",
    type: "select",
    placeholder: "Please select building khata type",
    options: [
      { label: "A-Khata", value: "a" },
      { label: "B-Khata", value: "b" },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["residential"] },
        {
          field: "assetType",
          values: [
            "apartment",
            "villa",
            "villament",
            "independent house",
            "row house",
          ],
        },
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
      { label: "A-Khata", value: "a" },
      { label: "B-Khata", value: "b" },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["residential"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  {
    id: "legalInfo.eKhata",
    label: "E-Khata",
    type: "boolean",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["residential"] },
        {
          field: "assetType",
          values: [
            "apartment",
            "villa",
            "villament",
            "independent house",
            "row house",
          ],
        },
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
        { field: "propertyType", values: ["residential"] },
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
        { field: "propertyType", values: ["residential"] },
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
        { field: "propertyType", values: ["residential"] },
        {
          field: "assetType",
          values: [
            "apartment",
            "villa",
            "villament",
            "independent house",
            "row house",
          ],
        },
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
      { label: "Gym", value: "gym" },
      { label: "Lifts", value: "lifts" },
      { label: "Water Storage", value: "water storage" },
      { label: "Visitor Parking", value: "visitor parking" },
      { label: "Service Lifts", value: "service lifts" },
      { label: "Pool", value: "pool" },
      { label: "CCTV Surveillance", value: "cctv surveillance" },
      { label: "Security", value: "security" },
      { label: "Power Backup", value: "power backup" },
      { label: "Club-House", value: "club-house" },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["resale"] },
        { field: "propertyType", values: ["residential"] },
        {
          field: "assetType",
          values: [
            "apartment",
            "villa",
            "villament",
            "independent house",
            "row house",
          ],
        },
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
        { field: "propertyType", values: ["residential"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
];
