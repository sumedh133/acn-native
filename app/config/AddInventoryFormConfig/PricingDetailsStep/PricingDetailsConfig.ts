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
      type: "number",
      required: true,
      placeholder: "Enter total asking price",
      dependsOn: {
        field: "listingType",
        values: ["resale"],
      },
      colspan: 12,
    },
    {
      id: "pricing.pricePerSqft",
      label: "Price per Sqft",
      type: "number",
      required: false,
      placeholder: "Enter price per sqft",
      dependsOn: {
        field: "listingType",
        values: ["resale"],
      },
      colspan: 6,
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
      colspan: 6,
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
      colspan: 6,
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
      colspan: 6,
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
      colspan: 6,
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
      id: "rentalInfo.rentalIncome",
      label: "Rental Income",
      type: "number",
      required: false,
      placeholder: "Enter rental income (if rented)",
      dependsOn: {
        field: "listingType",
        values: ["resale"],
      },
      colspan: 6,
    },
    {
      id: "rentalInfo.currentDeposit",
      label: "Current Deposit",
      type: "number",
      required: false,
      placeholder: "Enter current deposit",
      dependsOn: {
        field: "listingType",
        values: ["resale"],
      },
      colspan: 6,
    },
    {
      id: "rentalInfo.startDate",
      label: "Lease Start Date",
      type: "date",
      required: false,
      dependsOn: {
        field: "listingType",
        values: ["resale"],
      },
      colspan: 6,
    },
    {
      id: "rentalInfo.endDate",
      label: "Lease End Date",
      type: "date",
      required: false,
      dependsOn: {
        field: "listingType",
        values: ["resale"],
      },
      colspan: 6,
    },
  ],
};
