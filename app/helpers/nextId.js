import { doc, getDoc, updateDoc, runTransaction } from "firebase/firestore";
import { db } from "../config/firebase"; // Ensure correct path to your firebase config

/**
 * Generate the last ID and next ID based on the document data.
 * @param {Object} data - The document data { label, prefix, count }.
 * @returns {Object} - An object containing the lastId, nextId, updated prefix, and updated count.
 */
const generateNextId = (data) => {
  const { label, prefix, count } = data;

  const padLength = label === "P" ? 4 : 3;
  // Generate last ID
  const lastId = `${label}${prefix}${count.toString().padStart(padLength, "0")}`;

  // Update prefix and count for the next ID
  let newCount = count + 1;
  let newPrefix = prefix;

  if (newCount > (label === "P" ? 9999 : 999)) {
    // Reset count and increment prefix
    newCount = 1;
    if (prefix === "") {
      newPrefix = "A";
    } else {
      newPrefix = String.fromCharCode(prefix.charCodeAt(0) + 1);
    }
  }

  // Generate next ID
  const nextId = `${label}${newPrefix}${newCount.toString().padStart(padLength, "0")}`;

  return { lastId, nextId, updatedPrefix: newPrefix, updatedCount: newCount };
};

/**
 * Function to handle the entire flow of fetching, generating, and updating the ID.
 * @param {string} type - The document ID (e.g., "lastKamId" or "lastCpId").
 * @returns {Object} - An object containing the lastId and nextId.
 */
const handleIdGeneration = async (type, retries = 3) => {
  try {
    const docRef = doc(db, "acn-admin", type);

    return await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Document with type ${type} does not exist.`);
      }

      const data = docSnap.data();
      const { lastId, nextId, updatedPrefix, updatedCount } =
        generateNextId(data);

      // Update Firestore within the transaction
      transaction.update(docRef, {
        prefix: updatedPrefix,
        count: updatedCount,
      });

      return { lastId, nextId };
    });
  } catch (error) {
    if (retries > 0) {
      console.warn(`Transaction failed, retrying... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1000ms (1 second) before retry
      return handleIdGeneration(type, retries - 1);
    } else {
      console.error(
        "Transaction failed after multiple retries:",
        error.message,
      );
      throw new Error("ID generation failed. Please try again.");
    }
  }
};

export { handleIdGeneration };
