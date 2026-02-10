import React from "react";
import { View, Text, TextInput, Pressable, Image } from "react-native";
import { COLORS } from "../constants/colors";
import styles from "../styles/loginStyles";

export default function LoginScreen({
  email,
  pass,
  setEmail,
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
}) {
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
        <Image
          style={styles.logo}
          source={require("../../assets/Logo CAS-CHILE2 2.png")}
        />

        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesion para continuar</Text>

        <Text style={styles.label}>Correo</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="correo@empresa.cl"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>Contrasena</Text>
        <TextInput
          value={pass}
          onChangeText={setPass}
          placeholder="********"
          placeholderTextColor={COLORS.muted}
          secureTextEntry
          style={styles.input}
        />

        <Pressable style={styles.button} onPress={onLogin}>
          <Text style={styles.buttonText}>Iniciar sesion</Text>
        </Pressable>

        <Pressable style={styles.linkBtn} onPress={() => setShowReset((s) => !s)}>
          <Text style={styles.linkBtnText}>Cambiar contrasena</Text>
        </Pressable>

        {showReset && (
          <View style={styles.resetBox}>
            <Text style={styles.resetTitle}>Recuperar acceso</Text>
            <TextInput
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder="correo@empresa.cl"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
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
            <TextInput
              value={resetPass}
              onChangeText={setResetPass}
              placeholder="Nueva contrasena"
              placeholderTextColor={COLORS.muted}
              secureTextEntry
              style={styles.input}
            />
            <Pressable style={styles.secondaryBtn} onPress={onConfirmReset}>
              <Text style={styles.secondaryBtnText}>Cambiar contrasena</Text>
            </Pressable>
            {!!resetMsg && <Text style={styles.resetMsg}>{resetMsg}</Text>}
          </View>
        )}

        <Text style={styles.footer}>CAS - Sistema de Gastos</Text>
      </View>
    </View>
  );
}
