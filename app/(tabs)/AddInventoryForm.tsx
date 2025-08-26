import React, { useState } from 'react';
import { Alert } from 'react-native';
import { PropertyFormScreen } from '@/components/addInventoryForm/PropertyFormScreen';
import { Property } from '../types';

const AddInventoryForm = () => {
  const [showForm, setShowForm] = useState(true);
  const [editData, setEditData] = useState<Partial<Property> | undefined>();

  const handleFormComplete = (data: Partial<Property>) => {
    console.log('Form completed with data:', data);

    // Here you would typically save to your backend
    // savePropertyData(data);

    Alert.alert(
      'Success',
      editData ? 'Property updated successfully!' : 'Property added successfully!',
      [
        {
          text: 'OK',
          onPress: () => setShowForm(false)
        }
      ]
    );
  };

  const handleFormCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? All changes will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => setShowForm(false)
        }
      ]
    );
  };

  if (!showForm) {
    // Return your main app UI here
    return null;
  }

  return (
    <PropertyFormScreen
      initialData={editData}
      onComplete={handleFormComplete}
      onCancel={handleFormCancel}
      isEdit={!!editData}

    />
 
  );
  
};
export default AddInventoryForm;
