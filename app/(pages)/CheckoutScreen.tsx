import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  BackHandler,
  StatusBar
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { RouteProp, useRoute } from '@react-navigation/native';
import PremiumModal from '../modals/PremiumModal';
import PaymentUnsuccessfulModal from '../modals/PaymentUnsuccessfulModal';
import { router } from 'expo-router';
import { RootState } from '@/store/store';

type CheckoutScreenRouteProp = RouteProp<{
  CheckoutScreen: {
    planId?: string;
  };
}>;

/**
 * CheckoutScreen component that uses a WebView to display a web-based checkout experience
 * Fixed to prevent infinite reloading
 */
const CheckoutScreen: React.FC = () => {
  // Refs
  const webViewRef = useRef<WebView>(null);
  
  // Routes and params
  const route = useRoute<CheckoutScreenRouteProp>();
  const planId = route.params?.planId || 'premium';
  
  // Redux state
  const userData = useSelector((state: RootState) => state.agent);
  const {
    docData: { businessName = null, gstNo = null, cpId = null } = {},
    phonenumber: phoneNumber = null
  } = userData || {};
  
  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [webViewCanGoBack, setWebViewCanGoBack] = useState(false);
  
  // Reference to store if we've already processed a result to prevent loops
  const processedResultRef = useRef<{[key: string]: boolean}>({});
  
  // Build the checkout URL with query parameters - memoized to prevent rebuilding
  const checkoutUrl = React.useMemo(() => {
    //const baseUrl = 'https://acnonline.in/CheckoutPage';
    const baseUrl ='https://test-acn-resale-inventories-dde03.web.app/CheckoutPage'
    
    const params = new URLSearchParams();
    params.append('planId', planId);
    
   
    if (phoneNumber) params.append('phoneNumber', phoneNumber);
    if (cpId) params.append('cpId', cpId);
    if (businessName) params.append('businessName', businessName);
    if (gstNo) params.append('gstNo', gstNo);
    
    return `${baseUrl}?${params.toString()}`;
  }, [planId, phoneNumber, cpId, businessName, gstNo]);

 
  useEffect(() => {
    const backAction = () => {
      if (webViewCanGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; 
      }
      return false; 
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [webViewCanGoBack]);

  // Inject user data into WebView - memoized to prevent recreating on each render
  const injectUserData = useCallback((): void => {
    if (!webViewRef.current) return;
    
    const dataScript = `
      window.userPhoneNumber = ${JSON.stringify(phoneNumber || '')};
      window.userCpId = ${JSON.stringify(cpId || '')};
      window.userBusinessName = ${JSON.stringify(businessName || '')};
      window.userGstNo = ${JSON.stringify(gstNo || '')};
      
      // Dispatch a custom event that the web page can listen for
      if (!window.userDataInjected) {
        document.dispatchEvent(new CustomEvent('app:userData', { 
          detail: {
            phoneNumber: window.userPhoneNumber,
            cpId: window.userCpId,
            businessName: window.userBusinessName,
            gstNo: window.userGstNo
          }
        }));
        
        // Set flag to avoid triggering multiple times
        window.userDataInjected = true;
        
        // For backward compatibility
        if (typeof setUserData === 'function') {
          setUserData();
        }
      }
      
      true;
    `;
    
    webViewRef.current.injectJavaScript(dataScript);
  }, [phoneNumber, cpId, businessName, gstNo]);
  
  // JavaScript to inject into the WebView for communication - defined outside render
  const injectedJavaScript = `
    // Function to safely send messages to React Native
    window.sendToApp = function(type, payload = {}) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: type, 
          payload: payload 
        }));
      }
    };
    
    // Flag to prevent duplicate processing
    window.urlParamsProcessed = false;
    
    // Process URL parameters only once
    function checkAndProcessUrlParams() {
      if (window.urlParamsProcessed) return;
      
      const urlParams = new URLSearchParams(window.location.search);
      const result = urlParams.get('result');
      const error = urlParams.get('error');
      
      if (result === 'success') {
        window.sendToApp('PAYMENT_SUCCESS');
        
        // Remove the parameters to prevent reprocessing
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } else if (result === 'failure') {
        window.sendToApp('PAYMENT_FAILED', { error: error || 'Payment failed' });
        
        // Remove the parameters to prevent reprocessing
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
      
      window.urlParamsProcessed = true;
    }
    
    // Listen for page load
    window.addEventListener('load', function() {
      checkAndProcessUrlParams();
    });
    
    // Listen for navigation events
    window.addEventListener('popstate', function(event) {
      window.sendToApp('NAVIGATION_CHANGED', { 
        path: window.location.pathname,
        search: window.location.search,
        url: window.location.href
      });
      
      // Check URL params again after navigation
      checkAndProcessUrlParams();
    });
    
    // Create a global error handler
    window.addEventListener('error', function(e) {
      window.sendToApp('ERROR', { 
        message: e.message,
        filename: e.filename,
        lineno: e.lineno
      });
    });
    
    true;
  `;
  
  
  const retryPayment = (): void => {
    setShowFailedModal(false);
    processedResultRef.current = {};
    
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };
  
 
  const browsePlans = (): void => {
    setShowSuccessModal(false);
    router.push('/(tabs)/properties');
  };
  
  const handleWebViewNavigationStateChange = useCallback((navState: { loading: boolean; url: string; canGoBack: boolean; }): void => {
    
    setWebViewCanGoBack(navState.canGoBack);
   
    try {
      const url = new URL(navState.url);
      const resultKey = `${url.pathname}${url.search}`;
      
      // Only process if we haven't seen this URL before
      if (!processedResultRef.current[resultKey]) {
        const result = url.searchParams.get('result');
        const error = url.searchParams.get('error');
        
        if (result) {
          // Mark as processed to prevent loops
          processedResultRef.current[resultKey] = true;
          
          if (result === 'success') {
            setShowSuccessModal(true);
          } else if (result === 'failure') {
            setLastError(error);
            setShowFailedModal(true);
          }
        }
      }
      
      // Handle loading completed
      if (navState.loading === false) {
        setIsLoading(false);
        
        
        setTimeout(() => {
          injectUserData();
        }, 300);
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    }
  }, [injectUserData]);
  

  const handleMessage = useCallback((event: { nativeEvent: { data: string; }; }): void => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'PAYMENT_SUCCESS':
          setShowSuccessModal(true);
          break;
          
        case 'PAYMENT_FAILED':
          console.log("payment faild");
          setLastError(data.payload?.error || null);
          setShowFailedModal(true);
          break;
          
        case 'ERROR':
          console.error('Web error:', data.payload);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      
      <WebView
        ref={webViewRef}
        source={{ uri: checkoutUrl }}
        style={styles.webView}
        onMessage={handleMessage}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        //injectedJavaScript={injectedJavaScript}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        cacheEnabled={false}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#153E3B" />
            <Text style={styles.loadingText}>Loading checkout page...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          Alert.alert(
            'Connection Error',
            'Failed to load the checkout page. Please check your internet connection and try again.',
            [
              { 
                text: 'Retry', 
                onPress: () => webViewRef.current?.reload() 
              }
            ]
          );
        }}
        originWhitelist={['*']}
      />

      {/* Success Modal */}
      <PremiumModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onBrowsePress={browsePlans}
        planId={planId}
      />

      {/* Failed Payment Modal */}
      <PaymentUnsuccessfulModal
        visible={showFailedModal}
        onClose={() => setShowFailedModal(false)}
        onTryAgain={retryPayment}
        planId={planId}
       
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#153E3B',
    fontWeight: '500',
  },
  webView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default CheckoutScreen;