import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, className = "" }) => {
  return (
    <TouchableOpacity 
      className={`bg-[#153E3B] rounded-md py-3 items-center ${className}`}
      onPress={onPress}
    >
      <Text className="text-white text-sm font-medium" style={{fontFamily:"Lato"}}>{title}</Text>
    </TouchableOpacity>
  );
};

PrimaryButton.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default PrimaryButton;