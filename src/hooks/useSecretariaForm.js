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
    observacion: "",
    dias: "",
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
    movAsignado: "",
    transferUber: "",
    colectivoTaxi: "",
    peajes: "",
    reembolsos: "",
    varios: "",
    copec: "",
  };
  const [form, setForm] = useState({ ...emptyForm });
  const[tarifasBackup, setTarifasBackup] = useState({});

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
    const montos = [
      form.desayuno,
      form.almuerzo,
      form.once,
      form.cena,
      form.viatico,
      form.movAsignado,
      form.transferUber,
      form.colectivoTaxi,
      form.peajes,
      form.reembolsos,
      form.varios,
      form.copec,
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
    // Convertimos en string, si viene null o undefined, lo dejamos como string vacío.
    const textoSeguro = (valor !== null && valor !== undefined) ? valor.toString() : "";
    // se hace replace sabiendo que es texto
    const numeroLimpio = textoSeguro.replace(/[^0-9]/g, "");
    
    // Se guarda en el estado principal
    setForm(prev => ({ ...prev, [campo]: numeroLimpio }));

    // LO NUEVO: Se guarda en el respaldo SOLO si es un monto de la matriz
    const camposTarifa = ["desayuno", "almuerzo", "once", "cena", "viatico"];
    if (camposTarifa.includes(campo)) {
      setTarifasBackup(prev => ({ ...prev, [campo]: numeroLimpio }));
    }
  };

  const toggleNoAsignacion = (campoFlag, campoValor) => {
    setForm((prev) => {
      const next = !prev[campoFlag]; // true si marca "No Aplica"
      
      // LO NUEVO: Buscamos en el backup al desmarcar
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
    const error = validarFormulario();
    if (error) {
      Alert.alert("Revisa el formulario", error);
      setSaveMsg(error);
      return;
    }
    if (!authToken) {
      Alert.alert("Sesión requerida", "Inicia sesión para guardar.");
      return;
    }

    // 1. Transformar fecha DD/MM/YYYY a YYYY-MM-DD para el DateOnly de .NET
    const [dia, mes, anio] = form.fechaInicio.split("/");
    const fechaInicioIso = `${anio}-${mes}-${dia}`;

    // 2. Construir el DTO exacto (CrearViajeDto)
    const payload = {
      idUsuario: Number(form.idCapacitador), // Extraído desde el dropdown
      idCliente: Number(form.idCliente),     // Extraído desde el dropdown
      codigoOt: form.modalidad || "S/N",
      modalidad: form.modalidad,
      observacion: form.observacion,
      fechaInicio: fechaInicioIso,
      dias: Number(form.dias),
      
      // Toggles de Alimentación (El backend pide booleanos "Incluye", tu form usa "NoAplica")
      incluyeDesayuno: !form.noDesayuno,
      incluyeAlmuerzo: !form.noAlmuerzo,
      incluyeOnce: !form.noOnce,
      incluyeCena: !form.noCena,
      incluyeViatico: !form.noViatico,

      // Gastos Manuales (Agrupando algunos valores según tu UI)
      montoMovilizacion: Number(form.movAsignado || 0) + Number(form.colectivoTaxi || 0),
      montoTransferUber: Number(form.transferUber || 0),
      montoPeajes: Number(form.peajes || 0),
      montoCombustible: Number(form.copec || 0),
      otrosGastos: Number(form.varios || 0) + Number(form.reembolsos || 0),
    };

    try {
      // 3. Petición a la API
      await crearViaje(payload, authToken);
      Alert.alert("Éxito", "Asignación de viaje guardada correctamente.");
      setSaveMsg("Guardado con éxito.");
      resetSecretaria(); // Limpiar el formulario
    } catch (error) {
      // C# arroja excepciones de regla de negocio (InvalidOperationException)
      // Aseguramos que el usuario lea si "la semana está cerrada" o "sin tarifa"
      Alert.alert("Error de Validación", error?.message || "No se pudo guardar la asignación.");
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
