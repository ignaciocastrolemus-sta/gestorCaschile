import React from "react";
import { Pressable, Text } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";

// Ítem reutilizable del menú lateral

export default function MenuItem({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[dash.item, active && { backgroundColor: "#E8F0FF", borderColor: "#BFD4FF" }]}
    >
      <Text style={[dash.itemText, active && { color: COLORS.blue2 }]}>{label}</Text>
    </Pressable>
  );
}
