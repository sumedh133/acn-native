import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Pressable, ScrollView, Alert, Image, Linking } from 'react-native';
import { Link, useRouter, usePathname } from 'expo-router';
import ProfileModal from '@/app/modals/ProfileModal';
import { Button } from 'react-native-elements/dist/buttons/Button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logOut } from '@/store/slices/authSlice';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { selectAdmin, selectName } from '@/store/slices/agentSlice';
import { toCapitalizedWords } from '@/app/helpers/common';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HamburgerMenuButton } from './HamburgerMenuButton';
import DashboardIcon from '@/assets/icons/svg/Sidebar/DashboardIcon';
import PropertyIcon from '@/assets/icons/svg/Sidebar/PropertyIcon';
import RequirementIcon from '@/assets/icons/svg/Sidebar/RequirementsIcon';
import RupeeIcon from '@/assets/icons/svg/Sidebar/BillingIcon';
import AnimatedTooltip from './AnimatedTooltip';





const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

interface MenuItem {
  title: string;
  path: string;
  icon: string;
  iconType: 'Dashboard' | 'Requirements' | 'Properties' | 'Billing' | 'Feather';
}

interface SidebarItemProps {
  onClick: () => void;
  icon: string;
  label?: string;
  selected: boolean;
  iconType: MenuItem['iconType'];
}

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/dashboardTab', icon: 'dashboard', iconType: 'Dashboard' },
  { title: 'Properties', path: '/properties', icon: 'home', iconType: 'Properties' },
  { title: 'Requirements', path: '/requirements', icon: 'list-alt', iconType: 'Requirements' },
];

const bottomMenuItems: MenuItem[] = [
  { title: 'Billing', path: '/billings', icon: 'dollar-sign', iconType: 'Billing' },
  { title: 'Help', path: '/help', icon: 'help-circle', iconType: 'Feather' },
];

const getIconComponent = (type: MenuItem['iconType'], name: string, size: number = 24, color: string = '#252626') => {
  switch (type) {
    case 'Dashboard':
      return <DashboardIcon />;
    case 'Requirements':
      return <RequirementIcon />;
    case 'Properties':
      return <PropertyIcon />;
    case 'Billing':
      return <RupeeIcon />
    case 'Feather':
      return <Feather name={name as any} size={size} color={color} />;
    default:
      return <MaterialIcons name="error" size={size} color={color} />;
  }
};

// Standardized SidebarItem with consistent dimensions
const SidebarItem = forwardRef<View, SidebarItemProps>(({ onClick, icon, label, selected, iconType }, ref) => (
  <TouchableOpacity
    onPress={onClick}
    style={[styles.standardButton, selected ? styles.selectedButton : {}]}
    ref={ref}
  >
    <View style={styles.iconContainer}>
      {getIconComponent(iconType, icon, 20)}
    </View>
    {label && <Text style={styles.buttonLabel}>{label}</Text>}
  </TouchableOpacity>
));

export const HamburgerMenu = ({ visible, onClose, onOpenProfile }: HamburgerMenuProps) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const agentName = useSelector(selectName);
  const monthlyCredits = useSelector((state: RootState) => state?.agent?.docData?.monthlyCredits);
  const isAuthenticated = useSelector((state: RootState) => state?.auth?.isAuthenticated);
    

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, 0],
  });

  const handleOverlayPress = () => {
    onClose();
  };

  const handleNavigation = (path: string) => {
    if (pathname === path) {
      onClose();
      return;
    }
    onClose();
    // router.dismissAll();
    router.replace('/(tabs)/properties');
    router.push(path as any);
    // onClose();
  };

  const handleOpenProfile = () => {
    onOpenProfile();
    onClose();
  };

  const handleRequirementSubmit = () => {
    router.dismissAll();
    router.push('/(tabs)/UserRequirementForm');
    onClose();
  };

  const handleHelpClick = () => {
    router.dismissAll();
    router.push('/help' as any);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!visible) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayOpacity },
        ]}
      >
        <Pressable style={styles.overlayPressable} onPress={handleOverlayPress} />
      </Animated.View>

      <Animated.View
        style={[
          styles.menuContainer,
          { transform: [{ translateX }] },
        ]}
      >
        <View style={{ flexDirection: 'row' }}>
          <View
            style={[
              { marginTop: insets.top + 12, marginLeft: 16 },
            ]}
          >
            <HamburgerMenuButton onPress={onClose} isOpen={false} showACN={true} />
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.menuContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.menuWrapper}>
            {/* Main Menu Items */}
            <View style={styles.menuSection}>
              {menuItems.map((item) => (
                <View key={item.path} style={styles.menuItemContainer}>
                  <SidebarItem
                    onClick={() => handleNavigation(item.path)}
                    icon={item.icon}
                    label={item.title}
                    selected={isActive(item.path)}
                    iconType={item.iconType}
                  />
                </View>
              ))}
              <View className='mt-[36px]'>
                <View style={styles.menuItemContainer}>
                  <TouchableOpacity
                    onPress={handleRequirementSubmit}
                    style={[styles.standardButton, styles.primaryButton]}
                  >
                    <View style={styles.iconContainer}>
                      <MaterialIcons name="post-add" size={20} color="#fff" />
                    </View>
                    <Text style={styles.actionButtonText}>Add Requirement</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.menuItemContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL('https://chat.whatsapp.com/KcirtDCrZkA3sdgS6WIB38')
                        .catch((err) => console.error('Failed to open URL:', err));
                    }}
                    style={[styles.standardButton, styles.secondaryButton]}
                  >
                    <View style={styles.iconContainer}>
                      <FontAwesome5 name="whatsapp" size={20} color="#153E3B" />
                    </View>
                    <Text style={styles.communityButtonText}>Join Community</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Bottom Menu Items */}
            <View style={styles.bottomSection}>
              {bottomMenuItems.map((item) => (
                <View key={item.path} style={styles.menuItemContainer}>
                  <SidebarItem
                    onClick={() => handleNavigation(item.path)}
                    icon={item.icon}
                    label={item.title}
                    selected={isActive(item.path)}
                    iconType={item.iconType}
                  />
                </View>
              ))}

              {/* Credits Display with Improved Tooltip */}
              <View style={styles.creditsContainer}>
                <View style={styles.creditsInfoContainer}>
                  <MaterialIcons name="monetization-on" size={20} color="#FFD700" />
                  <Text style={styles.creditsText}>
                    {monthlyCredits} Credits
                  </Text>
                </View>
                <AnimatedTooltip message="1 Credit is used per enquiry." />
              </View>

              <TouchableOpacity
                onPress={handleOpenProfile}
                style={[styles.profileButton, isActive('/profile') ? styles.selectedButton : {}]}
              >
                <View style={styles.profileIconContainer}>
                  <MaterialIcons name="person" size={18} color="#fff" />
                </View>
                <View style={styles.profileInfoContainer}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode='tail'
                    style={styles.profileName}
                  >
                    {toCapitalizedWords(agentName) || 'Agent Name'}
                  </Text>
                  <View style={styles.profileLinkContainer}>
                    <Text style={styles.profileLinkText}>Check profile</Text>
                    <MaterialIcons name="arrow-forward" size={12} color="#205E59" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      <ProfileModal
        visible={profileModalVisible}
        setVisible={setProfileModalVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 3,
  },
  overlayPressable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.55,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  menuContent: {
    paddingTop: height * 0.03,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  menuWrapper: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
  menuSection: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 12,
  },
  bottomSection: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 10,
  },
  menuItemContainer: {
    width: '100%',
    marginBottom: 12,
    
  },
  standardButton: {
    height: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedButton: {
    backgroundColor: '#B9D7D2',
  },
  primaryButton: {
    backgroundColor: '#153E3B',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#153E3B',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: 'Lato',
    fontSize: 16,
    fontWeight: '500',
    color: '#252626',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    
  },
  communityButtonText: {
    color: '#153E3B',
    fontSize: 14,
    fontWeight: '600',
    
  },
  creditsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    height: 50,
  },
  creditsInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditsText: {
    fontFamily: 'Lato',
    fontWeight: '500',
    fontSize: 14,
    color: '#5A5555',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    height: 60,
  },
  profileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: '#153E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfoContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  profileName: {
    fontSize: 14,
    color: '#2B2928',
    fontWeight: 'bold',
    marginRight: 38,
  },
  profileLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileLinkText: {
    fontSize: 12,
    color: '#205E59',
  },
});

export default HamburgerMenu;