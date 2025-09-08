// logEventService.ts

import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";
import { AgentData, PropertyData, OptionalData } from "@/types/AnalyticsConfig";
import {
  mapEventData,
  validateEventData,
  sanitizeEventData,
  isValidEvent,
  debounce,
  throttle,
  EventBatch,
} from "@/utils/analyticsUtils";

export interface LogEventOptions {
  skipValidation?: boolean;
  silent?: boolean; // Don't log errors to console
  dryRun?: boolean; // Don't actually send the event
}

export interface LogEventResponse {
  success: boolean;
  eventName: string;
  data?: Record<string, any>;
  error?: string;
  warnings?: string[];
}

class AnalyticsService {
  private eventBatch: EventBatch;
  private debouncedEvents: Map<string, any> = new Map();

  constructor() {
    // Initialize batch processing
    this.eventBatch = new EventBatch({
      maxSize: 20,
      autoFlushDelay: 5000,
      onFlush: this.processBatch.bind(this),
    });
  }

  /**
   * Main method to log events
   */
  async logEvent(
    eventName: string,
    agentData?: AgentData,
    propertyData?: PropertyData,
    optionalData?: OptionalData,
    options: LogEventOptions = {}
  ): Promise<LogEventResponse> {
    try {
      // Validate event exists
      if (!isValidEvent(eventName)) {
        const error = `Event '${eventName}' not found in configuration`;
        if (!options.silent) {
          console.error("[Analytics]", error);
        }
        return {
          success: false,
          eventName,
          error,
        };
      }

      // Map event data
      const mappedData = mapEventData(
        eventName,
        agentData,
        propertyData,
        optionalData
      );

      // Validate data if not skipped
      let warnings: string[] = [];
      if (!options.skipValidation) {
        const validation = validateEventData(eventName, mappedData);
        warnings = validation.warnings;

        if (!validation.isValid && !options.silent) {
          console.warn(
            "[Analytics]",
            `Event '${eventName}' validation failed:`,
            validation.warnings
          );
        }
      }

      // Sanitize data
      const sanitizedData = sanitizeEventData(mappedData);

      // Log for debugging in development
      if (__DEV__ && !options.silent) {
        console.log(`[Analytics] ${eventName}:`, sanitizedData);
      }

      // Skip actual logging in dry run mode
      if (options.dryRun) {
        return {
          success: true,
          eventName,
          data: sanitizedData,
          warnings,
        };
      }

      // Send to Firebase Analytics
      await logEvent(analytics, eventName, sanitizedData);

      return {
        success: true,
        eventName,
        data: sanitizedData,
        warnings,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (!options.silent) {
        console.error("[Analytics] Error logging event:", errorMessage);
      }

      return {
        success: false,
        eventName,
        error: errorMessage,
      };
    }
  }

  /**
   * Batch log multiple events
   */
  async logEvents(
    events: Array<{
      eventName: string;
      agentData?: AgentData;
      propertyData?: PropertyData;
      optionalData?: OptionalData;
    }>,
    options: LogEventOptions = {}
  ): Promise<LogEventResponse[]> {
    const results: LogEventResponse[] = [];

    for (const event of events) {
      const result = await this.logEvent(
        event.eventName,
        event.agentData,
        event.propertyData,
        event.optionalData,
        options
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Add event to batch for deferred processing
   */
  addToBatch(
    eventName: string,
    agentData?: AgentData,
    propertyData?: PropertyData,
    optionalData?: OptionalData
  ) {
    

    try {
      const mappedData = mapEventData(
        eventName,
        agentData,
        propertyData,
        optionalData
      );
      const sanitizedData = sanitizeEventData(mappedData);

      this.eventBatch.add(eventName, sanitizedData);
    } catch (error) {
      console.error("[Analytics] Error adding event to batch:", error);
    }
  }

  /**
   * Process batch of events
   */
  private async processBatch(
    events: Array<{
      eventName: string;
      data: Record<string, any>;
      timestamp: string;
    }>
  ) {
    for (const event of events) {
      try {
        await logEvent(analytics, event.eventName, event.data);

        if (__DEV__) {
          console.log(`[Analytics Batch] ${event.eventName}:`, event.data);
        }
      } catch (error) {
        console.error("[Analytics] Batch processing error:", error);
      }
    }
  }

  /**
   * Debounced event logging (useful for frequent events like field updates)
   */
  logEventDebounced = debounce(
    (
      eventName: string,
      agentData?: AgentData,
      propertyData?: PropertyData,
      optionalData?: OptionalData,
      delay: number = 1000
    ) => {
      this.logEvent(eventName, agentData, propertyData, optionalData);
    },
    1000
  );

  /**
   * Throttled event logging (useful for scroll or resize events)
   */
  logEventThrottled = throttle(
    (
      eventName: string,
      agentData?: AgentData,
      propertyData?: PropertyData,
      optionalData?: OptionalData,
      limit: number = 2000
    ) => {
      this.logEvent(eventName, agentData, propertyData, optionalData);
    },
    2000
  );

  /**
   * Log property flow events with common patterns
   */
  async logPropertyEvent(
    action: string,
    propertyData: PropertyData,
    agentData?: AgentData,
    pageType: "resale" | "rental" = "resale"
  ) {
    const eventMap: Record<string, string> = {
      view_card: "property_card_view",
      view_details: "property_details_view",
      enquire: "click_enquire_now",
      share: "share_property_details",
      copy: "copy_property_details",
      whatsapp: "share_property_details_whatsapp",
      google_maps: "property_google_maps",
      open_drive: "property_open_details_drive",
    };

    const eventName = eventMap[action];
    if (!eventName) {
      console.warn(`[Analytics] Unknown property action: ${action}`);
      return;
    }

    return this.logEvent(eventName, agentData, propertyData, {
      page_type: pageType,
      property_type: pageType,
    });
  }

  /**
   * Log filter events with standardized format
   */
  async logFilterEvent(
    filterType: string,
    filterValue: any,
    agentData?: AgentData,
    pageType: "resale" | "rental" = "resale"
  ) {
    const eventName = `property_filter_${filterType}`;

    return this.logEvent(eventName, agentData, undefined, {
      page_type: pageType,
      [filterType]: filterValue,
    });
  }

  /**
   * Log inventory addition events
   */
  async logInventoryEvent(
    action: string,
    propertyData?: PropertyData,
    agentData?: AgentData,
    additionalData?: OptionalData
  ) {
    const eventMap: Record<string, string> = {
      initiated: "add_inventory_initiated",
      resale: "add_inventory_resale",
      rental: "add_inventory_rental",
      preview: "add_inventory_preview",
      submit: "add_inventory_submit",
      cancel: "add_inventory_cancel",
      save_draft: "save_draft_inventory",
      media_error: "media_error",
      exit: "exit_inventory_addition_page",
    };

    const eventName = eventMap[action];
    if (!eventName) {
      console.warn(`[Analytics] Unknown inventory action: ${action}`);
      return;
    }

    return this.logEvent(eventName, agentData, propertyData, additionalData);
  }

  /**
   * Log my business events
   */
  async logMyBusinessEvent(
    action: string,
    propertyData?: PropertyData,
    agentData?: AgentData,
    additionalData?: OptionalData
  ) {
    const eventMap: Record<string, string> = {
      page_view: "my_business_page_view",
      property_details: "mb_property_details_view",
      share_property: "mb_share_property_details",
      edit_property: "edit_property",
      edit_submit: "edit_property_submit",
      status_update: "inventory_status_update",
      status_hold: "inventory_status_update_hold",
      status_sold: "inventory_status_update_sold",
      enquiries_open: "enquiries_received_page_open",
      contact_buyer: "get_contact_enquiry",
    };

    const eventName = eventMap[action];
    if (!eventName) {
      console.warn(`[Analytics] Unknown my business action: ${action}`);
      return;
    }

    return this.logEvent(eventName, agentData, propertyData, additionalData);
  }



  /**
   * Flush any pending batch events
   */
  flush() {
    return this.eventBatch.flush();
  }

  /**
   * Get batch size
   */
  getBatchSize(): number {
    return this.eventBatch.size();
  }

  /**
   * Clear debounced events
   */
  clearDebouncedEvents() {
    this.debouncedEvents.clear();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export individual methods for convenience
export const {
  logEvent: trackEvent,
  logEvents: trackEvents,
  logEventDebounced: trackEventDebounced,
  logEventThrottled: trackEventThrottled,
  logPropertyEvent: trackPropertyEvent,
  logFilterEvent: trackFilterEvent,
  logInventoryEvent: trackInventoryEvent,
  logMyBusinessEvent: trackMyBusinessEvent,
  addToBatch: addEventToBatch,
  flush: flushAnalytics,
} = analyticsService;
