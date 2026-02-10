import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../constants/colors";


// Sidebar de navegación (Secretaria)

export default function Sidebar({ activeKey, active, onChange }) {
  const current = activeKey ?? active;
  const Item = ({ k, label }) => (
    <Pressable
      onPress={() => onChange(k)}
      style={[styles.item, current === k && styles.itemActive]}
    >
      <Text style={[styles.itemText, current === k && styles.itemTextActive]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.profile}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.profileName}>Administradora</Text>
          <Text style={styles.profileRole}>Secretaria</Text>
        </View>
      </View>

      <Text style={styles.menuTitle}>MENÚ</Text>

      <Item k="santiago" label="Ingresar gasto Santiago" />
      <Item k="regiones" label="Ingresar gasto Regiones" />
      <Item k="semanal" label="Asignaciones clientes" />
      <Item k="transfer" label="Transferencias" />
      <Item k="docs" label="Documentos recibidos" />

      <View style={{ flex: 1 }} />

      <Pressable style={styles.close}>
        <Text style={styles.closeText}>Cerrar menú</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 290,
    backgroundColor: "#F7F8FC",
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    padding: 16,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },
  avatar: { width: 44, height: 44, borderRadius: 999, backgroundColor: "#E6ECF7" },
  profileName: { fontWeight: "900", color: COLORS.text, fontSize: 14 },
  profileRole: { marginTop: 2, color: COLORS.muted, fontWeight: "800" },

  menuTitle: { marginTop: 18, marginBottom: 10, color: COLORS.blue2, fontWeight: "900", fontSize: 18 },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  itemActive: {
    backgroundColor: "#E8F0FF",
    borderColor: "#BFD4FF",
  },
  itemText: { color: COLORS.text, fontWeight: "800" },
  itemTextActive: { color: COLORS.blue2 },

  close: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
  },
  closeText: { color: COLORS.muted, fontWeight: "900" },
});
