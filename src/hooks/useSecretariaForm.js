import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { crearViaje } from "../api/viajesGastos";
import { obtenerMontos } from "../api/montosComuna";
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

  const buildEmptyForm = (tipo = "santiago") => ({
    fecha: formatFechaHoy(),
    fechaInicio: formatFechaHoy(),
    fechaTermino: formatFechaHoy(),
    capacitador: "",
    jefe: "",
    region: tipo === "santiago" ? "Metropolitana de Santiago" : "",
    comuna: "",
    modalidad: "",
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
  });
  const [form, setForm] = useState(() => buildEmptyForm("santiago"));

  // Limpia montos dependientes de la tarifa seleccionada (region/comuna).
  const limpiarMontosTarifa = (base) => ({
    desayuno: base.noDesayuno ? "0" : "",
    almuerzo: base.noAlmuerzo ? "0" : "",
    once: base.noOnce ? "0" : "",
    cena: base.noCena ? "0" : "",
    viatico: base.noViatico ? "0" : "",
  });

  const isValidFecha = (value) => !!parseFecha(value);

  const validarFormulario = () => {
    if (!isValidFecha(form.fechaInicio) || !isValidFecha(form.fechaTermino)) {
      return "Usa el formato DD/MM/AAAA en inicio y termino.";
    }
    if (!form.capacitador.trim()) return "Capacitador es obligatorio.";
    if (!form.jefe.trim()) return "Jefe es obligatorio.";
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
      if (campo === "region" && value !== prev.region) {
        next.comuna = "";
        Object.assign(next, limpiarMontosTarifa(next));
        lastMontosKey.current = "";
        if (montosAbortRef.current) montosAbortRef.current.abort();
      }
      if (campo === "comuna" && value !== prev.comuna) {
        Object.assign(next, limpiarMontosTarifa(next));
        lastMontosKey.current = "";
        if (montosAbortRef.current) montosAbortRef.current.abort();
      }
      if (campo === "fechaInicio" || campo === "dias") {
        next.fechaTermino = calcularFechaTermino(next.fechaInicio, next.dias);
      }
      return next;
    });
  };

  const onFechaInicioSelect = (date) => {
    updateFormConFechas("fechaInicio", formatFecha(date));
  };

  const updateNumero = (campo, value) => {
    const limpio = value.replace(/[^\d]/g, "");
    if (campo === "dias") {
      updateFormConFechas(campo, limpio);
      return;
    }
    updateForm(campo, limpio);
  };

  const toggleNoAsignacion = (campoFlag, campoValor) => {
    setForm((prev) => {
      const next = !prev[campoFlag];
      return {
        ...prev,
        [campoFlag]: next,
        [campoValor]: next ? "0" : prev[campoValor],
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
      Alert.alert("Sesion requerida", "Inicia sesion para guardar.");
      return;
    }
    const payload = {
      fecha: form.fecha,
      fechaInicio: form.fechaInicio,
      fechaTermino: form.fechaTermino,
      capacitador: form.capacitador,
      jefe: form.jefe,
      tipoViaje: tipoViaje === "santiago" ? "Santiago" : "Regiones",
      region: form.region,
      comuna: form.comuna,
      modalidad: form.modalidad,
      dias: Number(form.dias),
      desayuno: Number(form.desayuno),
      almuerzo: Number(form.almuerzo),
      once: Number(form.once),
      cena: Number(form.cena),
      viatico: Number(form.viatico),
      movAsignado: Number(form.movAsignado),
      transferUber: Number(form.transferUber),
      colectivoTaxi: Number(form.colectivoTaxi),
      peajes: Number(form.peajes),
      reembolsos: Number(form.reembolsos),
      varios: Number(form.varios),
      copec: Number(form.copec),
    };

    try {
      await crearViaje(payload, authToken);
      Alert.alert("Guardado", "Datos guardados.");
      setSaveMsg("Guardado.");
      setForm(buildEmptyForm(tipoViaje));
      lastMontosKey.current = "";
      if (montosAbortRef.current) montosAbortRef.current.abort();
    } catch (error) {
      Alert.alert("Error", error?.message || "No se pudo guardar.");
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
    setForm(buildEmptyForm("santiago"));
    lastMontosKey.current = "";
    if (montosAbortRef.current) montosAbortRef.current.abort();
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
