import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { decodeJwt } from "../utils/jwt";
import { SESSION_MS, saveSession, clearSession, loadSession } from "../utils/session";
import { API_BASE } from "../config/api";

export default function useAuth() {
  const [isAuth, setIsAuth] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authRole, setAuthRole] = useState("");
  const sessionTimeoutRef = useRef(null);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [resetMsg, setResetMsg] = useState("");

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

  const onLogout = () => {
    setIsAuth(false);
    setAuthToken("");
    setAuthEmail("");
    setAuthRole("");
    setEmail("");
    setPass("");
    clearSession();
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  };

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
    setEmail,
    setPass,
    setShowReset,
    setResetEmail,
    setResetCode,
    setResetPass,
    onLogin,
    onLogout,
    onRequestReset,
    onConfirmReset,
  };
}
