import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import { Field, Small } from "../components/FormFields";
import KpiRow from "../components/KpiRow";
import {
  obtenerCapacitadores,
  obtenerRegiones,
  obtenerMunicipios,
  obtenerSemanas,
  obtenerClientesPorComuna,
  obtenerTarifasPorCliente
} from "../api/catalogos";

// --- MINI COMPONENTE PARA SELECTORES CLÁSICOS ---
const DropdownSelector = ({ label, value, placeholder, isOpen, onToggle, data, onSelect }) => (
  <View style={{ zIndex: isOpen ? 5000 : 1, position: 'relative', flex: 1, marginHorizontal: 5, marginBottom: 15 }}>
    <Text style={{ fontWeight: '600', marginBottom: 5, color: '#444', fontSize: 13 }}>{label}</Text>
    <Pressable
      style={{
        borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 12,
        backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between'
      }}
      onPress={onToggle}
    >
      <Text style={{ color: value ? '#000' : '#888', fontSize: 14 }}>{value || placeholder}</Text>
      <Text style={{ color: '#888', fontSize: 12 }}>▼</Text>
    </Pressable>

    {isOpen && (
      <View style={styles.dropdownAbs}>
        <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
          {(!data || data.length === 0) ? (
            <Text style={{ padding: 12, color: '#888', fontStyle: 'italic' }}>Buscando opciones...</Text>
          ) : (
            data.map((item, index) => {
              const nombre = item.nombre || item.nombreRegion || item.NombreRegion || item.nombreComuna || item.NombreComuna || item.razonSocial || item.RazonSocial || item.nombreCompleto || item.NombreCompleto;
              const id = item.id ?? item.idRegion ?? item.IdRegion ?? item.idComuna ?? item.IdComuna ?? item.idCliente ?? item.IdCliente ?? item.idUsuario ?? item.IdUsuario ?? item.idSemana ?? item.IdSemana ?? `fallback-${index}`;
              
              return (
                <Pressable 
                  key={`drop-${id}-${index}`} 
                  style={styles.dropdownItem} 
                  onPress={() => onSelect(item, nombre, id)}
                >
                  <Text>{nombre}</Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    )}
  </View>
);

// --- COMPONENTE MINI CALENDARIO (RESTRINGIDO) ---
const CalendarioGrid = ({ onSelectDate, semanaActiva }) => {
  const [fechaVis, setFechaVis] = React.useState(new Date());

  const parseFechaGrid = (v) => {
    if (!v) return null;
    const [d, m, y] = v.split("/").map(Number);
    return new Date(y, m - 1, d);
  };

  const cambiarMes = (offset) => {
    setFechaVis(new Date(fechaVis.getFullYear(), fechaVis.getMonth() + offset, 1));
  };

  const renderDias = () => {
    const diasEnMes = new Date(fechaVis.getFullYear(), fechaVis.getMonth() + 1, 0).getDate();
    const primerDia = new Date(fechaVis.getFullYear(), fechaVis.getMonth(), 1).getDay();
    const dias = [];

    for (let i = 0; i < primerDia; i++) {
      dias.push(<View key={`empty-${i}`} style={{ width: '14.2%' }} />);
    }

    // Lógica para deshabilitar días fuera de la semana elegida
    let dInicio = null;
    let dTermino = null;
    if (semanaActiva && semanaActiva.fechaInicio && semanaActiva.fechaTermino) {
      dInicio = parseFechaGrid(semanaActiva.fechaInicio);
      dTermino = parseFechaGrid(semanaActiva.fechaTermino);
    }

    for (let i = 1; i <= diasEnMes; i++) {
      const fechaActualIteracion = new Date(fechaVis.getFullYear(), fechaVis.getMonth(), i);
      let isHabilitado = true;

      // Si tenemos semana activa, verificamos que el día esté en el rango
      if (dInicio && dTermino) {
        if (fechaActualIteracion < dInicio || fechaActualIteracion > dTermino) {
          isHabilitado = false;
        }
      }

      dias.push(
        <Pressable
          key={`dia-${i}`}
          disabled={!isHabilitado}
          style={({ pressed }) => ({
            width: '14.2%', paddingVertical: 10, alignItems: 'center',
            backgroundColor: pressed ? '#e0e0e0' : 'transparent', 
            borderRadius: 20,
            opacity: isHabilitado ? 1 : 0.2 // Se vuelve fantasma si está fuera de la semana
          })}
          onPress={() => {
            const diaStr = String(i).padStart(2, '0');
            const mesStr = String(fechaVis.getMonth() + 1).padStart(2, '0');
            const anioStr = fechaVis.getFullYear();
            onSelectDate(`${diaStr}/${mesStr}/${anioStr}`);
          }}
        >
          <Text style={{ fontSize: 14, color: isHabilitado ? '#333' : '#999', fontWeight: isHabilitado ? 'bold' : 'normal' }}>{i}</Text>
        </Pressable>
      );
    }
    return dias;
  };

  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <View style={{ width: '100%', marginTop: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <Pressable onPress={() => cambiarMes(-1)} style={{ padding: 5 }}><Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4a90e2' }}>{"<"}</Text></Pressable>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{meses[fechaVis.getMonth()]} {fechaVis.getFullYear()}</Text>
        <Pressable onPress={() => cambiarMes(1)} style={{ padding: 5 }}><Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4a90e2' }}>{">"}</Text></Pressable>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5, marginBottom: 5 }}>
        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
          <Text key={d} style={{ width: '14.2%', textAlign: 'center', fontWeight: 'bold', color: '#888', fontSize: 12 }}>{d}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {renderDias()}
      </View>
    </View>
  );
};

const obtenerEtiquetaSemana = (fechaInicioStr, fechaTerminoStr) => {
  if (!fechaInicioStr || !fechaTerminoStr) return "";

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Función interna para parsear la fecha venga como venga
  const parsear = (str) => {
    if (str.includes("/")) {
      const [d, m, y] = str.split("/").map(Number);
      return new Date(y, m - 1, d);
    }
    // Si viene como YYYY-MM-DD
    const [y, m, d] = str.split("T")[0].split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const inicio = parsear(fechaInicioStr);
  const termino = parsear(fechaTerminoStr);
  termino.setHours(23, 59, 59, 999);

  if (hoy > termino) return ' (Pasada)';
  if (hoy >= inicio && hoy <= termino) return ' (Actual)';
  return ' (Futura)';
};

export default function FormularioGasto({
  form,
  token,
  onTextChange,
  onNumberChange,
  onSave,
  onToggleNoAplica,
  saveMsg,
}) {
  const [regiones, setRegiones] = React.useState([]);
  const [municipios, setMunicipios] = React.useState([]);
  const [capacitadores, setCapacitadores] = React.useState([]);
  const [clientesDisponibles, setClientesDisponibles] = React.useState([]);
  
  const [semanasAbiertas, setSemanasAbiertas] = React.useState([]); // Pool de semanas
  const [semanaActiva, setSemanaActiva] = React.useState(null); // Semana seleccionada
  
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [campoAEditar, setCampoAEditar] = React.useState(null);

  const abrirCalendario = (campo) => {
    setCampoAEditar(campo);
    setCalendarOpen(true);
  };
  
  const [menuAbierto, setMenuAbierto] = React.useState(null); 

  // --- 1. CARGA INICIAL ---
  React.useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [regRes, capRes, semRes] = await Promise.all([
          obtenerRegiones(token),
          obtenerCapacitadores(token),
          obtenerSemanas(token)
        ]);

        // Guardamos TODAS las semanas que estén abiertas en el Pool
        const abiertas = Array.isArray(semRes) 
          ? semRes.filter(s => s.esAbierta === true || s.EsAbierta === true).map(s => {
              // Calculamos la etiqueta
              const etiqueta = obtenerEtiquetaSemana(s.fechaInicio || s.FechaInicio, s.fechaTermino || s.FechaTermino);
              // Retornamos la semana modificando solo su nombre para que incluya la etiqueta
              return {
                ...s,
                nombre: `${s.nombre || s.Nombre}${etiqueta}` 
              };
            })
          : [];
        
        setSemanasAbiertas(abiertas);

        // Si hay al menos una, la seleccionamos por defecto
        if (abiertas.length > 0) {
          setSemanaActiva(abiertas[0]);
          onTextChange("idSemana", abiertas[0].idSemana || abiertas[0].IdSemana);
        }

        setRegiones(Array.isArray(regRes) ? regRes : []);
        setCapacitadores(Array.isArray(capRes) ? capRes : []);
      } catch (err) { console.error("Error en carga inicial:", err); }
    })();
  }, [token]);

  // --- 2. CASCADA: REGIÓN -> COMUNA ---
  React.useEffect(() => {
    if (form.idRegion) {
      obtenerMunicipios(form.idRegion, token)
        .then(res => {
          const lista = Array.isArray(res) ? res : (res && res.id ? [res] : (res.$values || res.data || []));
          setMunicipios(lista);
        })
        .catch(err => setMunicipios([]));
    } else {
      setMunicipios([]);
    }
  }, [form.idRegion, token]);

  // --- 3. CASCADA: COMUNA -> CLIENTE ---
  React.useEffect(() => {
    if (form.idComuna) {
      obtenerClientesPorComuna(form.idComuna, token)
        .then(res => {
          const lista = Array.isArray(res) ? res : (res.data || []);
          setClientesDisponibles(lista);
        })
        .catch(() => setClientesDisponibles([]));
    } else {
      setClientesDisponibles([]);
    }
  }, [form.idComuna, token]);

  // --- 4. CÁLCULO DE FECHAS (Sin Fines de Semana) ---
  const parseFecha = (v) => {
    if (!v) return null;
    const [d, m, y] = v.split("/").map(Number);
    return new Date(y, m - 1, d);
  };

  React.useEffect(() => {
    if (form.fechaInicio && form.fechaTermino) {
      const inicio = parseFecha(form.fechaInicio);
      const termino = parseFecha(form.fechaTermino);

      if (inicio && termino && termino >= inicio) {
        let diasHabiles = 0;
        let fechaTemp = new Date(inicio);

        while (fechaTemp <= termino) {
          const diaSemana = fechaTemp.getDay();
          // Saltar 0 (Domingo) y 6 (Sábado)
          if (diaSemana !== 0 && diaSemana !== 6) {
            diasHabiles++;
          }
          fechaTemp.setDate(fechaTemp.getDate() + 1);
        }

        if (form.dias !== String(diasHabiles)) {
          onNumberChange("dias", String(diasHabiles));
        }
      } else if (inicio > termino) {
        onNumberChange("dias", "0");
      }
    }
  }, [form.fechaInicio, form.fechaTermino]);

  const handleGuardarViaje = () => {
    // 1. Verificamos que estén las fechas
    if (!form.fechaInicio || !form.fechaTermino) {
      alert("Faltan las fechas del viaje. Por favor, selecciónelas en el calendario.");
      return;
    }

    // 2. Parseamos las fechas del formulario (formato DD/MM/YYYY)
    const inicioViaje = parseFecha(form.fechaInicio);
    const terminoViaje = parseFecha(form.fechaTermino);

    // 3. Parseamos las fechas de la semana activa (Vienen de la API como YYYY-MM-DD)
    const inicioSemanaStr = semanaActiva.fechaInicio || semanaActiva.FechaInicio;
    const terminoSemanaStr = semanaActiva.fechaTermino || semanaActiva.FechaTermino;
    
    const [yI, mI, dI] = inicioSemanaStr.split("T")[0].split("-").map(Number);
    const inicioSemana = new Date(yI, mI - 1, dI, 0, 0, 0);

    const [yT, mT, dT] = terminoSemanaStr.split("T")[0].split("-").map(Number);
    const terminoSemana = new Date(yT, mT - 1, dT, 23, 59, 59);

    // 4. La validación de fuego
    if (inicioViaje < inicioSemana || terminoViaje > terminoSemana) {
      alert("¡Error! Las fechas ingresadas no corresponden a la semana seleccionada. Modifique las fechas o seleccione otra semana.");
      return; // Abortamos la misión
    }

    // Si todo está correcto, llamamos a la función onSave original
    if (onSave) onSave();
  };

  // --- 5. TOTALES ---
  const subtotalTarifas = Number(form.desayuno || 0) + Number(form.almuerzo || 0) + Number(form.once || 0) + Number(form.cena || 0) + Number(form.viatico || 0);
  const totalAsignacion = subtotalTarifas * Number(form.dias || 0);
  const totalManual = Number(form.movAsignado || 0) + Number(form.transferUber || 0) + Number(form.peajes || 0) + Number(form.copec || 0) + Number(form.varios || 0);
  const presupuestoTotal = totalAsignacion + totalManual;
  const opcionesModalidad = [
    { id: "Terreno", nombre: "Terreno" },
    { id: "Remoto", nombre: "Remoto" }
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        
        {/* HEADER DINÁMICO */}
        <View style={[styles.banner, { borderColor: semanaActiva ? COLORS.success : COLORS.danger }]}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: semanaActiva ? '#2e7d32' : '#c62828' }}>
            {semanaActiva ? `✅ Trabajando en: ${semanaActiva.nombre || semanaActiva.Nombre}` : "⚠️ Sistema Bloqueado: No hay semanas abiertas"}
          </Text>
          <Text style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            {semanaActiva ? `Rango permitido para el viaje: ${semanaActiva.fechaInicio} al ${semanaActiva.fechaTermino}` : "Contacte al Administrador."}
          </Text>
        </View>

        <KpiRow items={[
          { key: "kpi-dias", label: "Días a pagar", value: form.dias || 0 },
          { key: "kpi-total", label: "Presupuesto Total", value: `$${presupuestoTotal.toLocaleString("es-CL")}` }
        ]} />

        {/* ========================================== */}
        {/* BOX 1: DATOS DEL VIAJE                     */}
        {/* ========================================== */}
        <View style={[dash.panel, { zIndex: 1000 }]}>
          <Text style={dash.panelTitle}>Datos del viaje</Text>

          {/* NUEVO SELECTOR DE SEMANAS (Z-INDEX ALTO) */}
          <View style={{ flexDirection: 'row', zIndex: menuAbierto === 'sem' ? 4000 : 1 }}>
            <DropdownSelector
              label="Semana a Planificar"
              placeholder="Seleccione la semana..."
              value={semanaActiva ? (semanaActiva.nombre || semanaActiva.Nombre) : ""}
              isOpen={menuAbierto === 'sem'}
              onToggle={() => setMenuAbierto(menuAbierto === 'sem' ? null : 'sem')}
              data={semanasAbiertas}
              onSelect={(item, nombre, id) => {
                setSemanaActiva(item);
                onTextChange("idSemana", id);
                setMenuAbierto(null);
                
                // Limpiamos las fechas si cambia de semana para evitar errores
                onTextChange("fechaInicio", "");
                onTextChange("fechaTermino", "");
                onNumberChange("dias", "0");
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', zIndex: menuAbierto === 'cap' ? 3000 : 1 }}>
            <DropdownSelector
              label="Capacitador Asignado"
              placeholder="Seleccione capacitador..."
              value={form.capacitador}
              isOpen={menuAbierto === 'cap'}
              onToggle={() => setMenuAbierto(menuAbierto === 'cap' ? null : 'cap')}
              data={capacitadores}
              onSelect={(item, nombre, id) => {
                onTextChange("capacitador", nombre);
                onTextChange("idCapacitador", id);
                setMenuAbierto(null);
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', zIndex: menuAbierto === 'mod' ? 2500 : 1 }}>
            <DropdownSelector
              label="Modalidad de Trabajo"
              placeholder="Seleccione modalidad..."
              value={form.modalidad}
              isOpen={menuAbierto === 'mod'}
              onToggle={() => setMenuAbierto(menuAbierto === 'mod' ? null : 'mod')}
              data={opcionesModalidad}
              onSelect={(item, nombre, id) => {
                onTextChange("modalidad", id);
                setMenuAbierto(null);
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', zIndex: menuAbierto === 'reg' || menuAbierto === 'mun' ? 2000 : 1 }}>
            <DropdownSelector
              label="Región"
              placeholder="Elegir región..."
              value={form.region}
              isOpen={menuAbierto === 'reg'}
              onToggle={() => setMenuAbierto(menuAbierto === 'reg' ? null : 'reg')}
              data={regiones}
              onSelect={(item, nombre, id) => {
                onTextChange("region", nombre);
                onTextChange("idRegion", id);
                onTextChange("comuna", "");
                onTextChange("idComuna", "");
                onTextChange("cliente", "");
                onTextChange("idCliente", "");
                setClientesDisponibles([]); 
                setMenuAbierto(null);
              }}
            />

            <DropdownSelector
              label="Comuna"
              placeholder="Elegir comuna..."
              value={form.comuna}
              isOpen={menuAbierto === 'mun'}
              onToggle={() => setMenuAbierto(menuAbierto === 'mun' ? null : 'mun')}
              data={municipios}
              onSelect={(item, nombre, id) => {
                onTextChange("comuna", nombre);
                onTextChange("idComuna", id);
                onTextChange("cliente", "");
                onTextChange("idCliente", "");
                setMenuAbierto(null);
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', zIndex: menuAbierto === 'cli' ? 1000 : 1 }}>
            <DropdownSelector
              label="Cliente / Institución"
              placeholder="Seleccione el cliente..."
              value={form.cliente}
              isOpen={menuAbierto === 'cli'}
              onToggle={() => setMenuAbierto(menuAbierto === 'cli' ? null : 'cli')}
              data={clientesDisponibles}
              onSelect={async (item, nombre, id) => {
                onTextChange("cliente", nombre);
                onTextChange("idCliente", id);
                setMenuAbierto(null);
                
                try {
                  const t = await obtenerTarifasPorCliente(id, token);
                  const v = t.find(x => x.activo || x.Activo) || t[0];
                  if (v) {
                    onNumberChange("desayuno", v.montoDesayuno || v.MontoDesayuno || 0);
                    onNumberChange("almuerzo", v.montoAlmuerzo || v.MontoAlmuerzo || 0);
                    onNumberChange("once", v.montoOnce || v.MontoOnce || 0);
                    onNumberChange("cena", v.montoCena || v.MontoCena || 0);
                    onNumberChange("viatico", v.montoViatico || v.MontoViatico || 0);
                  }
                } catch (e) { console.error("Error tarifas:", e); }
              }}
            />
          </View>

          <View style={dash.grid3}>
            <Field label="Días Laborales" value={form.dias} onChangeText={v => onNumberChange("dias", v)} keyboardType="numeric" />
            
            <Pressable style={{flex: 1}} onPress={() => abrirCalendario('fechaInicio')}>
              <View pointerEvents="none">
                <Field label="Fecha Inicio" value={form.fechaInicio} disabled />
              </View>
            </Pressable>
            
            <Pressable style={{flex: 1}} onPress={() => abrirCalendario('fechaTermino')}>
              <View pointerEvents="none">
                <Field label="Fecha Término" value={form.fechaTermino} disabled />
              </View>
            </Pressable>
          </View>

        </View>

        {/* ========================================== */}
        {/* BOX 2: ASIGNACIONES                        */}
        {/* ========================================== */}
        <View style={[dash.panel, { zIndex: 10 }]}>
          <Text style={dash.panelTitle}>Asignaciones (Matriz de Tarifas)</Text>
          <View style={dash.grid5}>
            <Small label="Desayuno" value={form.desayuno} disabled={form.noDesayuno} onToggle={() => onToggleNoAplica("noDesayuno", "desayuno")} />
            <Small label="Almuerzo" value={form.almuerzo} disabled={form.noAlmuerzo} onToggle={() => onToggleNoAplica("noAlmuerzo", "almuerzo")} />
            <Small label="Once" value={form.once} disabled={form.noOnce} onToggle={() => onToggleNoAplica("noOnce", "once")} />
            <Small label="Cena" value={form.cena} disabled={form.noCena} onToggle={() => onToggleNoAplica("noCena", "cena")} />
            <Small label="Viático" value={form.viatico} disabled={form.noViatico} onToggle={() => onToggleNoAplica("noViatico", "viatico")} />
          </View>
          <View style={dash.totalRow}>
            <Text style={dash.totalLabel}>Subtotal Diario: ${subtotalTarifas.toLocaleString("es-CL")}</Text>
            <View style={dash.totalBox}>
              <Text style={dash.totalText}>Total Asignación: ${totalAsignacion.toLocaleString("es-CL")}</Text>
            </View>
          </View>
        </View>

        {/* ========================================== */}
        {/* BOX 3: OTROS GASTOS                        */}
        {/* ========================================== */}
        <View style={[dash.panel, { zIndex: 5 }]}>
          <Text style={dash.panelTitle}>Otros Gastos (Rendición Manual)</Text>
          <View style={dash.grid3}>
            <Field label="Movilidad Asignada" value={form.movAsignado} onChangeText={v => onNumberChange("movAsignado", v)} keyboardType="numeric" />
            <Field label="Uber/Transfer" value={form.transferUber} onChangeText={v => onNumberChange("transferUber", v)} keyboardType="numeric" />
            <Field label="Peajes" value={form.peajes} onChangeText={v => onNumberChange("peajes", v)} keyboardType="numeric" />
          </View>
          <View style={dash.grid3}>
            <Field label="Combustible" value={form.copec} onChangeText={v => onNumberChange("copec", v)} keyboardType="numeric" />
            <Field label="Varios" value={form.varios} onChangeText={v => onNumberChange("varios", v)} keyboardType="numeric" />
            <View style={{ marginTop: 10, marginBottom: 15 }}>
             <Field 
               label="Observaciones (Opcional)" 
               value={form.observacion} 
               onChangeText={v => onTextChange("observacion", v)} 
               placeholder="Ej: Viaje incluye parada en sucursal norte..."
             />
          </View>
            <Pressable 
              style={[dash.saveBtn, !semanaActiva && { backgroundColor: '#ccc' }]} 
              onPress={handleGuardarViaje} 
              disabled={!semanaActiva}
            >
              <Text style={dash.saveText}>{semanaActiva ? "Guardar Viaje" : "Cerrado"}</Text>
            </Pressable>
          </View>
          {!!saveMsg && <Text style={dash.saveMsg}>{saveMsg}</Text>}
        </View>

      </ScrollView>

      {/* OVERLAY DEL CALENDARIO CON GRILLA RESTRINGIDA */}
      {calendarOpen && (
        <View style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center', alignItems: 'center',
          zIndex: 999999
        }}>
          <View style={[dash.calendarCard, { backgroundColor: '#fff', padding: 20, borderRadius: 12, minWidth: 320, maxWidth: 350 }]}>
            <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#333'}}>
              {campoAEditar === 'fechaInicio' ? 'Seleccione Fecha de Inicio' : 'Seleccione Fecha de Término'}
            </Text>
            
            <CalendarioGrid 
              semanaActiva={semanaActiva} // Le pasamos la semana para que bloquee los días
              onSelectDate={(fechaFormateada) => {
                if (campoAEditar) onTextChange(campoAEditar, fechaFormateada); 
                setCalendarOpen(false);
                setCampoAEditar(null);
              }} 
            />

            <Pressable 
              style={[dash.calendarCloseBtn, { marginTop: 15 }]} 
              onPress={() => { setCalendarOpen(false); setCampoAEditar(null); }}
            >
              <Text style={dash.calendarCloseText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#fff',
    marginBottom: 20
  },
  dropdownAbs: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4a90e2', 
    borderRadius: 4,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  }
});