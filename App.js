import React from "react";
import SecretariaLayout from "./src/screens/SecretariaLayout";
import CapacitadorHome from "./src/screens/CapacitadorHome";
import ContadoraHome from "./src/screens/ContadoraHome";
import AdminHome from "./src/screens/AdminHome";
import LoginScreen from "./src/screens/LoginScreen";
import useAuth from "./src/hooks/useAuth";
import useSecretariaForm from "./src/hooks/useSecretariaForm";

export default function App() {
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
  } = useAuth();

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

  const handleLogout = () => {
    onLogout();
    resetSecretaria();
  };

  if (isAuth) {
    const emailLower = authEmail.toLowerCase();
    if (authRole === "Administrador") {
      return <AdminHome token={authToken} onLogout={handleLogout} email={authEmail} />;
    }
    if (emailLower === "jose.caschile.cl") {
      return <CapacitadorHome onLogout={handleLogout} token={authToken} />;
    }
    if (emailLower === "contadora@caschile.cl") {
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






