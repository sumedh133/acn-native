export const appartmentComponents = [
  {
    label: "Community Type",
    type: "radioSelect",
    field: "communityType",
    options: [
      { label: "Gated", value: "Gated" },
      { label: "Independent", value: "Independent" },
    ],
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
    required: true,
  },
  {
    label: "Unit No.",
    type: "textInput",
    field: "unitNo",
    alignment: "left",
  },
  {
    label: "Unit No.",
    type: "textInput",
    field: "unitNo",
    alignment: "right",
  },
  {
    label: "Unit No.",
    type: "textInput",
    field: "unitNo",
    alignment: "full",
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
    alignment: "full",
  },
  {
    label: "SBUA",
    type: "textInput",
    field: "sbua",
    alignment: "full",
    suffix: 'Sqft',
    placeholder:'1500',
  },
  {
    label: "Corner Unit",
    type: "Checkbox",
    field: "cornerUnit",
    alignment: "full",
  },
  {
    label: "Hand Over Date",
    type: "MonthYearPicker",
    field: "HandOverDate",
    alignment: "full",
  },
];

export const assetTypes: { Apartment: any } = {
  Apartment: appartmentComponents,
};
