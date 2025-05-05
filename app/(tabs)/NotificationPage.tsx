import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface NotificationPageProps {
  // You can add props here if needed in the future
}

const NotificationPage: React.FC<NotificationPageProps> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      
      
      <View style={styles.contentContainer}>
        {/* <Image 
          source={require('../assets/notification-icon.png')} 
          style={styles.image}
          // Fallback if image doesn't exist
          onError={(e) => console.log('Image could not be loaded')}
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