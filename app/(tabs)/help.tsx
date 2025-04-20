import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// You'll need to import these SVG files using a library like react-native-svg
// and convert them to React Native compatible components
import TncIcon from '../../assets/icons/tnc.svg';
import ArrowRightIcon from '../../assets/icons/arrowRightt.svg';
import LockIcon from '../../assets/icons/lock.svg';
import ReceiptMoneyIcon from '../../assets/icons/receiptMoney.svg';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Offline from '../components/Offline';

interface HelpMobileProps { }

const HelpMobile: React.FC<HelpMobileProps> = () => {
  const navigation = useNavigation();
  const isConnectedToInternet = useSelector((state: RootState) => state.app.isConnectedToInternet);

  useEffect(() => {
    const handleDimensionsChange = ({ window }: { window: { width: number; height: number } }) => {
      if (window.width > 768) {
        navigation.navigate('Home' as never);
      }
    };

    // Initial check
    const initialDimensions = Dimensions.get('window');
    if (initialDimensions.width > 768) {
      navigation.navigate('Home' as never);
    }

    // Set up event listener
    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    // Clean up
    return () => subscription.remove();
  }, [navigation]);

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const renderLinkItem = (
    icon: React.ReactNode,
    title: string,
    url: string
  ) => (
    <TouchableOpacity
      style={styles.linkItem}
      onPress={() => openLink(url)}
    >
      <View style={styles.leftContent}>
        {icon}
        <Text style={styles.linkText}>{title}</Text>
      </View>
      <ArrowRightIcon width={20} height={20} />
    </TouchableOpacity>
  );

  if (!isConnectedToInternet)
    return (<Offline />)

  return (
    <View style={styles.container}>
      <View style={styles.linksContainer}>
        {renderLinkItem(
          <TncIcon width={20} height={20} />,
          'Terms and Conditions',
          'https://acnonline.in/tnc'
        )}

        {renderLinkItem(
          <LockIcon width={20} height={20} />,
          'Privacy Policy',
          'https://acnonline.in/privacy-policy'
        )}

        {renderLinkItem(
          <ReceiptMoneyIcon width={20} height={20} />,
          'Refund Policy',
          'https://acnonline.in/refund-policy'
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 32,
    marginHorizontal: 16,
  },
  linksContainer: {
    gap: 24,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#B5B3B3',
    borderRadius: 8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontFamily: 'sans-serif',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    marginLeft: 8,
  },
});

export default HelpMobile;