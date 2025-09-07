import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ComingSoonPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 30,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    // Animate page entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime.seconds > 0) {
          return { ...prevTime, seconds: prevTime.seconds - 1 };
        } else if (prevTime.minutes > 0) {
          return { ...prevTime, minutes: prevTime.minutes - 1, seconds: 59 };
        } else if (prevTime.hours > 0) {
          return {
            ...prevTime,
            hours: prevTime.hours - 1,
            minutes: 59,
            seconds: 59,
          };
        } else if (prevTime.days > 0) {
          return {
            ...prevTime,
            days: prevTime.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prevTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNotifyMe = () => {
    if (email.trim() === "") {
      Alert.alert("Email Required", "Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    Alert.alert(
      "Thank You! 🎉",
      "You'll be the first to know when we launch!",
      [{ text: "Awesome!", onPress: () => setEmail("") }]
    );
  };

  const TimeCard: React.FC<{ value: number; label: string }> = ({
    value,
    label,
  }) => (
    <View style={styles.timeCard}>
      <Text style={styles.timeValue}>{value.toString().padStart(2, "0")}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text>Coming Soon</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#2D5016",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    backgroundColor: "#2D5016",
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoText: {
    color: "#2D5016",
    fontSize: 20,
    fontWeight: "bold",
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  heroContent: {
    alignItems: "center",
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },

  // Countdown Section
  countdownSection: {
    backgroundColor: "#ffffff",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 24,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  timeValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2D5016",
    lineHeight: 32,
  },
  timeLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
    fontWeight: "500",
  },

  // Features Section
  featuresSection: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: (width - 60) / 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  featureText: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    lineHeight: 18,
  },

  // Notification Section
  notificationSection: {
    backgroundColor: "#ffffff",
    paddingVertical: 40,
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: "center",
  },
  notifyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 8,
  },
  notifySubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
  },
  emailContainer: {
    marginBottom: 16,
  },
  emailInput: {
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333333",
    backgroundColor: "#ffffff",
    marginBottom: 16,
    fontWeight: "500",
  },
  notifyButton: {
    backgroundColor: "#2D5016",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#2D5016",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notifyButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  privacyText: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    marginTop: 12,
  },
});

export default ComingSoonPage;
