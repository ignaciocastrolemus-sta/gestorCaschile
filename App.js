import React from "react";
import SecretariaLayout from "./src/screens/SecretariaLayout";
import CapacitadorHome from "./src/screens/CapacitadorHome";
import ContadoraHome from "./src/screens/ContadoraHome";
import AdminHome from "./src/screens/AdminHome";
import LoginScreen from "./src/screens/LoginScreen";
import useAuth from "./src/hooks/useAuth";
import useSecretariaForm from "./src/hooks/useSecretariaForm";

export default function App() {
  // Maneja todo el estado de autenticacion y cambio de clave.
  const {
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
  } = useAuth();

  // Maneja el formulario principal de secretaria y sus validaciones.
  const {
    activeMenu,
    setActiveMenu,
    tipoViaje,
    form,
    saveMsg,
    updateFormConFechas,
    updateNumero,
    onFechaInicioSelect,
    toggleNoAsignacion,
    onGuardar,
    onChangeTipoViaje,
    diasHabiles,
    resetSecretaria,
  } = useSecretariaForm(authToken);

  // Cierra sesion y limpia el formulario para evitar datos residuales.
  const handleLogout = () => {
    onLogout();
    resetSecretaria();
  };

  // Router principal por rol/perfil autenticado.
  if (isAuth) {
    const role = (authRole || "").trim().toLowerCase();
    if (role === "administrador") {
      return <AdminHome token={authToken} onLogout={handleLogout} email={authEmail} />;
    }
    if (role === "usuario terreno") {
      return <CapacitadorHome onLogout={handleLogout} token={authToken} />;
    }
    if (role === "contadora") {
      return <ContadoraHome onLogout={handleLogout} token={authToken} />;
    }
    return (
      <SecretariaLayout
        onLogout={handleLogout}
        authToken={authToken}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        tipoViaje={tipoViaje}
        form={form}
        onTextChange={(campo, value) => updateFormConFechas(campo, value)}
        onNumberChange={(campo, value) => updateNumero(campo, value)}
        onFechaInicioSelect={onFechaInicioSelect}
        diasHabiles={diasHabiles}
        onSave={onGuardar}
        onToggleNoAplica={(campoFlag, campoValor) => toggleNoAsignacion(campoFlag, campoValor)}
        onChangeTipoViaje={onChangeTipoViaje}
        saveMsg={saveMsg}
      />
    );
  }

  // Si no hay sesion, muestra pantalla de login y recuperacion.
  return (
    <LoginScreen
      email={email}
      pass={pass}
      setEmail={setEmail}
      onEmailInputChange={onEmailInputChange}
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
      forceChange={forceChange}
      forceCurrent={forceCurrent}
      forceNew={forceNew}
      forceConfirm={forceConfirm}
      forceMsg={forceMsg}
      setForceCurrent={setForceCurrent}
      setForceNew={setForceNew}
      setForceConfirm={setForceConfirm}
      onForceChange={onForceChange}
    />
  );
}
