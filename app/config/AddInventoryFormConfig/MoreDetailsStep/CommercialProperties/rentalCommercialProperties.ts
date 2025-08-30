import { FormField } from "@/types/FormConfig";

export const rentalCommercialProperties: FormField[] = [
  {
    id: "amenities",
    label: "Amenities",
    type: "multiselect",
    options: [
      { label: "Maintenance Staff", value: "maintenance staff" },
      { label: "Water Storage", value: "water storage" },
      { label: "Visitor Parking", value: "visitor parking" },
      { label: "ATM", value: "atm" },
      { label: "CCTV Surveillance", value: "cctv surveillance" },
      { label: "Cafeteria / Food Court", value: "cafeteria / food court" },
      { label: "Lifts", value: "lifts" },
      { label: "Security", value: "security" },
      { label: "Power Backup", value: "power backup" },
      { label: "Wheel-Chair Accessibility", value: "wheel-chair accessibility" },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["rental"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  {
    id: "parking",
    label: "Parking",
    type: "showStepper",
    placeholder: "Enter number of parking slots",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["rental"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 6,
  },
  {
    id: "extraDetails",
    label: "Extra Details",
    type: "textarea",
    placeholder: "Enter any additional details",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["rental"] },
        { field: "propertyType", values: ["commercial"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
];
