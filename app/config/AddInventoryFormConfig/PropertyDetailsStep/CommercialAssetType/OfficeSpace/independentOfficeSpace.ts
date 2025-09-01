import { FormField } from "@/types/FormConfig";

export const independentOfficeSpaceFields: FormField[] = [
  {
    id: "propertyName",
    label: "Project Name",
    type: "placesApi",
    required: true,
    placeholder: "Enter property name",
    colspan: 12,
    conditional: false,
    dependsOn: {
      field: "commercialSubType",
      values: ["independent office space"],
    },
  },
  {
    id: "sbua",
    label: "SBUA",
    type: "number",
    required: true,
    placeholder: "1500",
    validation: {
      min: 100,
      message: "SBUA must be at least 100 sqft",
    },
    dependsOn: {
      field: "commercialSubType",
      values: ["independent office space"],
    },
    suffix: "Sqft",
    keyBoardType: "numeric",
    colspan: 12,
    conditional: true,
  },
  {
    id: "carpetArea",
    label: "Carpet Area",
    type: "number",
    required: false,
    placeholder: "1500",
    dependsOn: {
      field: "commercialSubType",
      values: ["independent office space"],
    },
    suffix: "Sqft",
    keyBoardType: "numeric",
    colspan: 12,
    conditional: true,
  },
  {
    id: "noOfSeats",
    label: "No. of Seats",
    type: "number",
    required: true,
    placeholder: "0000",
    validation: {
      min: 1,
      message: "Seating capacity must be at least 1",
    },
    dependsOn: {
      field: "commercialSubType",
      values: ["independent office space"],
    },
    keyBoardType: "numeric",
    colspan: 12,
    conditional: true,
  },
  {
    id: "facing",
    label: "Facing",
    type: "dropdown",
    required: true,
    placeholder: "Select facing direction",
    options: [
      { label: "North", value: "north" },
      { label: "South", value: "south" },
      { label: "East", value: "east" },
      { label: "West", value: "west" },
    ],
    dependsOn: {
      field: "commercialSubType",
      values: ["independent office space"],
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "floorNumber",
    label: "Floor No.",
    type: "number",
    required: true,
    placeholder: "0000",
    validation: {
      min: 0,
      message: "Floor number must be 0 or higher",
    },
    dependsOn: {
      field: "commercialSubType",
      values: ["independent office space"],
    },
    keyBoardType: "numeric",
    colspan: 6,
    conditional: true,
  },
  {
    id: "totalFloors",
    label: "Total Floors",
    type: "number",
    required: false,
    placeholder: "0000",
    validation: {
      min: 1,
      message: "Total floors must be at least 1",
    },
    dependsOn: {
      field: "commercialSubType",
      values: ["independent office space"],
    },
    keyBoardType: "numeric",
    colspan: 6,
    conditional: true,
  },
  {
    id: "furnishing",
    label: "Furnishing",
    type: "select",
    required: true,
    placeholder: "Select furnishing status",
    options: [
      { label: "Bare Shell", value: "bare shell" },
      { label: "Warm Shell", value: "warm shell" },
      { label: "Plug & Play", value: "plug & play" },
    ],
    dependsOn: {
      field: "commercialSubType",
      values: ["independent office space"],
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "possession",
    label: "Possession",
    type: "select",
    required: true,
    placeholder: "Select possession status",
    options: [
      { label: "Ready to Move", value: "ready to move" },
      { label: "Under Construction", value: "under construction" },
    ],
    dependsOn: {
      conditions: [
        {
          field: "commercialSubType",
          values: ["independent office space"],
        },
        {
          field: "listingType",
          values: ["resale"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "handoverDate",
    label: "Handover Date",
    type: "date",
    required: true,
    placeholder: "MM/YYYY",
    dependsOn: {
      conditions: [
        {
          field: "commercialSubType",
          values: ["independent office space"],
        },
        {
          field: "listingType",
          values: ["resale"],
        },
        {
          field: "possession",
          values: ["under construction"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "readyToMove",
    label: "Ready-To-Move",
    type: "boolean",
    required: true,
    dependsOn: {
      conditions: [
        {
          field: "commercialSubType",
          values: ["independent office space"],
        },
        {
          field: "listingType",
          values: ["rental"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "handoverDate",
    label: "Available From",
    type: "date",
    required: true,
    placeholder: "MM/YYYY",
    dependsOn: {
      conditions: [
        {
          field: "commercialSubType",
          values: ["independent office space"],
        },
        {
          field: "listingType",
          values: ["rental"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "ageOfTheBuilding",
    label: "Age of Building",
    type: "select",
    required: true,
    placeholder: "Select building age",
    options: [
      { label: "New", value: "new" },
      { label: "1-5 years", value: "1-5 years" },
      { label: "6-10 years", value: "6-10 years" },
      { label: "11-15 years", value: "11-15 years" },
      { label: "15+ Years", value: "15+ years" },
    ],
    dependsOn: {
      conditions: [
        {
          field: "commercialSubType",
          values: ["independent office space"],
        },
        {
          field: "possession",
          values: ["ready to move"],
        },
        {
          field: "listingType",
          values: ["resale"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "ageOfTheBuilding",
    label: "Age of Building",
    type: "select",
    placeholder: "Select building age",
    options: [
      { label: "New", value: "new" },
      { label: "1-5 years", value: "1-5 years" },
      { label: "6-10 years", value: "6-10 years" },
      { label: "11-15 years", value: "11-15 years" },
      { label: "15+ Years", value: "15+ years" },
    ],
    dependsOn: {
      conditions: [
        {
          field: "commercialSubType",
          values: ["independent office space"],
        },
        {
          field: "listingType",
          values: ["rental"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
];