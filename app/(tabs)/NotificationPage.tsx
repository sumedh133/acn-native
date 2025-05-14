import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

const { width } = Dimensions.get('window');

interface NotificationPageProps {
  // You can add props here if needed in the future
}

const NotificationPage: React.FC<NotificationPageProps> = () => {
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, 'notification_page_view', {
        event_category: 'notifications',
        event_label: 'coming_soon',
        page_status: 'under_development',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging notification page view:', error);
    }
  }, [userType]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.contentContainer}>
        {/* <Image 
          source={require('../assets/notification-icon.png')} 
          style={styles.image}
          // Fallback if image doesn't exist
          onError={(e) => {
            console.log('Image could not be loaded');
            try {
              logEvent(analytics, 'notification_image_error', {
                event_category: 'errors',
                event_label: 'image_load_failed',
                user_type: userType
              });
            } catch (error) {
              console.error('Error logging image error:', error);
            }
          }}
        /> */}
        
        <Text style={styles.title}>Coming Soon</Text>
        
        <Text style={styles.subtitle}>
          We're working hard to bring you notifications.
          Stay tuned for updates!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 24,
    tintColor: '#AAAAAA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    lineHeight: 24,
  },
});

export default NotificationPage;