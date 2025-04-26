export const villaComponents = [
  {
    label: "Unit No.",
    type: "textInput",
    field: "unitNo",
    suffix: "Sqrt",
    colspan: 1,
    placeholder: "hi guysss",
    // required: true,
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
    // required: true,
  },
];