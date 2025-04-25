import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { setMonthlyCredit } from "@/store/slices/agentSlice";

/**
 * Deducts 1 credit from the user's monthly credits.
 * @param {string} phoneNumber - The phone number of the agent.
 * @param {number} currentCredits - The current number of monthly credits.
 * @param {Function} dispatch - Redux dispatch function to update state.
 * @returns {Promise<void>} - Resolves when the operation completes.
 */
const deductMonthlyCredit = async (phoneNumber, currentCredits, dispatch) => {
  if (!phoneNumber) {
    console.error("Phone number is required.");
    return;
  }

  if (typeof currentCredits !== "number" || currentCredits <= 0) {
    console.error("Invalid credit value. Cannot deduct.");
    return;
  }

  const finalCredit = Math.max(0, currentCredits - 1);

  try {
    const agentsCollection = collection(db, "agents");
    const q = query(agentsCollection, where("phonenumber", "==", phoneNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error(`No document found for phone number: ${phoneNumber}`);
      return;
    }

    const docRef = querySnapshot.docs[0].ref;

    await updateDoc(docRef, { monthlyCredits: finalCredit });

    dispatch(setMonthlyCredit(finalCredit));
  } catch (error) {
    console.error("Error deducting credits:", error.message || error);
    throw error;
  }
};

export default deductMonthlyCredit;
