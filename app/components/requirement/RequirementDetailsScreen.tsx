import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

// Import components and utilities
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { showErrorToast } from '@/utils/toastUtils';
import CloseIcon from '@/assets/icons/svg/CloseIcon';
import { selectRequirementStateData } from '@/store/slices/requirementSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import Offline from '../Offline';

// Helper function to capitalize words
const toCapitalizedWords = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export default function RequirementDetailsScreen() {
  const params = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the requirement data from Redux store
  const requirement = useSelector(selectRequirementStateData);

  const isConnectedToInternet = useSelector((state: RootState) => state.app.isConnectedToInternet);

  // If no requirement is provided, don't render anything
  if (!requirement) return null;

  const kam_phonenumber = useSelector((state: RootState) => state?.kam?.kamDocData?.phonenumber) || "";

  // Helper function to format budget display
  const formatBudget = () => {
    if (requirement.marketValue) {
      return "Market Price";
    }

    if (typeof requirement.budget === 'number') {
      return `₹${requirement.budget} Cr`;
    }

    if (requirement.budget && typeof requirement.budget === 'object') {
      const from = requirement.budget.from || 0;
      const to = requirement.budget.to || 0;

      if (from === 0) {
        return `₹${to} Cr`;
      }

      return `₹${from} Cr - ₹${to} Cr`;
    }

    return "-";
  };

  // Handle back button
  const handleGoBack = () => {
    router.back();
  };

  // Handle WhatsApp button press
  const openWhatsapp = () => {
    const phonenumber = kam_phonenumber;
    const reqId = requirement.requirementId;

    if (phonenumber === "" || !reqId) {
      showErrorToast("Some error occured! Please contact your kam.");
      return;
    }

    const message = encodeURIComponent(
      `Hello, \nI want to submit a matching inventory for a requirement.\n\n*Requirement ID*: ${reqId}\n\nThe inventory details are as follows:\n`
    );

    const whatsappUrl = `https://wa.me/${phonenumber}?text=${message}`;
    Linking.openURL(whatsappUrl).catch(err =>
      console.error("Error opening WhatsApp:", err)
    );
  };

  const handleSubmitMatchingInventory = async () => {
    try {
      setIsSubmitting(true); // Indicate that the process has started

      // Call WhatsApp functionality
      openWhatsapp();
    } catch (error) {
      console.error("Error submitting matching inventory:", error);
    } finally {
      // Always reset the state, even if there is an error
      setIsSubmitting(false);
    }
  };

  // Render each info row
  const InfoRow = ({
    label,
    value
  }: {
    label: string;
    value: string;
  }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value || "-"}</Text>
    </View>
  );

  if (!isConnectedToInternet)
    return <Offline />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Requirement ID */}
          <View style={styles.idContainer}>
            <Text style={styles.idText}>
              {requirement.requirementId || ""}
            </Text>
            <View style={styles.divider} />
          </View>

          {/* Project Name */}
          <Text style={styles.titleText}>
            {toCapitalizedWords(requirement.propertyName || '') || "No Project Name"}
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleGoBack}
          accessibilityLabel="Close Modal"
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.mainContentContainer}>
        <ScrollView style={styles.scrollContent}>
          <View style={styles.infoWrapper}>
            {/* Key Information */}
            <View style={styles.infoSection}>
              <InfoRow
                label="Asset Type"
                value={toCapitalizedWords(requirement.assetType || '')}
              />
              <InfoRow
                label="Configuration"
                value={requirement.configuration || '-'}
              />
              <InfoRow
                label="Area (Sqft)"
                value={requirement.area ? `${requirement.area} sqft` : "-"}
              />
              <InfoRow
                label="Budget"
                value={formatBudget()}
              />
              <InfoRow
                label="Date of Requirement Added"
                value={requirement.added
                  ? new Date(requirement.added * 1000).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )
                  : "-"
                }
              />
            </View>

            {/* Requirement Details Section */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Requirement Details</Text>
              <View style={styles.detailsContent}>
                <Text style={styles.detailsText}>
                  {requirement.requirementDetails || "No additional details provided."}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          onPress={handleSubmitMatchingInventory}
          style={styles.submitButton}
          icon="logo-whatsapp"
          isLoading={isSubmitting}
          disable={isSubmitting}
        >
          {isSubmitting ? "Please Wait..." : "Submit Matching Inventory"}
        </PrimaryButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    zIndex: 10,
    gap: 10,
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    maxWidth: '85%',
  },
  idContainer: {
    flexDirection: 'column',
    gap: 2,
    width: '100%',
  },
  idText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Montserrat_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 2,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Montserrat_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 36,
    height: 36,
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  infoWrapper: {
    padding: 16,
  },
  infoSection: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
  },
  infoLabel: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Montserrat_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoValue: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Montserrat_600SemiBold',

    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  detailsSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'column',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailsTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Montserrat_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  detailsContent: {

    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailsText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Montserrat_600SemiBold',
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flexWrap: 'wrap',
  },
  footer: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#153E3B', // Primary theme color
    borderRadius: 8,
    fontSize: 14,
    paddingVertical: 12,
  },
});