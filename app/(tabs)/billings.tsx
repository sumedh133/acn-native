import React, { useState } from 'react';
import BusinessDetailsModal from '../components/Billing/BusinessDetailsModal';
import BillingContainer from '../components/Billing/BillingContainer';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import Offline from '../components/Offline';

export default function Billings() {
  const [showModal, setShowModal] = useState(false);
  const openBusinessModal = () => setShowModal(true);
  const isConnectedToInternet = useSelector((state: RootState) => state.app.isConnectedToInternet);

  if (!isConnectedToInternet)
    return (<Offline />)

  return (
    <>
      <BillingContainer onOpenBusinessModal={openBusinessModal} />

      <BusinessDetailsModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}