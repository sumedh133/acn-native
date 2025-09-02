import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import Offline from "../components/Offline";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import EnquiryCard from "../components/MyBusinessPage/EnquiryCard";
import { Enquiry } from "../types";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
} from "react-native-reanimated";
import { updateEnquiry } from "../services/user_services/enquiryService";
import { useEnquiries } from "@/hooks/enquiryHooks/useEnquiries";

const EnquiriesReceived = () => {
    // Use the custom hook
    const {
        enquiries,
        enquiryCount,
        newEnquiryCount,
        loading,
        refreshing,
        error,
        handleRefresh
    } = useEnquiries();

    // Other selectors and state
    const agentData = useSelector((state: RootState) => state?.agent?.docData);
    const isConnectedToInternet = useSelector(
        (state: RootState) => state.app.isConnectedToInternet
    );

    const userType = agentData?.userType || "free";
    const scrollY = useSharedValue(0);
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    });

    // Track page view
    useEffect(() => {
        try {
            logEvent(analytics, "enquiries_received_page_view", {
                event_category: "page_view",
                event_label: "enquiries",
                user_type: userType,
                total_enquiries: enquiryCount,
                new_enquiries: newEnquiryCount,
            });
        } catch (error) {
            console.error("Error logging page view:", error);
        }
    }, [userType, enquiryCount, newEnquiryCount]);

    const handleContactShare = useCallback(async (enquiryId: string) => {
        try {
            // Update in Firestore - the onSnapshot listener will automatically update local state
            await updateEnquiry(enquiryId, { isContactShared: true })

            // Log analytics
            logEvent(analytics, "enquiry_contact_shared", {
                event_category: "interaction",
                event_label: "contact_share",
                enquiry_id: enquiryId,
                user_type: userType,
            });

            console.log(`Contact shared for enquiry: ${enquiryId}`);
        } catch (error) {
            console.error("Error sharing contact:", error);
            // Show error to user if needed
        }
    }, [userType]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const onScrollEndDrag = useCallback(() => {
        // Handle scroll end drag if needed
    }, []);

    const onMomentumScrollEnd = useCallback(() => {
        // Handle momentum scroll end if needed
    }, []);

    const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        // Handle viewable items changed if needed
    }, []);

    const handleEndReached = useCallback(() => {
        // Handle pagination if needed
        console.log("End reached");
    }, []);

    const renderFooter = useCallback(() => {
        if (enquiryCount === 0) return null;
        return (
            <View style={{ height: 20 }}>
                <Text style={{ textAlign: "center", color: "#666" }}>
                    End of results
                </Text>
            </View>
        );
    }, [enquiryCount]);

    const keyExtractor = useCallback((item: Enquiry, index: number) => {
        return item.enquiryId || index.toString();
    }, []);

    const renderItem = useCallback(
        ({ item, index }: { item: Enquiry; index: number }) => {
            const handleEnquiryView = () => {
                try {
                    logEvent(analytics, "enquiry_card_view", {
                        event_category: "interaction",
                        event_label: "enquiry_view",
                        enquiry_id: item.enquiryId,
                        list_position: index + 1,
                        total_results: enquiryCount,
                        new_enquiries: newEnquiryCount,
                        user_type: userType,
                        is_contact_shared: item.isContactShared || false,
                        is_new: item.isNew || false,
                    });
                } catch (error) {
                    console.error("Error logging enquiry view:", error);
                }
            };

            return (
                <View
                    className=""
                    onStartShouldSetResponder={() => {
                        handleEnquiryView();
                        return false;
                    }}
                >
                    <EnquiryCard
                        enquiry={item}
                    />
                </View>
            );
        },
        [enquiryCount, newEnquiryCount, userType, handleContactShare]
    );

    // Conditional renders
    if (!isConnectedToInternet) {
        try {
            logEvent(analytics, "enquiries_offline_view", {
                event_category: "error",
                event_label: "offline",
                user_type: userType,
            });
        } catch (error) {
            console.error("Error logging offline state:", error);
        }
        return <Offline />;
    }

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#153E3B" />
                <Text style={{ marginTop: 10, color: "#666" }}>Loading enquiries...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-4">
                <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
                    {error}
                </Text>
                <Text style={{ fontSize: 14, color: "#999", textAlign: "center", marginTop: 8 }}>
                    Pull down to refresh
                </Text>
            </View>
        );
    }

    if (enquiryCount === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
                    No enquiries found
                </Text>
                <Text style={{ fontSize: 14, color: "#999", textAlign: "center", marginTop: 8 }}>
                    Pull down to refresh
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F5F6F7]">
            {/* Optional: Display counts at the top */}
            <View className="px-4 py-2 bg-white border-b border-gray-200">
                <Text className="text-sm text-gray-600">
                    Total Enquiries: {enquiryCount} 
                    {newEnquiryCount > 0 && (
                        <Text className="text-green-600 font-semibold">
                            {" "}• {newEnquiryCount} New
                        </Text>
                    )}
                </Text>
            </View>

            <Animated.FlatList
                data={enquiries}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onScrollEndDrag={onScrollEndDrag}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={viewabilityConfig.current}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={["#153E3B"]}
                        tintColor="#153E3B"
                        title="Refreshing..."
                        titleColor="#153E3B"
                    />
                }
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    width: "100%",
                    flexGrow: 1,
                    backgroundColor: "#F5F6F7",
                    padding: 12,
                }}
                style={{ flexGrow: 1, flexShrink: 1 }}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={10}
                removeClippedSubviews={true}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.3}
                ListFooterComponent={renderFooter}
            />
        </View>
    );
};

export default EnquiriesReceived;