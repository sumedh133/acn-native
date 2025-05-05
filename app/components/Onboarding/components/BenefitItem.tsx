import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

interface BenefitItemProps {
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ text }) => {
  return (
    <View className="flex-row items-start mb-2">
      <View className="w-5 h-5 bg-[#153E3B] rounded-full items-center justify-center mr-2 mt-1">
        <Text className="text-white text-xs">✓</Text>
      </View>
      <Text className="text-[#171D1B] font-medium flex-1 text-sm">{text}</Text>
    </View>
  );
};

BenefitItem.propTypes = {
  text: PropTypes.string.isRequired
};

export default BenefitItem;