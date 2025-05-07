import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity,ScrollView } from 'react-native';


// Types
interface EnquiryItem {
  id: number;
  propertyName: string;
  date: string;
  creditsUsed: number;
  status: 'pending' | 'completed' | 'cancelled';
}

interface RecentEnquiriesProps {
  enquiries: EnquiryItem[];
  maxDisplay?: number;
  onViewMore?: () => void;
}

// Sample data - can be moved to a separate file in a real application
export const sampleEnquiries: EnquiryItem[] = [
  {
    id: 1,
    propertyName: "Tangled Up In The Green - Total Environment",
    date: "1 Sep 2024, 06:16PM",
    creditsUsed: 1,
    status: "pending"
  },
  {
    id: 2,
    propertyName: "Pursuit of a Radical Rhapsody - Total Environment",
    date: "30 Aug 2024, 03:42PM",
    creditsUsed: 1,
    status: "pending"
  },
  {
    id: 3,
    propertyName: "Windmills of Your Mind - Total Environment",
    date: "29 Aug 2024, 11:30AM",
    creditsUsed: 1,
    status: "completed"
  },
  {
    id: 4,
    propertyName: "Tangled Up In The Green - Total Environment",
    date: "1 Sep 2024, 06:16PM",
    creditsUsed: 1,
    status: "pending"
  },
  {
    id: 5,
    propertyName: "Pursuit of a Radical Rhapsody - Total Environment",
    date: "30 Aug 2024, 03:42PM",
    creditsUsed: 1,
    status: "pending"
  },
  {
    id: 6,
    propertyName: "Windmills of Your Mind - Total Environment",
    date: "29 Aug 2024, 11:30AM",
    creditsUsed: 1,
    status: "completed"
  },
  {
    id: 7,
    propertyName: "Tangled Up In The Green - Total Environment",
    date: "1 Sep 2024, 06:16PM",
    creditsUsed: 1,
    status: "pending"
  },
  {
    id: 9,
    propertyName: "Pursuit of a Radical Rhapsody - Total Environment",
    date: "30 Aug 2024, 03:42PM",
    creditsUsed: 1,
    status: "pending"
  },
  {
    id: 10,
    propertyName: "Windmills of Your Mind - Total Environment",
    date: "29 Aug 2024, 11:30AM",
    creditsUsed: 1,
    status: "completed"
  },
  {
    id: 11,
    propertyName: "Tangled Up In The Green - Total Environment",
    date: "1 Sep 2024, 06:16PM",
    creditsUsed: 1,
    status: "pending"
  },
  {
    id: 12,
    propertyName: "Pursuit of a Radical Rhapsody - Total Environment",
    date: "30 Aug 2024, 03:42PM",
    creditsUsed: 1,
    status: "pending"
  },
  {
    id: 13,
    propertyName: "Windmills of Your Mind - Total Environment",
    date: "29 Aug 2024, 11:30AM",
    creditsUsed: 1,
    status: "completed"
  },
  
];

// Status indicator component
const StatusIndicator = ({ status }: { status: string }) => {
  // Map status to color
  const getStatusColor = () => {
    switch(status) {
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      case "pending":
      default:
        return "bg-yellow-400";
    }
  };
  
  return (
    <View className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
  );
};

// Individual enquiry item component
const EnquiryItem = ({ 
  item, 
  isLast 
}: { 
  item: EnquiryItem; 
  isLast: boolean 
}) => {
  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="font-lato text-sm font-medium text-gray-900">
            {item.propertyName}
          </Text>
          <Text className="font-lato text-xs text-gray-500 mt-1">
            {item.date}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text className="font-montserrat-bold text-base font-bold text-red-600 mr-2">
            - {item.creditsUsed}
          </Text>
          <StatusIndicator status={item.status} />
        </View>
      </View>

      {!isLast && <View className="h-px bg-gray-200 my-3" />}
    </View>
  );
};

// Main Recent Enquiries component
const RecentEnquiries = ({ 
  enquiries = sampleEnquiries, 
  maxDisplay = 3, 
  onViewMore 
}: RecentEnquiriesProps) => {
  const displayEnquiries = enquiries.slice(0, maxDisplay);
  const handleBackPress = () => {
    router.back();
  };
  
  return (
    <View className="flex-1 bg-[#EEEEEE]">
    {/* Header */}
    <View className="bg-white p-4 flex-row items-center justify-between">
      <TouchableOpacity onPress={handleBackPress}>
        <Text className="font-montserrat-semibold text-sm text-[#153E3B]">Back</Text>
      </TouchableOpacity>
      <Text className="font-montserrat-bold text-lg text-[#153E3B]">All Enquiries</Text>
      <View style={{ width: 40 }} /> {/* Empty view for centering the title */}
    </View>

    {/* Content */}
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        <View className="bg-white rounded-xl p-5 border border-gray-200">
          {/* Filter options could go here */}
          
          {/* Enquiry Items */}
          {sampleEnquiries.map((item, index) => (
            <EnquiryItem 
              key={item.id} 
              item={item} 
              isLast={index === sampleEnquiries.length - 1} 
            />
          ))}
        </View>
      </View>
    </ScrollView>
  </View>
  );
};

export default RecentEnquiries;