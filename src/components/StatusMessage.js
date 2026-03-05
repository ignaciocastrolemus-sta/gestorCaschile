import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TONES = {
  error: {
    borderColor: "#F6C7CC",
    backgroundColor: "#FFF1F2",
    color: "#B42318",
  },
  info: {
    borderColor: "#BFD4FF",
    backgroundColor: "#EEF4FF",
    color: "#1D4ED8",
  },
  warning: {
    borderColor: "#F9D79B",
    backgroundColor: "#FFF8E8",
    color: "#B54708",
  },
};

export default function StatusMessage({ tone = "info", text, style }) {
  if (!text) return null;
  const ui = TONES[tone] || TONES.info;
  return (
    <View
      style={[
        styles.box,
        { borderColor: ui.borderColor, backgroundColor: ui.backgroundColor },
        style,
      ]}
    >
      <Text style={[styles.text, { color: ui.color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  text: {
    fontWeight: "800",
  },
});

