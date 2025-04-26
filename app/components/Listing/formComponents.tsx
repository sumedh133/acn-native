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
  },
  {
    label: "Unit No.",
    type: "textInput",
    field: "unitNo",
    suffix: "Sqrt",
    colspan: 1,
    placeholder: "hi guysss",
  },
];

export const assetTypes: { Apartment: any } = {
  Apartment: appartmentComponents,
};
