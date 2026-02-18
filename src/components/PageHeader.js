import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

// Cabecera estandar para pantallas de mantenedores.
export default function PageHeader({
  title,
  subtitle,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.actions}>
        {!!secondaryLabel && (
          <Pressable style={styles.secondaryBtn} onPress={onSecondaryPress}>
            <Text style={styles.secondaryText}>{secondaryLabel}</Text>
          </Pressable>
        )}
        {!!primaryLabel && (
          <Pressable style={styles.primaryBtn} onPress={onPrimaryPress}>
            <Text style={styles.primaryText}>{primaryLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  left: { flex: 1 },
  title: { fontSize: 27, fontWeight: "900", color: COLORS.text },
  subtitle: { marginTop: 4, color: COLORS.muted, fontWeight: "800" },
  actions: { flexDirection: "row", gap: 8 },
  primaryBtn: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  secondaryBtn: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: COLORS.blue2, fontWeight: "900", fontSize: 12 },
});
