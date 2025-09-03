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
  increment,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../../config/firebase"; // your Firebase config
import { Property } from "../../types";

// Firestore Collections
const ADMIN_COLLECTION = "acn-admin";
const INVENTORY_COLLECTION = "acnTestProperties";

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
 * Create a new property in `acnQCInventories`.
 */
export const createProperty = async (
  property: Omit<Property, "propertyId">
) => {
  const propertyId = await generatePropertyId();

  const ref = doc(collection(db, INVENTORY_COLLECTION), propertyId);

  const newProperty: Property = {
    ...property,
    propertyId,
    added: Date.now() / 1000,
    lastModified: Date.now() / 1000,
    status: property.status || "active",
  };

  await setDoc(ref, newProperty);

  return newProperty;
};

/**
 * Fetch a property by ID.
 */
export const getPropertyById = async (
  propertyId: string
): Promise<Property | null> => {
  const ref = doc(db, INVENTORY_COLLECTION, propertyId);
  const snapshot = await getDoc(ref);

  return snapshot.exists() ? (snapshot.data() as Property) : null;
};

/**
 * Listen to real-time updates for a property by ID.
 */
export const subscribeToPropertyById = (
  propertyId: string,
  onUpdate: (property: Property | null) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = doc(db, INVENTORY_COLLECTION, propertyId);

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
 * Listen to real-time updates for multiple properties by IDs.
 */
export const subscribeToPropertiesByIds = (
  propertyIds: string[],
  onUpdate: (properties: (Property | null)[]) => void,
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
 * Fetch all properties (optionally filtered).
 */
export const getAllProperties = async (filters?: {
  listingType?: "resale" | "rental";
  propertyType?: "residential" | "commercial";
  status?: string;
}) => {
  let q = collection(db, INVENTORY_COLLECTION);

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
 * Update a property by ID.
 */
export const updateProperty = async (
  propertyId: string,
  updates: Partial<Property>
) => {
  const ref = doc(db, INVENTORY_COLLECTION, propertyId);

  await updateDoc(ref, {
    ...updates,
    lastModified: Date.now() / 1000,
  });
};

/**
 *dia Update a whole property object by property ID.
 */
export const updateWholeProperty = async (
  propertyId: string,
  updates: Partial<Property>
) => {
  const ref = doc(db, INVENTORY_COLLECTION, propertyId);

  await setDoc(ref, {
    ...updates,
    lastModified: Date.now() / 1000,
  });
};

/**
 * Delete a property by ID.
 */
export const deleteProperty = async (propertyId: string) => {
  const ref = doc(db, INVENTORY_COLLECTION, propertyId);
  await deleteDoc(ref);
};

/**
 * Assign a KAM to a property.
 */
export const assignKamToProperty = async (
  propertyId: string,
  kamId: string,
  kamName: string
) => {
  await updateProperty(propertyId, { kamId, kamName, kamStatus: "assigned" });
};

/**
 * Change QC status of a property.
 */
export const updateQcStatus = async (
  propertyId: string,
  kamStatus: string,
  dataStatus: string,
  stage: string
) => {
  await updateProperty(propertyId, { kamStatus, dataStatus, stage });
};

/**
 * Search properties by agent phone number or property name.
 */
export const searchProperties = async (
  field: "agentPhoneNumber" | "propertyName" | "cpId",
  value: string
) => {
  const q = query(
    collection(db, INVENTORY_COLLECTION),
    where(field, "==", value)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Property);
};

/**
 * Get recent properties (sorted by added date).
 */
export const getRecentProperties = async (limitCount = 10) => {
  const q = query(
    collection(db, INVENTORY_COLLECTION),
    orderBy("added", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Property);
};

/**
 * Test function to validate snapshot functionality
 */
export const testSnapshotConnection = async (): Promise<{
  success: boolean;
  message: string;
  propertyIds?: string[];
}> => {
  try {
    // First, get some property IDs to test with
    const recentProperties = await getRecentProperties(3);

    if (recentProperties.length === 0) {
      return {
        success: false,
        message: "No properties found in database to test with",
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
            message: `Snapshot working correctly for property ${testPropertyId}`,
            propertyIds,
          });
        },
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
