import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, Image, useWindowDimensions } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import MenuItem from "../components/MenuItem";
import CapacitadorRendicion from "./CapacitadorRendicion";
import CapacitadorCarpeta from "./CapacitadorCarpeta";
import CapacitadorSaldos from "./CapacitadorSaldos";
import { API_BASE } from "../config/api";
import {
  getHiddenNotificationIds,
  getRecentVisibleNotificationCount,
  getVisibleNotifications,
  hideNotifications,
} from "../utils/notificationUtils";

export default function CapacitadorHome({ onLogout, token, embedded = false }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 980;
  const [activeMenu, setActiveMenu] = useState("rendicion");
  const [selectedViajeId, setSelectedViajeId] = useState(null);
  const [rendicionContext, setRendicionContext] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [hiddenNotiIds, setHiddenNotiIds] = useState(() => getHiddenNotificationIds("capacitador"));
  const [showNotiModal, setShowNotiModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);

  const handleIrRendicion = (viajeId, context = null) => {
    if (viajeId) setSelectedViajeId(viajeId);
    setRendicionContext(context);
    setActiveMenu("rendicion");
    setShowMenuModal(false);
  };

  const loadNotificaciones = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/Rendiciones/saldos/notificaciones?top=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setNotificaciones([]);
        return;
      }
      const data = await res.json();
      setNotificaciones(Array.isArray(data) ? data : []);
    } catch {
      setNotificaciones([]);
    }
  }, [token]);

  useEffect(() => {
    loadNotificaciones();
    const timer = setInterval(loadNotificaciones, 45000);
    return () => clearInterval(timer);
  }, [loadNotificaciones]);

  useEffect(() => {
    if (!isMobile) setShowMenuModal(false);
  }, [isMobile]);

  const visibleNotificaciones = useMemo(
    () => getVisibleNotifications(notificaciones, hiddenNotiIds),
    [notificaciones, hiddenNotiIds]
  );
  const badgeCount = useMemo(
    () => getRecentVisibleNotificationCount(notificaciones, 3, hiddenNotiIds),
    [notificaciones, hiddenNotiIds]
  );

  if (embedded) {
    return (
      <View style={dash.content}>
        {activeMenu === "carpeta" ? (
          <CapacitadorCarpeta token={token} onIrRendicion={handleIrRendicion} />
        ) : activeMenu === "saldos" ? (
          <CapacitadorSaldos token={token} />
        ) : (
          <CapacitadorRendicion token={token} selectedViajeId={selectedViajeId} selectedContext={rendicionContext} />
        )}
      </View>
    );
  }

  const SidebarContent = () => (
    <>
      <View style={dash.profileBox}>
        <Image style={dash.avatarLogo} source={require("../../assets/RindeCas.jpg")} />
        <View>
          <Text style={dash.profileName}>Capacitador</Text>
          <Text style={dash.profileRole}>Terreno</Text>
        </View>
      </View>

      <View style={dash.menuTitleWrap}>
        <Text style={dash.menuTitle}>OPCIONES</Text>
      </View>

      <ScrollView style={dash.sidebarMenu} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator>
        <MenuItem label="Mis rendiciones" icon="🧾" active={activeMenu === "rendicion"} onPress={() => { setActiveMenu("rendicion"); setShowMenuModal(false); }} highlight />
        <MenuItem label="Carpeta de viajes" icon="🗂️" active={activeMenu === "carpeta"} onPress={() => { setActiveMenu("carpeta"); setShowMenuModal(false); }} />
        <MenuItem
          label={badgeCount > 0 ? `Mis saldos (${badgeCount})` : "Mis saldos"}
          icon="💰"
          active={activeMenu === "saldos"}
          onPress={() => { setActiveMenu("saldos"); setShowMenuModal(false); }}
        />
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
              <Pressable style={dash.topBtn} onPress={() => setShowNotiModal(true)}>
                <Text style={dash.topBtnText}>{badgeCount > 0 ? `Noti (${badgeCount})` : "Noti"}</Text>
              </Pressable>
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
              <Pressable style={dash.topBtn} onPress={() => setShowNotiModal(true)}>
                <Text style={dash.topBtnText}>{badgeCount > 0 ? `Notificaciones (${badgeCount})` : "Notificaciones"}</Text>
              </Pressable>
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
          {activeMenu === "carpeta" ? (
            <CapacitadorCarpeta token={token} onIrRendicion={handleIrRendicion} />
          ) : activeMenu === "saldos" ? (
            <CapacitadorSaldos token={token} />
          ) : (
            <CapacitadorRendicion token={token} selectedViajeId={selectedViajeId} selectedContext={rendicionContext} />
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

      <Modal transparent visible={showNotiModal} animationType="fade" onRequestClose={() => setShowNotiModal(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center", padding: 16 }}>
          <View style={{ width: "100%", maxWidth: 760, maxHeight: "80%", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#D9E5FF", padding: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: COLORS.text, fontWeight: "900", fontSize: 18 }}>Notificaciones</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable style={dash.docBtn} onPress={loadNotificaciones}>
                  <Text style={dash.docBtnText}>Actualizar</Text>
                </Pressable>
                <Pressable style={dash.docBtn} onPress={() => setHiddenNotiIds(hideNotifications("capacitador", visibleNotificaciones))}>
                  <Text style={dash.docBtnText}>Marcar todo leido</Text>
                </Pressable>
                <Pressable style={dash.docBtn} onPress={() => setShowNotiModal(false)}>
                  <Text style={dash.docBtnText}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView>
              {visibleNotificaciones.length === 0 ? (
                <Text style={{ color: COLORS.muted, fontWeight: "700" }}>Sin notificaciones.</Text>
              ) : (
                visibleNotificaciones.map((n) => (
                  <View key={String(n.id)} style={{ borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 8, marginTop: 8 }}>
                    <Text style={{ color: COLORS.text, fontWeight: "900" }}>{n.titulo || "Notificacion"}</Text>
                    <Text style={{ color: COLORS.muted, fontWeight: "700", fontSize: 12 }}>
                      {n?.fechaRegistro ? new Date(n.fechaRegistro).toLocaleString("es-CL") : "-"}
                      {n?.rendicionId ? ` | Rendicion #${n.rendicionId}` : ""}
                    </Text>
                    {!!n?.mensaje ? <Text style={{ color: COLORS.muted, fontWeight: "700", fontSize: 12 }}>{n.mensaje}</Text> : null}
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                      <Pressable style={dash.docBtn} onPress={() => { setShowNotiModal(false); setActiveMenu("rendicion"); }}>
                        <Text style={dash.docBtnText}>Ir a rendiciones</Text>
                      </Pressable>
                      <Pressable style={dash.docBtn} onPress={() => { setShowNotiModal(false); setActiveMenu("saldos"); }}>
                        <Text style={dash.docBtnText}>Ir a saldos</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
