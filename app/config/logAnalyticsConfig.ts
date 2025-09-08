// Hare Krishna

//------------------Importing Interfaces------------------//
import { EventConfig } from "@/types/AnalyticsConfig";

export const ANALYTICS_EVENTS_CONFIG: Record<string, EventConfig> = {
  // Property Flow Events
  property_page_rental_view: {
    required: ["event_category", "page_type"],
    mapper: () => ({
      event_category: "property flow",
      page_type: "rental",
    }),
  },
  property_page_resale_view: {
    required: ["event_category", "page_type"],
    mapper: () => ({
      event_category: "property flow",
      page_type: "resale",
    }),
  },
  property_row_view: {
    required: ["event_category", "property_count", "type"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      property_count: optionalData?.property_count || 1,
      pageType: optionalData?.page_type || "resale",
    }),
  },
  property_card_view: {
    required: ["event_category", "property_id"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      property_id: propertyData?.propertyId,
      type: propertyData?.listingType || "resale",
    }),
  },
  click_enquire_now: {
    required: ["event_category", "page_type"],
    mapper: (optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
    }),
  },
  confirm_enquiry: {
    required: [
      "event_category",
      "page_type",
      "property_id",
      "buyer_cpid",
      "seller_cpid",
    ],
    mapper: ( propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      property_id: propertyData?.propertyId,
      buyer_cpid: optionalData?.buyerCpId,
      seller_cpid: optionalData?.sellerCpId,
    }),
  },
  cancel_enquiry: {
    required: ["event_category", "page_type"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
    }),
  },
  contact_whatsapp_seller: {
    required: [
      "event_category",
      "page_type",
      "property_id",
      "buyer_cpid",
      "seller_cpid",
    ],
    mapper: ( propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      property_id: propertyData?.propertyId,
      buyer_cpid: optionalData?.buyerCpId,
      seller_cpid: optionalData?.sellerCpId,
    }),
  },
  contact_oncall_seller: {
    required: [
      "event_category",
      "page_type",
      "property_id",
      "buyer_cpid",
      "seller_cpid",
    ],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      property_id: propertyData?.propertyId,
      buyer_cpid: optionalData?.buyerCpId,
      seller_cpid: optionalData?.sellerCpId,
    }),
  },
  copy_agent_details: {
    required: [
      "event_category",
      "page_type",
      "property_id",
      "buyer_cpid",
      "seller_cpid",
    ],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      property_id: propertyData?.propertyId,
      buyer_cpid: optionalData?.buyerCpId,
      seller_cpid: optionalData?.sellerCpId,
    }),
  },
  property_details_view: {
    required: ["event_category", "property_id", "property_type", "micromarket"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      property_id: propertyData?.propertyId,
      property_type: propertyData?.listingType,
      micromarket: propertyData?.micromarket,
    }),
  },
  property_google_maps: {
    required: ["event_category", "property_id", "property_type", "micromarket"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      property_id: propertyData?.propertyId,
      property_type: propertyData?.listingType,
      micromarket: propertyData?.micromarket,
    }),
  },
  property_open_details_drive: {
    required: ["event_category", "property_id", "property_type", "micromarket"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      property_id: propertyData?.propertyId,
      property_type: propertyData?.listingType,
      micromarket: propertyData?.micromarket,
    }),
  },
  share_property_details: {
    required: ["event_category", "property_id", "property_type", "micromarket"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      property_id: propertyData?.propertyId,
      property_type: propertyData?.listingType,
      micromarket: propertyData?.micromarket,
    }),
  },
  copy_property_details: {
    required: ["event_category", "property_id", "property_type", "micromarket"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      property_id: propertyData?.propertyId,
      property_type: propertyData?.listingType,
      micromarket: propertyData?.micromarket,
    }),
  },
  share_property_details_whatsapp: {
    required: ["event_category", "property_id", "property_type", "micromarket"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      property_id: propertyData?.propertyId,
      property_type: propertyData?.listingType,
      micromarket: propertyData?.micromarket,
    }),
  },
  property_search: {
    required: ["event_category", "page_type", "search_query"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      search_query: optionalData?.search_query,
    }),
  },
  property_search_results: {
    required: [
      "event_category",
      "page_type",
      "search_query",
      "property_id",
      "asset_type",
    ],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      search_query: optionalData?.search_query,
      property_id: propertyData?.propertyId,
      asset_type: propertyData?.assetType,
    }),
  },
  property_filter_open: {
    required: ["event_category", "page_type"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
    }),
  },
  property_filter_landmark: {
    required: ["event_category", "page_type", "landmark"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      landmark: optionalData?.landmark,
    }),
  },
  property_filter_micromarket: {
    required: ["event_category", "page_type", "micromarket"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      micromarket: propertyData?.micromarket,
    }),
  },
  property_filter_category: {
    required: ["event_category", "page_type", "category"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      category: optionalData?.category,
    }),
  },
  property_filter_asset_type: {
    required: ["event_category", "page_type", "asset_type"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      asset_type: optionalData?.assetType,
    }),
  },
  property_filter_budget: {
    required: ["event_category", "page_type", "budget"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      budget: optionalData?.budget,
    }),
  },
  property_filter_area: {
    required: ["event_category", "page_type", "area"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      area: optionalData?.area,
    }),
  },
  property_filter_possession: {
    required: ["event_category", "page_type", "possession"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      possession: optionalData?.possession,
    }),
  },
  property_filter_range: {
    required: ["event_category", "page_type", "range"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      range: optionalData?.range,
    }),
  },
  property_filter_facing: {
    required: ["event_category", "page_type", "facing"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      facing: optionalData?.facing || propertyData?.facing,
    }),
  },
  property_filter_clear: {
    required: ["event_category", "page_type"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
    }),
  },
  property_filter_remove: {
    required: ["event_category", "page_type"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
    }),
  },
  property_filter_carpetarea: {
    required: ["event_category", "page_type", "carpetarea"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      carpetarea: optionalData?.carpetArea,
    }),
  },
  property_filter_SBUA: {
    required: ["event_category", "page_type", "sbua"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      sbua: optionalData?.sbua,
    }),
  },
  property_filter_bedroom: {
    required: ["event_category", "page_type", "bedrooms"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property flow",
      page_type: optionalData?.page_type || "resale",
      bedrooms: optionalData?.noOfBedrooms,
    }),
  },

  // Property Addition Flow Events
  addition_flow_initiated: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  add_inventory_initiated: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  add_inventory_resale: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  add_inventory_rental: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  open_image_picker: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  open_document_picker: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  media_error: {
    required: ["event_category"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property addition",
      error_type: optionalData?.error_type,
      error_message: optionalData?.error_message,
    }),
  },
  remove_image: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  remove_document: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  inventory_addition_previous_page: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  exit_inventory_addition_page: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  save_draft_inventory: {
    required: [
      "event_category",
      "category",
      "asset_type",
      "micromarket",
      "agent_cpid",
    ],
    mapper: (agentData, propertyData) => ({
      event_category: "property addition",
      category: propertyData?.propertyType,
      asset_type: propertyData?.assetType,
      micromarket: propertyData?.micromarket,
      agent_cpid: agentData?.cpId,
    }),
  },
  add_inventory_preview: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  add_inventory_submit: {
    required: ["event_category"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property addition",
      property_id: propertyData?.propertyId,
      asset_type: propertyData?.assetType,
      agent_cpid: agentData?.cpId,
    }),
  },
  add_inventory_cancel: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "property addition",
    }),
  },
  inventory_addition_error: {
    required: ["event_category"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "property addition",
      error_type: optionalData?.error_type,
      error_message: optionalData?.error_message,
    }),
  },

  // My Business Flow Events
  my_business_page_view: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  qc_review_banner_click: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  inventory_status_update: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  inventory_status_update_hold: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  inventory_status_update_sold: {
    required: ["event_category", "property_id", "sold_price", "agent_cpid"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "my business flow",
      property_id: propertyData?.propertyId,
      sold_price: optionalData?.sold_price,
      agent_cpid: agentData?.cpId,
    }),
  },
  multiple_properties_selected: {
    required: ["event_category", "property_count"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "my business flow",
      property_count: optionalData?.property_count,
    }),
  },
  mb_property_details_view: {
    required: ["event_category", "property_id", "agent_cpid"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "my business flow",
      property_id: propertyData?.propertyId,
      agent_cpid: agentData?.cpId,
    }),
  },
  mb_share_property_details: {
    required: ["event_category", "property_id", "agent_cpid"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "my business flow",
      property_id: propertyData?.propertyId,
      agent_cpid: agentData?.cpId,
    }),
  },
  edit_property: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  edit_property_submit: {
    required: ["event_category", "property_id", "agent_cpid", "field_updated"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "my business flow",
      property_id: propertyData?.propertyId,
      agent_cpid: propertyData?.cpId,
      field_updated: optionalData?.field_updated,
    }),
  },
  enquiries_received_page_open: {
    required: ["event_category", "enquiries_count"],
    mapper: (agentData, propertyData, optionalData) => ({
      event_category: "my business flow",
      enquiries_count: optionalData?.enquiries_count,
    }),
  },
  get_contact_enquiry: {
    required: ["event_category", "buyer_cpid", "seller_cpid"],
    mapper: (optionalData) => ({
      event_category: "my business flow",
      buyer_cpid: optionalData?.buyerCpId,
      seller_cpid: optionalData?.sellerCpId,
    }),
  },
  contact_oncall_buyer: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  contact_whatsapp_buyer: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  agent_review_modal_open: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  agent_cancel_review: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  submit_review_submit: {
    required: ["event_category", "buyer_cpid", "seller_cpid"],
    mapper: (optionalData) => ({
      event_category: "my business flow",
      buyer_cpid: optionalData?.buyerCpId,
      seller_cpid: optionalData?.sellerCpId,
    }),
  },
  mb_filters_applied: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  mb_search_applied: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
  mb_sort_applied: {
    required: ["event_category"],
    mapper: () => ({
      event_category: "my business flow",
    }),
  },
};
