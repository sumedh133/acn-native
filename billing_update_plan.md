# Billing Update Plan for iOS App Store Compliance

**Objective:** Address iOS app rejection issues related to billing and in-app purchases.

**Plan:**

1.  **Implement "Restore Purchases" Functionality:**

    *   Add a button or link in the UI labeled "Restore Purchases". This button should be placed in a visible location on the billing screen (e.g., below the "Pay" button).
    *   Create a function `restorePurchases` that uses `getAvailablePurchases` from `react-native-iap` to fetch previous purchases.
    *   For each previous purchase, call the `handlePurchaseUpdate` function to validate and process the purchase.
    *   Display a message to the user indicating whether the restore was successful or not.

    ```mermaid
    graph LR
        A[User clicks "Restore Purchases"] --> B{getAvailablePurchases()};
        B -- No purchases found --> C[Display "No purchases to restore"];
        B -- Purchases found --> D{Iterate through purchases};
        D --> E{handlePurchaseUpdate(purchase)};
        E -- Success --> F[Display "Purchase restored"];
        E -- Failure --> G[Display "Restore failed. Contact support."];
    ```

2.  **Remove PhonePe Payment Option for iOS Users:**

    *   Modify the code to only show the PhonePe payment option for non-iOS users. This can be achieved by using `Platform.OS === 'ios'` to conditionally render the PhonePe payment button.
    *   Ensure that iOS users can only purchase the premium subscription through IAP.

**Rationale:**

*   The "Restore Purchases" functionality is a mandatory requirement for non-consumable in-app purchases on iOS.
*   Offering alternative payment methods (like PhonePe) to iOS users for digital content or subscriptions violates Apple's App Store guidelines, which require the use of IAP for such transactions.

**Next Steps:**

1.  Switch to code mode to implement the changes in `BillingContainer.tsx`.
2.  Test the "Restore Purchases" functionality thoroughly on iOS devices.
3.  Ensure that the PhonePe payment option is not visible or accessible to iOS users.