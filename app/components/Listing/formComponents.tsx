export const appartmentComponents = [
  {
    label: "Community Type",
    type: "radioSelect",
    field: "communityType",
    options: [
      { label: "Gated", value: "Gated" },
      { label: "Independent", value: "Independent" },
    ],
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
];

export const assetTypes: { Apartment: any } = {
    Apartment: appartmentComponents,
};