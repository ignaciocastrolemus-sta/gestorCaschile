import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";

// Componentes de formulario reutilizables (input, label, etc.)

export function Field({ label, placeholder, value, onChangeText, disabled, keyboardType }) {
  return (
    <View style={{ flex: 1, marginBottom: 12 }}>
      <Text style={dash.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        editable={!disabled}
        keyboardType={keyboardType}
        style={[dash.input, disabled && { backgroundColor: "#F3F4F6" }]}
      />
    </View>
  );
}

export function Small({ label, value, onChangeText, disabled, onToggle }) {
  return (
    <View style={dash.smallBox}>
      <Text style={dash.smallLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="$"
        placeholderTextColor={COLORS.muted}
        keyboardType="numeric"
        editable={!disabled}
        style={[dash.smallInput, disabled && { backgroundColor: "#F3F4F6" }]}
      />
      <Pressable style={dash.radioRow} onPress={onToggle}>
        <View style={[dash.radioOuter, disabled && dash.radioOuterActive]}>
          {disabled && <View style={dash.radioInner} />}
        </View>
        <Text style={dash.radioText}>No aplica</Text>
      </Pressable>
    </View>
  );
}
