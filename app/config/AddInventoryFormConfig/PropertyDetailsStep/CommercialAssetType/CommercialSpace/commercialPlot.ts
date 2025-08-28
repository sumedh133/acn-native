import { FormField } from "@/types/FormConfig";

export const commercialPlotFields: FormField[] = [
  {
    id: "propertyName",
    label: "Project Name",
    type: "text",
    required: true,
    placeholder: "Enter property name",
    colspan: 12,
    conditional: false,
    dependsOn: {
      field: "commercialSubType",
      values: ["Commercial Plot"],
    },
  },
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
      values: ["Commercial Plot"],
    },
    colspan: 12,
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
      values: ["Commercial Plot"],
    },
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
      { label: "North", value: "North" },
      { label: "South", value: "South" },
      { label: "East", value: "East" },
      { label: "West", value: "West" },
    ],
    dependsOn: {
      field: "commercialSubType",
      values: ["Commercial Plot"],
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
      { label: "Ready to Move", value: "Ready to Move" },
      { label: "Under Construction", value: "Under Construction" },
    ],
    dependsOn: {
      field: "commercialSubType",
      values: ["Commercial Plot"],
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "suitableFor",
    label: "Suitable For",
    type: "text",
    required: false,
    placeholder: "Enter suitable business types",
    dependsOn: {
      field: "commercialSubType",
      values: ["Commercial Plot"],
    },
    colspan: 12,
    conditional: true,
  },
];
