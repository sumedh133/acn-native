import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import {
  arrayUnion,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { getUnixDateTime } from "@/app/helpers/getUnixDateTime";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/utils/toastUtils";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  enqId: string;
};

const ReviewModal: React.FC<Props> = ({ isOpen, onClose, enqId }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loader, setLoader] = useState(false);
  const [errors, setErrors] = useState({ rating: false, review: false });
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  useEffect(() => {
    if (isOpen) {
      try {
        logEvent(analytics, 'review_modal_shown', {
          event_category: 'enquiries',
          event_label: 'impression',
          enquiry_id: enqId,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging review modal shown:', error);
      }
    }
  }, [isOpen]);

  const handleRatingChange = (newRating: number) => {
    try {
      logEvent(analytics, 'review_rating_selected', {
        event_category: 'enquiries',
        event_label: 'interaction',
        enquiry_id: enqId,
        rating: newRating,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging rating selection:', error);
    }
    setRating(newRating);
    setErrors((prev) => ({
      ...prev,
      rating: false,
    }));
  };

  const handleSubmit = async () => {
    if (loader) return;
    let hasError = false;
    const newErrors = { rating: false, review: false };

    if (rating === 0) {
      newErrors.rating = true;
      hasError = true;
    }

    if (review.trim() === "") {
      newErrors.review = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      try {
        logEvent(analytics, 'review_submission_error', {
          event_category: 'enquiries',
          event_label: 'error',
          enquiry_id: enqId,
          error_type: rating === 0 ? 'missing_rating' : 'missing_review',
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging submission error:', error);
      }
      return;
    }

    try {
      setLoader(true);
      logEvent(analytics, 'review_submission_started', {
        event_category: 'enquiries',
        event_label: 'interaction',
        enquiry_id: enqId,
        rating: rating,
        review_length: review.length,
        user_type: userType
      });

      const q = query(
        collection(db, "enquiries"),
        where("enquiryId", "==", enqId)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.error("No enquiry found with the specified ID.");
        setLoader(false);
        return;
      }

      const docRef = querySnapshot.docs[0].ref;

      const newReview = {
        stars: rating,
        review: review,
        timestamp: getUnixDateTime(),
      };

      await updateDoc(docRef, {
        reviews: arrayUnion(newReview),
      });

      logEvent(analytics, 'review_submission_success', {
        event_category: 'enquiries',
        event_label: 'success',
        enquiry_id: enqId,
        rating: rating,
        review_length: review.length,
        user_type: userType
      });

      showSuccessToast("Review added successfully!");
    } catch (error) {
      console.error("Error adding review:", error);
      logEvent(analytics, 'review_submission_failure', {
        event_category: 'enquiries',
        event_label: 'error',
        enquiry_id: enqId,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        user_type: userType
      });
      showErrorToast("Failed to add review. Please try again.");
    } finally {
      setLoader(false);
      onClose();
      setRating(0);
      setReview("");
      setErrors({ rating: false, review: false });
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={() => {
        try {
          logEvent(analytics, 'review_modal_closed', {
            event_category: 'enquiries',
            event_label: 'interaction',
            enquiry_id: enqId,
            close_type: 'back_button',
            had_rating: rating > 0,
            had_review: review.trim().length > 0,
            user_type: userType
          });
        } catch (error) {
          console.error('Error logging modal close:', error);
        }
        onClose();
      }}
    >
      <Pressable
        className="flex-1 bg-black/40 justify-center items-center p-5"
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-2xl p-8 w-full max-w-md space-y-6"
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.heading}>Overall Rating</Text>
          <View className="flex-row justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  handleRatingChange(star);
                }}
              >
                <FontAwesome
                  name="star"
                  size={39}
                  color={star <= rating ? "#FFD700" : "#D1D5DB"}
                  style={{ marginHorizontal: 6 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          {errors.rating && (
            <Text style={styles.errorText}>Please select a rating.</Text>
          )}

          <TextInput
            placeholder="Write your review here..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={review}
            onChangeText={(text) => {
              setReview(text);
              setErrors((prev) => ({ ...prev, review: false }));
            }}
            style={styles.textInput}
          />
          {errors.review && (
            <Text style={styles.errorText}>Please enter your review.</Text>
          )}

          <TouchableOpacity
            className="bg-[#153E3B] px-4 py-3 rounded-lg w-full"
            onPress={handleSubmit}
          >
            {loader ? (
              <ActivityIndicator color="#153E3B" />
            ) : (
              <Text className="text-white text-center font-medium text-xl">
                Submit Review
              </Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    height: 128,
    fontSize: 20,
    textAlignVertical: "top",
    textAlign: "left",
  },
  heading: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 20,
    textAlign: "center",
    color: "#153E3B",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
});

export default ReviewModal;
