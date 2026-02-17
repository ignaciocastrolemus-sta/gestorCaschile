import React from "react";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import MenuItem from "../components/MenuItem";
import ContadoraRendiciones from "./ContadoraRendiciones";

// Contadora: revisión de rendiciones
export default function ContadoraHome({ onLogout, token, embedded = false }) {
  const [activeMenu, setActiveMenu] = useState("rendiciones");

  if (embedded) {
    return (
      <View style={dash.content}>
        <ContadoraRendiciones token={token} viewMode="rendiciones" />
      </View>
    );
  }

  return (
    <View style={dash.root}>
      <View style={dash.topbar}>
        <Text style={dash.brand}>CAS-Chile</Text>
        <View style={dash.topActions}>
          <Pressable style={dash.topBtn}>
            <Text style={dash.topBtnText}>Inicio</Text>
          </Pressable>
          <Pressable style={[dash.topBtn, { backgroundColor: COLORS.orange }]} onPress={onLogout}>
            <Text style={[dash.topBtnText, { color: "#fff" }]}>Salir</Text>
          </Pressable>
        </View>
      </View>

      <View style={dash.body}>
        <View style={dash.sidebar}>
          <View style={dash.profileBox}>
            <View style={dash.avatar} />
            <View>
              <Text style={dash.profileName}>Contadora</Text>
              <Text style={dash.profileRole}>Revision</Text>
            </View>
          </View>

          <Text style={dash.menuTitle}>OPCIONES</Text>
          <MenuItem
            label="Rendiciones"
            active={activeMenu === "rendiciones"}
            onPress={() => setActiveMenu("rendiciones")}
          />
          <MenuItem
            label="Saldos"
            active={activeMenu === "saldos"}
            onPress={() => setActiveMenu("saldos")}
          />
        </View>

        <View style={dash.content}>
          <ContadoraRendiciones token={token} viewMode={activeMenu === "saldos" ? "saldos" : "rendiciones"} />
        </View>
      </View>
    </View>
  );
}
