import React from "react";
import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import { Field, Small } from "../components/FormFields";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import { logWarn } from "../utils/logger";
import {
  obtenerCapacitadores,
  obtenerComunas,
  obtenerJefesProyecto,
  obtenerRegiones,
  obtenerMunicipios,
} from "../api/catalogos";

// Secretaria: formulario principal de asignación de viajes
export default function FormularioGasto({
  tipo,
  form,
  diasHabiles = 0,
  token,
  onTextChange,
  onNumberChange,
  onFechaInicioSelect,
  onSave,
  onToggleNoAplica,
  onChangeTipoViaje,
  saveMsg,
}) {
  const [regiones, setRegiones] = React.useState([]);
  const [comunasPorRegion, setComunasPorRegion] = React.useState({});
  const [municipios, setMunicipios] = React.useState([]);
  const [capacitadores, setCapacitadores] = React.useState([]);
  const [jefesProyecto, setJefesProyecto] = React.useState([]);

  React.useEffect(() => {
    let alive = true;
    if (!token)
      return () => {
        alive = false;
      };
    (async () => {
      try {
        const [regionesRes, comunasRes, capsRes, jefesRes] = await Promise.all([
          obtenerRegiones(token),
          obtenerComunas(token),
          obtenerCapacitadores(token),
          obtenerJefesProyecto(token),
        ]);

        if (!alive) return;

        const regionesNombres = Array.isArray(regionesRes)
          ? regionesRes
              .map((r) => ({
                id: r?.id ?? r?.Id ?? null,
                nombre: r?.nombre ?? r?.Nombre ?? r,
              }))
              .filter((r) => !!r.nombre)
              .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
          : [];

          
        const comunasMap = {};
        if (Array.isArray(comunasRes)) {
          comunasRes.forEach((c) => {
            const regionName = c?.region?.nombre ?? c?.region?.Nombre ?? c?.regionNombre ?? c?.RegionNombre;
            const comunaNombre = c?.nombre ?? c?.Nombre ?? c;
            if (!regionName || !comunaNombre) return;
            if (!comunasMap[regionName]) comunasMap[regionName] = [];
            comunasMap[regionName].push(comunaNombre);
          });
        }

        Object.keys(comunasMap).forEach((key) => {
          comunasMap[key] = comunasMap[key].slice().sort((a, b) => a.localeCompare(b, "es"));
        });

        setRegiones(regionesNombres);
        setComunasPorRegion(comunasMap);
        const capsNombres = Array.isArray(capsRes)
          ? capsRes
              .map((c) => c?.nombre ?? c?.Nombre ?? c)
              .filter((c) => typeof c === "string" && c.trim().length > 0)
          : [];
        const jefesNombres = Array.isArray(jefesRes)
          ? jefesRes
              .map((j) => j?.nombre ?? j?.Nombre ?? j)
              .filter((j) => typeof j === "string" && j.trim().length > 0)
          : [];

        setCapacitadores(capsNombres);
        setJefesProyecto(jefesNombres);
      } catch (err) {
        logWarn("Catalogos: error al cargar", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  React.useEffect(() => {
    const regionName = (form.region || "").trim();
    if (!regionName) {
      setMunicipios([]);
      return;
    }
    const normalized = regionName.toLowerCase();
    const region = regiones.find((r) => (r.nombre || "").toLowerCase() === normalized);
    const regionId = region?.id;
    if (!regionId) {
      setMunicipios([]);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const data = await obtenerMunicipios(regionId, token);
        if (!alive) return;
        setMunicipios(Array.isArray(data) ? data : []);
      } catch (err) {
        logWarn("Municipios: error al cargar", err);
        setMunicipios([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [form.region, regiones, token]);

  const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const parseFecha = (value) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
    const [dd, mm, yyyy] = value.split("/").map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
      return null;
    }
    return date;
  };
  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
    );
  };
  const buildCalendarCells = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState(() => {
    const selected = parseFecha(form.fechaInicio);
    const base = selected || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const selectedDate = parseFecha(form.fechaInicio);
  const calendarCells = buildCalendarCells(calendarMonth.getFullYear(), calendarMonth.getMonth());
  const openCalendar = () => {
    const selected = parseFecha(form.fechaInicio);
    const base = selected || new Date();
    setCalendarMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setCalendarOpen(true);
  };
  const onSelectDate = (date) => {
    if (date) onFechaInicioSelect(date);
    setCalendarOpen(false);
  };
  const onPrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const onNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const diasParaCalculo = diasHabiles > 0 ? diasHabiles : Number(form.dias || 0);
  const subtotalAsignacion =
    Number(form.desayuno || 0) +
    Number(form.almuerzo || 0) +
    Number(form.once || 0) +
    Number(form.cena || 0) +
    Number(form.viatico || 0);
  const subtotalAsignacionTotal =
    subtotalAsignacion * (Number.isFinite(diasParaCalculo) ? diasParaCalculo : 0);
  const totalManual =
    Number(form.movAsignado || 0) +
    Number(form.transferUber || 0) +
    Number(form.colectivoTaxi || 0) +
    Number(form.peajes || 0) +
    Number(form.reembolsos || 0) +
    Number(form.varios || 0) +
    Number(form.copec || 0);

  // KPI para resumen rapido del formulario de asignacion.
  const kpiItems = [
    { key: "dias", label: "Dias habiles", value: diasParaCalculo || 0 },
    {
      key: "asignacion",
      label: "Asignacion total",
      value: `$ ${subtotalAsignacionTotal.toLocaleString("es-CL")}`,
    },
    { key: "manual", label: "Gasto manual", value: `$ ${totalManual.toLocaleString("es-CL")}` },
    {
      key: "tipo",
      label: "Tipo de viaje",
      value: tipo === "regiones" ? "Regiones" : "Santiago",
    },
  ];

  const regionesNombres = regiones.map((r) => r.nombre);
  const regionesFiltradas = regionesNombres.filter((r) =>
    r.toLowerCase().includes((form.region || "").toLowerCase())
  );

  const regionSeleccionada = (form.region || "").trim().toLowerCase();
  const regionKey = Object.keys(comunasPorRegion).find((key) => key.toLowerCase() === regionSeleccionada);
  const comunas = regionKey ? comunasPorRegion[regionKey] : [];
  const municipiosDisponibles = municipios.length > 0 ? municipios : comunas;
  const comunasFiltradas = municipiosDisponibles.filter((c) =>
    c.toLowerCase().includes((form.comuna || "").toLowerCase())
  );
  const capacitadoresFiltrados = capacitadores.filter((c) =>
    c.toLowerCase().includes((form.capacitador || "").toLowerCase())
  );
  const jefesFiltrados = jefesProyecto.filter((c) =>
    c.toLowerCase().includes((form.jefe || "").toLowerCase())
  );
  const isExactMatch = (value, list) => {
    if (!value) return false;
    const normalized = value.trim().toLowerCase();
    return list.some((item) => item.toLowerCase() === normalized);
  };
  const showCapacitadores =
    !!form.capacitador && capacitadoresFiltrados.length > 0 && !isExactMatch(form.capacitador, capacitadores);
  const showJefes = !!form.jefe && jefesFiltrados.length > 0 && !isExactMatch(form.jefe, jefesProyecto);
  const showRegiones =
    tipo === "regiones" &&
    !!form.region &&
    regionesFiltradas.length > 0 &&
    !isExactMatch(form.region, regionesNombres);
  const showComunas =
    !!form.comuna && comunasFiltradas.length > 0 && !isExactMatch(form.comuna, municipiosDisponibles);

  const DateField = ({ label, value, placeholder, onPress }) => (
    <View style={{ flex: 1, marginBottom: 12 }}>
      <Text style={dash.label}>{label}</Text>
      <Pressable style={dash.input} onPress={onPress}>
        <Text style={{ color: value ? COLORS.text : COLORS.muted, fontWeight: "700" }}>
          {value || placeholder}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title={tipo === "regiones" ? "Ingresar gasto (Regiones)" : "Ingresar gasto (Santiago)"}
        subtitle="Formulario de asignacion de viaje."
      />
      <KpiRow items={kpiItems} />

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Datos del viaje</Text>

        <View style={dash.grid2}>
          <View style={{ flex: 1 }}>
            <Text style={dash.label}>Tipo de viaje</Text>
            <View style={dash.toggleRow}>
              <Pressable
                style={[dash.toggleBtn, tipo === "santiago" && dash.toggleBtnActive]}
                onPress={() => onChangeTipoViaje("santiago")}
              >
                <Text style={[dash.toggleText, tipo === "santiago" && dash.toggleTextActive]}>Santiago</Text>
              </Pressable>
              <Pressable
                style={[dash.toggleBtn, tipo === "regiones" && dash.toggleBtnActive]}
                onPress={() => onChangeTipoViaje("regiones")}
              >
                <Text style={[dash.toggleText, tipo === "regiones" && dash.toggleTextActive]}>Regiones</Text>
              </Pressable>
            </View>
          </View>
          <View />
        </View>

        <View style={dash.grid2}>
          <Field label="Fecha" placeholder="DD/MM/AAAA" value={form.fecha} disabled />
          <Field
            label="Capacitador"
            placeholder="Seleccionar..."
            value={form.capacitador}
            onChangeText={(value) => onTextChange("capacitador", value)}
          />
        </View>
        {showCapacitadores && (
          <View style={dash.suggestBox}>
            {capacitadoresFiltrados.slice(0, 6).map((item) => (
              <Pressable
                key={item}
                style={dash.suggestItem}
                onPress={() => onTextChange("capacitador", item)}
              >
                <Text style={dash.suggestText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={dash.grid2}>
          <Field
            label="Jefe Proyecto / Capacitador"
            placeholder="Seleccionar..."
            value={form.jefe}
            onChangeText={(value) => onTextChange("jefe", value)}
          />
          {tipo === "regiones" ? (
            <Field
              label="Region"
              placeholder="Ej: Valparaiso"
              value={form.region}
              onChangeText={(value) => onTextChange("region", value)}
            />
          ) : (
            <Field
              label="Region"
              placeholder="Metropolitana"
              value={form.region || "Metropolitana de Santiago"}
              disabled
            />
          )}
        </View>
        {showJefes && (
          <View style={dash.suggestBox}>
            {jefesFiltrados.slice(0, 6).map((item) => (
              <Pressable key={item} style={dash.suggestItem} onPress={() => onTextChange("jefe", item)}>
                <Text style={dash.suggestText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {showRegiones && (
          <View style={dash.suggestBox}>
            {regionesFiltradas.slice(0, 6).map((item) => (
              <Pressable key={item} style={dash.suggestItem} onPress={() => onTextChange("region", item)}>
                <Text style={dash.suggestText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={dash.grid2}>
          <View style={{ flex: 1 }}>
            <Text style={dash.label}>Modalidad</Text>
            <View style={dash.toggleRow}>
              <Pressable
                style={[dash.toggleBtn, form.modalidad === "Terreno" && dash.toggleBtnActive]}
                onPress={() => onTextChange("modalidad", "Terreno")}
              >
                <Text style={[dash.toggleText, form.modalidad === "Terreno" && dash.toggleTextActive]}>
                  Terreno
                </Text>
              </Pressable>
              <Pressable
                style={[dash.toggleBtn, form.modalidad === "Oficina" && dash.toggleBtnActive]}
                onPress={() => onTextChange("modalidad", "Oficina")}
              >
                <Text style={[dash.toggleText, form.modalidad === "Oficina" && dash.toggleTextActive]}>
                  Oficina
                </Text>
              </Pressable>
            </View>
          </View>
          <Field
            label="Dias"
            placeholder="Ej: 5"
            value={form.dias}
            onChangeText={(value) => onNumberChange("dias", value)}
            keyboardType="numeric"
          />
        </View>
        <View style={dash.grid2}>
          <DateField
            label="Fecha inicio viaje"
            placeholder="DD/MM/AAAA"
            value={form.fechaInicio}
            onPress={openCalendar}
          />
          <Field label="Fecha termino viaje" placeholder="DD/MM/AAAA" value={form.fechaTermino} disabled />
        </View>
        <View style={dash.grid2}>
          <Field
            label="Comuna / Municipalidad"
            placeholder="Escribir comuna"
            value={form.comuna}
            onChangeText={(value) => onTextChange("comuna", value)}
          />
          <View />
        </View>
        {showComunas && (
          <View style={dash.suggestBox}>
            {comunasFiltradas.slice(0, 8).map((item) => (
              <Pressable key={item} style={dash.suggestItem} onPress={() => onTextChange("comuna", item)}>
                <Text style={dash.suggestText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen rapido del viaje</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>Region</Text>
            <Text style={styles.summaryValue}>{form.region || "-"}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>Comuna</Text>
            <Text style={styles.summaryValue}>{form.comuna || "-"}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>Modalidad</Text>
            <Text style={styles.summaryValue}>{form.modalidad || "-"}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>Dias</Text>
            <Text style={styles.summaryValue}>{diasParaCalculo || 0}</Text>
          </View>
        </View>
      </View>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Asignaciones (por dia)</Text>
        <Text style={styles.panelHint}>Montos diarios definidos por tarifa y periodo activo.</Text>

        <View style={dash.grid5}>
          <Small
            label="Desayuno"
            value={form.desayuno}
            onChangeText={(value) => onNumberChange("desayuno", value)}
            disabled={form.noDesayuno}
            onToggle={() => onToggleNoAplica("noDesayuno", "desayuno")}
          />
          <Small
            label="Almuerzo"
            value={form.almuerzo}
            onChangeText={(value) => onNumberChange("almuerzo", value)}
            disabled={form.noAlmuerzo}
            onToggle={() => onToggleNoAplica("noAlmuerzo", "almuerzo")}
          />
          <Small
            label="Once"
            value={form.once}
            onChangeText={(value) => onNumberChange("once", value)}
            disabled={form.noOnce}
            onToggle={() => onToggleNoAplica("noOnce", "once")}
          />
          <Small
            label="Cena"
            value={form.cena}
            onChangeText={(value) => onNumberChange("cena", value)}
            disabled={form.noCena}
            onToggle={() => onToggleNoAplica("noCena", "cena")}
          />
          <Small
            label="Viatico"
            value={form.viatico}
            onChangeText={(value) => onNumberChange("viatico", value)}
            disabled={form.noViatico}
            onToggle={() => onToggleNoAplica("noViatico", "viatico")}
          />
        </View>

        <View style={dash.totalRow}>
          <Text style={dash.totalLabel}>Subtotal</Text>
          <View style={dash.totalBox}>
            <Text style={dash.totalText}>${subtotalAsignacionTotal.toLocaleString("es-CL")}</Text>
          </View>
        </View>
      </View>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Gastos ingresados manualmente</Text>
        <Text style={styles.panelHint}>Estos montos se suman como ajustes operativos del viaje.</Text>

        <View style={dash.grid3}>
          <Field
            label="Valor mov. asignado"
            placeholder="$"
            value={form.movAsignado}
            onChangeText={(value) => onNumberChange("movAsignado", value)}
            keyboardType="numeric"
          />
          <Field
            label="Transfer/Uber/Estac."
            placeholder="$"
            value={form.transferUber}
            onChangeText={(value) => onNumberChange("transferUber", value)}
            keyboardType="numeric"
          />
          <Field
            label="Colectivo/Bus rural/Taxi"
            placeholder="$"
            value={form.colectivoTaxi}
            onChangeText={(value) => onNumberChange("colectivoTaxi", value)}
            keyboardType="numeric"
          />
        </View>

        <View style={dash.grid3}>
          <Field
            label="Peajes"
            placeholder="$"
            value={form.peajes}
            onChangeText={(value) => onNumberChange("peajes", value)}
            keyboardType="numeric"
          />
          <Field
            label="Reembolsos/Descuentos"
            placeholder="$"
            value={form.reembolsos}
            onChangeText={(value) => onNumberChange("reembolsos", value)}
            keyboardType="numeric"
          />
          <Field
            label="Varios"
            placeholder="$"
            value={form.varios}
            onChangeText={(value) => onNumberChange("varios", value)}
            keyboardType="numeric"
          />
        </View>

        <View style={dash.grid3}>
          <Field
            label="Total asig x Cliente"
            placeholder="$0"
            value={`$${subtotalAsignacion.toLocaleString("es-CL")}`}
            disabled
          />
          <Field
            label="Total Asig Nomina CAS"
            placeholder="$0"
            value={`$${totalManual.toLocaleString("es-CL")}`}
            disabled
          />
          <Field
            label="Combustible"
            placeholder="$"
            value={form.copec}
            onChangeText={(value) => onNumberChange("copec", value)}
            keyboardType="numeric"
          />
        </View>

        <Pressable style={dash.saveBtn} onPress={onSave}>
          <Text style={dash.saveText}>Guardar</Text>
        </Pressable>
        {!!saveMsg && <Text style={dash.saveMsg}>{saveMsg}</Text>}
      </View>

      <Modal transparent visible={calendarOpen} animationType="fade">
        <Pressable style={dash.calendarOverlay} onPress={() => setCalendarOpen(false)}>
          <Pressable style={dash.calendarCard} onPress={() => null}>
            <View style={dash.calendarHeader}>
              <Pressable style={dash.calendarNavBtn} onPress={onPrevMonth}>
                <Text style={dash.calendarNavText}>{"<"}</Text>
              </Pressable>
              <Text style={dash.calendarTitle}>
                {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <Pressable style={dash.calendarNavBtn} onPress={onNextMonth}>
                <Text style={dash.calendarNavText}>{">"}</Text>
              </Pressable>
            </View>

            <View style={dash.calendarWeekRow}>
              {weekDays.map((day) => (
                <Text key={day} style={dash.calendarWeekText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={dash.calendarGrid}>
              {calendarCells.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={dash.calendarDay} />;
                }
                const selected = isSameDay(date, selectedDate);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <Pressable
                    key={date.toISOString()}
                    style={[dash.calendarDay, selected && dash.calendarDaySelected]}
                    onPress={() => onSelectDate(date)}
                  >
                    <Text
                      style={[
                        dash.calendarDayText,
                        isWeekend && dash.calendarDayWeekend,
                        selected && dash.calendarDayTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={dash.calendarCloseBtn} onPress={() => setCalendarOpen(false)}>
              <Text style={dash.calendarCloseText}>Cerrar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    borderRadius: 12,
    backgroundColor: "#F8FAFF",
    padding: 12,
  },
  summaryTitle: { color: COLORS.text, fontWeight: "900", marginBottom: 8, fontSize: 14 },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  summaryPill: {
    minWidth: 130,
    flex: 1,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  summaryLabel: { color: COLORS.muted, fontWeight: "800", fontSize: 11 },
  summaryValue: { color: COLORS.text, fontWeight: "800", marginTop: 3, fontSize: 13 },
  panelHint: { color: COLORS.muted, fontWeight: "700", marginBottom: 10, fontSize: 12, lineHeight: 17 },
});
