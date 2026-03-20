import React from "react";
import { View, Text, TextInput, Pressable, Image } from "react-native";
import { COLORS } from "../constants/colors";
import styles from "../styles/loginStyles";

function PasswordField({ label, value, onChangeText, placeholder, visible, onToggle }) {
  return (
    <>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.passwordWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          secureTextEntry={!visible}
          style={[styles.input, styles.passwordInput]}
        />
        <Pressable style={styles.passwordToggle} onPress={onToggle}>
          <Text style={styles.passwordToggleText}>{visible ? "Ocultar" : "Mostrar"}</Text>
        </Pressable>
      </View>
    </>
  );
}

export default function LoginScreen({
  email,
  pass,
  setEmail,
  onEmailInputChange,
  setPass,
  onLogin,
  showReset,
  setShowReset,
  resetEmail,
  setResetEmail,
  resetCode,
  setResetCode,
  resetPass,
  setResetPass,
  onRequestReset,
  onConfirmReset,
  resetMsg,
  forceChange,
  forceCurrent,
  forceNew,
  forceConfirm,
  forceMsg,
  setForceCurrent,
  setForceNew,
  setForceConfirm,
  onForceChange,
}) {
  const [showLoginPass, setShowLoginPass] = React.useState(false);
  const [showForceCurrent, setShowForceCurrent] = React.useState(false);
  const [showForceNew, setShowForceNew] = React.useState(false);
  const [showForceConfirm, setShowForceConfirm] = React.useState(false);
  const [showResetPass, setShowResetPass] = React.useState(false);

  return (
    <View style={styles.root}>
      <View style={styles.bgBase} />
      <View style={styles.topLeftBlue} />
      <View style={styles.topLeftBlueSoft} />
      <View style={styles.topLeftOrange} />
      <View style={styles.topRightOrange} />
      <View style={styles.dotOrange} />
      <View style={styles.dotBlue} />
      <View style={styles.crossBlue} />
      <View style={styles.bottomWave1} />
      <View style={styles.bottomWave2} />
      <View style={styles.bottomWave3} />

      <View style={styles.card}>
        <Image style={styles.logo} source={require("../../assets/RindeCas.jpg")} />

        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesion para continuar</Text>

        {!forceChange && (
          <>
            <Text style={styles.label}>Correo</Text>
            <TextInput
              value={email}
              onChangeText={onEmailInputChange || setEmail}
              placeholder="correo@empresa.cl"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              style={styles.input}
            />

            <PasswordField
              label="Contrasena"
              value={pass}
              onChangeText={setPass}
              placeholder="********"
              visible={showLoginPass}
              onToggle={() => setShowLoginPass((prev) => !prev)}
            />

            <Pressable style={styles.button} onPress={onLogin}>
              <Text style={styles.buttonText}>Iniciar sesion</Text>
            </Pressable>

            <Pressable style={styles.linkBtn} onPress={() => setShowReset((s) => !s)}>
              <Text style={styles.linkBtnText}>Cambiar contrasena</Text>
            </Pressable>
          </>
        )}

        {forceChange && (
          <View style={styles.resetBox}>
            <Text style={styles.resetTitle}>Cambiar contrasena obligatoria</Text>
            <PasswordField
              value={forceCurrent}
              onChangeText={setForceCurrent}
              placeholder="Contrasena actual"
              visible={showForceCurrent}
              onToggle={() => setShowForceCurrent((prev) => !prev)}
            />
            <PasswordField
              value={forceNew}
              onChangeText={setForceNew}
              placeholder="Nueva contrasena"
              visible={showForceNew}
              onToggle={() => setShowForceNew((prev) => !prev)}
            />
            <PasswordField
              value={forceConfirm}
              onChangeText={setForceConfirm}
              placeholder="Confirmar nueva contrasena"
              visible={showForceConfirm}
              onToggle={() => setShowForceConfirm((prev) => !prev)}
            />
            <Pressable style={styles.secondaryBtn} onPress={onForceChange}>
              <Text style={styles.secondaryBtnText}>Actualizar contrasena</Text>
            </Pressable>
            {!!forceMsg && <Text style={styles.resetMsg}>{forceMsg}</Text>}
          </View>
        )}

        {!forceChange && showReset && (
          <View style={styles.resetBox}>
            <Text style={styles.resetTitle}>Recuperar acceso</Text>
            <TextInput
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder="correo@empresa.cl"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              style={styles.input}
            />
            <Pressable style={styles.secondaryBtn} onPress={onRequestReset}>
              <Text style={styles.secondaryBtnText}>Enviar codigo</Text>
            </Pressable>

            <TextInput
              value={resetCode}
              onChangeText={setResetCode}
              placeholder="Codigo de 6 digitos"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
            <PasswordField
              value={resetPass}
              onChangeText={setResetPass}
              placeholder="Nueva contrasena"
              visible={showResetPass}
              onToggle={() => setShowResetPass((prev) => !prev)}
            />
            <Pressable style={styles.secondaryBtn} onPress={onConfirmReset}>
              <Text style={styles.secondaryBtnText}>Cambiar contrasena</Text>
            </Pressable>
            {!!resetMsg && <Text style={styles.resetMsg}>{resetMsg}</Text>}
          </View>
        )}

        <Text style={styles.footer}>RindeCas</Text>
      </View>
    </View>
  );
}
