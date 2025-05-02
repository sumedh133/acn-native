import { getMessaging } from "@react-native-firebase/messaging";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { PermissionsAndroid } from "react-native";
export default function useNotification() {
  const cpId =
    useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;

  const requestUserPermission = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted === "granted") {
      console.log("GRANTED");
    } else {
      console.log("NOT GRANTED");
    }
  };

  const getToken = async () => {
    try {
      const token = await getMessaging().getToken();
      const docRef = doc(db, "agents", cpId);
      await updateDoc(docRef, {
        fsmToken: arrayUnion(token),
      });
    } catch (error) {
      console.error("Failed to get FCM Token", error);
    }
    return "";
  };

  // Optionally return any functions you might want to expose
  return {
    refreshToken: getToken,
    requestPermission: requestUserPermission,
  };
}
