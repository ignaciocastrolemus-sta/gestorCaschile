import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../constants/colors";


// Barra superior (topbar) con acciones principales


export default function Topbar({ onLogout }) {
  return (
    <View style={styles.bar}>
      <Text style={styles.brand}>Gestor • CAS Chile</Text>

      <View style={styles.actions}>
        <Pressable style={styles.linkBtn}>
          <Text style={styles.linkText}>Inicio</Text>
        </Pressable>

        <Pressable style={styles.linkBtn}>
          <Text style={styles.linkText}>Administración</Text>
        </Pressable>

        <Pressable style={[styles.linkBtn, styles.logout]} onPress={onLogout}>
          <Text style={[styles.linkText, { color: "#fff" }]}>Salir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 64,
    backgroundColor: COLORS.blue2,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { color: "#fff", fontSize: 18, fontWeight: "800" },

  actions: { flexDirection: "row", gap: 10, alignItems: "center" },
  linkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  linkText: { color: "#fff", fontWeight: "800" },
  logout: { backgroundColor: COLORS.orange },
});


