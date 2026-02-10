import React from "react";
import { View, Text, Pressable } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import MenuItem from "../components/MenuItem";
import FormularioGasto from "./FormularioGasto";
import CarpetaViajes from "./CarpetaViajes";
import AsignacionSemanal from "./AsignacionSemanal";
import TransferenciasSecretaria from "./TransferenciasSecretaria";

export default function SecretariaLayout({
  onLogout,
  authToken,
  activeMenu,
  setActiveMenu,
  tipoViaje,
  form,
  onTextChange,
  onNumberChange,
  onFechaInicioSelect,
  diasHabiles,
  onSave,
  onToggleNoAplica,
  onChangeTipoViaje,
  saveMsg,
}) {
  return (
    <View style={dash.root}>
      <View style={dash.topbar}>
        <Text style={dash.brand}>Gestor CAS Chile</Text>

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
              <Text style={dash.profileName}>Administradora</Text>
              <Text style={dash.profileRole}>Secretaria</Text>
            </View>
          </View>

          <Text style={dash.menuTitle}>OPCIONES</Text>

          <MenuItem
            label="Ingresar gasto"
            active={activeMenu === "gasto"}
            onPress={() => setActiveMenu("gasto")}
          />
          <MenuItem
            label="Carpeta de viajes"
            active={activeMenu === "carpeta"}
            onPress={() => setActiveMenu("carpeta")}
          />
          <MenuItem
            label="Asignaciones clientes"
            active={activeMenu === "semanal"}
            onPress={() => setActiveMenu("semanal")}
          />
          <MenuItem
            label="Transferencias"
            active={activeMenu === "transfer"}
            onPress={() => setActiveMenu("transfer")}
          />
        </View>

        <View style={dash.content}>
          {activeMenu === "carpeta" ? (
            <CarpetaViajes token={authToken} />
          ) : activeMenu === "semanal" ? (
            <AsignacionSemanal token={authToken} />
          ) : activeMenu === "transfer" ? (
            <TransferenciasSecretaria token={authToken} />
          ) : (
            <FormularioGasto
              tipo={tipoViaje}
              form={form}
              onTextChange={onTextChange}
              onNumberChange={onNumberChange}
              onFechaInicioSelect={onFechaInicioSelect}
              diasHabiles={diasHabiles}
              onSave={onSave}
              onToggleNoAplica={onToggleNoAplica}
              onChangeTipoViaje={onChangeTipoViaje}
              saveMsg={saveMsg}
              token={authToken}
            />
          )}
        </View>
      </View>
    </View>
  );
}
