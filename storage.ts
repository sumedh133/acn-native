import { MMKV } from "react-native-mmkv";

// Create MMKV instance
export const storage = new MMKV();

// Type-safe set function
export const setItem = (
  key: string,
  value: string | number | boolean | object
): void => {
  try {
    if (typeof value === "object") {
      storage.set(key, JSON.stringify(value));
    } else {
      storage.set(key, value);
    }
  } catch (error) {
    console.error("Error setting item in MMKV:", error);
  }
};

export const getItem = <T>(key: string): T | undefined => {
  try {
    // Try to get number first
    const numValue = storage.getNumber(key);
    if (numValue !== undefined) return numValue as unknown as T;

    // Try to get boolean
    const boolValue = storage.getBoolean(key);
    if (boolValue !== undefined) return boolValue as unknown as T;

    // Try to get string
    const strValue = storage.getString(key);
    if (strValue === undefined) return undefined;

    // Attempt to parse JSON (for objects/arrays)
    try {
      return JSON.parse(strValue) as T;
    } catch {
      return strValue as unknown as T; // fallback to string
    }
  } catch (error) {
    console.error("Error getting item from MMKV:", error);
    return undefined;
  }
};

// Remove item
export const removeItem = (key: string): void => {
  try {
    storage.delete(key);
  } catch (error) {
    console.error("Error removing item from MMKV:", error);
  }
};

// Clear all
export const clearStorage = (): void => {
  try {
    storage.clearAll();
  } catch (error) {
    console.error("Error clearing MMKV storage:", error);
  }
};
