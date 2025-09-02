import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ReviewModal from '../Enquiries/ReviewModal';
import { updateEnquiry } from '@/app/services/user_services/enquiryService';
import { formatUnixDate } from '@/app/helpers/getUnixDateTime';
import WhatsappIcon from "@/assets/icons/MyBusinessPage/whatsapp.svg";
import CallIcon from "@/assets/icons/MyBusinessPage/call.svg";
import ProfileIcon from "@/assets/icons/MyBusinessPage/profile.svg";
import { Enquiry } from '@/app/types';

interface EnquiryCardProps {
    enquiry: Enquiry;
}

const EnquiryCard: React.FC<EnquiryCardProps> = ({ enquiry }) => {
    const [showReviewModal, setShowReviewModal] = useState(false);

    const maskName = (name: string) => {
        const parts = name.split(' ');
        return parts.map(part =>
            part.charAt(0) + 'x'.repeat(Math.max(part.length - 1, 4))
        ).join(' ');
    };

    const maskNumber = (number: string) => {
        return number.substring(0, 6) + 'x'.repeat(5);
    };

    const displayName = enquiry.isContactShared ? enquiry.buyerName : maskName(enquiry.buyerName);
    const displayNumber = enquiry.isContactShared ? enquiry.buyerNumber : maskNumber(enquiry.buyerNumber);

    const handleContactShare = async (enquiryId: string) => {
        try {
            await updateEnquiry(enquiryId, { isContactShared: true });
        } catch (error) {
            console.error('Error sharing contact:', error);
        }
    };

    return (
        <>
            <View className=" bg-[#E3E3E3] shadow-sm rounded-[12px] border border-[#CCCBCB]">
                <View className="bg-white rounded-[12px] border border-[#9F9C9C] p-4">
                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-row items-center space-x-2">
                            <Text className="text-xs text-[#5A5555] font-semibold leading-normal">
                                {enquiry.enquiryId}
                            </Text>
                            <Text className="bg-[#E93B3E] text-white px-0.5 py-0.5 rounded-[2px] text-xs font-medium">
                                New!
                            </Text>
                        </View>
                        <Text className="text-xs text-[#5A5555] font-semibold leading-normal">
                            Enquired On: {formatUnixDate(enquiry.added)}
                        </Text>
                    </View>
                    <View className="flex-row justify-between items-start mb-4">
                        {/* Contact Info */}
                        <View className="space-y-2 flex-1">
                            <View className="flex-row items-center space-x-2">
                                <ProfileIcon height={18} width={18} />
                                <Text className="font-semibold text-sm leading-[154%]">{displayName}</Text>
                            </View>
                            <View className="flex-row items-center space-x-2">
                                <CallIcon height={18} width={18} />
                                <Text className='font-semibold text-sm leading-[154%]'>{displayNumber}</Text>
                            </View>
                        </View>

                        {/* Buttons */}
                        <View className="items-end ml-4">
                            {!enquiry?.isContactShared ? (
                                <TouchableOpacity
                                    onPress={() => handleContactShare(enquiry.enquiryId)}
                                    className="bg-[#10302D] px-4 py-[6px] rounded-[6px]"
                                >
                                    <Text className="text-white font-medium text-center leading-[21px]">Get Contact</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setShowReviewModal(true)}
                                    className="border border-[#10302D] px-4 py-[6px] rounded-[6px]"
                                >
                                    <Text className="text-[#10302D] text-center font-semibold leading-[21px]">Submit Review</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {enquiry.isContactShared && (<>
                    {/* Action Buttons */}
                    <View className="flex-row space-x-3 items-center justify-center py-[10px]">

                        <View className="flex-row justify-between mt-4 gap-[10px]">
                            <TouchableOpacity className="flex-row items-center border border-[#10302D] px-4 py-[6px] rounded-[6px] bg-white">
                                <CallIcon height={18} width={18} />
                                <Text className="text-[#10302D] text-center font-semibold leading-[21px] ml-2">
                                    Call Agent
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="flex-row items-center border border-[#10302D] px-4 py-[6px] rounded-[6px] bg-white">
                                <WhatsappIcon height={18} width={18} />
                                <Text className="text-[#10302D] text-center font-semibold leading-[21px] ml-2">
                                    WhatsApp Agent
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </>
                )}


            </View>

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                enqId={enquiry.enquiryId}
            />
        </>
    );
};

export default EnquiryCard;
