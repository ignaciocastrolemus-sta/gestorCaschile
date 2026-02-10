import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { COLORS } from "../constants/colors";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Card, Col, Input, Label, Row, SectionTitle, Select } from "../components/UI";
import AsignacionSemanal from "./AsignacionSemanal";
import TransferenciasSecretaria from "./TransferenciasSecretaria";

// Secretaria: ingreso de gastos y documentos recibidos
export default function SecretariaHome({ onLogout, token, embedded = false }) {
  const [active, setActive] = useState("santiago");
  const [form, setForm] = useState({
    concepto: "",
    monto: "",
    fecha: "",
    datosViaje: "",
    dias: "",
    asignacionDia: "",
    gastoManual: "",
    responsable: "",
    categoria: "movilidad",
  });
  const [gastosSantiago, setGastosSantiago] = useState([]);
  const [gastosRegion, setGastosRegion] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const isSantiago = active === "santiago";
  const gastosActuales = isSantiago ? gastosSantiago : gastosRegion;

  const totalActual = useMemo(() => {
    return gastosActuales.reduce((acc, it) => {
      const base = Number(it.monto || 0);
      const asignacion = Number(it.asignacionTotal || 0);
      const manual = Number(it.gastoManual || 0);
      return acc + base + asignacion + manual;
    }, 0);
  }, [gastosActuales]);

  const handleNumeroChange = (campo, value) => {
    const limpio = value.replace(/[^\d]/g, "");
    // Solo permite numeros en campos numericos
    setForm((prev) => ({ ...prev, [campo]: limpio }));
  };

  const handleAgregarGasto = () => {
    if (!form.concepto.trim() || !form.monto.trim()) {
      setMensaje("Faltan campos obligatorios (concepto y monto).");
      Alert.alert("Atencion", "Completa concepto y monto para guardar.");
      return;
    }
    const asignacionTotal = Number(form.asignacionDia || 0) * Number(form.dias || 0);
    const nuevo = {
      id: Date.now().toString(),
      concepto: form.concepto.trim(),
      monto: form.monto.trim(),
      fecha: form.fecha.trim(),
      datosViaje: form.datosViaje.trim(),
      dias: form.dias.trim(),
      asignacionDia: form.asignacionDia.trim(),
      asignacionTotal: String(asignacionTotal || 0),
      gastoManual: form.gastoManual.trim(),
      responsable: form.responsable.trim(),
      categoria: form.categoria,
      sede: isSantiago ? "Santiago" : "Regiones",
    };

    // Agrega el gasto a la lista de la sede activa
    if (isSantiago) {
      setGastosSantiago((prev) => [nuevo, ...prev]);
    } else {
      setGastosRegion((prev) => [nuevo, ...prev]);
    }

    setForm((prev) => ({
      ...prev,
      concepto: "",
      monto: "",
      gastoManual: "",
    }));

    // Muestra confirmacion simple de guardado
    setMensaje("Gasto guardado correctamente.");
    Alert.alert("Guardado", "El gasto fue guardado.");
  };

  const mainContent = (
    <ScrollView contentContainerStyle={styles.content}>
      {active === "semanal" ? (
        <AsignacionSemanal token={token} />
      ) : active === "transfer" ? (
        <TransferenciasSecretaria token={token} />
      ) : active === "docs" ? (
        <View style={styles.card}>
          <Text style={styles.title}>Documentos recibidos</Text>
          <Text style={styles.subtitle}>
            Aqui se listaran los PDF/imagenes enviados por capacitadores/jefes/soporte.
          </Text>
          <View style={styles.placeholder}>
            <Text style={{ color: COLORS.muted, fontWeight: "700" }}>
              Siguiente paso: lista de documentos con busqueda y descarga.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <SectionTitle
            title={isSantiago ? "Ingresar gasto Santiago" : "Ingresar gasto Regiones"}
            subtitle="Formulario simple para registrar gastos."
          />

          <Card style={{ marginBottom: 16 }}>
            <Row gap={16}>
              <Col>
                <Label>Concepto</Label>
                <Input
                  value={form.concepto}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, concepto: value }))}
                  placeholder="Ej: Pasajes, colacion"
                />
              </Col>
              <Col>
                <Label>Monto (CLP)</Label>
                <Input
                  value={form.monto}
                  onChangeText={(value) => handleNumeroChange("monto", value)}
                  placeholder="Ej: 15000"
                  keyboardType="numeric"
                />
              </Col>
            </Row>

            <Row gap={16} style={{ marginTop: 12 }}>
              <Col>
                <Label>Fecha</Label>
                <Input
                  value={form.fecha}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, fecha: value }))}
                  placeholder="Ej: 27-01-2026"
                />
              </Col>
              <Col>
                <Label>Datos del viaje</Label>
                <Input
                  value={form.datosViaje}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, datosViaje: value }))}
                  placeholder="Ej: Santiago - Valparaiso"
                />
              </Col>
            </Row>

            <Row gap={16} style={{ marginTop: 12 }}>
              <Col>
                <Label>Asignacion (por dia)</Label>
                <Input
                  value={form.asignacionDia}
                  onChangeText={(value) => handleNumeroChange("asignacionDia", value)}
                  placeholder="Ej: 25000"
                  keyboardType="numeric"
                />
              </Col>
              <Col>
                <Label>Dias</Label>
                <Input
                  value={form.dias}
                  onChangeText={(value) => handleNumeroChange("dias", value)}
                  placeholder="Ej: 2"
                  keyboardType="numeric"
                />
              </Col>
            </Row>

            <Row gap={16} style={{ marginTop: 12 }}>
              <Col>
                <Label>Gasto manual</Label>
                <Input
                  value={form.gastoManual}
                  onChangeText={(value) => handleNumeroChange("gastoManual", value)}
                  placeholder="Ej: 5000"
                  keyboardType="numeric"
                />
              </Col>
              <Col>
                <Label>Responsable</Label>
                <Input
                  value={form.responsable}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, responsable: value }))}
                  placeholder="Nombre de quien rinde"
                />
              </Col>
            </Row>

            <Row gap={16} style={{ marginTop: 12 }}>
              <Col>
                <Label>Categoria</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, categoria: value }))}
                  items={[
                    { label: "Movilidad", value: "movilidad" },
                    { label: "Alimentacion", value: "alimentacion" },
                    { label: "Materiales", value: "materiales" },
                    { label: "Otros", value: "otros" },
                  ]}
                />
              </Col>
              <Col>
                <View />
              </Col>
            </Row>

            <Pressable style={styles.addBtn} onPress={handleAgregarGasto}>
              <Text style={styles.addBtnText}>Guardar</Text>
            </Pressable>
            {!!mensaje && <Text style={styles.saveMsg}>{mensaje}</Text>}
          </Card>

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Gastos registrados</Text>
            <Text style={styles.listTotal}>Total: ${totalActual.toLocaleString("es-CL")}</Text>
          </View>

          {gastosActuales.length === 0 ? (
            <Text style={styles.emptyText}>No hay gastos registrados en esta sede.</Text>
          ) : (
            gastosActuales.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <View>
                  <Text style={styles.listItemTitle}>{item.concepto}</Text>
                  <Text style={styles.listItemSub}>
                    {item.responsable ? `${item.responsable} - ` : ""}
                    {item.categoria}
                  </Text>
                  {!!item.fecha && <Text style={styles.listItemSub}>Fecha: {item.fecha}</Text>}
                  {!!item.datosViaje && <Text style={styles.listItemSub}>Viaje: {item.datosViaje}</Text>}
                  {!!item.asignacionDia && !!item.dias && (
                    <Text style={styles.listItemSub}>
                      Asignacion: ${Number(item.asignacionDia).toLocaleString("es-CL")} x{" "}
                      {item.dias} = ${Number(item.asignacionTotal).toLocaleString("es-CL")}
                    </Text>
                  )}
                  {!!item.gastoManual && (
                    <Text style={styles.listItemSub}>
                      Gasto manual: ${Number(item.gastoManual).toLocaleString("es-CL")}
                    </Text>
                  )}
                </View>
                <Text style={styles.listItemAmount}>
                  ${Number(item.monto).toLocaleString("es-CL")}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );

  if (embedded) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.body}>
          <Sidebar activeKey={active} onChange={setActive} />
          {mainContent}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Fondo curvo (azul + celeste) */}
      <View style={styles.bgWrap}>
        <View style={styles.bigArc} />
        <View style={styles.smallArc} />
      </View>

      {/* Topbar */}
      <Topbar onLogout={onLogout} />

      {/* Layout */}
      <View style={styles.body}>
        <Sidebar activeKey={active} onChange={setActive} />
        {mainContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  bgWrap: { ...StyleSheet.absoluteFillObject, zIndex: 0 },

  bigArc: {
    position: "absolute",
    top: -420,
    left: -220,
    width: 1200,
    height: 620,
    borderRadius: 9999,
    backgroundColor: COLORS.blue2,
    transform: [{ rotate: "-6deg" }],
  },

  // Reemplazo del amarillo por celeste claro
  smallArc: {
    position: "absolute",
    top: -360,
    left: -160,
    width: 1180,
    height: 520,
    borderRadius: 9999,
    backgroundColor: COLORS.sky,
    opacity: 0.35,
    transform: [{ rotate: "-6deg" }],
  },

  body: { flex: 1, flexDirection: "row", zIndex: 1 },

  content: { padding: 18, flexGrow: 1 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    maxWidth: 980,
  },

  title: { fontSize: 22, fontWeight: "800", color: COLORS.blue, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.muted, marginBottom: 14 },

  placeholder: {
    height: 320,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  addBtn: {
    marginTop: 14,
    backgroundColor: COLORS.blue,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  addBtnText: { color: COLORS.white, fontWeight: "800" },
  saveMsg: { marginTop: 8, color: COLORS.muted, fontWeight: "700" },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  listTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  listTotal: { fontSize: 14, fontWeight: "700", color: COLORS.muted },
  emptyText: { color: COLORS.muted, fontWeight: "700" },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listItemTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  listItemSub: { marginTop: 2, fontSize: 13, color: COLORS.muted },
  listItemAmount: { fontSize: 15, fontWeight: "800", color: COLORS.blue },
});
