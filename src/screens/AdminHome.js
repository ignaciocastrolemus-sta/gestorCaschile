import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, ScrollView, Modal, useWindowDimensions } from "react-native";
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
  const { width } = useWindowDimensions();
  const isMobile = width < 980;
  const [activeMenu, setActiveMenu] = useState("usuarios");
  const [showMenuModal, setShowMenuModal] = useState(false);

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

  const SidebarContent = () => (
    <>
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
        <MenuItem label="Usuarios" icon="👤" active={activeMenu === "usuarios"} onPress={() => { setActiveMenu("usuarios"); setShowMenuModal(false); }} highlight />
        <Text style={styles.sectionTitle}>Gestion</Text>
        <MenuItem label="Catalogos" icon="🗃️" active={activeMenu === "catalogos"} onPress={() => { setActiveMenu("catalogos"); setShowMenuModal(false); }} />
        <MenuItem label="Tarifas" icon="💳" active={activeMenu === "tarifas"} onPress={() => { setActiveMenu("tarifas"); setShowMenuModal(false); }} />
        <MenuItem label="Periodos" icon="🗓️" active={activeMenu === "periodos"} onPress={() => { setActiveMenu("periodos"); setShowMenuModal(false); }} />
        <MenuItem label="Roles" icon="🛡️" active={activeMenu === "roles"} onPress={() => { setActiveMenu("roles"); setShowMenuModal(false); }} />
        <Text style={styles.sectionTitle}>Reportes</Text>
        <MenuItem label="Listados" icon="📑" active={activeMenu === "listados"} onPress={() => { setActiveMenu("listados"); setShowMenuModal(false); }} />
        <MenuItem label="Encuadre" icon="📊" active={activeMenu === "encuadre"} onPress={() => { setActiveMenu("encuadre"); setShowMenuModal(false); }} />
      </ScrollView>
    </>
  );

  return (
    <View style={dash.root}>
      <View style={[dash.topbar, isMobile && dash.topbarMobile]}>
        {isMobile ? (
          <View style={dash.topbarRowMobile}>
            <View style={dash.brandWrap}>
              <Text style={dash.brand}>RindeCas</Text>
            </View>
            <View style={dash.topActionsMobile}>
              <Pressable style={dash.topBtn} onPress={() => setShowMenuModal(true)}>
                <Text style={dash.topBtnText}>Menu</Text>
              </Pressable>
              <Pressable style={[dash.topBtn, { backgroundColor: COLORS.orange }]} onPress={onLogout}>
                <Text style={[dash.topBtnText, { color: "#fff" }]}>Salir</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
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
          </>
        )}
      </View>

      <View style={[dash.body, isMobile && dash.bodyMobile]}>
        {!isMobile ? (
          <View style={dash.sidebar}>
            <SidebarContent />
          </View>
        ) : null}

        <View style={[dash.content, isMobile && dash.contentMobile]}>
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

      <Modal transparent visible={showMenuModal} animationType="slide" onRequestClose={() => setShowMenuModal(false)}>
        <Pressable style={dash.drawerOverlay} onPress={() => setShowMenuModal(false)}>
          <Pressable style={dash.drawerPanel} onPress={() => null}>
            <View style={dash.drawerHeaderRow}>
              <Text style={{ color: COLORS.blue2, fontWeight: "900", fontSize: 16 }}>Menu</Text>
              <Pressable style={dash.drawerCloseBtn} onPress={() => setShowMenuModal(false)}>
                <Text style={dash.drawerCloseText}>Cerrar</Text>
              </Pressable>
            </View>
            <SidebarContent />
          </Pressable>
        </Pressable>
      </Modal>
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
