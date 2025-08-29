import { FormStep } from "@/types/FormConfig";

export const pricingDetailsStep: FormStep = {
  id: "pricingDetails",
  title: "Pricing Details",
  description: "Provide the pricing details",
  fields: [
    // ----------- Resale Pricing -----------
    {
      id: "pricing.totalAskPrice",
      label: "Total Ask Price",
      type: "dropdownWithInput",
      required: true,
      placeholder: "Enter total asking price",
      options: [
        { label: "Ask Price", value: "pricing.totalAskPrice" },
        { label: "Sq/ft", value: "pricing.pricePerSqft" },
      ],
      dependsOn: {
        field: "listingType",
        values: ["resale"],
      },
      colspan: 12,
    },

    // ----------- Rental Pricing -----------
    {
      id: "rentalInfo.rent",
      label: "Rent/ month ",
      type: "number",
      required: true,
      placeholder: "Enter monthly rent",
      dependsOn: {
        field: "listingType",
        values: ["rental"],
      },
      colspan: 12,
    },
    {
      id: "rentalInfo.deposit",
      label: "Deposit",
      type: "number",
      required: true,
      placeholder: "Enter deposit amount",
      dependsOn: {
        field: "listingType",
        values: ["rental"],
      },
      colspan: 12,
    },
    {
      id: "rentalInfo.maintenance",
      label: "Maintenance",
      type: "select",
      required: true,
      placeholder: "Select maintenance type",
      options: [
        { label: "Included", value: "Included" },
        { label: "Not Included", value: "Not Included" },
      ],
      dependsOn: {
        field: "listingType",
        values: ["rental"],
      },
      colspan: 12,
    },
    {
      id: "rentalInfo.maintenanceAmount",
      label: "Maintenance Amount",
      type: "number",
      required: false,
      placeholder: "Enter maintenance charges",
      dependsOn: {
        field: "rentalInfo.maintenance",
        values: ["Not Included"],
      },
      colspan: 12,
    },
    {
      id: "rentalInfo.commissionType",
      label: "Commission Type",
      type: "select",
      required: true,
      options: [
        { label: "Side by Side", value: "Side by Side" },
        { label: "Commission Sharing", value: "Commission Sharing" },
      ],
      dependsOn: {
        field: "listingType",
        values: ["rental"],
      },
      colspan: 12,
    },

    // ----------- Rental Info for Resale Properties (optional) -----------
    {
      id: "isPreLeased",
      label: "PreL-Leased / Pre-Rented",
      type: "select",
      required: false,
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
      placeholder: "Enter rental income (if rented)",
      dependsOn: {
        field: "listingType",
        values: ["resale"],
      },
      colspan: 12,
    },
    {
      id: "rentalInfo.rentalIncome",
      label: "Rental Income (per month)",
      type: "number",
      required: false,
      placeholder: "Enter rental income (if rented)",
      dependsOn: {
        conditions: [
          {
            field: "listingType",
            values: ["resale"],
          },
          {
            field: "isPreLeased",
            values: [true],
          },
        ],
        logicOperator: "AND",
      },
      colspan: 12,
    },
    {
      id: "rentalInfo.currentDeposit",
      label: "Current Deposit Taken",
      type: "number",
      required: false,
      placeholder: "Enter current deposit",
      dependsOn: {
        conditions: [
          {
            field: "listingType",
            values: ["resale"],
          },
          {
            field: "isPreLeased",
            values: [true],
          },
        ],
        logicOperator: "AND",
      },
      colspan: 12,
    },

    {
      id: "rentalInfo",
      label: "Current Lease Tenure",
      type: "dateRange",
      required: false,
      dateFields: [
        { label: "Lease Start Date", value: "rentalInfo.startDate" },
        { label: "Lease End Date", value: "rentalInfo.endDate" },
      ],
      dependsOn: {
        conditions: [
          {
            field: "listingType",
            values: ["resale"],
          },
          {
            field: "isPreLeased",
            values: [true],
          },
        ],
        logicOperator: "AND",
      },
      colspan: 6,
    },
  ],
};
