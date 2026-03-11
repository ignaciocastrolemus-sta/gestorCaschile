import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, ScrollView } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import MenuItem from "../components/MenuItem";
import AdminUsuarios from "./AdminUsuarios";
import AdminRoles from "./AdminRoles";
import AdminPeriodos from "./AdminPeriodos";
import AdminCatalogos from "./AdminCatalogos";
import AdminTarifas from "./AdminTarifas";
import ListadoAsignacionesSemanales from "./ListadoAsignacionesSemanales";
import EncuadreRendiciones from "./EncuadreRendiciones";

export default function AdminHome({ token, onLogout, email = "" }) {
  const [activeMenu, setActiveMenu] = useState("usuarios");

  const title = useMemo(() => {
    if (activeMenu === "roles") return "Roles";
    if (activeMenu === "usuarios") return "Usuarios";
    if (activeMenu === "periodos") return "Periodos";
    if (activeMenu === "encuadre") return "Encuadre";
    if (activeMenu === "tarifas") return "Tarifas";
    if (activeMenu === "catalogos") return "Catalogos";
    if (activeMenu === "listados") return "Listados";
    return "Admin";
  }, [activeMenu]);

  return (
    <View style={dash.root}>
      <View style={dash.topbar}>
        <View style={dash.brandWrap}>
          <Text style={dash.brand}>RindeCas</Text>
        </View>
        <View style={dash.topActions}>
          <Pressable style={dash.topBtn}>
            <Text style={dash.topBtnText}>Inicio</Text>
          </Pressable>
          <Pressable style={dash.topBtn}>
            <Text style={dash.topBtnText}>Administración</Text>
          </Pressable>
          <Pressable style={[dash.topBtn, { backgroundColor: COLORS.orange }]} onPress={onLogout}>
            <Text style={[dash.topBtnText, { color: "#fff" }]}>Salir</Text>
          </Pressable>
        </View>
      </View>

      <View style={dash.body}>
        <View style={dash.sidebar}>
          <View style={dash.profileBox}>
            <Image style={dash.avatarLogo} source={require("../../assets/RindeCas.jpg")} />
            <View>
              <Text style={dash.profileName}>Administrador</Text>
            </View>
          </View>

          <View style={dash.menuTitleWrap}>
            <Text style={dash.menuTitle}>ADMINISTRACION</Text>
          </View>

          <ScrollView style={dash.sidebarMenu} contentContainerStyle={styles.sidebarContent} showsVerticalScrollIndicator>
            <MenuItem label="Usuarios" icon="👤" active={activeMenu === "usuarios"} onPress={() => setActiveMenu("usuarios")} highlight />
            <Text style={styles.sectionTitle}>Gestion</Text>
            <MenuItem label="Catalogos" icon="🗃️" active={activeMenu === "catalogos"} onPress={() => setActiveMenu("catalogos")} />
            <MenuItem label="Tarifas" icon="💳" active={activeMenu === "tarifas"} onPress={() => setActiveMenu("tarifas")} />
            <MenuItem label="Periodos" icon="🗓️" active={activeMenu === "periodos"} onPress={() => setActiveMenu("periodos")} />
            <MenuItem label="Roles" icon="🛡️" active={activeMenu === "roles"} onPress={() => setActiveMenu("roles")} />
            <Text style={styles.sectionTitle}>Reportes</Text>
            <MenuItem label="Listados" icon="📑" active={activeMenu === "listados"} onPress={() => setActiveMenu("listados")} />
            <MenuItem label="Encuadre" icon="📊" active={activeMenu === "encuadre"} onPress={() => setActiveMenu("encuadre")} />
          </ScrollView>
        </View>

        <View style={dash.content}>
          {activeMenu === "roles" ? (
            <AdminRoles token={token} title={title} />
          ) : activeMenu === "usuarios" ? (
            <AdminUsuarios token={token} title={title} />
          ) : activeMenu === "catalogos" ? (
            <AdminCatalogos token={token} />
          ) : activeMenu === "tarifas" ? (
            <AdminTarifas token={token} />
          ) : activeMenu === "listados" ? (
            <ListadoAsignacionesSemanales token={token} />
          ) : activeMenu === "periodos" ? (
            <AdminPeriodos token={token} />
          ) : activeMenu === "encuadre" ? (
            <EncuadreRendiciones token={token} />
          ) : (
            <AdminUsuarios token={token} title={title} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "900",
    color: COLORS.muted,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
