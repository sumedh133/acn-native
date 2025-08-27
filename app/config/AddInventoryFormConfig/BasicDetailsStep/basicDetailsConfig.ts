import { FormStep } from "@/types/FormConfig";

export const basicDetailsStep: FormStep = {
  id: "basicDetails",
  title: "Basic Details",
  description: "Tell us what you're looking to do",
  fields: [
    {
      id: "listingType",
      label: "You're looking to?",
      type: "select",
      required: true,
      options: [
        { label: "Sell", value: "resale" },
        { label: "Rent", value: "rental" },
      ],
      colspan: 12,
      conditional: false,
    },
    {
      id: "propertyType",
      label: "What kind of property?",
      type: "select",
      required: true,
      options: [
        { label: "Residential", value: "residential" },
        { label: "Commercial", value: "commercial" },
      ],
      colspan: 12,
      conditional: false,
    },
    {
      id: "assetType",
      label: "Select property type",
      type: "select",
      required: true,
      options: [
        { label: "Apartment", value: "apartment" },
        { label: "Villa", value: "villa" },
        { label: "Plot", value: "plot" },
        { label: "Row House", value: "row house" },
        { label: "Villament", value: "villament" },
        { label: "Independent Building", value: "independent house" },
      ],
      dependsOn: {
        field: "propertyType",
        values: ["residential"],
      },
      colspan: 12,
      conditional: true,
    },
    {
      id: "commercialPropertyType",
      label: "Select property type",
      type: "select",
      required: true,
      options: [
        { label: "Office Space", value: "Office Space" },
        { label: "Retail Space", value: "Retail Space" },
        { label: "Commercial Space", value: "Commercial Space" },
      ],
      dependsOn: {
        field: "propertyType",
        values: ["commercial"],
      },
      colspan: 12,
      conditional: true,
    },
    {
      id: "commercialSubType",
      label: "Select office space type",
      type: "select",
      required: true,
      options: [
        {
          label: "Independent Office Space",
          value: "Independent Office Space",
        },
        { label: "IT Park", value: "IT Park" },
        { label: "Co-Working Space", value: "Co-Working Space" },
      ],
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Office Space"],
      },
      colspan: 12,
      conditional: true,
    },
    {
      id: "commercialSubType",
      label: "Select retail space type",
      type: "select",
      required: true,
      options: [
        { label: "Commercial Shop", value: "Commercial Shop" },
        { label: "Showroom", value: "Showroom" },
      ],
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Retail Space"],
      },
      colspan: 12,
      conditional: true,
    },
    {
      id: "commercialSubType",
      label: "Select commercial space type",
      type: "select",
      required: true,
      options: [
        { label: "PG/Guest-House", value: "PG/Guest-House" },
        { label: "Warehouse", value: "Warehouse" },
        { label: "Commercial Plot", value: "Commercial Plot" },
        { label: "Industrial Shed", value: "Industrial Shed" },
        { label: "Factory", value: "Factory" },
        { label: "Other", value: "Other" },
      ],
      dependsOn: {
        field: "commercialPropertyType",
        values: ["Commercial Space"],
      },
      colspan: 12,
      conditional: true,
    },
    {
      id: "communityType",
      label: "Select community type",
      type: "select",
      required: true,
      options: [
        { label: "Gated", value: "Gated" },
        { label: "Independent", value: "Independent" },
      ],
      dependsOn: {
        field: "propertyType",
        values: ["residential"],
      },
      colspan: 12,
      conditional: true,
    },
  ],
};
