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
      className={`bg-teal-800 rounded-md py-3 items-center ${className}`}
      onPress={onPress}
    >
      <Text className="text-white font-medium">{title}</Text>
    </TouchableOpacity>
  );
};

PrimaryButton.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default PrimaryButton;