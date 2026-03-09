import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import { API_BASE } from "../config/api";
import { COLORS } from "../constants/colors";
import dash from "../styles/dashboardStyles";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import StatusMessage from "../components/StatusMessage";
import { getVisibleNotifications } from "../utils/notificationUtils";

const fmtMoney = (n) => `$ ${Number(n || 0).toLocaleString("es-CL")}`;
const fmtDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getSaldoSigned = (r) => {
  const pendiente = Number(r?.saldoPendiente || 0);
  const tipo = normalizeText(r?.tipoResultado);
  if (pendiente <= 0) return 0;
  if (tipo === "reembolso") return Math.abs(pendiente);
  if (tipo === "devolucion") return -Math.abs(pendiente);
  return 0;
};

const pickComprobanteWeb = () =>
  new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,image/png,image/jpeg";
    input.style.display = "none";
    input.onchange = () => {
      const selected = input.files?.[0] || null;
      input.remove();
      resolve(selected);
    };
    input.oncancel = () => {
      input.remove();
      resolve(null);
    };
    document.body.appendChild(input);
    input.click();
  });

export default function CapacitadorSaldos({ token }) {
  const [items, setItems] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showNovedades, setShowNovedades] = useState(true);
  const [formById, setFormById] = useState({});
  const [openByCap, setOpenByCap] = useState({});
  const [movimientosById, setMovimientosById] = useState({});
  const [openById, setOpenById] = useState({});
  const [loadingById, setLoadingById] = useState({});
  const [registrandoById, setRegistrandoById] = useState({});

  const load = useCallback(async () => {
    try {
      const [res, resNoti] = await Promise.all([
        fetch(`${API_BASE}/Rendiciones/mias`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/Rendiciones/saldos/notificaciones?top=20`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const list = (Array.isArray(data) ? data : []).filter((r) => normalizeText(r?.tipoResultado) !== "cuadrada");
      setItems(list);
      if (resNoti.ok) {
        const dataNoti = await resNoti.json();
        setNotificaciones(Array.isArray(dataNoti) ? dataNoti : []);
      } else {
        setNotificaciones([]);
      }
      setError("");
    } catch (e) {
      setError(e?.message || "No se pudieron cargar saldos.");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const openActionForm = (r) => {
    const saldo = Math.abs(getSaldoSigned(r));
    if (!saldo) return;
    setFormById((prev) => ({
      ...prev,
      [r.id]: {
        monto: String(saldo),
        observacion: "",
        comprobante: null,
        comprobanteNombre: "",
      },
    }));
  };

  const closeActionForm = (id) => {
    setFormById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const onPickComprobante = async (id) => {
    const picked = await pickComprobanteWeb();
    if (!picked) return;
    setFormById((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        comprobante: picked,
        comprobanteNombre: picked.name || "comprobante",
      },
    }));
  };

  const onRegistrarSaldoCapacitador = async (r) => {
    setError("");
    setInfo("");
    const saldo = Math.abs(getSaldoSigned(r));
    if (!saldo) return;
    const tipoResultado = normalizeText(r?.tipoResultado);
    const requiereComprobante = tipoResultado === "devolucion";
    const form = formById[r.id] || {};
    const monto = Number(String(form.monto || "").replace(/[^\d.,-]/g, "").replace(",", "."));
    if (!monto || monto <= 0) return;
    const observacion = String(form.observacion || "").trim();
    const comprobante = form.comprobante || null;
    if (requiereComprobante && !comprobante) {
      setError("Debes adjuntar comprobante para informar devolucion.");
      return;
    }

    try {
      setRegistrandoById((prev) => ({ ...prev, [r.id]: true }));
      const formData = new FormData();
      formData.append("monto", String(monto));
      if (observacion) formData.append("observacion", observacion);
      if (comprobante) formData.append("comprobante", comprobante, comprobante.name);

      const res = await fetch(`${API_BASE}/Rendiciones/${r.id}/registrar-saldo-capacitador`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      setInfo(requiereComprobante ? "Devolucion informada correctamente." : "Recepcion confirmada correctamente.");
      closeActionForm(r.id);
      await load();
      setMovimientosById((prev) => ({ ...prev, [r.id]: undefined }));
    } catch (e) {
      setError(e?.message || "No se pudo registrar saldo.");
    } finally {
      setRegistrandoById((prev) => ({ ...prev, [r.id]: false }));
    }
  };

  const onToggleMovimientos = async (rendicionId) => {
    const nextOpen = !openById[rendicionId];
    setOpenById((prev) => ({ ...prev, [rendicionId]: nextOpen }));
    if (!nextOpen || movimientosById[rendicionId]) return;

    try {
      setLoadingById((prev) => ({ ...prev, [rendicionId]: true }));
      const res = await fetch(`${API_BASE}/Rendiciones/${rendicionId}/saldo-movimientos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMovimientosById((prev) => ({ ...prev, [rendicionId]: Array.isArray(data) ? data : [] }));
    } catch (e) {
      setMovimientosById((prev) => ({
        ...prev,
        [rendicionId]: [{ id: `err-${rendicionId}`, observacion: e?.message || "Error al cargar movimientos." }],
      }));
    } finally {
      setLoadingById((prev) => ({ ...prev, [rendicionId]: false }));
    }
  };

  const resumen = useMemo(() => {
    return items.reduce(
      (acc, r) => {
        const saldo = getSaldoSigned(r);
        if (saldo === 0) acc.cerrados += 1;
        else acc.pendientes += 1;
        if (saldo > 0) acc.aFavor += saldo;
        if (saldo < 0) acc.enContra += Math.abs(saldo);
        return acc;
      },
      { pendientes: 0, cerrados: 0, aFavor: 0, enContra: 0 }
    );
  }, [items]);

  const itemsPorCapacitador = useMemo(() => {
    const map = new Map();
    (items || []).forEach((r) => {
      const cap = r?.viaje?.capacitador || "Sin nombre";
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap).push(r);
    });
    return Array.from(map.entries()).map(([capacitador, rows]) => ({ capacitador, rows }));
  }, [items]);

  const visibleNotificaciones = useMemo(() => getVisibleNotifications(notificaciones), [notificaciones]);

  useEffect(() => {
    setOpenByCap((prev) => {
      const next = {};
      itemsPorCapacitador.forEach((g, idx) => {
        next[g.capacitador] = prev[g.capacitador] ?? idx === 0;
      });
      return next;
    });
  }, [itemsPorCapacitador]);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title="Mis saldos"
        subtitle="Consulta saldos de reembolso/devolucion y su historial."
        secondaryLabel="Actualizar"
        onSecondaryPress={load}
      />

      <KpiRow
        items={[
          { key: "pend", label: "Pendientes", value: resumen.pendientes },
          { key: "close", label: "Cerrados", value: resumen.cerrados },
          { key: "fav", label: "A favor", value: fmtMoney(resumen.aFavor) },
          { key: "contra", label: "En contra", value: fmtMoney(resumen.enContra) },
        ]}
      />

      <StatusMessage tone="error" text={error} />
      <StatusMessage tone="info" text={info} />

      <View style={dash.panel}>
        <View style={styles.panelHeadRow}>
          <Text style={dash.panelTitle}>Novedades de saldos</Text>
          <Pressable style={styles.btn} onPress={() => setShowNovedades((v) => !v)}>
            <Text style={styles.btnText}>{showNovedades ? "Ocultar" : "Mostrar"}</Text>
          </Pressable>
        </View>
        {!showNovedades ? (
          <Text style={styles.empty}>Panel contraido. Tienes {visibleNotificaciones.length} notificacion(es).</Text>
        ) : visibleNotificaciones.length === 0 ? (
          <Text style={styles.empty}>Sin novedades recientes.</Text>
        ) : (
          visibleNotificaciones.map((n) => (
            <View key={String(n.id)} style={styles.notiRow}>
              <Text style={styles.notiTitle}>{n.titulo || "Novedad"}</Text>
              <Text style={styles.sub}>
                {fmtDate(n.fechaRegistro)}
                {n.rendicionId ? ` | Rendicion #${n.rendicionId}` : ""}
                {typeof n.monto === "number" ? ` | ${fmtMoney(n.monto || 0)}` : ""}
              </Text>
              {!!n.mensaje ? <Text style={styles.sub}>{n.mensaje}</Text> : null}
            </View>
          ))
        )}
      </View>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Detalle de saldos</Text>
        {items.length === 0 ? (
          <Text style={styles.empty}>No hay saldos para mostrar.</Text>
        ) : (
          itemsPorCapacitador.map((grupo) => (
            <View key={`cap-${grupo.capacitador}`} style={styles.capGroup}>
              <Pressable
                style={styles.capHeader}
                onPress={() => setOpenByCap((prev) => ({ ...prev, [grupo.capacitador]: !prev[grupo.capacitador] }))}
              >
                <Text style={styles.capTitle}>{grupo.capacitador}</Text>
                <Text style={styles.capToggle}>{openByCap[grupo.capacitador] ? "Ocultar" : "Ver"}</Text>
              </Pressable>
              {openByCap[grupo.capacitador]
                ? grupo.rows.map((r) => {
            const saldo = getSaldoSigned(r);
            const saldoEstadoRaw = normalizeText(r?.saldoEstado);
            const estadoSaldo =
              saldoEstadoRaw === "devolucionreportadacapacitador"
                ? "Reportado a contadora"
                : saldo === 0
                  ? "Cerrado"
                  : "Pendiente";
            const tipoSaldo = saldo > 0 ? "Empresa te debe" : saldo < 0 ? "Debes devolver" : "Sin saldo";
            const devolucionReportada = saldoEstadoRaw === "devolucionreportadacapacitador";
            const mostrarAccion = saldo !== 0 && !devolucionReportada;
            return (
              <View key={r.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>
                    Rendicion #{r.id} - {r?.viaje?.municipio || "-"}
                  </Text>
                  <Text style={styles.sub}>
                    {r?.viaje?.capacitador || "-"} | {fmtDate(r?.viaje?.fechaInicio)} - {fmtDate(r?.viaje?.fechaTermino)}
                  </Text>
                  <Text style={styles.sub}>
                    Tipo: {tipoSaldo} | Estado: {estadoSaldo} | Saldo: {fmtMoney(Math.abs(saldo))}
                  </Text>
                  {devolucionReportada ? (
                    <Text style={[styles.sub, { color: "#1D4ED8" }]}>
                      Devolucion informada. Pendiente de confirmacion de contadora.
                    </Text>
                  ) : null}
                  {openById[r.id] ? (
                    <View style={styles.movBox}>
                      {loadingById[r.id] ? <Text style={styles.movLine}>Cargando movimientos...</Text> : null}
                      {(movimientosById[r.id] || []).length === 0 && !loadingById[r.id] ? (
                        <Text style={styles.movLine}>Sin movimientos registrados.</Text>
                      ) : null}
                      {(movimientosById[r.id] || []).map((m) => (
                        <Text key={String(m.id)} style={styles.movLine}>
                          {fmtDate(m.fechaRegistro)} | {m.tipoOperacion || "Movimiento"} | {fmtMoney(m.monto || 0)} |{" "}
                          {m.observacion || "-"}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
                <Pressable style={styles.btn} onPress={() => onToggleMovimientos(r.id)}>
                  <Text style={styles.btnText}>{openById[r.id] ? "Ocultar historial" : "Ver historial"}</Text>
                </Pressable>
                {mostrarAccion ? (
                  formById[r.id] ? (
                    <View style={styles.formBox}>
                      <Text style={styles.formLabel}>Monto</Text>
                      <TextInput
                        value={String(formById[r.id]?.monto || "")}
                        onChangeText={(value) =>
                          setFormById((prev) => ({
                            ...prev,
                            [r.id]: { ...(prev[r.id] || {}), monto: value },
                          }))
                        }
                        placeholder="Monto"
                        placeholderTextColor={COLORS.muted}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                      <Text style={styles.formLabel}>Observacion (opcional)</Text>
                      <TextInput
                        value={String(formById[r.id]?.observacion || "")}
                        onChangeText={(value) =>
                          setFormById((prev) => ({
                            ...prev,
                            [r.id]: { ...(prev[r.id] || {}), observacion: value },
                          }))
                        }
                        placeholder="Referencia / comentario"
                        placeholderTextColor={COLORS.muted}
                        style={styles.input}
                      />
                      {normalizeText(r?.tipoResultado) === "devolucion" ? (
                        <>
                          <Pressable style={styles.btn} onPress={() => onPickComprobante(r.id)}>
                            <Text style={styles.btnText}>Adjuntar comprobante</Text>
                          </Pressable>
                          <Text style={styles.fileName}>
                            {formById[r.id]?.comprobanteNombre || "Sin archivo seleccionado"}
                          </Text>
                        </>
                      ) : null}
                      <View style={styles.formActions}>
                        <Pressable style={styles.btn} onPress={() => closeActionForm(r.id)}>
                          <Text style={styles.btnText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.btn, styles.btnPrimary, registrandoById[r.id] && { opacity: 0.7 }]}
                          onPress={() => onRegistrarSaldoCapacitador(r)}
                          disabled={!!registrandoById[r.id]}
                        >
                          <Text style={[styles.btnText, styles.btnPrimaryText]}>
                            {registrandoById[r.id] ? "Enviando..." : "Enviar"}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => openActionForm(r)}>
                      <Text style={[styles.btnText, styles.btnPrimaryText]}>
                        {normalizeText(r?.tipoResultado) === "reembolso"
                          ? "Confirmar recepcion"
                          : "Informar devolucion"}
                      </Text>
                    </Pressable>
                  )
                ) : null}
              </View>
            );
          })
                : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { color: COLORS.muted, fontWeight: "700" },
  panelHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  capGroup: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    marginTop: 8,
    paddingTop: 8,
  },
  capHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  capTitle: { color: COLORS.text, fontWeight: "900" },
  capToggle: { color: COLORS.blue2, fontWeight: "800", fontSize: 12 },
  row: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 10,
  },
  title: { color: COLORS.text, fontWeight: "900" },
  sub: { marginTop: 3, color: COLORS.muted, fontWeight: "700", fontSize: 12 },
  btn: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#BFD4FF",
    borderRadius: 8,
    backgroundColor: "#EEF3FF",
  },
  btnText: { color: COLORS.blue2, fontWeight: "900", fontSize: 12 },
  btnPrimary: { borderColor: COLORS.blue2, backgroundColor: COLORS.blue2 },
  btnPrimaryText: { color: "#fff" },
  movBox: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    paddingTop: 6,
    gap: 3,
  },
  movLine: { color: COLORS.muted, fontWeight: "700", fontSize: 12 },
  notiRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    paddingVertical: 8,
  },
  notiTitle: { color: COLORS.text, fontWeight: "900" },
  formBox: {
    minWidth: 320,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#F8FAFF",
    gap: 6,
  },
  formLabel: { color: COLORS.text, fontWeight: "800", fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 12,
  },
  formActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 2 },
  fileName: { color: COLORS.muted, fontWeight: "700", fontSize: 12 },
});
