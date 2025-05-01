// // FirebaseNotificationService.ts
// import { Platform, PermissionsAndroid } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
// import notifee, {
//   AndroidImportance,
//   AndroidStyle,
//   AndroidVisibility,
//   EventType,
//   InitialNotification,
//   AuthorizationStatus
// } from '@notifee/react-native';

// // Interface for notification data
// export interface NotificationData {
//   title: string;
//   body: string;
//   data?: Record<string, string>;
//   imageUrl?: string;
//   channelId?: string;
//   color?: string;
//   badge?: number;
//   subtitle?: string;
//   bigText?: string;
//   largeIcon?: string;
//   timestamp?: number;
//   showTimestamp?: boolean;
//   actions?: Array<{
//     title: string;
//     pressAction: {
//       id: string;
//     };
//   }>;
// }

// // Interface for FCM token
// export interface FCMTokenResponse {
//   token: string | null;
//   error?: Error;
// }

// // Default channel configuration
// const DEFAULT_CHANNEL_ID = 'default-channel-id';

// class FirebaseNotificationService {
//   private hasPermission: boolean = false;
//   private fcmToken: string | null = null;
//   private initialNotification: InitialNotification | null = null;

//   constructor() {
//     this.initialize();
//   }

//   /**
//    * Initialize the Firebase Notification Service
//    */
//   private async initialize(): Promise<void> {
//     try {
//       // Create default notification channel
//       await this.createDefaultChannel();
      
//       // Check for permission
//       this.hasPermission = await this.checkPermission();
      
//       // Setup notification listeners
//       if (this.hasPermission) {
//         // Get FCM token
//         this.fcmToken = await this.getFCMToken();
        
//         // Setup foreground handler
//         this.setupForegroundHandler();
        
//         // Setup background handler
//         this.setupBackgroundHandler();

//         // Setup notification event listeners
//         this.setupNotificationListeners();
        
//         // Check for initial notification (if app was opened via notification)
//         this.checkInitialNotification();
//       }
//     } catch (error) {
//       console.error('Error initializing notification service:', error);
//     }
//   }

//   /**
//    * Create default notification channel (Android only)
//    */
//   private async createDefaultChannel(): Promise<void> {
//     if (Platform.OS === 'android') {
//       await notifee.createChannel({
//         id: DEFAULT_CHANNEL_ID,
//         name: 'Default Channel',
//         lights: true,
//         vibration: true,
//         importance: AndroidImportance.HIGH,
//       });
//     }
//   }

//   /**
//    * Check if notification permissions are granted
//    */
//   private async checkPermission(): Promise<boolean> {
//     try {
//       // For iOS, request notification permission
//       if (Platform.OS === 'ios') {
//         const settings = await notifee.requestPermission({
//           sound: true,
//           alert: true,
//           badge: true,
//           criticalAlert: false,
//           provisional: false,
//         });
        
//         return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
//                settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
//       } 
//       // For Android 13+ (API level 33+), request POST_NOTIFICATIONS permission
//       else if (Platform.OS === 'android' && Platform.Version >= 33) {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       }
      
//       // Earlier Android versions don't need runtime permission
//       return true;
//     } catch (error) {
//       console.error('Error checking notification permission:', error);
//       return false;
//     }
//   }

//   /**
//    * Get the FCM token for the device
//    */
//   async getFCMToken(): Promise<string | null> {
//     try {
//       if (!this.hasPermission) {
//         console.warn('Cannot get FCM token: No notification permission');
//         return null;
//       }

//       const token = await messaging().getToken();
//       console.log('FCM Token:', token);
//       return token;
//     } catch (error) {
//       console.error('Error getting FCM token:', error);
//       return null;
//     }
//   }

//   /**
//    * Setup foreground message handler
//    */
//   private setupForegroundHandler(): void {
//     const unsubscribe = messaging().onMessage(async remoteMessage => {
//       console.log('Foreground message received:', remoteMessage);
      
//       // Display notification while app is in foreground
//       await this.displayNotification({
//         title: remoteMessage.notification?.title || 'New Notification',
//         body: remoteMessage.notification?.body || '',
//         data: remoteMessage.data as Record<string, string>,
//         // imageUrl: Platform.OS === 'android' ?
//         // remoteMessage.notification?.android?.imageUrl 
//         //   : remoteMessage.notification?.ios?.imageUrl,
//       });
//     });
    
//     // Store unsubscribe function for cleanup if needed
//     // return unsubscribe;
//   }

//   /**
//    * Setup background message handler
//    */
//   private setupBackgroundHandler(): void {
//     // Set the background handler
//     messaging().setBackgroundMessageHandler(async remoteMessage => {
//       console.log('Background message received:', remoteMessage);
      
//       // For background messages on Android, the system already shows the notification
//       // On iOS, we need to handle displaying ourselves
//       if (Platform.OS === 'ios') {
//         await this.displayNotification({
//           title: remoteMessage.notification?.title || 'New Notification',
//           body: remoteMessage.notification?.body || '',
//           data: remoteMessage.data as Record<string, string>,
//         //   imageUrl: remoteMessage.notification?.ios?.imageUrl,
//         });
//       }
//     });
//   }

//   /**
//    * Setup notification event listeners
//    */
//   private setupNotificationListeners(): void {
//     // Handle notification events (press, dismiss, etc.)
//     const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
//       switch (type) {
//         case EventType.PRESS:
//           console.log('User pressed notification', detail.notification);
//           this.handleNotificationPress(detail.notification);
//           break;
          
//         case EventType.DISMISSED:
//           console.log('User dismissed notification', detail.notification);
//           break;
          
//         case EventType.ACTION_PRESS:
//           console.log('User pressed notification action', detail.pressAction);
//           this.handleActionPress(detail.pressAction, detail.notification);
//           break;
//       }
//     });

//     // Handle background events
//     notifee.onBackgroundEvent(async ({ type, detail }) => {
//       if (type === EventType.PRESS) {
//         console.log('User pressed notification from background', detail.notification);
//         return this.handleNotificationPress(detail.notification);
//       }
      
//       if (type === EventType.ACTION_PRESS) {
//         console.log('User pressed notification action from background', detail.pressAction);
//         return this.handleActionPress(detail.pressAction, detail.notification);
//       }
//     });
    
//     // Check for notification that opened the app
//     notifee.getInitialNotification().then(initialNotification => {
//       if (initialNotification) {
//         console.log('App opened by notification', initialNotification);
//         this.initialNotification = initialNotification;
//         this.handleNotificationPress(initialNotification.notification);
//       }
//     });
//   }

//   /**
//    * Check if the app was opened from a notification (Firebase)
//    */
//   private async checkInitialNotification(): Promise<void> {
//     try {
//       // Get notification that opened the app from a quit state
//       const remoteMessage = await messaging().getInitialNotification();
      
//       if (remoteMessage) {
//         console.log('App opened by Firebase notification:', remoteMessage);
//         // If the Notifee handler didn't already process this, display it
//         if (!this.initialNotification) {
//           await this.displayNotification({
//             title: remoteMessage.notification?.title || 'New Notification',
//             body: remoteMessage.notification?.body || '',
//             data: remoteMessage.data as Record<string, string>,
//             // imageUrl: Platform.OS === 'android' 
//             //   ? remoteMessage.notification?.android?.imageUrl 
//             //   : remoteMessage.notification?.ios?.imageUrl,
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error checking initial notification:', error);
//     }
//   }

//   /**
//    * Handle notification press
//    */
//   private handleNotificationPress(notification: any): void {
//     // Extract notification data
//     const data = notification?.data || {};
//     console.log('Notification pressed with data:', data);
    
//     // Here you can add custom logic based on notification data
//     // For example, navigate to specific screens
    
//     // Example:
//     // if (data.type === 'chat') {
//     //   // Navigate to chat screen with the given ID
//     //   navigate('ChatScreen', { chatId: data.chatId });
//     // }
//   }

//   /**
//    * Handle notification action press
//    */
//   private handleActionPress(pressAction: any, notification: any): void {
//     console.log(
//       `Action ${pressAction.id} pressed on notification`,
//       notification?.data
//     );
    
//     // Handle different actions based on the pressAction.id
//     // Example:
//     // switch (pressAction.id) {
//     //   case 'mark-as-read':
//     //     // Mark message as read
//     //     break;
//     //   case 'reply':
//     //     // Open reply interface
//     //     break;
//     // }
//   }

//   /**
//    * Display a local notification
//    */
//   async displayNotification({
//     title,
//     body,
//     data = {},
//     imageUrl,
//     channelId = DEFAULT_CHANNEL_ID,
//     color = '#1677FF',
//     badge,
//     subtitle,
//     bigText,
//     largeIcon,
//     timestamp,
//     showTimestamp = false,
//     actions = [],
//   }: NotificationData): Promise<string> {
//     try {
//       // Build the notification
//       const notificationConfig: any = {
//         title,
//         body,
//         data,
//         android: {
//           channelId,
//           color,
//           largeIcon: largeIcon,
//           timestamp: timestamp || Date.now(),
//           showTimestamp,
//           pressAction: {
//             id: 'default',
//           },
//         },
//         ios: {
//           subtitle,
//           threadId: channelId,
//           badgeCount: badge,
//           sound: 'default',
//         },
//       };
      
//       // Add big text if provided
//       if (bigText) {
//         notificationConfig.android.style = {
//           type: AndroidStyle.BIGTEXT,
//           text: bigText,
//         };
//       }
      
//       // Add image if provided
//       if (imageUrl) {
//         notificationConfig.android.style = {
//           type: AndroidStyle.BIGPICTURE,
//           picture: imageUrl,
//           largeIcon: largeIcon || imageUrl,
//         };
//         notificationConfig.ios.attachments = [
//           {
//             url: imageUrl,
//           },
//         ];
//       }
      
//       // Add actions if provided
//       if (actions && actions.length > 0) {
//         notificationConfig.android.actions = actions;
//         notificationConfig.ios.categoryId = 'actions';
//       }
      
//       // Display the notification
//       return await notifee.displayNotification(notificationConfig);
//     } catch (error) {
//       console.error('Error displaying notification:', error);
//       throw error;
//     }
//   }

//   /**
//    * Create notification channel (Android only)
//    */
//   async createChannel({
//     channelId,
//     channelName,
//     description = '',
//     importance = AndroidImportance.HIGH,
//     lights = true,
//     vibration = true,
//     badge = true,
//     visibility = AndroidVisibility.PRIVATE,
//   }: {
//     channelId: string;
//     channelName: string;
//     description?: string;
//     importance?: AndroidImportance;
//     lights?: boolean;
//     vibration?: boolean;
//     badge?: boolean;
//     visibility?: AndroidVisibility;
//   }): Promise<void> {
//     if (Platform.OS === 'android') {
//       await notifee.createChannel({
//         id: channelId,
//         name: channelName,
//         description,
//         importance,
//         lights,
//         vibration,
//         badge,
//         visibility,
//       });
//     }
//   }

//   /**
//    * Cancel a notification by ID
//    */
//   async cancelNotification(notificationId: string): Promise<void> {
//     await notifee.cancelNotification(notificationId);
//   }

//   /**
//    * Cancel all notifications
//    */
//   async cancelAllNotifications(): Promise<void> {
//     await notifee.cancelAllNotifications();
//   }

//   /**
//    * Subscribe to a topic
//    */
//   async subscribeToTopic(topic: string): Promise<boolean> {
//     try {
//       await messaging().subscribeToTopic(topic);
//       console.log(`Subscribed to topic: ${topic}`);
//       return true;
//     } catch (error) {
//       console.error(`Error subscribing to topic ${topic}:`, error);
//       return false;
//     }
//   }

//   /**
//    * Unsubscribe from a topic
//    */
//   async unsubscribeFromTopic(topic: string): Promise<boolean> {
//     try {
//       await messaging().unsubscribeFromTopic(topic);
//       console.log(`Unsubscribed from topic: ${topic}`);
//       return true;
//     } catch (error) {
//       console.error(`Error unsubscribing from topic ${topic}:`, error);
//       return false;
//     }
//   }

//   /**
//    * Get the current FCM token
//    */
//   async getToken(): Promise<FCMTokenResponse> {
//     try {
//       if (!this.hasPermission) {
//         await this.checkPermission();
//       }
      
//       if (!this.hasPermission) {
//         return { token: null, error: new Error('No notification permission') };
//       }
      
//       const token = await messaging().getToken();
//       this.fcmToken = token;
//       return { token };
//     } catch (error) {
//       console.error('Error getting token:', error);
//       return { token: null, error: error instanceof Error ? error : new Error('Unknown error') };
//     }
//   }

//   /**
//    * Request notification permissions explicitly
//    */
//   async requestPermission(): Promise<boolean> {
//     try {
//       this.hasPermission = await this.checkPermission();
//       return this.hasPermission;
//     } catch (error) {
//       console.error('Error requesting notification permission:', error);
//       return false;
//     }
//   }

//   /**
//    * Set badge count (iOS only)
//    */
//   async setBadgeCount(count: number): Promise<void> {
//     if (Platform.OS === 'ios') {
//       await notifee.setBadgeCount(count);
//     }
//   }

//   /**
//    * Get badge count (iOS only)
//    */
//   async getBadgeCount(): Promise<number> {
//     if (Platform.OS === 'ios') {
//       return await notifee.getBadgeCount();
//     }
//     return 0;
//   }

//   /**
//    * Get all trigger notifications
//    */
//   async getTriggerNotifications(): Promise<any[]> {
//     return await notifee.getTriggerNotifications();
//   }

//   /**
//    * Schedule a notification for future delivery
//    */
//   async scheduleNotification({
//     title,
//     body,
//     data = {},
//     imageUrl,
//     channelId = DEFAULT_CHANNEL_ID,
//     trigger,
//     ...rest
//   }: NotificationData & {
//     trigger: {
//       type: 'timestamp' | 'interval';
//       timestamp?: number;
//       interval?: number;
//       repeatFrequency?: 'hourly' | 'daily' | 'weekly';
//       alarmManager?: boolean;
//     };
//   }): Promise<string> {
//     try {
//       // Build the notification
//       const notificationConfig: any = {
//         title,
//         body,
//         data,
//         android: {
//           channelId,
//           ...rest.color && { color: rest.color },
//           ...rest.largeIcon && { largeIcon: rest.largeIcon },
//           pressAction: {
//             id: 'default',
//           },
//         },
//         ios: {
//           ...rest.subtitle && { subtitle: rest.subtitle },
//           threadId: channelId,
//           ...rest.badge && { badgeCount: rest.badge },
//           sound: 'default',
//         },
//       };
      
//       // Add big text if provided
//       if (rest.bigText) {
//         notificationConfig.android.style = {
//           type: AndroidStyle.BIGTEXT,
//           text: rest.bigText,
//         };
//       }
      
//       // Add image if provided
//       if (imageUrl) {
//         notificationConfig.android.style = {
//           type: AndroidStyle.BIGPICTURE,
//           picture: imageUrl,
//           largeIcon: rest.largeIcon || imageUrl,
//         };
//         notificationConfig.ios.attachments = [
//           {
//             url: imageUrl,
//           },
//         ];
//       }
      
//       // Add actions if provided
//       if (rest.actions && rest.actions.length > 0) {
//         notificationConfig.android.actions = rest.actions;
//         notificationConfig.ios.categoryId = 'actions';
//       }
      
//       // Create the trigger
//       let triggerConfig: any = {};
      
//       if (trigger.type === 'timestamp') {
//         triggerConfig = {
//           type: trigger.type,
//           timestamp: trigger.timestamp || Date.now() + 3600000, // Default 1 hour from now
//         };
//       } else if (trigger.type === 'interval') {
//         triggerConfig = {
//           type: trigger.type,
//           interval: trigger.interval || 3600000, // Default 1 hour
//           ...trigger.repeatFrequency && { repeatFrequency: trigger.repeatFrequency },
//         };
        
//         // Use alarm manager for precision on Android
//         if (Platform.OS === 'android' && trigger.alarmManager) {
//           triggerConfig.alarmManager = true;
//         }
//       }
      
//       // Schedule the notification
//       return await notifee.createTriggerNotification(notificationConfig, triggerConfig);
//     } catch (error) {
//       console.error('Error scheduling notification:', error);
//       throw error;
//     }
//   }
// }

// // Export as singleton
// export default new FirebaseNotificationService();