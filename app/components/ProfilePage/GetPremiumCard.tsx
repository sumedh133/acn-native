import DoubleRightArrowIcon from "@/assets/icons/svg/Common/DoubleRightArrow";
import PremiumIcon from "@/assets/icons/svg/ProfilePage/PremiumIcon";
import { RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSelector } from "react-redux";



const GetPremiumCard = ({
  handleClick,
  slug,
}: {
  handleClick: (slug: string) => void;

  slug: string;
}) => {


  const trialUsed:boolean | null =
  useSelector((state: RootState) => state?.agent?.docData?.onboardingComplete) || false;

 
  const handleStartTrial = () => {
     
  };

  return (
    <>
    
    <LinearGradient
      colors={['#153E3B', '#05635C']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      locations={[-0.1051, 0.4663, 0.9999999999]} 
      
      style={styles.gradientContainer}
    >
      
      <View className="flex-row justify-between">
        <View>
          <Text className="text-white text-lg" style={{fontFamily: "Montserrat_700Bold"}}>ACN Premium</Text>
          <Text className="text-white text-xl font-extrabold mt-1">
            ₹10,000/year!
          </Text>
          
        </View>
        <View className="justify-center">
          <Ionicons
            name="people-circle-outline"
            size={40}
            color="rgba(255,255,255,0.8)"
          />
        </View>
      </View>

      <View className="border-t border-[#FAFAFA] my-4" />

      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <View className="w-2 h-2 bg-white font-normal rounded-full mr-2" />
          <Text className="text-white">Unlimited enquiries</Text>
        </View>
        <View className="flex-row items-center mb-2">
          <View className="w-2 h-2 bg-white rounded-full mr-2" />
          <Text className="text-white">Priority KAM support</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-white rounded-full mr-2" />
          <Text className="text-white">Exclusive market features</Text>
        </View>
      </View>

      <TouchableOpacity
        className="bg-white py-3 rounded-md mb-2"
         onPress={handleStartTrial}
        disabled={trialUsed ?? false}
      >
        <Text className="text-center text-sm text-[#153E3B]" style={{fontFamily:'Lato_700Bold'}} >
          Start 1 month free trial
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row justify-center items-center gap-1"
        onPress={()=>handleClick("compare_plans")}
      >
        <Text className="text-white text-sm" style={{fontFamily:'Lato_700Bold'}}>Compare Plans</Text>
        <Ionicons name="arrow-forward" size={18} color="white" />
      </TouchableOpacity>
    </LinearGradient>
    </>
  );
};

export default React.memo(GetPremiumCard);

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 8,
    padding: 20,
    overflow: 'hidden', 
  },
  ellipseBackground: {
    position: 'absolute',
    overflow:'hidden',
    width: 203,
    height: 208,
    left: 203,
    top: -69.5,
    backgroundColor: 'rgba(244, 168, 0, 0.2)',
    borderRadius: 104,  
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    backgroundColor: "#1B665D",
    borderWidth: 1,
    borderColor: "#10302D",
    borderRadius: 24,
    marginBottom: 17,
  },
  informationContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  textContainer: {
    width: 215,
  },
  text: {
    fontFamily: "Lato",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 500,
    color: "#CCCBCB",
  },
  textBold: {
    fontFamily: "Lato",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  button: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F9D274",
    borderRadius: 6,
    marginBottom: -17,
  },
  buttonText: {
    fontFamily: "Lato",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 21,
    color: "#000000",
  },
});
