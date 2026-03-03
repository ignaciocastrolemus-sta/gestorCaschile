import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { crearViaje } from "../api/viajesGastos";
import { API_BASE } from "../config/api";
import { normalizeText } from "../utils/textUtils";
import {
  FERIADOS_CL_2026,
  formatFecha,
  formatFechaHoy,
  parseFecha,
  contarDiasHabiles,
  calcularFechaTermino,
} from "../utils/dateUtils";

const regionNombreToId = (nombre, map) => map[normalizeText(nombre)] || null;

export default function useSecretariaForm(authToken) {
  const [activeMenu, setActiveMenu] = useState("gasto");
  const [tipoViaje, setTipoViaje] = useState("santiago");
  const [regionIdMap, setRegionIdMap] = useState({});
  const [saveMsg, setSaveMsg] = useState("");
  const lastMontosKey = useRef("");
  const montosAbortRef = useRef(null);

  // 1. ESTADO INICIAL ACTUALIZADO AL NUEVO DESGLOSE
  const emptyForm = {
    fecha: formatFechaHoy(),
    fechaInicio: formatFechaHoy(),
    fechaTermino: formatFechaHoy(),
    idCLiente: "",
    idSemana: "",
    idCapacitador: "",
    capacitador: "",
    region: "",
    comuna: "",
    modalidad: "",
    tipoTransporte: "", // <-- NUEVO
    observacion: "",
    dias: "",
    
    // Tarifas
    desayuno: "",
    almuerzo: "",
    once: "",
    cena: "",
    viatico: "",
    noDesayuno: false,
    noAlmuerzo: false,
    noOnce: false,
    noCena: false,
    noViatico: false,
    
    // Transporte y Otros (Nuevos campos)
    bus: "",
    uber: "",
    transfer: "",
    colectivo: "",
    peajes: "",
    estacionamiento: "",
    combustible: "",
    varios: "",
  };
  
  const [form, setForm] = useState({ ...emptyForm });
  const [tarifasBackup, setTarifasBackup] = useState({});

  const isValidFecha = (value) => !!parseFecha(value);

  const validarFormulario = () => {
    if (!isValidFecha(form.fechaInicio) || !isValidFecha(form.fechaTermino)) {
      return "Usa el formato DD/MM/AAAA en inicio y termino.";
    }
    if (!form.capacitador.trim()) return "Capacitador es obligatorio.";
    if (!form.region.trim()) return "Region es obligatoria.";
    if (!form.comuna.trim()) return "Comuna es obligatoria.";
    if (!form.modalidad.trim()) return "Modalidad es obligatoria.";
    
    const diasNum = Number(form.dias);
    if (!Number.isInteger(diasNum) || diasNum <= 0) return "Dias debe ser mayor a 0.";
    
    // Validamos que los nuevos montos no sean negativos
    const montos = [
      form.desayuno, form.almuerzo, form.once, form.cena, form.viatico,
      form.bus, form.uber, form.transfer, form.colectivo, 
      form.peajes, form.estacionamiento, form.combustible, form.varios
    ].map(Number);
    
    if (montos.some((n) => Number.isNaN(n) || n < 0)) {
      return "Los montos no pueden ser negativos.";
    }
    
    const inicio = parseFecha(form.fechaInicio);
    const termino = parseFecha(form.fechaTermino);
    if (inicio && termino && termino < inicio) {
      return "Fecha termino no puede ser menor que fecha inicio.";
    }
    return "";
  };

  const updateForm = (campo, value) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const updateFormConFechas = (campo, value) => {
    setForm((prev) => {
      const next = { ...prev, [campo]: value };
      if (campo === "fechaInicio" || campo === "dias") {
        next.fechaTermino = calcularFechaTermino(next.fechaInicio, next.dias);
      }
      return next;
    });
  };

  const onFechaInicioSelect = (date) => {
    updateFormConFechas("fechaInicio", formatFecha(date));
  };

  const updateNumero = (campo, valor) => {
    const textoSeguro = (valor !== null && valor !== undefined) ? valor.toString() : "";
    const numeroLimpio = textoSeguro.replace(/[^0-9]/g, "");
    
    setForm(prev => ({ ...prev, [campo]: numeroLimpio }));

    const camposTarifa = ["desayuno", "almuerzo", "once", "cena", "viatico"];
    if (camposTarifa.includes(campo)) {
      setTarifasBackup(prev => ({ ...prev, [campo]: numeroLimpio }));
    }
  };

  const toggleNoAsignacion = (campoFlag, campoValor) => {
    setForm((prev) => {
      const next = !prev[campoFlag]; 
      const valorRecuperado = tarifasBackup[campoValor] !== undefined 
                              ? tarifasBackup[campoValor] 
                              : prev[campoValor];

      return {
        ...prev,
        [campoFlag]: next,
        [campoValor]: next ? "0" : valorRecuperado,
      };
    });
  };

  const onGuardar = async () => {
    const errorFormato = validarFormulario();
    if (errorFormato) {
      Alert.alert("Revisa el formulario", errorFormato);
      setSaveMsg(errorFormato);
      return;
    }
    if (!authToken) {
      Alert.alert("Sesión requerida", "Inicia sesión para guardar.");
      return;
    }

    const [dia, mes, anio] = form.fechaInicio.split("/");
    const fechaInicioIso = `${anio}-${mes}-${dia}`;

    // 2. EL NUEVO PAYLOAD (Mapeo 1:1 con CrearViajeDto de C#)
    const payload = {
      idUsuario: Number(form.idCapacitador), 
      idCliente: Number(form.idCliente),     
      codigoOt: form.modalidad || "S/N",
      modalidad: form.modalidad,
      tipoTransporte: form.tipoTransporte || "Otro", // Enviamos el nuevo campo
      observacion: form.observacion,
      fechaInicio: fechaInicioIso,
      dias: Number(form.dias),
      
      incluyeDesayuno: !form.noDesayuno,
      incluyeAlmuerzo: !form.noAlmuerzo,
      incluyeOnce: !form.noOnce,
      incluyeCena: !form.noCena,
      incluyeViatico: !form.noViatico,

      // Desglose exacto esperado por el Backend
      montoBus: Number(form.bus || 0),
      montoColectivo: Number(form.colectivo || 0),
      montoTransfer: Number(form.transfer || 0),
      montoUber: Number(form.uber || 0),
      montoEstacionamiento: Number(form.estacionamiento || 0),
      montoPeajes: Number(form.peajes || 0),
      montoCombustible: Number(form.combustible || 0),
      montoVarios: Number(form.varios || 0),
    };

    try {
      await crearViaje(payload, authToken);
      Alert.alert("Éxito", "Asignación de viaje guardada correctamente.");
      setSaveMsg("Guardado con éxito.");
      resetSecretaria(); 
    } catch (error) {
      Alert.alert("Error al Guardar", error?.message || "No se pudo guardar la asignación.");
      setSaveMsg("Error al guardar.");
    }
  };

  const onChangeTipoViaje = (next) => {
    setTipoViaje(next);
    setForm((prev) => ({
      ...prev,
      region: next === "santiago" ? "Metropolitana de Santiago" : "",
      comuna: "",
    }));
  };

  const resetSecretaria = () => {
    setActiveMenu("gasto");
    setTipoViaje("santiago");
    setForm({ ...emptyForm });
  };

  const diasHabiles = contarDiasHabiles(
    parseFecha(form.fechaInicio),
    parseFecha(form.fechaTermino),
    FERIADOS_CL_2026
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/Regiones`);
        if (!res.ok) return;
        const data = await res.json();
        if (!alive || !Array.isArray(data)) return;
        const map = {};
        data.forEach((r) => {
          const name = r?.nombre ?? r?.Nombre ?? "";
          const id = r?.id ?? r?.Id;
          if (!name || !id) return;
          map[normalizeText(name)] = id;
        });
        setRegionIdMap(map);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Hook para cargar tarifas automáticamente si cambia la comuna/región
  useEffect(() => {
    const regionId = regionNombreToId(form.region, regionIdMap);
    const comunaSeleccionada = (form.comuna || "").trim();
    if (!regionId || !comunaSeleccionada) return;

    const key = `${regionId}|${comunaSeleccionada.toLowerCase()}`;
    if (key === lastMontosKey.current) return;
    lastMontosKey.current = key;

    if (montosAbortRef.current) montosAbortRef.current.abort();
    const controller = new AbortController();
    montosAbortRef.current = controller;

    (async () => {
      try {
        // Asumiendo que obtenerMontos hace fetch al backend y devuelve las tarifas.
        const data = await obtenerMontos(regionId, comunaSeleccionada, controller.signal);
        if (!data) return;
        setForm((prev) => {
          const next = { ...prev };
          if (!prev.noDesayuno) next.desayuno = String(data.desayuno ?? 0);
          if (!prev.noAlmuerzo) next.almuerzo = String(data.almuerzo ?? 0);
          if (!prev.noOnce) next.once = String(data.once ?? 0);
          if (!prev.noCena) next.cena = String(data.cena ?? 0);
          if (!prev.noViatico) next.viatico = String(data.viatico ?? 0);
          return next;
        });
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.log("Montos: error al cargar", error);
      }
    })();
  }, [form.region, form.comuna, regionIdMap]);

  return {
    activeMenu,
    setActiveMenu,
    tipoViaje,
    form,
    setForm,
    saveMsg,
    updateFormConFechas,
    updateNumero,
    onFechaInicioSelect,
    toggleNoAsignacion,
    onGuardar,
    onChangeTipoViaje,
    diasHabiles,
    resetSecretaria,
  };
}