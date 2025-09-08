import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../../config/firebase"; // your Firebase config
import { Property } from "../../types";
import _ from "lodash";

import { getUnixDateTime } from "@/app/helpers/getUnixDateTime";
import { usePathname } from "expo-router";

// Firestore Collections
const ADMIN_COLLECTION = "acn-admin";
const INVENTORY_COLLECTION = "acnTestProperties"; // verified stage
const QC_INVENTORY_COLLECTION = "acnQCInventoriesTest"; // qc stage

// Types
type InventoryStage = "qc" | "verified";

interface EditHistoryRecord {
  editId: string;
  timestamp: number;
  changes: Record<string, any>; // Object with field names as keys and new values
}

/**
 * Utility function for comparing objects
 */

function getChangedFields(oldObj: any, newObj: any): any {
  const changes: any = {};

  Object.keys(newObj).forEach((key) => {
    const oldValue = _.get(oldObj, key);
    const newValue = newObj[key];

    if (_.isPlainObject(newValue)) {
      const nestedChanges = getChangedFields(oldValue || {}, newValue);
      if (!_.isEmpty(nestedChanges)) {
        changes[key] = nestedChanges;
      }
    } else if (!_.isEqual(oldValue, newValue)) {
      changes[key] = newValue;
    }
  });

  return changes;
}

/**
 * Get the appropriate collection name based on inventory stage
 */
const getCollectionName = (
  inventoryStage: InventoryStage = "verified"
): string => {
  return inventoryStage === "qc"
    ? QC_INVENTORY_COLLECTION
    : INVENTORY_COLLECTION;
};

/**
 * Generate a new unique Property ID using `acn-admin/lastQcId`.
 */
export const generatePropertyId = async (): Promise<string> => {
  const ref = doc(db, ADMIN_COLLECTION, "lastQcId");
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error("lastQcId doc not found in acn-admin");
  }

  const { count, label, prefix } = snapshot.data() as {
    count: number;
    label: string;
    prefix: string;
  };

  const newCount = count + 1;

  // Format count with leading zeros (e.g., 001, 023, 145)
  const paddedCount = newCount.toString().padStart(3, "0");

  const propertyId = `${label}${prefix}${paddedCount}`;

  // Update counter in admin doc
  await updateDoc(ref, { count: newCount });

  return propertyId;
};

/**
 * Create a new property in the specified inventory stage.
 */
export const createProperty = async (
  property: Omit<Property, "propertyId">,
  inventoryStage: InventoryStage = "verified"
) => {
  const propertyId = await generatePropertyId();
  const collectionName = getCollectionName(inventoryStage);
  const ref = doc(collection(db, collectionName), propertyId);
  console.log(property, "property");
  console.log(collectionName, "collection name");
  const time = getUnixDateTime();
  const referredFloorNumber: string | null =
    property.floorNumber !== undefined && property.floorNumber !== null
      ? property.floorNumber === 0
        ? "ground floor"
        : property.floorNumber < 6
        ? "lower floor (1 - 5)"
        : property.floorNumber < 11
        ? "middle floor (6 - 10)"
        : property.floorNumber < 20
        ? "higher floor (10+)"
        : property.floorNumber > 20
        ? "higher floor (20+)"
        : null
      : null;

  const newProperty: Property = {
    ...property,
    referredFloorNumber: referredFloorNumber,
    propertyId,
    added: time,
    dateOfLastChecked: time,
    lastModified: time,
    stage: "kam",
    status: property.status ?? "pending",
    source: "app",
  };

  await setDoc(ref, newProperty);

  return newProperty;
};

/**
 * Fetch a property by ID from the specified inventory stage.
 */
export const getPropertyById = async (
  propertyId: string,
  inventoryStage: InventoryStage = "verified"
): Promise<Property | null> => {
  const collectionName = getCollectionName(inventoryStage);
  const ref = doc(db, collectionName, propertyId);
  const snapshot = await getDoc(ref);

  return snapshot.exists() ? (snapshot.data() as Property) : null;
};

/**
 * Listen to real-time updates for a property by ID from the specified inventory stage.
 */
export const subscribeToPropertyById = (
  propertyId: string,
  onUpdate: (property: Property | null) => void,
  inventoryStage: InventoryStage = "verified",
  onError?: (error: Error) => void
): Unsubscribe => {
  const collectionName = getCollectionName(inventoryStage);
  const ref = doc(db, collectionName, propertyId);

  return onSnapshot(
    ref,
    (snapshot) => {
      try {
        const property = snapshot.exists()
          ? (snapshot.data() as Property)
          : null;
        onUpdate(property);
      } catch (error) {
        console.error(
          `Error processing property update for ${propertyId}:`,
          error
        );
        onError?.(error as Error);
      }
    },
    (error) => {
      console.error(`Error listening to property ${propertyId}:`, error);
      onError?.(error);
    }
  );
};

/**
 * Listen to real-time updates for multiple properties by IDs from the specified inventory stage.
 */
export const subscribeToPropertiesByIds = (
  propertyIds: string[],
  onUpdate: (properties: (Property | null)[]) => void,
  inventoryStage: InventoryStage = "verified",
  onError?: (error: Error) => void,
  onProgress?: (loaded: number, total: number) => void
): (() => void) => {
  const unsubscribers: Unsubscribe[] = [];
  const propertiesMap = new Map<string, Property | null>();
  let initialLoadCount = 0;
  const totalProperties = propertyIds.length;

  const updateCallback = () => {
    // Convert map to array in the same order as propertyIds
    const orderedProperties = propertyIds.map(
      (id) => propertiesMap.get(id) || null
    );
    onUpdate(orderedProperties);
  };

  // Set up individual listeners for each property
  propertyIds.forEach((propertyId) => {
    const unsubscribe = subscribeToPropertyById(
      propertyId,
      (property) => {
        const wasInitialLoad = !propertiesMap.has(propertyId);
        propertiesMap.set(propertyId, property);

        if (wasInitialLoad) {
          initialLoadCount++;

          // Report progress during initial loading
          onProgress?.(initialLoadCount, totalProperties);

          // Only call update after all initial properties are loaded
          if (initialLoadCount === totalProperties) {
            updateCallback();
          }
        } else {
          // This is a real-time update, call immediately
          updateCallback();
        }
      },
      inventoryStage,
      onError
    );
    unsubscribers.push(unsubscribe);
  });

  // Return a single cleanup function that unsubscribes all listeners
  return () => {
    unsubscribers.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn("Error unsubscribing from property listener:", error);
      }
    });
  };
};

/**
 * Fetch all properties from the specified inventory stage (optionally filtered).
 */
export const getAllProperties = async (
  inventoryStage: InventoryStage = "verified",
  filters?: {
    listingType?: "resale" | "rental";
    propertyType?: "residential" | "commercial";
    status?: string;
  }
) => {
  const collectionName = getCollectionName(inventoryStage);
  let q = collection(db, collectionName);

  // Apply filters dynamically
  const conditions: any[] = [];
  if (filters?.listingType)
    conditions.push(where("listingType", "==", filters.listingType));
  if (filters?.propertyType)
    conditions.push(where("propertyType", "==", filters.propertyType));
  if (filters?.status) conditions.push(where("status", "==", filters.status));

  let queryRef = conditions.length > 0 ? query(q, ...conditions) : query(q);

  const snapshot = await getDocs(queryRef);

  return snapshot.docs.map((doc) => doc.data() as Property);
};

/**
 * Update a property by ID in the specified inventory stage.
 */
export const updateProperty = async (
  propertyId: string,
  updates: Partial<Property>,
  inventoryStage: InventoryStage = "verified",
  isEdit: boolean = false
) => {
  const collectionName = getCollectionName(inventoryStage);
  const ref = doc(db, collectionName, propertyId);

  // Get current property for change tracking
  const currentSnapshot = await getDoc(ref);
  const currentData = currentSnapshot.exists()
    ? (currentSnapshot.data() as Property)
    : null;

  const updateData = {
    ...updates,
    lastModified: getUnixDateTime(),
  };

  await updateDoc(ref, updateData);

  // Log changes in edit history
  if (currentData && isEdit) {
    const changes = getChangedFields(currentData, updates);

    if (!_.isEmpty(changes)) {
      await addEditHistory(propertyId, { changes }, inventoryStage);
    }
  }
};

/**
 * Update a whole property object by property ID in the specified inventory stage.
 */
export const updateWholeProperty = async (
  propertyId: string,
  updates: Partial<Property>,
  inventoryStage: InventoryStage = "verified"
) => {
  const collectionName = getCollectionName(inventoryStage);
  const ref = doc(db, collectionName, propertyId);

  const updateData = {
    ...updates,
    lastModified: getUnixDateTime(),
  };

  await setDoc(ref, updateData);
};

/**
 * Delete a property by ID from the specified inventory stage.
 */
export const deleteProperty = async (
  propertyId: string,
  inventoryStage: InventoryStage = "verified"
) => {
  const collectionName = getCollectionName(inventoryStage);
  const ref = doc(db, collectionName, propertyId);
  await deleteDoc(ref);
};

/**
 * Assign a KAM to a property in the specified inventory stage.
 */
export const assignKamToProperty = async (
  propertyId: string,
  kamId: string,
  kamName: string,
  inventoryStage: InventoryStage = "verified"
) => {
  await updateProperty(
    propertyId,
    { kamId, kamName, kamStatus: "assigned" },
    inventoryStage
  );
};

/**
 * Change QC status of a property in the specified inventory stage.
 */
export const updateQcStatus = async (
  propertyId: string,
  kamStatus: string,
  dataStatus: string,
  stage: string,
  inventoryStage: InventoryStage = "verified"
) => {
  await updateProperty(
    propertyId,
    { kamStatus, dataStatus, stage },
    inventoryStage
  );
};

/**
 * Search properties by agent phone number, property name, or cpId in the specified inventory stage.
 */
export const searchProperties = async (
  field: "agentPhoneNumber" | "propertyName" | "cpId",
  value: string,
  inventoryStage: InventoryStage = "verified"
) => {
  const collectionName = getCollectionName(inventoryStage);
  const q = query(collection(db, collectionName), where(field, "==", value));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Property);
};

/**
 * Get recent properties from the specified inventory stage (sorted by added date).
 */
export const getRecentProperties = async (
  limitCount = 10,
  inventoryStage: InventoryStage = "verified"
) => {
  const collectionName = getCollectionName(inventoryStage);
  const q = query(
    collection(db, collectionName),
    orderBy("added", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Property);
};

/**
 * Add an edit history record to the property's subcollection.
 */
export const addEditHistory = async (
  propertyId: string,
  editData: {
    changes: Record<string, any>; // Object with field names as keys and new values
  },
  inventoryStage: InventoryStage = "verified"
): Promise<string> => {
  const collectionName = getCollectionName(inventoryStage);
  const timestamp = getUnixDateTime();
  const editId = timestamp.toString();
  const historyRef = doc(db, collectionName, propertyId, "editHistory", editId);

  const editRecord: EditHistoryRecord = {
    editId,
    timestamp,
    changes: editData.changes,
  };

  await setDoc(historyRef, editRecord);

  return editId;
};

/**
 * Get edit history for a property from the specified inventory stage.
 */
export const getEditHistory = async (
  propertyId: string,
  inventoryStage: InventoryStage = "verified",
  limitCount?: number
): Promise<EditHistoryRecord[]> => {
  const collectionName = getCollectionName(inventoryStage);
  const historyRef = collection(db, collectionName, propertyId, "editHistory");

  let q = query(historyRef, orderBy("timestamp", "desc"));

  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (doc) =>
      ({
        editId: doc.id,
        ...doc.data(),
      } as EditHistoryRecord)
  );
};

/**
 * Test function to validate snapshot functionality for the specified inventory stage
 */
export const testSnapshotConnection = async (
  inventoryStage: InventoryStage = "verified"
): Promise<{
  success: boolean;
  message: string;
  propertyIds?: string[];
}> => {
  try {
    // First, get some property IDs to test with
    const recentProperties = await getRecentProperties(3, inventoryStage);

    if (recentProperties.length === 0) {
      return {
        success: false,
        message: `No properties found in ${inventoryStage} database to test with`,
      };
    }

    const propertyIds = recentProperties.map((p) => p.propertyId);

    // Test single property subscription
    return new Promise((resolve) => {
      const testPropertyId = propertyIds[0];
      let updateReceived = false;

      const unsubscribe = subscribeToPropertyById(
        testPropertyId,
        (property) => {
          updateReceived = true;
          unsubscribe();

          resolve({
            success: true,
            message: `Snapshot working correctly for property ${testPropertyId} in ${inventoryStage} inventory`,
            propertyIds,
          });
        },
        inventoryStage,
        (error) => {
          console.error("Test snapshot error:", error);
          unsubscribe();

          resolve({
            success: false,
            message: `Snapshot error: ${error.message}`,
          });
        }
      );

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!updateReceived) {
          unsubscribe();
          resolve({
            success: false,
            message:
              "Snapshot test timed out - no updates received within 10 seconds",
          });
        }
      }, 10000);
    });
  } catch (error) {
    console.error("Snapshot test error:", error);
    return {
      success: false,
      message: `Test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Export types for use in other files
export type { InventoryStage, EditHistoryRecord };
