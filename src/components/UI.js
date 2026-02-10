import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { COLORS } from "../constants/colors";


// Componentes UI base (Card, Label, Input, Select, etc.)

export function SectionTitle({ title, subtitle }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.h1}>{title}</Text>
      {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Label({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Input({ value, onChangeText, placeholder, keyboardType }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.muted}
      keyboardType={keyboardType}
      style={styles.input}
    />
  );
}

export function Select({ value, onValueChange, items = [] }) {
  return (
    <View style={styles.selectWrap}>
      <Picker selectedValue={value} onValueChange={onValueChange} style={styles.picker}>
        {items.map((it) => (
          <Picker.Item key={String(it.value)} label={it.label} value={it.value} />
        ))}
      </Picker>
    </View>
  );
}

export function Row({ children, gap = 12 }) {
  return <View style={[styles.row, { gap }]}>{children}</View>;
}

export function Col({ children, flex = 1 }) {
  return <View style={{ flex }}>{children}</View>;
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: "800", color: COLORS.text },
  sub: { marginTop: 4, fontSize: 14, color: COLORS.muted },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  label: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 6 },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
  },

  selectWrap: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.inputBg,
    justifyContent: "center",
  },
  picker: {
    height: 44,
    color: COLORS.text,
  },

  row: { flexDirection: "row", alignItems: "center" },
});
