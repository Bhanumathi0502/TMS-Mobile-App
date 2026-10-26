import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";
import AppLogo from "../components/AppLogo";

export default function SplashScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 2200);

    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true })
    ]).start();

    return () => clearTimeout(timer);
  }, [fade, navigation, scale]);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.center, { opacity: fade, transform: [{ scale }] }]}>
        <AppLogo size={92} />
        <Text style={styles.subtitle}>Ticket Management System</Text>
      </Animated.View>
      <ActivityIndicator color="#60A5FA" size="small" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#07111F",
    alignItems: "center",
    justifyContent: "center"
  },
  center: { alignItems: "center" },
  title: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 1.2
  },
  subtitle: {
    marginTop: 10,
    color: "#93C5FD",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center"
  },
  loader: { position: "absolute", bottom: 48 }
});
