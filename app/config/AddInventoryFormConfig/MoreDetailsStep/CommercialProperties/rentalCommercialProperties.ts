import { FormField } from "@/types/FormConfig";

export const rentalCommercialProperties: FormField[] = [
  {
    id: "amenities",
    label: "Amenities",
    type: "multiselect",
    options: [
      { label: "Maintenance Staff", value: "Maintenance Staff" },
      { label: "Water Storage", value: "Water Storage" },
      { label: "Visitor Parking", value: "Visitor Parking" },
      { label: "ATM", value: "ATM" },
      { label: "CCTV Surveillance", value: "CCTV Surveillance" },
      { label: "Cafeteria / Food Court", value: "Cafeteria / Food Court" },
      { label: "Lifts", value: "Lifts" },
      { label: "Security", value: "Security" },

      { label: "Power Backup", value: "Power Backup" },

      {
        label: "Wheel-Chair Accessibility",
        value: "Wheel-Chair Accessibility",
      },
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
