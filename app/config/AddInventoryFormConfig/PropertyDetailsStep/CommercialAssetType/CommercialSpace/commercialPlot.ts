import { FormField } from "@/types/FormConfig";

export const commercialPlotFields: FormField[] = [
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
      field: "commercialSubType",
      values: ["Commercial Plot"],
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
      field: "commercialSubType",
      values: ["Commercial Plot"],
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
      field: "commercialSubType",
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
      field: "commercialSubType",
      values: ["Commercial Plot"],
    },
    colspan: 6,
    conditional: true,
  },
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
      field: "commercialSubType",
      values: ["Commercial Plot"],
    },
    colspan: 6,
    conditional: true,
  },
  // {
  //   id: "ageOfTheBuilding",
  //   label: "Age of Building",
  //   type: "select",
  //   required: true,
  //   placeholder: "Select building age",
  //   options: [
  //     { label: "New", value: "New" },
  //     { label: "1-5 years", value: "1-5 years" },
  //     { label: "6-10 years", value: "6-10 years" },
  //     { label: "11-15 years", value: "11-15 years" },
  //     { label: "15+ Years", value: "15+ Years" },
  //   ],
  //   dependsOn: {
  //     field: "commercialSubType",
  //     values: ["Commercial Plot"],
  //   },
  //   colspan: 6,
  //   conditional: true,
  // },
];
