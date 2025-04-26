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
    label: "SBUA",
    type: "textInput",
    field: "sbua",
    suffix: "Sqft",
    placeholder: "1500",
    colspan: 2,
    // required: true,
  },
  
];
