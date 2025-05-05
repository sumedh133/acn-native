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
import { doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase'; 

type CheckoutScreenRouteProp = RouteProp<{
  CheckoutScreen: {
    planId?: string;
  };
}>;

const CheckoutScreen: React.FC = () => {
  // Refs
  const webViewRef = useRef<WebView>(null);
  
  // Routes and params
  const route = useRoute<CheckoutScreenRouteProp>();
  const planId = route.params?.planId || 'premium';
  

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
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [paymentListenerActive, setPaymentListenerActive] = useState(false);

  useEffect(() => {
    if (!currentTransactionId && cpId) {
      const newTransactionId = "TXN" + Date.now();
      setCurrentTransactionId(newTransactionId);
      console.log("Generated transaction ID:", newTransactionId);
    }
  }, [cpId, currentTransactionId]);
  

  
  
  const checkoutUrl = React.useMemo(() => {
    //const baseUrl = 'https://acnonline.in/CheckoutPage';
    const baseUrl ='https://test-acn-resale-inventories-dde03.web.app/CheckoutPage'
    
    const params = new URLSearchParams();
    params.append('planId', planId);
    
   
    if (phoneNumber) params.append('phoneNumber', phoneNumber);
    if (cpId) params.append('cpId', cpId);
    if (businessName) params.append('businessName', businessName);
    if (gstNo) params.append('gstNo', gstNo);
    if (currentTransactionId) params.append('transactionId', currentTransactionId);
    
    return `${baseUrl}?${params.toString()}`;
  }, [planId, phoneNumber, cpId, businessName, gstNo, currentTransactionId]);

 
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

  useEffect(() => {
    
    if (!currentTransactionId || !cpId || paymentListenerActive) return;
    
    console.log('Setting up payment listener for transaction:', currentTransactionId);
    setPaymentListenerActive(true);
    
    // Create Firebase listener for payment status
    const unsubscribe = onSnapshot(
      doc(db, 'payments', currentTransactionId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const paymentData = docSnapshot.data();
          console.log('Payment status update:', paymentData);
          
          if (paymentData.status === 'PAYMENT_SUCCESS') {
            // Handle successful payment in app
            updateUserSubscription(cpId, planId, paymentData);
            setShowSuccessModal(true);
          } else if (paymentData.status === 'PAYMENT_ERROR' || paymentData.status === 'PAYMENT_FAILED') {
            setLastError(paymentData.failureReason || 'Payment failed');
            setShowFailedModal(true);
          }
        }
      },
      (error) => {
        console.error('Error listening to payment updates:', error);
        setPaymentListenerActive(false);
      }
    );
    
    
    // Cleanup listener when component unmounts or transaction changes
    return () => {
      console.log('Cleaning up payment listener');
      unsubscribe();
      setPaymentListenerActive(false);
    };
  }, [currentTransactionId, cpId, planId]);


  const updateUserSubscription = async (cpId: string, planId: string, paymentData: any) => {
    try {
      const agentRef = doc(db, "agents", cpId);
      
      
      const now = new Date();
      
      let planExpiry = new Date();
      planExpiry.setFullYear(planExpiry.getFullYear() + 1);
      
      let updateData: any = {};

      switch (planId) {
        case "premium":
          updateData = {
            userType: "premium",
            planExpiry: planExpiry,
            monthlyCredits: 100,
            paymentHistory: {
              lastPaymentDate: now,
              lastPaymentAmount: paymentData.data.amount,
              lastPaymentId: currentTransactionId,
              lastPlanId: planId,
            },
          };
          break;
        case "booster":
          updateData = {
            boosterCredits: 5,
            monthlyCredits: 5,
            paymentHistory: {
              lastPaymentDate: now,
              lastPaymentAmount: paymentData.data.amount,
              lastPaymentId: currentTransactionId,
              lastPlanId: planId,
            },
          };
          break;
        default:
          console.log("Unknown plan ID:", planId);
          return false;
      }
      
      // Update the user document
      await updateDoc(agentRef, updateData);
      console.log("Successfully updated user subscription");
      return true;
    } catch (error) {
      console.error("Error updating user subscription:", error);
      return false;
    }
  };

 
  const injectUserData = useCallback((): void => {
    if (!webViewRef.current) return;
    
    const dataScript = `
      window.userPhoneNumber = ${JSON.stringify(phoneNumber || '')};
      window.userCpId = ${JSON.stringify(cpId || '')};
      window.userBusinessName = ${JSON.stringify(businessName || '')};
      window.userGstNo = ${JSON.stringify(gstNo || '')};
      window.userTransactionId = ${JSON.stringify(currentTransactionId || '')};
      
      // Dispatch a custom event that the web page can listen for
      if (!window.userDataInjected) {
        document.dispatchEvent(new CustomEvent('app:userData', { 
          detail: {
            phoneNumber: window.userPhoneNumber,
            cpId: window.userCpId,
            businessName: window.userBusinessName,
            gstNo: window.userGstNo,
            transactionId: window.userTransactionId
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
  }, [phoneNumber, cpId, businessName, gstNo, currentTransactionId]);
  
  const retryPayment = (): void => {
    setShowFailedModal(false);
    
    const newTransactionId = "TXN" + Date.now();
    setCurrentTransactionId(newTransactionId);
    
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
   
    // Handle loading completed
    if (navState.loading === false) {
      setIsLoading(false);
      
      setTimeout(() => {
        injectUserData();
      }, 300);
    }
  }, [injectUserData]);
  

  const handleMessage = useCallback((event: { nativeEvent: { data: string; }; }): void => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'PAYMENT_INITIATED':
          console.log("Payment initiated:", data.payload);
          setCurrentTransactionId(data.payload.transactionId || currentTransactionId);
          
          break;
          
        case 'PAYMENT_SUCCESS':
          // This might still come from the web if we're redirected back with success
          setShowSuccessModal(true);
          break;
          
        case 'PAYMENT_FAILED':
          console.log("Payment failed:", data.payload);
          setLastError(data.payload?.error || data.payload?.reason || null);
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
      
      
      {currentTransactionId ? (
        <WebView
          ref={webViewRef}
          source={{ uri: checkoutUrl }}
          style={styles.webView}
          onMessage={handleMessage}
          onNavigationStateChange={handleWebViewNavigationStateChange}
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
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#153E3B" />
          <Text style={styles.loadingText}>Preparing checkout...</Text>
        </View>
      )}

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