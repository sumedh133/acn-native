import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Dimensions, SafeAreaView } from "react-native";
import 'react-native-reanimated';
import '../global.css';
import ReduxProvider from '@/providers/ReduxProvider';
import LayoutApp from "./_layoutApp";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  // Function to calculate dynamic top margin based on screen dimensions and orientation
  // const calculateTopMargin = () => {
  //   const { height, width } = Dimensions.get('window');
  //   const isLandscape = width > height;

  //   // Different margins based on device type and orientation
  //   if (Platform.OS === 'ios') {
  //     // iOS specific margins
  //     return isLandscape ? 0.01*height : 0.06*height;
  //   } else {
  //     // Android specific margins
  //     return isLandscape ? 0.01*height : 0.04*height;
  //   }
  // };

  // Update top margin when dimensions change (e.g., rotation)
  useEffect(() => {
    const updateMargin = () => {
      // setTopMargin(calculateTopMargin());
    };

    // Set initial margin
    updateMargin();

    // Add event listener for dimension changes
    const dimensionsSubscription = Dimensions.addEventListener('change', updateMargin);

    // Clean up
    return () => {
      dimensionsSubscription.remove();
    };
  }, []);

  return (
    <ReduxProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <LayoutApp />
        </SafeAreaView>
      </SafeAreaProvider>
    </ReduxProvider>
  );
}