import messaging from "@react-native-firebase/messaging";
import * as firebaseMessaging from "@react-native-firebase/messaging";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { PermissionsAndroid, Platform } from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

export default function useNotification() {
  const cpId =
    useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  const requestUserPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        
        logEvent(analytics, 'notification_permission_request', {
          event_category: 'notifications',
          event_label: 'permission',
          platform: 'android',
          status: granted,
          user_type: userType
        });

        if (granted === "granted") {
          console.log("GRANTED");
        } else {
          console.log("NOT GRANTED");
        }
      } else {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === firebaseMessaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === firebaseMessaging.AuthorizationStatus.PROVISIONAL;

        logEvent(analytics, 'notification_permission_request', {
          event_category: 'notifications',
          event_label: 'permission',
          platform: 'ios',
          status: enabled ? 'granted' : 'denied',
          auth_status: authStatus,
          user_type: userType
        });

        if (enabled) {
          console.log('Authorization status:', enabled);
        }
      }
    } catch (error) {
      logEvent(analytics, 'notification_permission_error', {
        event_category: 'notifications',
        event_label: 'error',
        platform: Platform.OS,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        user_type: userType
      });
      console.error("Error requesting permission:", error);
    }
  };

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      const docRef = doc(db, "agents", cpId);
      await updateDoc(docRef, {
        fsmToken: arrayUnion(token),
      });

      logEvent(analytics, 'fcm_token_refresh', {
        event_category: 'notifications',
        event_label: 'success',
        token_updated: true,
        user_type: userType
      });

    } catch (error) {
      logEvent(analytics, 'fcm_token_error', {
        event_category: 'notifications',
        event_label: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        user_type: userType
      });
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
