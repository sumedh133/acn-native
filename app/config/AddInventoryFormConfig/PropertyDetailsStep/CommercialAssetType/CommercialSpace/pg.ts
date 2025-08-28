import { FormField } from "@/types/FormConfig";

export const pgGuestHouseFields: FormField[] = [
  {
    id: "sbua",
    label: "SBUA",
    type: "number",
    required: true,
    placeholder: "Enter SBUA in square feet",
    validation: {
      min: 100,
      message: "SBUA must be at least 100 sqft",
    },
    dependsOn: {
      field: "commercialSubType",
      values: ["PG/Guest-House"],
    },
    colspan: 6,
    conditional: true,
  },
  {
    id: "carpetArea",
    label: "Carpet Area",
    type: "number",
    required: false,
    placeholder: "Enter carpet area in square feet",
    dependsOn: {
      field: "commercialSubType",
      values: ["PG/Guest-House"],
    },
    colspan: 6,
    conditional: true,
  },
  {
    id: "plotArea",
    label: "Plot Area",
    type: "number",
    required: true,
    placeholder: "Enter plot area",
    dependsOn: {
      field: "commercialSubType",
      values: ["PG/Guest-House"],
    },
    colspan: 6,
    conditional: true,
  },
  {
    id: "facing",
    label: "Facing",
    type: "dropdown",
    required: true,
    placeholder: "Select facing direction",
    options: [
      { label: "North", value: "North" },
      { label: "South", value: "South" },
      { label: "East", value: "East" },
      { label: "West", value: "West" },
    ],
    dependsOn: {
      field: "commercialSubType",
      values: ["PG/Guest-House"],
    },
    colspan: 23,
    conditional: true,
  },
  {
    id: "structure",
    label: "Structure",
    type: "text",
    required: true,
    placeholder: "E.g., G+1, G+2",
    dependsOn: {
      field: "commercialSubType",
      values: ["PG/Guest-House"],
    },
    colspan: 12,
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
      field: "commercialSubType",
      values: ["PG/Guest-House"],
    },
    colspan: 12,
    conditional: true,
  },
  // Resale Possession
  {
    id: "possession",
    label: "Possession",
    type: "select",
    required: true,
    placeholder: "Select possession status",
    options: [
      { label: "Ready to Move", value: "Ready to Move" },
      { label: "Under Construction", value: "Under Construction" },
    ],
    dependsOn: {
      conditions: [
        { field: "commercialSubType", values: ["PG/Guest-House"] },
        { field: "listingType", values: ["resale"] },
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
        { field: "commercialSubType", values: ["PG/Guest-House"] },
        { field: "listingType", values: ["resale"] },
        { field: "possession", values: ["Under Construction"] },
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
      { label: "New", value: "New" },
      { label: "1-5 years", value: "1-5 years" },
      { label: "6-10 years", value: "6-10 years" },
      { label: "11-15 years", value: "11-15 years" },
      { label: "15+ Years", value: "15+ Years" },
    ],
    dependsOn: {
      conditions: [
        { field: "commercialSubType", values: ["PG/Guest-House"] },
        { field: "listingType", values: ["resale"] },
        { field: "possession", values: ["Ready to Move"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
  // Rental
  {
    id: "readyToMove",
    label: "Ready-To-Move",
    type: "boolean",
    required: true,
    dependsOn: {
      conditions: [
        { field: "commercialSubType", values: ["PG/Guest-House"] },
        { field: "listingType", values: ["rental"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "availableFrom",
    label: "Available From",
    type: "date",
    required: true,
    placeholder: "MM/YYYY",
    dependsOn: {
      conditions: [
        { field: "commercialSubType", values: ["PG/Guest-House"] },
        { field: "listingType", values: ["rental"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "waterSupply",
    label: "Water Supply",
    type: "boolean",
    required: true,
    dependsOn: {
      field: "commercialSubType",
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
];
