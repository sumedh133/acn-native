// Hare Krishna

//------------------Importing Interfaces------------------//

import { Property } from "@/app/types";

// Interface for event in the config

export interface EventConfig {
  required: string[];
  mapper: (
    agentData?: any,
    propertyData?: any,
    optionalData?: any
  ) => Record<string, any>;
}

// Interface for general agent data can be changed with main type

export interface AgentData {
  cpId?: string;
  userType?: string;
  kamName?: string;
  kamId?: string;
  [key: string]: any;
}

// Interface for general property data can be changed with main type

export type PropertyData = Property;

// Interface for optional data e.g. page_type, property_count etc..

export interface OptionalData {
  [key: string]: any;
}