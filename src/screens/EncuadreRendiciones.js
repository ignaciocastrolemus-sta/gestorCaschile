import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import { Card, Col, Label, Row, SectionTitle } from "../components/UI";

const API_URL = `${API_BASE}/Rendiciones/encuadre`;

const fmtDate = (value) => {
  if (!value) return "";
  const raw = String(value).slice(0, 10);
  const [yyyy, mm, dd] = raw.split("-");
  if (!yyyy || !mm || !dd) return raw;
  return `${dd}/${mm}/${yyyy}`;
};

const fmtMoney = (n) => {
  const v = Number(n || 0);
  return v.toLocaleString("es-CL");
};

export default function EncuadreRendiciones({ token }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState({
    desde: "",
    hasta: "",
    estado: "",
    capacitador: "",
    cliente: "",
  });

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (filtro.desde) params.set("desde", filtro.desde);
    if (filtro.hasta) params.set("hasta", filtro.hasta);
    if (filtro.estado) params.set("estado", filtro.estado);
    if (filtro.capacitador) params.set("capacitador", filtro.capacitador);
    if (filtro.cliente) params.set("cliente", filtro.cliente);
    const qs = params.toString();
    return qs ? `${API_URL}?${qs}` : API_URL;
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(buildUrl(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "No se pudo cargar el encuadre.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const onChange = (k, v) => setFiltro((prev) => ({ ...prev, [k]: v }));

  const totales = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        acc.asignado += Number(it.totalAsignado || 0);
        acc.rendido += Number(it.totalRendido || 0);
        acc.diff += Number(it.diferencia || 0);
        return acc;
      },
      { asignado: 0, rendido: 0, diff: 0 }
    );
  }, [items]);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <SectionTitle title="Encuadre de rendiciones" subtitle="Comparacion asignado vs rendido." />

      <Card style={{ marginBottom: 16 }}>
        <Row gap={12}>
          <Col>
            <Label>Desde</Label>
            <TextInput
              value={filtro.desde}
              onChangeText={(v) => onChange("desde", v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
          </Col>
          <Col>
            <Label>Hasta</Label>
            <TextInput
              value={filtro.hasta}
              onChangeText={(v) => onChange("hasta", v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
          </Col>
        </Row>

        <Row gap={12} style={{ marginTop: 12 }}>
          <Col>
            <Label>Estado</Label>
            <TextInput
              value={filtro.estado}
              onChangeText={(v) => onChange("estado", v)}
              placeholder="Ej: Aprobada"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
          </Col>
          <Col>
            <Label>Capacitador</Label>
            <TextInput
              value={filtro.capacitador}
              onChangeText={(v) => onChange("capacitador", v)}
              placeholder="Nombre o correo"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
          </Col>
        </Row>

        <Row gap={12} style={{ marginTop: 12 }}>
          <Col>
            <Label>Cliente / Municipio</Label>
            <TextInput
              value={filtro.cliente}
              onChangeText={(v) => onChange("cliente", v)}
              placeholder="Municipio"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
          </Col>
          <Col>
            <Label>&nbsp;</Label>
            <Pressable style={styles.primaryBtn} onPress={load}>
              <Text style={styles.primaryText}>{loading ? "Cargando..." : "Aplicar filtros"}</Text>
            </Pressable>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.totals}>Total asignado: $ {fmtMoney(totales.asignado)}</Text>
        <Text style={styles.totals}>Total rendido: $ {fmtMoney(totales.rendido)}</Text>
        <Text style={styles.totals}>Diferencia: $ {fmtMoney(totales.diff)}</Text>
      </Card>

      {items.length === 0 ? (
        <Text style={{ color: COLORS.muted, fontWeight: "700" }}>No hay rendiciones.</Text>
      ) : (
        items.map((it) => (
          <View key={it.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Rendicion #{it.id}</Text>
              <Text style={styles.sub}>Capacitador: {it.viaje?.capacitador || "-"}</Text>
              <Text style={styles.sub}>
                Destino: {it.viaje?.municipio || "-"} ({it.viaje?.regionNombre || "-"})
              </Text>
              <Text style={styles.sub}>
                Fechas: {fmtDate(it.viaje?.fechaInicio)} - {fmtDate(it.viaje?.fechaTermino)}
              </Text>
              <Text style={styles.sub}>Estado: {it.estado}</Text>
            </View>
            <View style={styles.moneyCol}>
              <Text style={styles.money}>Asignado: $ {fmtMoney(it.totalAsignado)}</Text>
              <Text style={styles.money}>Rendido: $ {fmtMoney(it.totalRendido)}</Text>
              <Text style={styles.money}>Dif: $ {fmtMoney(it.diferencia)}</Text>
            </View>
          </View>
        ))
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  primaryBtn: {
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#fff", fontWeight: "900" },
  totals: { color: COLORS.text, fontWeight: "800", marginBottom: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  title: { fontWeight: "900", color: COLORS.text },
  sub: { marginTop: 2, color: COLORS.muted, fontWeight: "700" },
  moneyCol: { alignItems: "flex-end" },
  money: { fontWeight: "800", color: COLORS.text },
  error: { marginTop: 10, color: COLORS.muted, fontWeight: "800" },
});


