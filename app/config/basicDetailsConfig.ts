import { FormStep } from "@/types/FormConfig";

export const basicDetailsStep: FormStep = {
  id: "basicDetails",
  title: "Basic Details",
  description: "Tell us what you're looking to do",
  fields: [
    {
      id: "transactionType",
      label: "What would you like to do?",
      type: "select",
      required: true,
      placeholder: "Select transaction type",
      options: [
        { label: "Sell", value: "resale" },
        { label: "Rent", value: "rental" },
      ],
      colspan: 12,
      conditional: false,
    },
    {
      id: "category",
      label: "Property Category",
      type: "select",
      required: true,
      placeholder: "Select property category",
      options: [
        { label: "Residential", value: "residential" },
        { label: "Commercial", value: "commercial" },
      ],
      dependsOn: {
        field: "transactionType",
        values: ["resale", "rental"],
      },
      colspan: 12,
      conditional: false,
    },

    // Residential asset types - shown only when residential is selected
    {
      id: "residentialSubCategory",
      label: "Asset Type",
      type: "select",
      required: true,
      placeholder: "Select asset type",
      options: [
        { label: "Apartment", value: "apartment" },
        { label: "Villa", value: "villa" },
        { label: "Villament", value: "villament" },
        { label: "Row House", value: "rowhouse" },
        { label: "Plot", value: "plot" },
        { label: "Independent Building", value: "independent" },
      ],
      dependsOn: {
        field: "category",
        values: ["residential"],
      },
      colspan: 12,
      conditional: true,
    },

    // Commercial property types - shown only when commercial is selected
    {
      id: "commercialPropertyType",
      label: "Property Type",
      type: "select",
      required: true,
      placeholder: "Select property type",
      options: [
        { label: "Office Space", value: "Office Space" },
        { label: "Retail Space", value: "Retail Space" },
        { label: "Commercial Space", value: "Commercial Space" },
      ],
      dependsOn: {
        field: "category",
        values: ["commercial"],
      },
      colspan: 12,
      conditional: true,
    },

    // Office Space subtypes - shown only when Office Space is selected
    {
      id: "officeSpaceSubType",
      label: "Office Space Type",
      type: "select",
      required: true,
      placeholder: "Select office space type",
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

    // Retail Space subtypes - shown only when Retail Space is selected
    {
      id: "retailSpaceSubType",
      label: "Retail Space Type",
      type: "select",
      required: true,
      placeholder: "Select retail space type",
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

    // Commercial Space subtypes - shown only when Commercial Space is selected
    {
      id: "commercialSpaceSubType",
      label: "Commercial Space Type",
      type: "select",
      required: true,
      placeholder: "Select commercial space type",
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

    // Community type - only shown for residential properties
    {
      id: "communityType",
      label: "Community Type",
      type: "select",
      required: true,
      placeholder: "Select community type",
      options: [
        { label: "Gated", value: "Gated" },
        { label: "Independent", value: "Independent" },
      ],
      dependsOn: {
        field: "category",
        values: ["residential"],
      },
      colspan: 12,
      conditional: true,
    },
  ],
};
