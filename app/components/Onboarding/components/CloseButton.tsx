import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface CloseButtonProps {
  onPress: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity className="self-end" onPress={onPress}>
      <Text className="text-gray-400">✕</Text>
    </TouchableOpacity>
  );
};

export default CloseButton;