import { handleIdGeneration } from "./nextId";
import { getUnixDateTime } from "./getUnixDateTime";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useSelector } from "react-redux";

const generateNextIssueId = async () => {
  try {
    const type = "lastIssueId"; // Replace with "lastCpId" or others as needed
    const { lastId, nextId } = await handleIdGeneration(type);
    return nextId;
  } catch (error) {
    console.error("Error generating IDs:", error);
    return null;
  }
};

export default async function submitIssue(issueReport, cpId) {
  try {
    const timestamp = getUnixDateTime();
    const nextIssueId = await generateNextIssueId();
    if (!nextIssueId) {
      throw new Error(
        "Failed to generate the Issue ID. Please try again later."
      );
    }

    const formData = {
      added: timestamp,
      agentCpid: cpId,
      issueId: nextIssueId,
      ...issueReport,
    };

    const docRef = doc(db, "acnIssues", nextIssueId);
    await setDoc(docRef, formData);

  } catch (error) {
    return error;
  }
}
