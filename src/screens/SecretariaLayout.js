import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, Image } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import MenuItem from "../components/MenuItem";
import FormularioGasto from "./FormularioGasto";
import CarpetaViajes from "./CarpetaViajes";
import AsignacionSemanal from "./AsignacionSemanal";
import TransferenciasSecretaria from "./TransferenciasSecretaria";
import EncuadreRendiciones from "./EncuadreRendiciones";
import { API_BASE } from "../config/api";
import {
  getHiddenNotificationIds,
  getRecentVisibleNotificationCount,
  getVisibleNotifications,
  hideNotifications,
} from "../utils/notificationUtils";

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
  isSaving,
}) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [hiddenNotiIds, setHiddenNotiIds] = useState(() => getHiddenNotificationIds("secretaria"));
  const [showNotiModal, setShowNotiModal] = useState(false);

  const loadNotificaciones = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/Rendiciones/saldos/notificaciones?top=20`, {
        headers: { Authorization: `Bearer ${authToken}` },
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
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    loadNotificaciones();
    const timer = setInterval(loadNotificaciones, 45000);
    return () => clearInterval(timer);
  }, [authToken, loadNotificaciones]);

  const visibleNotificaciones = useMemo(
    () => getVisibleNotifications(notificaciones, hiddenNotiIds),
    [notificaciones, hiddenNotiIds]
  );
  const badgeCount = useMemo(
    () => getRecentVisibleNotificationCount(notificaciones, 3, hiddenNotiIds),
    [notificaciones, hiddenNotiIds]
  );

  return (
    <View style={dash.root}>
      <View style={dash.topbar}>
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
      </View>

      <View style={dash.body}>
        <View style={dash.sidebar}>
          <View style={dash.profileBox}>
            <Image style={dash.avatarLogo} source={require("../../assets/RindeCas.jpg")} />
            <View>
              <Text style={dash.profileName}>Secretaria</Text>
              <Text style={dash.profileRole}>Operacional</Text>
            </View>
          </View>

          <View style={dash.menuTitleWrap}>
            <Text style={dash.menuTitle}>OPCIONES</Text>
          </View>

          <ScrollView style={dash.sidebarMenu} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator>
            <MenuItem label="Ingresar gasto" icon="🧾" active={activeMenu === "gasto"} onPress={() => setActiveMenu("gasto")} highlight />
            <MenuItem
              label={badgeCount > 0 ? `Carpeta de viajes (${badgeCount})` : "Carpeta de viajes"}
              icon="🗂️"
              active={activeMenu === "carpeta"}
              onPress={() => setActiveMenu("carpeta")}
            />
            <MenuItem label="Saldos" icon="💰" active={activeMenu === "saldos"} onPress={() => setActiveMenu("saldos")} />
            <MenuItem
              label="Asignaciones clientes"
              icon="👥"
              active={activeMenu === "semanal"}
              onPress={() => setActiveMenu("semanal")}
            />
            <MenuItem
              label="Transferencias"
              icon="⇄"
              active={activeMenu === "transfer"}
              onPress={() => setActiveMenu("transfer")}
            />
            <MenuItem label="Encuadre" icon="📋" active={activeMenu === "encuadre"} onPress={() => setActiveMenu("encuadre")} />
          </ScrollView>
        </View>

        <View style={dash.content}>
          {activeMenu === "carpeta" ? (
            <CarpetaViajes token={authToken} viewMode="rendiciones" />
          ) : activeMenu === "saldos" ? (
            <CarpetaViajes token={authToken} viewMode="saldos" />
          ) : activeMenu === "semanal" ? (
            <AsignacionSemanal token={authToken} />
          ) : activeMenu === "transfer" ? (
            <TransferenciasSecretaria token={authToken} />
          ) : activeMenu === "encuadre" ? (
            <EncuadreRendiciones token={authToken} />
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
              isSaving={isSaving}
              token={authToken}
            />
          )}
        </View>
      </View>

      <Modal transparent visible={showNotiModal} animationType="fade" onRequestClose={() => setShowNotiModal(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center", padding: 16 }}>
          <View style={{ width: "100%", maxWidth: 760, maxHeight: "80%", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#D9E5FF", padding: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: COLORS.text, fontWeight: "900", fontSize: 18 }}>Notificaciones</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable style={dash.docBtn} onPress={loadNotificaciones}>
                  <Text style={dash.docBtnText}>Actualizar</Text>
                </Pressable>
                <Pressable
                  style={dash.docBtn}
                  onPress={() => setHiddenNotiIds(hideNotifications("secretaria", visibleNotificaciones))}
                >
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
                    <Pressable
                      style={[dash.docBtn, { marginTop: 6 }]}
                      onPress={() => {
                        setShowNotiModal(false);
                        setActiveMenu("carpeta");
                      }}
                    >
                      <Text style={dash.docBtnText}>Ir a carpeta de viajes</Text>
                    </Pressable>
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

