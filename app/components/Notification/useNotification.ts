import messaging from "@react-native-firebase/messaging";
import * as firebaseMessaging from "@react-native-firebase/messaging";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { PermissionsAndroid, Platform } from "react-native";
export default function useNotification() {
  const cpId =
    useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;

  const requestUserPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted === "granted") {
        console.log("GRANTED");
      } else {
        console.log("NOT GRANTED");
      }
    } else {
      try {
        const authStatus = await messaging().requestPermission();

        console.log(authStatus, "hey")
        const enabled =
          authStatus === firebaseMessaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === firebaseMessaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', enabled);
        }
      } catch (error) {
        console.error("Error requesting iOS permission:", error);
      }
    }
  };

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
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
