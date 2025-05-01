import { useState, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { getMessaging } from "@react-native-firebase/messaging";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { PermissionsAndroid } from 'react-native';

// Define custom notification types
export interface CustomNotification {
  id?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: 'order' | 'message' | 'promotion' | 'system';
}

// Type guard for CustomNotification
function isCustomNotification(obj: any): obj is CustomNotification {
  return (
    typeof obj === 'object' && 
    obj !== null && 
    typeof obj.title === 'string' && 
    typeof obj.body === 'string'
  );
}

export default function useNotification() {
  const cpId = useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Request notification permissions
  const requestUserPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      try {
        const authStatus = await messaging().requestPermission();
        return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
      } catch (error) {
        console.error('iOS permission request error:', error);
        return false;
      }
    }
    return false;
  };

  // Get and store FCM token
  const getToken = async (): Promise<string | null> => {
    try {
      const token = await getMessaging().getToken();
      setFcmToken(token);

      if (cpId) {
        const docRef = doc(db, "agents", cpId);
        await updateDoc(docRef, { fsm: token });
      }

      return token;
    } catch (error) {
      console.error("Failed to get FCM Token", error);
      return null;
    }
  };

  // Send custom notification to Firestore
  const sendCustomNotification = async (notification: CustomNotification): Promise<string | null> => {
    try {
      // Store notification in Firestore
      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, {
        ...notification,
        createdAt: new Date(),
        recipientId: cpId,
        read: false
      });

      return docRef.id;
    } catch (error) {
      console.error("Error sending custom notification:", error);
      return null;
    }
  };

  // Convert RemoteMessage to CustomNotification
  const convertRemoteMessageToCustomNotification = (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): CustomNotification | null => {
    if (!remoteMessage.notification) return null;

    return {
      title: remoteMessage.notification.title ?? '',
      body: remoteMessage.notification.body ?? '',
      data: remoteMessage.data,
      type: remoteMessage.data?.type as CustomNotification['type']
    };
  };

  // Convert PushNotification to CustomNotification
  // const convertPushNotificationToCustomNotification = (
  //   notification: ReceivedNotification
  // ): CustomNotification => {
  //   return {
  //     title: notification.title ?? '',
  //     body: notification.message ?? '',
  //     data: notification.data
  //   };
  // };

  // Handle incoming foreground notifications
  // const handleForegroundNotifications = () => {
  //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
  //     const customNotification = convertRemoteMessageToCustomNotification(remoteMessage);
      
  //     if (customNotification) {
  //       if (Platform.OS === 'ios') {
  //         PushNotificationIOS.presentLocalNotification({
  //           alertTitle: customNotification.title,
  //           alertBody: customNotification.body,
  //           userInfo: customNotification.data
  //         });
  //       } else {
  //         PushNotification.localNotification({
  //           title: customNotification.title,
  //           message: customNotification.body,
  //           userInfo: customNotification.data
  //         });
  //       }
  //     }
  //   });

  //   return unsubscribe;
  // };

  // Handle notification click/open
  const handleNotificationClick = (notification: CustomNotification) => {
    // Handle different notification types
    switch (notification.type) {
      case 'order':
        // Navigate to order details
        // navigation.navigate('OrderDetails', { orderId: notification.data?.orderId });
        break;
      case 'message':
        // Open chat screen
        // navigation.navigate('Chat', { chatId: notification.data?.chatId });
        break;
      case 'promotion':
        // Open promotional link
        if (notification.data?.promoLink) {
          Linking.openURL(notification.data.promoLink).catch(err => {
            console.error('Error opening promo link:', err);
          });
        }
        break;
      case 'system':
        // Handle system notifications (maybe open app settings)
        break;
      default:
        // Default action
        break;
    }
  };

  // Setup notification handlers
  useEffect(() => {
    // Request permissions and get token
    requestUserPermission();
    getToken();

    // Handle background notification clicks
    const backgroundSubscription = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        const customNotification = convertRemoteMessageToCustomNotification(remoteMessage);
        if (customNotification) {
          handleNotificationClick(customNotification);
        }
      }
    );

    // Handle initial notification if app was closed
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          const customNotification = convertRemoteMessageToCustomNotification(remoteMessage);
          if (customNotification) {
            handleNotificationClick(customNotification);
          }
        }
      });

    // Handle foreground notifications
    // const unsubscribeForeground = handleForegroundNotifications();

    // Configure local notification settings
    // PushNotification.configure({
    //   onNotification: (notification: ReceivedNotification) => {
    //     // Check if this is a user interaction
    //     if (notification.userInteraction) {
    //       const customNotification = convertPushNotificationToCustomNotification(notification);
    //       handleNotificationClick(customNotification);
    //     }
    //   },
    //   requestPermissions: true
    // });

    // Cleanup subscriptions
    return () => {
      // unsubscribeForeground();
      backgroundSubscription();
    };
  }, []);

  return {
    fcmToken,
    requestPermission: requestUserPermission,
    refreshToken: getToken,
    sendCustomNotification,
    handleNotificationClick
  };
}

// Example usage in a component
/*
function NotificationExample() {
  const { 
    fcmToken, 
    sendCustomNotification, 
    handleNotificationClick 
  } = useNotification();

  const sendOrderNotification = async () => {
    const notification: CustomNotification = {
      title: 'New Order',
      body: 'You have a new order!',
      type: 'order',
      data: {
        orderId: 'order-123'
      }
    };

    const notificationId = await sendCustomNotification(notification);
  };

  return (
    <View>
      <Text>FCM Token: {fcmToken}</Text>
      <Button 
        title="Send Notification" 
        onPress={sendOrderNotification} 
      />
    </View>
  );
}
*/