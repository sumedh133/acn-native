// modalOptions.ts
export type ModalType = 'sort' | 'status' | 'category' | null;

export interface ModalItem {
  id: string;
  text: string;
  onPress: () => void;
  selected: boolean;
}

export const getSortOptions = (selectedSort: string | null, handleSelection: (type: string, value: string) => void): ModalItem[] => [
  {
    id: "relevance",
    text: "Most Relevant",
    onPress: () => handleSelection('sort', "relevance"),
    selected: selectedSort === "relevance",
  },
  {
    id: "price_asc",
    text: "Price: Low to High",
    onPress: () => handleSelection('sort', "price_asc"),
    selected: selectedSort === "price_asc",
  },
  {
    id: "price_desc",
    text: "Price: High to Low",
    onPress: () => handleSelection('sort', "price_desc"),
    selected: selectedSort === "price_desc",
  },
  {
    id: "date_desc",
    text: "Newest First",
    onPress: () => handleSelection('sort', "date_desc"),
    selected: selectedSort === "date_desc",
  },
  {
    id: "date_asc",
    text: "Oldest First",
    onPress: () => handleSelection('sort', "date_asc"),
    selected: selectedSort === "date_asc",
  },
];

export const getStatusOptions = (selectedStatus: string | null, handleSelection: (type: string, value: string) => void): ModalItem[] => [
  {
    id: "all",
    text: "All Status",
    onPress: () => handleSelection('status', "all"),
    selected: selectedStatus === "all" || !selectedStatus,
  },
  {
    id: "available",
    text: "Available",
    onPress: () => handleSelection('status', "available"),
    selected: selectedStatus === "available",
  },
  {
    id: "sold",
    text: "Sold",
    onPress: () => handleSelection('status', "sold"),
    selected: selectedStatus === "sold",
  },
  {
    id: "rented",
    text: "Rented",
    onPress: () => handleSelection('status', "rented"),
    selected: selectedStatus === "rented",
  },
  {
    id: "under_construction",
    text: "Under Construction",
    onPress: () => handleSelection('status', "under_construction"),
    selected: selectedStatus === "under_construction",
  },
];

export const getCategoryOptions = (selectedCategory: string | null, handleSelection: (type: string, value: string) => void): ModalItem[] => [
  {
    id: "all",
    text: "All Categories",
    onPress: () => handleSelection('category', "all"),
    selected: selectedCategory === "all" || !selectedCategory,
  },
  {
    id: "apartment",
    text: "Apartment",
    onPress: () => handleSelection('category', "apartment"),
    selected: selectedCategory === "apartment",
  },
  {
    id: "villa",
    text: "Villa",
    onPress: () => handleSelection('category', "villa"),
    selected: selectedCategory === "villa",
  },
  {
    id: "plot",
    text: "Plot",
    onPress: () => handleSelection('category', "plot"),
    selected: selectedCategory === "plot",
  },
  {
    id: "commercial",
    text: "Commercial",
    onPress: () => handleSelection('category', "commercial"),
    selected: selectedCategory === "commercial",
  },
];

export const getModalItems = (
  activeModal: ModalType,
  selectedSort: string | null,
  selectedStatus: string | null,
  selectedCategory: string | null,
  handleSelection: (type: string, value: string) => void
): ModalItem[] => {
  switch (activeModal) {
    case 'sort':
      return getSortOptions(selectedSort, handleSelection);
    case 'status':
      return getStatusOptions(selectedStatus, handleSelection);
    case 'category':
      return getCategoryOptions(selectedCategory, handleSelection);
    default:
      return [];
  }
};