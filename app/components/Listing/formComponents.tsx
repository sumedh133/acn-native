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
  },
  {
    label: "Furnishing",
    type: "Dropdown",
    field: "Furnishing",
    option: [
      { label: "Simplex", value: "simplex" },
      { label: "Duplex", value: "duplex" },
      { label: "Triplex", value: "triplex" },
      { label: "Penthouse", value: "penthouse" },
    ],
    // alignment: "full",
    colspan: 2,
  },
  {
    label: "SBUA",
    type: "textInput",
    field: "sbua",
    alignment: "full",
    suffix: "Sqft",
    placeholder: "1500",
  },
  {
    label: "Corner Unit",
    type: "Checkbox",
    field: "cornerUnit",
    alignment: "full",
    colspan: 1,
  },
  {
    label: "Hand Over Date",
    type: "MonthYearPicker",
    field: "HandOverDate",
    alignment: "full",
    colspan: 1,
  },
];

export const assetTypes: { Apartment: any } = {
  Apartment: appartmentComponents,
};
