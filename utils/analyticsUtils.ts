// Hare Krishna

//------------------Importing Interfaces------------------//

import { AgentData, PropertyData, OptionalData } from "@/types/AnalyticsConfig";
import { ANALYTICS_EVENTS_CONFIG } from "@/app/config/logAnalyticsConfig";

/**
 * Validates if an event exists in the configuration
 */
export function isValidEvent(eventName: string): boolean {
  return eventName in ANALYTICS_EVENTS_CONFIG;
}

/**
 * Gets required fields for a specific event
 */
export function getRequiredFields(eventName: string): string[] {
  const eventConfig = ANALYTICS_EVENTS_CONFIG[eventName];
  if (!eventConfig) {
    throw new Error(`Event '${eventName}' not found in configuration`);
  }
  return eventConfig.required;
}

/**
 * Maps event data based on the event configuration
 */
export function mapEventData(
  eventName: string,
  agentData?: AgentData,
  propertyData?: PropertyData,
  optionalData?: OptionalData
): Record<string, any> {
  const eventConfig = ANALYTICS_EVENTS_CONFIG[eventName];

  if (!eventConfig) {
    throw new Error(`Event '${eventName}' not found in configuration`);
  }

  // Map the data using the event's mapper function
  const mappedData = eventConfig.mapper(agentData, propertyData, optionalData);

  // Add common fields that should be present in all events
  const enhancedData = {
    ...mappedData,
    platform: "app", // or 'web' based on your platform
    app_version: "1.0.2", // You can make this dynamic
  };

  return enhancedData;
}

/**
 * Validates that all required fields are present in the mapped data
 */
export function validateEventData(
  eventName: string,
  mappedData: Record<string, any>
): { isValid: boolean; missingFields: string[]; warnings: string[] } {
  const eventConfig = ANALYTICS_EVENTS_CONFIG[eventName];
  const warnings: string[] = [];

  if (!eventConfig) {
    return {
      isValid: false,
      missingFields: [],
      warnings: [`Event '${eventName}' not found in configuration`],
    };
  }

  // Check for missing required fields
  const missingFields = eventConfig.required.filter((field) => {
    const value = mappedData[field];
    return value === undefined || value === null || value === "";
  });

  // Generate warnings for missing non-critical fields
  if (missingFields.length > 0) {
    warnings.push(`Missing required fields: ${missingFields.join(", ")}`);
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

/**
 * Sanitizes event data by removing null/undefined values and ensuring proper types
 */
export function sanitizeEventData(
  data: Record<string, any>
): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== "") {
      // Convert numbers to strings if they're meant to be IDs
      if (key.includes("id") && typeof value === "number") {
        sanitized[key] = value.toString();
      } else if (typeof value === "string") {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Gets all available events categorized by flow
 */
export function getEventsByCategory(): Record<string, string[]> {
  const categories: Record<string, string[]> = {};

  for (const [eventName, config] of Object.entries(ANALYTICS_EVENTS_CONFIG)) {
    const sampleData = config.mapper();
    const category = sampleData.event_category || "uncategorized";

    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(eventName);
  }

  return categories;
}

/**
 * Debounce utility for events that might fire frequently
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Throttle utility for events that should not fire too frequently
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Creates a batch of events for bulk processing
 */
export class EventBatch {
  private events: Array<{
    eventName: string;
    data: Record<string, any>;
    timestamp: string;
  }> = [];
  private maxSize: number;
  private autoFlushDelay: number;
  private flushTimer?: NodeJS.Timeout;
  private onFlush?: (events: typeof this.events) => void;

  constructor(
    options: {
      maxSize?: number;
      autoFlushDelay?: number;
      onFlush?: (events: typeof this.events) => void;
    } = {}
  ) {
    this.maxSize = options.maxSize || 10;
    this.autoFlushDelay = options.autoFlushDelay || 5000;
    this.onFlush = options.onFlush;
  }

  add(eventName: string, data: Record<string, any>) {
    this.events.push({
      eventName,
      data,
      timestamp: new Date().toISOString(),
    });

    // Auto-flush if batch is full
    if (this.events.length >= this.maxSize) {
      this.flush();
    } else {
      // Reset auto-flush timer
      this.resetAutoFlushTimer();
    }
  }

  flush(): typeof this.events {
    const events = [...this.events];
    this.events = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }

    if (this.onFlush && events.length > 0) {
      this.onFlush(events);
    }

    return events;
  }

  private resetAutoFlushTimer() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, this.autoFlushDelay);
  }

  size(): number {
    return this.events.length;
  }

  clear() {
    this.events = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
  }
}