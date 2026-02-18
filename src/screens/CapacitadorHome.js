import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import MenuItem from "../components/MenuItem";
import CapacitadorRendicion from "./CapacitadorRendicion";
import CapacitadorCarpeta from "./CapacitadorCarpeta";

// Vista Capacitador: rendición y carpeta de viajes

export default function CapacitadorHome({ onLogout, token, embedded = false }) {
  const [activeMenu, setActiveMenu] = useState("rendicion");
  const [selectedViajeId, setSelectedViajeId] = useState(null);
  const [rendicionContext, setRendicionContext] = useState(null);

  const handleIrRendicion = (viajeId, context = null) => {
    if (viajeId) setSelectedViajeId(viajeId);
    setRendicionContext(context);
    setActiveMenu("rendicion");
  };

  if (embedded) {
    return (
      <View style={dash.content}>
        {activeMenu === "carpeta" ? (
          <CapacitadorCarpeta token={token} onIrRendicion={handleIrRendicion} />
        ) : (
          <CapacitadorRendicion
            token={token}
            selectedViajeId={selectedViajeId}
            selectedContext={rendicionContext}
          />
        )}
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
          <Pressable style={dash.topBtn}>
            <Text style={dash.topBtnText}>Administracion</Text>
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
              <Text style={dash.profileName}>Capacitador</Text>
              <Text style={dash.profileRole}>Usuario</Text>
            </View>
          </View>

          <Text style={dash.menuTitle}>OPCIONES</Text>

          <MenuItem
            label="Mis rendiciones"
            active={activeMenu === "rendicion"}
            onPress={() => setActiveMenu("rendicion")}
          />
          <MenuItem
            label="Carpeta de viajes"
            active={activeMenu === "carpeta"}
            onPress={() => setActiveMenu("carpeta")}
          />
        </View>

        <View style={dash.content}>
          {activeMenu === "carpeta" ? (
            <CapacitadorCarpeta token={token} onIrRendicion={handleIrRendicion} />
          ) : (
            <CapacitadorRendicion
              token={token}
              selectedViajeId={selectedViajeId}
              selectedContext={rendicionContext}
            />
          )}
        </View>
      </View>
    </View>
  );
}
