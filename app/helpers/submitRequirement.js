import { handleIdGeneration } from "./nextId";
import { getUnixDateTime } from "./getUnixDateTime";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useSelector } from "react-redux";

const generateNextReqId = async () => {
  try {
    const type = "lastReqId"; // Replace with "lastCpId" or others as needed
    const { lastId, nextId } = await handleIdGeneration(type);
    return nextId;
  } catch (error) {
    console.error("Error generating IDs:", error);
    return null;
  }
};

export default async function submitRequirement(userRequirement, cpId) {
  try {
    const timestamp = getUnixDateTime();
    const nextReqId = await generateNextReqId();
    if (!nextReqId) {
      throw new Error(
        "Failed to generate the Requirement ID. Please try again later.",
      );
    }

    const formData = {
      added: timestamp,
      lastModified: timestamp,
      agentCpid: cpId,
      area: userRequirement.area || 0,
      assetType: userRequirement.assetType,
      budget: userRequirement.budget,
      budget: {
        from: userRequirement.budget.from || "", // Convert budgetFrom to a number
        to: userRequirement.budget.to || "", // Convert budgetTo to a number
      },
      configuration: userRequirement.configuration || "",
      marketValue: userRequirement.marketValue,
      propertyName: userRequirement.propertyName,
      requirementDetails: userRequirement.requirementDetails,
      requirementId: nextReqId,
      status: "Pending",
    };

    const docRef = doc(db, "requirements", nextReqId);
    await setDoc(docRef, formData);
    await updateDoc(doc(db, "agents", formData.agentCpid), {
      myRequirements: arrayUnion(nextReqId),
    });
  } catch (error) {
    return error;
  }
}
