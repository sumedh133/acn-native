import { FormField } from "@/types/FormConfig";

export const residentialPlot: FormField[] = [
  {
    id: "propertyName",
    label: "Project Name",
    type: "text",
    required: true,
    placeholder: "Enter property name",
    colspan: 12,
    conditional: false,
    dependsOn: {
      field: "assetType",
      values: ["plot"],
    },
  },
  {
    id: "plotArea",
    label: "Plot Size",
    type: "number",
    required: true,
    placeholder: "Enter plot area in square feet",
    validation: {
      min: 100,
      message: "Plot area must be at least 100 sqft",
    },
    dependsOn: {
      field: "assetType",
      values: ["plot"],
    },
    colspan: 12,
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
      field: "assetType",
      values: ["plot"],
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "plotNo",
    label: "Plot No",
    type: "text",
    required: false,
    placeholder: "Enter plot number",
    dependsOn: {
      field: "assetType",
      values: ["plot"],
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "plotLength",
    label: "Plot Length",
    type: "number",
    required: false,
    placeholder: "Enter plot length",
    dependsOn: {
      field: "assetType",
      values: ["plot"],
    },
    colspan: 6,
    conditional: true,
  },
  {
    id: "plotBreadth",
    label: "Plot Breadth",
    type: "number",
    required: false,
    placeholder: "Enter plot breadth",
    dependsOn: {
      field: "assetType",
      values: ["plot"],
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
      field: "assetType",
      values: ["plot"],
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
      field: "assetType",
      values: ["plot"],
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
        {
          field: "assetType",
          values: ["plot"],
        },
        {
          field: "possession",
          values: ["Under Construction"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
];
