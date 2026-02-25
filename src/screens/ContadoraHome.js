import React from "react";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import MenuItem from "../components/MenuItem";
import ContadoraRendiciones from "./ContadoraRendiciones";
import TransferenciasContadora from "./TransferenciasContadora"; // <-- IMPORTAMOS LA NUEVA VISTA

// Contadora: revisión de rendiciones y liberación de fondos
export default function ContadoraHome({ onLogout, token, embedded = false }) {
  // Ponemos 'transferencias' como menú activo por defecto o lo dejas en 'rendiciones'
  const [activeMenu, setActiveMenu] = useState("transferencias"); 

  if (embedded) {
    return (
      <View style={dash.content}>
        <ContadoraRendiciones token={token} viewMode="rendiciones" />
      </View>
    );
  }

  // Función para renderizar el contenido según el menú
  const renderContent = () => {
    if (activeMenu === "transferencias") {
      return <TransferenciasContadora token={token} />;
    }
    return <ContadoraRendiciones token={token} viewMode={activeMenu === "saldos" ? "saldos" : "rendiciones"} />;
  };

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
              <Text style={dash.profileRole}>Revision y Caja</Text>
            </View>
          </View>

          <Text style={dash.menuTitle}>OPCIONES</Text>
          
          {/* NUEVO ITEM EN EL MENÚ */}
          <MenuItem
            label="Liberar Fondos"
            active={activeMenu === "transferencias"}
            onPress={() => setActiveMenu("transferencias")}
          />

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
          {renderContent()}
        </View>
      </View>
    </View>
  );
}