import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

// Fila de indicadores rapidos para resumen visual.
export default function KpiRow({ items = [] }) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.key} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={[styles.value, item.valueColor && { color: item.valueColor }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginBottom: 12, flexWrap: "wrap" },
  card: {
    minWidth: 140,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#F7FAFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  label: { color: COLORS.muted, fontWeight: "800", fontSize: 12 },
  value: { marginTop: 4, color: COLORS.text, fontWeight: "900", fontSize: 20 },
});
