import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { COLORS } from "./src/constants/colors";
import dash from "./src/styles/dashboardStyles";
import MenuItem from "./src/components/MenuItem";
import FormularioGasto from "./src/screens/FormularioGasto";
import CarpetaViajes from "./src/screens/CarpetaViajes";
import CapacitadorHome from "./src/screens/CapacitadorHome";
import ContadoraHome from "./src/screens/ContadoraHome";
import AsignacionSemanal from "./src/screens/AsignacionSemanal";
import AdminHome from "./src/screens/AdminHome";`r`
import LoginScreen from "./src/screens/LoginScreen";`r`
import { crearViaje } from "./src/api/viajesGastos";
import { obtenerMontos } from "./src/api/montosComuna";
const normalizeText = (value) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const decodeJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const SESSION_MS = 5 * 60 * 60 * 1000;
const STORAGE_TOKEN_KEY = "cas_token";
const STORAGE_TS_KEY = "cas_token_ts";

const saveSession = (token) => {
  const ts = Date.now();
  try {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_TS_KEY, String(ts));
  } catch {
    // Ignora si localStorage esta bloqueado
  }
  try {
    sessionStorage.setItem(STORAGE_TOKEN_KEY, token);
    sessionStorage.setItem(STORAGE_TS_KEY, String(ts));
  } catch {}
  return ts;
};

const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_TS_KEY);
  } catch {}
  try {
    sessionStorage.removeItem(STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_TS_KEY);
  } catch {}
};
const regionNombreToId = (nombre, map) => map[normalizeText(nombre)] || null;
// Feriados nacionales Chile 2026 (formato YYYY-MM-DD, excluye regionales)
const FERIADOS_CL_2026 = new Set([
  "2026-01-01",
  "2026-04-03",
  "2026-04-04",
  "2026-05-01",
  "2026-05-21",
  "2026-06-20",
  "2026-06-29",
  "2026-07-16",
  "2026-08-15",
  "2026-09-18",
  "2026-09-19",
  "2026-10-12",
  "2026-10-31",
  "2026-11-01",
  "2026-12-08",
  "2026-12-25",
]);
const toIsoDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const contarDiasHabiles = (inicio, termino, feriados) => {
  if (!inicio || !termino) return 0;
  const start = new Date(inicio);
  const end = new Date(termino);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (end < start) return 0;
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    const isWeekend = day === 0 || day === 6;
    const iso = toIsoDate(current);
    const isHoliday = feriados.has(iso);
    if (!isWeekend && !isHoliday) count += 1;
    current.setDate(current.getDate() + 1);
  }
  return count;
};
export default function App() {
  // Estado login
  const [isAuth, setIsAuth] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authRole, setAuthRole] = useState("");
  const sessionTimeoutRef = useRef(null);

  // Datos form login
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  // Menu (secretaria)
  const [activeMenu, setActiveMenu] = useState("gasto");
  const [tipoViaje, setTipoViaje] = useState("santiago");
  const [regionIdMap, setRegionIdMap] = useState({});
  const formatFechaHoy = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = String(now.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  };
  const formatFecha = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = String(date.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  };
  const parseFecha = (value) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
    const [dd, mm, yyyy] = value.split("/").map(Number);
    if (mm < 1 || mm > 12) return null;
    if (dd < 1 || dd > 31) return null;
    const date = new Date(yyyy, mm - 1, dd);
    if (
      date.getFullYear() !== yyyy ||
      date.getMonth() !== mm - 1 ||
      date.getDate() !== dd
    ) {
      return null;
    }
    return date;
  };
  const addBusinessDays = (startDate, days) => {
    if (!startDate || days <= 0) return null;
    const result = new Date(startDate);
    let remaining = days;
    while (remaining > 0) {
      const day = result.getDay();
      if (day !== 0 && day !== 6) {
        remaining -= 1;
        if (remaining === 0) break;
      }
      result.setDate(result.getDate() + 1);
    }
    return result;
  };
  const calcularFechaTermino = (fechaInicio, diasStr) => {
    const dias = Number(diasStr);
    if (!Number.isInteger(dias) || dias <= 0) return "";
    const startDate = parseFecha(fechaInicio);
    if (!startDate) return "";
    const endDate = addBusinessDays(startDate, dias);
    return endDate ? formatFecha(endDate) : "";
  };
  const isValidFecha = (value) => {
    return !!parseFecha(value);
  };
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

  const emptyForm = {
    fecha: formatFechaHoy(),
    fechaInicio: formatFechaHoy(),
    fechaTermino: formatFechaHoy(),
    capacitador: "",
    jefe: "",
    region: "Metropolitana de Santiago",
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
  };
  const [form, setForm] = useState({ ...emptyForm });
  const [saveMsg, setSaveMsg] = useState("");
  const lastMontosKey = useRef("");
  const montosAbortRef = useRef(null);
  const diasHabiles = contarDiasHabiles(
    parseFecha(form.fechaInicio),
    parseFecha(form.fechaTermino),
    FERIADOS_CL_2026
  );

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

  const updateNumero = (campo, value) => {
    const limpio = value.replace(/[^\d]/g, "");
    // Solo permite numeros en campos numericos
    if (campo === "dias") {
      updateFormConFechas(campo, limpio);
      return;
    }
    updateForm(campo, limpio);
  };

  const scheduleAutoLogout = (startTs) => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    const remaining = SESSION_MS - (Date.now() - startTs);
    if (remaining <= 0) {
      onLogout();
      return;
    }
    sessionTimeoutRef.current = setTimeout(() => {
      onLogout();
    }, remaining);
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
    console.log("Guardar: click recibido");
    const error = validarFormulario();
    if (error) {
      console.log("Guardar: validacion", error);
      Alert.alert("Revisa el formulario", error);
      setSaveMsg(error);
      return;
    }
    if (!authToken) {
      Alert.alert("Sesion requerida", "Inicia sesion para guardar.");
      return;
    }
    // Envio al backend manteniendo la UI intacta.
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
      console.log("Guardar: enviando payload", payload);
      await crearViaje(payload, authToken);
      Alert.alert("Guardado", "Datos guardados.");
      setSaveMsg("Guardado.");
    } catch (error) {
      console.log("Guardar: error al enviar", error);
      Alert.alert("Error", error?.message || "No se pudo guardar.");
      setSaveMsg("Error al guardar.");
    }
  };

  const onLogin = async () => {
    if (!email.trim() || !pass.trim()) {
      Alert.alert("Faltan datos", "Completa correo y contrasena.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5067/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Credenciales incorrectas.");
      }
      const data = await res.json();
      if (!data?.token) {
        throw new Error("Token no recibido.");
      }
      const decoded = decodeJwt(data.token);
      const tokenEmail =
        decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
        "";
      const tokenRole =
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        "";
      const emailLower = tokenEmail.toLowerCase();
      const allowedEmails = new Set([
        "jose.caschile.cl",
        "secretaria@caschile.cl",
        "contadora@caschile.cl",
        "gonzaloadm@caschile.cl",
      ]);
      const allowedRoles = new Set(["Administrador", "Secretaria", "Usuario Terreno", "Contadora"]);
      if (!allowedEmails.has(emailLower) && !allowedRoles.has(tokenRole)) {
        Alert.alert("Acceso restringido", "Solo las cuentas autorizadas pueden ingresar.");
        return;
      }
      setAuthToken(data.token);
      setAuthEmail(tokenEmail);
      setAuthRole(tokenRole);
      setIsAuth(true);
      const ts = saveSession(data.token);
      scheduleAutoLogout(ts);
    } catch (error) {
      Alert.alert("Login incorrecto", error?.message || "No se pudo iniciar sesion.");
    }
  };

  const onRequestReset = async () => {
    const correo = (resetEmail || email).trim();
    if (!correo) {
      Alert.alert("Falta correo", "Ingresa tu correo para enviar el codigo.");
      return;
    }
    try {
      setResetMsg("");
      const res = await fetch("http://localhost:5067/api/Auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo enviar el codigo.");
      }
      setResetMsg("Codigo enviado. Revisa la consola del backend.");
    } catch (error) {
      setResetMsg(error?.message || "No se pudo enviar el codigo.");
    }
  };

  const onConfirmReset = async () => {
    const correo = (resetEmail || email).trim();
    if (!correo || !resetCode.trim() || !resetPass.trim()) {
      Alert.alert("Faltan datos", "Completa correo, codigo y nueva contrasena.");
      return;
    }
    try {
      setResetMsg("");
      const res = await fetch("http://localhost:5067/api/Auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: correo,
          code: resetCode.trim(),
          newPassword: resetPass,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo cambiar la contrasena.");
      }
      setResetMsg("Contrasena actualizada. Ya puedes iniciar sesion.");
      setResetCode("");
      setResetPass("");
    } catch (error) {
      setResetMsg(error?.message || "No se pudo cambiar la contrasena.");
    }
  };

  const onLogout = () => {
    setIsAuth(false);
    setAuthToken("");
    setAuthEmail("");
    setAuthRole("");
    setEmail("");
    setPass("");
    setActiveMenu("gasto");
    setTipoViaje("santiago");
    setForm({ ...emptyForm });
    clearSession();
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
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

  useEffect(() => {
    try {
      const token =
        localStorage.getItem(STORAGE_TOKEN_KEY) ||
        sessionStorage.getItem(STORAGE_TOKEN_KEY);
      const tsRaw =
        localStorage.getItem(STORAGE_TS_KEY) ||
        sessionStorage.getItem(STORAGE_TS_KEY);
      const ts = Number(tsRaw);
      if (!token || !ts) return;
      if (Date.now() - ts > SESSION_MS) {
        clearSession();
        return;
      }
      const decoded = decodeJwt(token);
      const tokenEmail =
        decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
        "";
      const tokenRole =
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        "";
      const emailLower = tokenEmail.toLowerCase();
      const allowedEmails = new Set([
        "jose.caschile.cl",
        "secretaria@caschile.cl",
        "contadora@caschile.cl",
        "gonzaloadm@caschile.cl",
      ]);
      const allowedRoles = new Set(["Administrador", "Secretaria", "Usuario Terreno", "Contadora"]);
      if (!allowedEmails.has(emailLower) && !allowedRoles.has(tokenRole)) {
        clearSession();
        return;
      }
      setAuthToken(token);
      setAuthEmail(tokenEmail);
      setAuthRole(tokenRole);
      setIsAuth(true);
      scheduleAutoLogout(ts);
    } catch {
      clearSession();
    }
  }, []);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:5067/api/Regiones");
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
  }, [form.region, form.comuna]);
  // Si esta autenticado: mostrar intranet
  if (isAuth) {
    const emailLower = authEmail.toLowerCase();
    if (authRole === "Administrador") {
      return <AdminHome token={authToken} onLogout={onLogout} email={authEmail} />;
    }
    if (emailLower === "jose.caschile.cl") {
      return <CapacitadorHome onLogout={onLogout} token={authToken} />;
    }
    if (emailLower === "contadora@caschile.cl") {
      return <ContadoraHome onLogout={onLogout} token={authToken} />;
    }
    return (
      <View style={dash.root}>
        {/* Topbar */}
        <View style={dash.topbar}>
          <Text style={dash.brand}>Gestor CAS Chile</Text>

          <View style={dash.topActions}>
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

        {/* Body */}
        <View style={dash.body}>
          {/* Sidebar */}
          <View style={dash.sidebar}>
            <View style={dash.profileBox}>
              <View style={dash.avatar} />
              <View>
                <Text style={dash.profileName}>Administradora</Text>
                <Text style={dash.profileRole}>Secretaria</Text>
              </View>
            </View>

            <Text style={dash.menuTitle}>OPCIONES</Text>

            <MenuItem
              label="Ingresar gasto"
              active={activeMenu === "gasto"}
              onPress={() => setActiveMenu("gasto")}
            />
            <MenuItem
              label="Carpeta de viajes"
              active={activeMenu === "carpeta"}
              onPress={() => setActiveMenu("carpeta")}
            />
            <MenuItem
              label="Asignacion semanal"
              active={activeMenu === "semanal"}
              onPress={() => setActiveMenu("semanal")}
            />
          </View>

          {/* Content */}
          <View style={dash.content}>
            {activeMenu === "carpeta" ? (
              <CarpetaViajes token={authToken} />
            ) : activeMenu === "semanal" ? (
              <AsignacionSemanal token={authToken} />
            ) : (
              <FormularioGasto
                tipo={tipoViaje}
                form={form}
                onTextChange={(campo, value) => updateFormConFechas(campo, value)}
                onNumberChange={(campo, value) => updateNumero(campo, value)}
                onFechaInicioSelect={(date) =>
                  updateFormConFechas("fechaInicio", formatFecha(date))
                }
                diasHabiles={diasHabiles}
                onSave={onGuardar}
                onToggleNoAplica={(campoFlag, campoValor) => toggleNoAsignacion(campoFlag, campoValor)}
                onChangeTipoViaje={onChangeTipoViaje}
                saveMsg={saveMsg}
                token={authToken}
              />
            )}
          </View>
        </View>
      </View>
    );
  }

    // Login (tu diseno intacto, movido a LoginScreen)
  return (
    <LoginScreen
      email={email}
      pass={pass}
      setEmail={setEmail}
      setPass={setPass}
      onLogin={onLogin}
      showReset={showReset}
      setShowReset={setShowReset}
      resetEmail={resetEmail}
      setResetEmail={setResetEmail}
      resetCode={resetCode}
      setResetCode={setResetCode}
      resetPass={resetPass}
      setResetPass={setResetPass}
      onRequestReset={onRequestReset}
      onConfirmReset={onConfirmReset}
      resetMsg={resetMsg}
    />
  );
}


