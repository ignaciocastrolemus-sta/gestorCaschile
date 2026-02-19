import { useEffect, useRef, useState } from "react";
import { useCallback } from "react";
import { Alert } from "react-native";
import { decodeJwt } from "../utils/jwt";
import { SESSION_MS, saveSession, clearSession, loadSession } from "../utils/session";
import { API_BASE } from "../config/api";

const ALLOWED_ROLES = ["Administrador", "Secretaria", "Usuario Terreno", "Contadora"];
const ALLOWED_ROLES_SET = new Set(ALLOWED_ROLES.map((r) => r.toLowerCase()));

export default function useAuth() {
  const [isAuth, setIsAuth] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authRole, setAuthRole] = useState("");
  const sessionTimeoutRef = useRef(null);
  const logoutRef = useRef(() => {});

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const [forceChange, setForceChange] = useState(false);
  const [forceCurrent, setForceCurrent] = useState("");
  const [forceNew, setForceNew] = useState("");
  const [forceConfirm, setForceConfirm] = useState("");
  const [forceMsg, setForceMsg] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingRole, setPendingRole] = useState("");

  // Regla minima para fortalecer el cambio de clave obligatorio.
  const validatePasswordPolicy = (password) => {
    if (!password || password.length < 8) {
      return "La nueva contrasena debe tener al menos 8 caracteres.";
    }
    if (!/[A-Z]/.test(password)) {
      return "La nueva contrasena debe incluir una mayuscula.";
    }
    if (!/[a-z]/.test(password)) {
      return "La nueva contrasena debe incluir una minuscula.";
    }
    if (!/[0-9]/.test(password)) {
      return "La nueva contrasena debe incluir un numero.";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "La nueva contrasena debe incluir un simbolo.";
    }
    return "";
  };

  const isRoleAllowed = useCallback((role) => {
    const normalized = (role || "").trim().toLowerCase();
    return ALLOWED_ROLES_SET.has(normalized);
  }, []);

  // Programa el cierre de sesion sin depender de closures (mas estable a largo plazo).
  const scheduleAutoLogout = useCallback((startTs) => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    const remaining = SESSION_MS - (Date.now() - startTs);
    if (remaining <= 0) {
      logoutRef.current();
      return;
    }
    sessionTimeoutRef.current = setTimeout(() => {
      logoutRef.current();
    }, remaining);
  }, []);

  const onLogin = async () => {
    if (!email.trim() || !pass.trim()) {
      Alert.alert("Faltan datos", "Completa correo y contrasena.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/Auth/login`, {
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
        decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "";
      const tokenRole = decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";

      if (!isRoleAllowed(tokenRole)) {
        Alert.alert("Acceso restringido", "Solo las cuentas autorizadas pueden ingresar.");
        return;
      }

      const mustChangePassword = Boolean(data?.mustChangePassword);
      if (mustChangePassword) {
        setPendingToken(data.token);
        setPendingEmail(tokenEmail);
        setPendingRole(tokenRole);
        setForceChange(true);
        setForceMsg("Debes cambiar tu contrasena para continuar.");
        setShowReset(false);
        setPass("");
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
      const res = await fetch(`${API_BASE}/Auth/request-reset`, {
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
      const res = await fetch(`${API_BASE}/Auth/reset-password`, {
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

  const onForceChange = async () => {
    if (!pendingToken) return;
    if (!forceCurrent.trim() || !forceNew.trim() || !forceConfirm.trim()) {
      setForceMsg("Completa los 3 campos.");
      return;
    }
    if (forceNew !== forceConfirm) {
      setForceMsg("La nueva contrasena no coincide.");
      return;
    }
    if (forceCurrent === forceNew) {
      setForceMsg("La nueva contrasena debe ser distinta a la actual.");
      return;
    }

    const policyError = validatePasswordPolicy(forceNew);
    if (policyError) {
      setForceMsg(policyError);
      return;
    }

    try {
      setForceMsg("");
      const res = await fetch(`${API_BASE}/Auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pendingToken}`,
        },
        body: JSON.stringify({
          currentPassword: forceCurrent,
          newPassword: forceNew,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo cambiar la contrasena.");
      }

      setAuthToken(pendingToken);
      setAuthEmail(pendingEmail);
      setAuthRole(pendingRole);
      setIsAuth(true);
      const ts = saveSession(pendingToken);
      scheduleAutoLogout(ts);

      setForceChange(false);
      setPendingToken("");
      setPendingEmail("");
      setPendingRole("");
      setForceCurrent("");
      setForceNew("");
      setForceConfirm("");
      setForceMsg("");
    } catch (error) {
      setForceMsg(error?.message || "No se pudo cambiar la contrasena.");
    }
  };

  const onLogout = () => {
    setIsAuth(false);
    setAuthToken("");
    setAuthEmail("");
    setAuthRole("");
    setEmail("");
    setPass("");
    clearSession();

    setForceChange(false);
    setPendingToken("");
    setPendingEmail("");
    setPendingRole("");
    setForceCurrent("");
    setForceNew("");
    setForceConfirm("");
    setForceMsg("");

    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  };
  // Mantiene una referencia siempre actual al logout para scheduleAutoLogout.
  logoutRef.current = onLogout;

  useEffect(() => {
    try {
      const { token, ts } = loadSession();
      if (!token || !ts) return;
      if (Date.now() - ts > SESSION_MS) {
        clearSession();
        return;
      }

      const decoded = decodeJwt(token);
      const tokenEmail =
        decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "";
      const tokenRole = decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";

      if (!isRoleAllowed(tokenRole)) {
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
  }, [isRoleAllowed, scheduleAutoLogout]);

  // Evita artefactos de input en web (duplicacion por autofill/composicion).
  const onEmailInputChange = useCallback((raw) => {
    const next = String(raw || "").replace(/\s+/g, "");
    setEmail((prev) => {
      if (!prev || next.length < prev.length) return next;
      const doubled = prev + prev;
      if (next === doubled) return prev;
      return next;
    });
  }, []);

  return {
    isAuth,
    authToken,
    authEmail,
    authRole,
    email,
    pass,
    showReset,
    resetEmail,
    resetCode,
    resetPass,
    resetMsg,
    forceChange,
    forceCurrent,
    forceNew,
    forceConfirm,
    forceMsg,
    setEmail,
    onEmailInputChange,
    setPass,
    setShowReset,
    setResetEmail,
    setResetCode,
    setResetPass,
    setForceCurrent,
    setForceNew,
    setForceConfirm,
    onLogin,
    onLogout,
    onRequestReset,
    onConfirmReset,
    onForceChange,
  };
}
