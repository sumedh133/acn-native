export const appartmentComponents = [
  {
    label: "Community Type",
    type: "radioSelect",
    field: "communityType",
    options: [
      { label: "Gated", value: "Gated" },
      { label: "Independent", value: "Independent" },
    ],
    colspan: 2,
    required: true,
  },
  {
    label: "Apartment Type",
    type: "slider",
    field: "subType",
    options: [
      { label: "Simplex", value: "simplex" },
      { label: "Duplex", value: "duplex" },
      { label: "Triplex", value: "triplex" },
      { label: "Penthouse", value: "penthouse" },
    ],
    colspan: 2,
    required: true,
  },
  {
    label: "Unit No.",
    type: "textInput",
    field: "unitNo",
    suffix: "Sqrt",
    colspan: 1,
    placeholder: "hi guysss",
    required: true,
  },
  {
    label: "Furnishing",
    type: "Dropdown",
    field: "furnishing",
    option: [
      { label: "Simplex", value: "simplex" },
      { label: "Duplex", value: "duplex" },
      { label: "Triplex", value: "triplex" },
      { label: "Penthouse", value: "penthouse" },
    ],
    colspan: 1,
    required: true,
  },
  {
    label: "SBUA",
    type: "textInput",
    field: "sbua",
    suffix: "Sqft",
    placeholder: "1500",
    colspan: 2,
    required: true,
  },
  {
    label: "Corner Unit",
    type: "Checkbox",
    field: "cornerUnit",
    colspan: 2,
    required: true,
  },
  {
    label: "Hand Over Date",
    type: "MonthYearPicker",
    field: "handoverDate",
    colspan: 2,
    required: false,
  },
];

export const assetTypes: { Apartment: any } = {
  Apartment: appartmentComponents,
};
