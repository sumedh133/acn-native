// modalOptions.ts
export type ModalType = "sort" | "status" | "listingType" | null;

export interface ModalItem {
  id: string;
  text: string;
  onPress: () => void;
  selected: boolean;
}

export const getSortOptions = (
  selectedSort: string | null,
  handleSelection: (type: string, value: string) => void,
  propertyType?: string
): ModalItem[] => {
  // always available
  console.log(propertyType)
  const baseOptions: ModalItem[] = [
    {
      id: "relevance",
      text: "Most Relevant",
      onPress: () => handleSelection("sort", "relevance"),
      selected: selectedSort === "relevance",
    },
    {
      id: "date_desc",
      text: "Newest First",
      onPress: () => handleSelection("sort", "date_desc"),
      selected: selectedSort === "date_desc",
    },
    {
      id: "date_asc",
      text: "Oldest First",
      onPress: () => handleSelection("sort", "date_asc"),
      selected: selectedSort === "date_asc",
    },
  ];

  if (propertyType === "resale") {
    return [
      ...baseOptions,
      {
        id: "price_asc",
        text: "Total Price: Low to High",
        onPress: () => handleSelection("sort", "price_asc"),
        selected: selectedSort === "price_asc",
      },
      {
        id: "price_desc",
        text: "Total Price: High to Low",
        onPress: () => handleSelection("sort", "price_desc"),
        selected: selectedSort === "price_desc",
      },
      {
        id: "price_per_sqft_asc",
        text: "Price per sqft: Low to High",
        onPress: () => handleSelection("sort", "price_per_sqft_asc"),
        selected: selectedSort === "price_per_sqft_asc",
      },
      {
        id: "price_per_sqft_desc",
        text: "Price per sqft: High to Low",
        onPress: () => handleSelection("sort", "price_per_sqft_desc"),
        selected: selectedSort === "price_per_sqft_desc",
      },
    ];
  } else if (propertyType === "rental") {
    return [
      ...baseOptions,
      {
        id: "rent_asc",
        text: "Rent: Low to High",
        onPress: () => handleSelection("sort", "rent_asc"),
        selected: selectedSort === "rent_asc",
      },
      {
        id: "rent_desc",
        text: "Rent: High to Low",
        onPress: () => handleSelection("sort", "rent_desc"),
        selected: selectedSort === "rent_desc",
      },
    ];
  }else {
    return baseOptions
  }

  return baseOptions;
};


export const getStatusOptions = (
  selectedStatus: string | null,
  handleSelection: (type: string, value: string) => void
): ModalItem[] => [
  {
    id: "all",
    text: "All Status",
    onPress: () => handleSelection("status", "all"),
    selected: selectedStatus === "all" || !selectedStatus,
  },
  {
    id: "available",
    text: "Available",
    onPress: () => handleSelection("status", "available"),
    selected: selectedStatus === "available",
  },
  {
    id: "sold",
    text: "Sold",
    onPress: () => handleSelection("status", "sold"),
    selected: selectedStatus === "sold",
  },
  {
    id: "hold",
    text: "Hold",
    onPress: () => handleSelection("status", "hold"),
    selected: selectedStatus === "hold",
  },
  {
    id: "tenanted",
    text: "Tenanted",
    onPress: () => handleSelection("status", "tenanted"),
    selected: selectedStatus === "tenanted",
  },
  {
    id: "de-listed",
    text: "De-Listed",
    onPress: () => handleSelection("status", "de-listed"),
    selected: selectedStatus === "de-listed",
  },
];

export const getCategoryOptions = (
  selectedCategory: string | null,
  handleSelection: (type: string, value: string) => void
): ModalItem[] => [
  {
    id: "all",
    text: "All Categories",
    onPress: () => handleSelection("listingType", "all"),
    selected: selectedCategory === "all" || !selectedCategory,
  },
  {
    id: "resale",
    text: "Resale",
    onPress: () => handleSelection("listingType", "resale"),
    selected: selectedCategory === "resale",
  },
  {
    id: "rental",
    text: "Rental",
    onPress: () => handleSelection("listingType", "rental"),
    selected: selectedCategory === "rental",
  },
];

export const getModalItems = (
  activeModal: ModalType,
  selectedSort: string | null,
  selectedStatus: string | null,
  selectedCategory: string | null,
  handleSelection: (type: string, value: string) => void,
  propertyType?: string,
): ModalItem[] => {
  switch (activeModal) {
    case "sort":
      return getSortOptions(selectedSort, handleSelection, propertyType );
    case "status":
      return getStatusOptions(selectedStatus, handleSelection);
    case "listingType":
      return getCategoryOptions(selectedCategory, handleSelection);
    default:
      return [];
  }
};
