import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useDispatch } from 'react-redux';
import { setIsConnectedToInternet } from '@/store/slices/appSlice';

export default function Offline() {
    const isConnectedToInternet = useSelector((state: RootState) => state.app.isConnectedToInternet);
    const dispatch = useDispatch();

    const handleRetry = () => {
        NetInfo.fetch().then((state) => {
            if (state.isInternetReachable) {
                dispatch(setIsConnectedToInternet(true));
            } else {
                dispatch(setIsConnectedToInternet(false));
            }
        });
    };

    return (
        <View style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 56 }}>
            <Image source={require('../../assets/icons/no-internet-icon.webp')} style={{ width: 211, height: 213 }} resizeMode="contain" />
            <View style={styles.innerContainer}>
                <Text style={styles.text1}>No internet found :(</Text>
                <Text style={styles.text2}>Slow or no internet connection. Please check your internet settings.</Text>
                <TouchableOpacity onPress={handleRetry}><Text style={styles.buttonStyle}>Retry Now</Text></TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    text1: {
        fontFamily: "Montserrat_700Bold",
        fontSize: 18,
        textAlign: 'center'
    },
    text2: {
        fontFamily: "Lato",
        fontSize: 16,
        fontWeight: 500,
        color: '#656F77',
        textAlign: 'center'
    },
    innerContainer: {
        maxWidth: 255,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: 'center'
    },
    buttonStyle: {
        fontFamily: "Lato",
        fontSize: 14,
        fontWeight: 700,
        color: "#FAFBFC",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#153E3B",
        borderRadius: 4,
        marginTop: 20
    }
});
