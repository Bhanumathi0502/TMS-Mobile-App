import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { colors } from "../theme";

export default function AppBackground({ children, image, overlay = true, style, contentStyle }) {
  const content = <View style={[styles.inner, contentStyle]}>{children}</View>;

  if (image) {
    return (
      <ImageBackground
        source={{ uri: image }}
        style={[styles.container, style]}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        {overlay ? <View style={styles.overlay} /> : null}
        {content}
      </ImageBackground>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.62)"
  },
  inner: { flex: 1 }
});
