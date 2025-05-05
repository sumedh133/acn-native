// // paymentSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { RootState } from '../store';

// // Define types for our state
// interface Purchase {
//   type: 'booster' | 'premium' | 'trial';
//   amount?: number;
//   date: string;
//   expiryDate?: string;
// }

// interface PaymentState {
//   credits: number;
//   purchaseHistory: Purchase[];
//   hasPremium: boolean;
//   premiumExpiryDate: string | null;
//   hasTrial: boolean;
//   trialExpiryDate: string | null;
//   trialActivated: boolean;  // Flag to track if trial has ever been activated
// }

// const initialState: PaymentState = {
//   credits: 0,
//   purchaseHistory: [],
//   hasPremium: false,
//   premiumExpiryDate: null,
//   hasTrial: false,
//   trialExpiryDate: null,
//   trialActivated: false,
// };

// const paymentSlice = createSlice({
//   name: 'payment',
//   initialState,
//   reducers: {
//     // Add credits when user buys a booster
//     addBoosterCredits: (state) => {
//       state.credits += 5;
//       state.purchaseHistory.push({
//         type: 'booster',
//         amount: 5,
//         date: new Date().toISOString(),
//       });
//     },
    
//     // Activate premium subscription
//     activatePremium: (state) => {
//       state.hasPremium = true;
//       // Set expiry date to one year from now
//       const expiryDate = new Date();
//       expiryDate.setFullYear(expiryDate.getFullYear() + 1);
//       state.premiumExpiryDate = expiryDate.toISOString();
      
//       state.purchaseHistory.push({
//         type: 'premium',
//         date: new Date().toISOString(),
//         expiryDate: state.premiumExpiryDate,
//       });
//     },
    
//     // Activate trial period (one month with 100 credits)
//     activateTrial: (state) => {
//       // Only allow trial activation once
//       if (!state.trialActivated) {
//         state.hasTrial = true;
//         state.trialActivated = true;
//         state.credits += 100;
        
//         // Set expiry date to one month from now
//         const expiryDate = new Date();
//         expiryDate.setMonth(expiryDate.getMonth() + 1);
//         state.trialExpiryDate = expiryDate.toISOString();
        
//         state.purchaseHistory.push({
//           type: 'trial',
//           amount: 100,
//           date: new Date().toISOString(),
//           expiryDate: state.trialExpiryDate,
//         });
//       }
//     },
    
//     // Use a credit (for non-premium users)
//     useCredit: (state) => {
//       // Only deduct if not premium and has credits
//       if (!state.hasPremium && state.credits > 0) {
//         state.credits -= 1;
//       }
//     },
    
//     // Check if premium and trial have expired
//     checkSubscriptionStatus: (state) => {
//       const now = new Date();
      
//       // Check premium status
//       if (state.hasPremium && state.premiumExpiryDate) {
//         const premiumExpiry = new Date(state.premiumExpiryDate);
//         if (now > premiumExpiry) {
//           state.hasPremium = false;
//           state.premiumExpiryDate = null;
//         }
//       }
      
//       // Check trial status
//       if (state.hasTrial && state.trialExpiryDate) {
//         const trialExpiry = new Date(state.trialExpiryDate);
//         if (now > trialExpiry) {
//           state.hasTrial = false;
//           state.trialExpiryDate = null;
//           // Note: We don't remove the credits that came with the trial
//         }
//       }
//     },

    
//     resetPaymentState: () => initialState,
//   },
// });

// export const { 
//   addBoosterCredits, 
//   activatePremium,
//   activateTrial,
//   useCredit, 
//   checkSubscriptionStatus,
//   resetPaymentState
// } = paymentSlice.actions;


// export const selectCredits = (state: RootState) => state.payment.credits;
// export const selectHasPremium = (state: RootState) => state.payment.hasPremium;
// export const selectHasTrial = (state: RootState) => state.payment.hasTrial;
// export const selectTrialActivated = (state: RootState) => state.payment.trialActivated;
// export const selectPremiumExpiryDate = (state: RootState) => state.payment.premiumExpiryDate;
// export const selectTrialExpiryDate = (state: RootState) => state.payment.trialExpiryDate;
// export const selectPurchaseHistory = (state: RootState) => state.payment.purchaseHistory;

// // Helper selector to check if user can perform an action that requires credits
// export const selectCanPerformAction = (state: RootState) => {
//   const { hasPremium, credits } = state.payment;
//   return hasPremium || credits > 0;
// };

// export default paymentSlice.reducer;