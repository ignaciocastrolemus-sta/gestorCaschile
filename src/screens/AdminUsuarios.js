import React, { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { bajaSeguraUsuario, buildAnonUserView } from "../api/usuarios";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import { Picker } from "@react-native-picker/picker";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";

// Admin Usuarios: crear/editar/desactivar usuarios y asignar rol

export default function AdminUsuarios({ token, title }) {
  const BANCOS_CHILE = [
    "Banco de Chile",
    "BancoEstado",
    "Banco Santander",
    "Banco BCI",
    "Banco Itaú",
    "Banco Scotiabank",
    "Banco Falabella",
    "Banco Ripley",
    "Banco Consorcio",
    "Banco Security",
    "Banco Internacional",
    "Banco BICE",
    "Banco BTG Pactual Chile",
    "Banco Edwards",
    "Banco do Brasil",
    "Banco Penta",
    "Banco Corpbanca",
    "Banco Paris",
    "Banco Coopeuch",
    "Banco BBVA",
    "Banco Rabobank",
    "Banco HSBC",
  ];
  const TIPOS_CUENTA = [
    "Cuenta Corriente",
    "Cuenta Vista",
    "Cuenta RUT",
    "Cuenta de Ahorro",
    "Cuenta Credito",
  ];

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtroListado, setFiltroListado] = useState("activos");
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    cuentaNumero: "",
    cuentaTipo: "",
    banco: "",
    titularNombre: "",
    titularRut: "",
    activo: true,
    rolId: "",
  });

  const roleItems = useMemo(() => roles.map((r) => ({ label: r.nombre, value: r.id })), [roles]);
  const usuariosFiltrados = useMemo(() => {
    let base = usuarios;
    if (filtroListado === "activos") base = base.filter((u) => Boolean(u.activo));
    if (filtroListado === "inactivos") base = base.filter((u) => !u.activo);

    const q = busqueda.trim().toLowerCase();
    if (!q) return base;

    // Busqueda rapida por campos clave del usuario.
    return base.filter((u) => {
      const texto = [
        u.nombre,
        u.email,
        u.rolNombre,
        u.banco,
        u.titularNombre,
        u.titularRut,
        u.cuentaNumero || u.cuentaBancaria,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return texto.includes(q);
    });
  }, [usuarios, filtroListado, busqueda]);
  const totalPages = Math.max(1, Math.ceil(usuariosFiltrados.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const totalUsuarios = usuarios.length;
  const activosUsuarios = usuarios.filter((u) => Boolean(u.activo)).length;
  const inactivosUsuarios = totalUsuarios - activosUsuarios;
  const rolesUnicos = new Set(usuarios.map((u) => u.rolNombre).filter(Boolean)).size;
  const pagedUsuarios = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return usuariosFiltrados.slice(start, start + PAGE_SIZE);
  }, [usuariosFiltrados, pageSafe]);

  const load = useCallback(async () => {
    try {
      const [resUsers, resRoles] = await Promise.all([
        fetch(`${API_BASE}/Usuarios`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/Roles`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!resUsers.ok) throw new Error(await resUsers.text());
      if (!resRoles.ok) throw new Error(await resRoles.text());
      const usersData = await resUsers.json();
      const rolesData = await resRoles.json();
      setUsuarios(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar usuarios.");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [filtroListado, busqueda]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setEditing(null);
    setForm({
      nombre: "",
      email: "",
      password: "",
      cuentaNumero: "",
      cuentaTipo: "",
      banco: "",
      titularNombre: "",
      titularRut: "",
      activo: true,
      rolId: roles[0]?.id ?? "",
    });
  };

  const normalizeRut = (value) => value.replace(/[^0-9kK]/g, "").toUpperCase();
  const isUsuarioAnonimizado = (u) =>
    Boolean(u?.anonimizado) || String(u?.nombre || "").startsWith("ANON_") || String(u?.email || "").includes("@anon.local");

  const askMotivoBaja = () => {
    if (typeof window !== "undefined" && typeof window.prompt === "function") {
      return (window.prompt("Motivo de baja segura", "Desvinculacion laboral") || "").trim();
    }
    return "Desvinculacion laboral";
  };

  const validarRut = (rut) => {
    const clean = normalizeRut(rut);
    if (clean.length < 8) return false;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    let sum = 0;
    let mul = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number(body[i]) * mul;
      mul = mul === 7 ? 2 : mul + 1;
    }
    const mod = 11 - (sum % 11);
    const dvCalc = mod === 11 ? "0" : mod === 10 ? "K" : String(mod);
    return dvCalc === dv;
  };

  const onSave = async () => {
    setInfo("");
    if (!form.nombre.trim() || !form.email.trim()) {
      setError("Nombre y email son obligatorios.");
      return;
    }
    if (!editing && !form.password.trim()) {
      setError("Password es obligatorio para crear.");
      return;
    }
    if (!form.cuentaNumero.trim()) {
      setError("Numero de cuenta es obligatorio.");
      return;
    }
    if (!form.cuentaTipo) {
      setError("Tipo de cuenta es obligatorio.");
      return;
    }
    if (!form.banco) {
      setError("Banco es obligatorio.");
      return;
    }
    if (!form.titularNombre.trim()) {
      setError("Nombre del titular es obligatorio.");
      return;
    }
    if (!form.titularRut.trim()) {
      setError("RUT es obligatorio.");
      return;
    }
    if (!validarRut(form.titularRut)) {
      setError("RUT invalido (verifica digito).");
      return;
    }
    if (!form.rolId) {
      setError("Rol es obligatorio.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        cuentaNumero: form.cuentaNumero.trim(),
        cuentaTipo: form.cuentaTipo,
        banco: form.banco,
        titularNombre: form.titularNombre.trim(),
        titularRut: normalizeRut(form.titularRut),
        activo: form.activo,
        rolId: Number(form.rolId),
      };
      // En edicion, solo envia password si el usuario realmente la cambio.
      if (form.password.trim()) {
        payload.password = form.password;
      }
      const url = editing ? `${API_BASE}/Usuarios/${editing.id}` : `${API_BASE}/Usuarios`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      resetForm();
      load();
      setInfo(editing ? "Usuario actualizado." : "Usuario creado.");
    } catch (e) {
      setError(e?.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (u) => {
    if (isUsuarioAnonimizado(u)) {
      setError("Usuario anonimizado: no se puede editar.");
      return;
    }
    setInfo("");
    setEditing(u);
    setForm({
      nombre: u.nombre || "",
      email: u.email || "",
      password: "",
      cuentaNumero: u.cuentaNumero || u.cuentaBancaria || "",
      cuentaTipo: u.cuentaTipo || "",
      banco: u.banco || "",
      titularNombre: u.titularNombre || "",
      titularRut: u.titularRut || "",
      activo: Boolean(u.activo),
      rolId: u.rolId,
    });
  };

  const onDeleteAccount = async (u) => {
    setError("");
    setInfo("");
    const confirmar = async () => {
      try {
        setLoading(true);
        const motivo = askMotivoBaja();
        if (!motivo) return;
        const result = await bajaSeguraUsuario(token, u.id, motivo);
        if (editing?.id === u.id) resetForm();
        setUsuarios((prev) =>
          prev.map((x) => (x.id === u.id ? (result.mode === "secure" ? buildAnonUserView(x) : { ...x, activo: false }) : x))
        );
        setInfo(
          result.mode === "secure"
            ? "Usuario dado de baja y anonimizado."
            : "Usuario desactivado. Backend aun no expone baja-segura."
        );
      } catch (e) {
        setError(e?.message || "No se pudo aplicar baja segura.");
      } finally {
        setLoading(false);
      }
    };

    const msg = `¿Aplicar baja segura a ${u.email}?\\nDesactiva la cuenta y elimina datos personales.`;
    const canUseWindowConfirm = typeof window !== "undefined" && typeof window.confirm === "function";
    if (canUseWindowConfirm) {
      const ok = window.confirm(msg);
      if (!ok) return;
      confirmar();
      return;
    }

    Alert.alert("Baja segura", msg, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", style: "destructive", onPress: confirmar },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <PageHeader
        title={title || "Usuarios"}
        subtitle="Crea, edita o desactiva usuarios. Asigna roles."
        secondaryLabel="Actualizar"
        onSecondaryPress={load}
        primaryLabel="Limpiar formulario"
        onPrimaryPress={resetForm}
      />
      <KpiRow
        items={[
          { key: "total", label: "Total usuarios", value: totalUsuarios },
          { key: "activos", label: "Activos", value: activosUsuarios, valueColor: "#0D8A42" },
          { key: "inactivos", label: "Inactivos", value: inactivosUsuarios, valueColor: "#C2410C" },
          { key: "roles", label: "Roles en uso", value: rolesUnicos },
        ]}
      />

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>{editing ? "Editar usuario" : "Nuevo usuario"}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos básicos</Text>
          <View style={styles.sectionCard}>
            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={dash.label}>Nombre</Text>
                <TextInput
                  value={form.nombre}
                  onChangeText={(v) => setField("nombre", v)}
                  placeholder="Nombre completo"
                  placeholderTextColor={COLORS.muted}
                  style={dash.input}
                />
              </View>
              <View style={styles.col}>
                <Text style={dash.label}>Email</Text>
                <TextInput
                  value={form.email}
                  onChangeText={(v) => setField("email", v)}
                  placeholder="correo@empresa.cl"
                  placeholderTextColor={COLORS.muted}
                  autoCapitalize="none"
                  style={dash.input}
                />
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={dash.label}>Password</Text>
                <TextInput
                  value={form.password}
                  onChangeText={(v) => setField("password", v)}
                  placeholder={editing ? "Dejar vacio para no cambiar" : "Nueva contrasena"}
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry
                  style={dash.input}
                />
              </View>
              <View style={styles.col}>
                <Text style={dash.label}>Rol</Text>
                <View style={styles.selectWrap}>
                  <Picker
                    selectedValue={form.rolId || roleItems[0]?.value}
                    onValueChange={(v) => setField("rolId", v)}
                    style={styles.picker}
                  >
                    {roleItems.map((it) => (
                      <Picker.Item key={String(it.value)} label={it.label} value={it.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={dash.label}>Activo</Text>
                <View style={styles.toggleRow}>
                  <Pressable
                    style={[styles.toggleBtn, form.activo && styles.toggleBtnActive]}
                    onPress={() => setField("activo", true)}
                  >
                    <Text style={[styles.toggleText, form.activo && styles.toggleTextActive]}>Si</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.toggleBtn, !form.activo && styles.toggleBtnActive]}
                    onPress={() => setField("activo", false)}
                  >
                    <Text style={[styles.toggleText, !form.activo && styles.toggleTextActive]}>No</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta bancaria</Text>
          <View style={styles.sectionCard}>
            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={dash.label}>Numero de cuenta</Text>
                <TextInput
                  value={form.cuentaNumero}
                  onChangeText={(v) => setField("cuentaNumero", v.replace(/[^\d]/g, ""))}
                  placeholder="123456789"
                  placeholderTextColor={COLORS.muted}
                  style={dash.input}
                />
              </View>
              <View style={styles.col}>
                <Text style={dash.label}>Banco</Text>
                <View style={styles.selectWrap}>
                  <Picker
                    selectedValue={form.banco || ""}
                    onValueChange={(v) => setField("banco", v)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecciona banco" value="" />
                    {BANCOS_CHILE.map((b) => (
                      <Picker.Item key={b} label={b} value={b} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={dash.label}>Tipo de cuenta</Text>
                <View style={styles.selectWrap}>
                  <Picker
                    selectedValue={form.cuentaTipo || ""}
                    onValueChange={(v) => setField("cuentaTipo", v)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecciona tipo" value="" />
                    {TIPOS_CUENTA.map((t) => (
                      <Picker.Item key={t} label={t} value={t} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.col}>
                <Text style={dash.label}>Nombre titular</Text>
                <TextInput
                  value={form.titularNombre}
                  onChangeText={(v) => setField("titularNombre", v)}
                  placeholder="Nombre del titular"
                  placeholderTextColor={COLORS.muted}
                  style={dash.input}
                />
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={dash.label}>RUT titular</Text>
                <TextInput
                  value={form.titularRut}
                  onChangeText={(v) => setField("titularRut", v)}
                  placeholder="12.345.678-9"
                  placeholderTextColor={COLORS.muted}
                  style={dash.input}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.btnRow}>
          <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={onSave}>
            <Text style={styles.primaryText}>
              {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}
            </Text>
          </Pressable>
          {editing && (
            <Pressable style={styles.secondaryBtn} onPress={resetForm}>
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
          )}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!info && <Text style={styles.info}>{info}</Text>}
      </View>

      <View style={dash.panel}>
        <View style={styles.listHeader}>
          <Text style={dash.panelTitle}>Listado</Text>
          <Text style={styles.listHint}>Usuarios activos e inactivos</Text>
        </View>
        <View style={styles.searchWrap}>
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por nombre, correo, rol o banco..."
            placeholderTextColor={COLORS.muted}
            style={dash.input}
          />
        </View>
        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterChip, filtroListado === "activos" && styles.filterChipActive]}
            onPress={() => setFiltroListado("activos")}
          >
            <Text style={[styles.filterChipText, filtroListado === "activos" && styles.filterChipTextActive]}>
              Activos
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, filtroListado === "inactivos" && styles.filterChipActive]}
            onPress={() => setFiltroListado("inactivos")}
          >
            <Text
              style={[styles.filterChipText, filtroListado === "inactivos" && styles.filterChipTextActive]}
            >
              Inactivos
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, filtroListado === "todos" && styles.filterChipActive]}
            onPress={() => setFiltroListado("todos")}
          >
            <Text style={[styles.filterChipText, filtroListado === "todos" && styles.filterChipTextActive]}>
              Todos
            </Text>
          </Pressable>
        </View>
        {usuariosFiltrados.length === 0 ? (
          <Text style={styles.empty}>No hay usuarios.</Text>
        ) : (
          <View style={styles.gridList}>
            {pagedUsuarios.map((u) => (
                <View key={u.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle}>{u.nombre}</Text>
                  <Text style={styles.cardSub}>{u.email}</Text>
                  {isUsuarioAnonimizado(u) ? <Text style={styles.anonTag}>Cuenta anonimizada</Text> : null}
                  <View style={styles.metaRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{u.rolNombre || "Sin rol"}</Text>
                    </View>
                    <View style={[styles.badge, u.activo ? styles.badgeActive : styles.badgeInactive]}>
                      <Text style={styles.badgeText}>{u.activo ? "Activo" : "Inactivo"}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDetail}>
                    Cuenta: {u.cuentaNumero || u.cuentaBancaria || "-"} · {u.cuentaTipo || "-"}
                  </Text>
                  <Text style={styles.cardDetail}>
                    Banco: {u.banco || "-"} · Titular: {u.titularNombre || "-"} ({u.titularRut || "-"})
                  </Text>
                </View>
                <View style={styles.actions}>
                  <Pressable style={styles.smallBtn} onPress={() => onEdit(u)}>
                    <Text style={styles.smallBtnText}>Editar</Text>
                  </Pressable>
                  <Pressable style={styles.smallBtnDanger} onPress={() => onDeleteAccount(u)}>
                    <Text style={styles.smallBtnText}>Baja segura</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <View style={styles.paginationRow}>
              <Text style={styles.paginationText}>
                Mostrando {pagedUsuarios.length} de {usuariosFiltrados.length} usuarios
              </Text>
              <View style={styles.paginationActions}>
                <Pressable
                  style={[styles.pageBtn, pageSafe <= 1 && styles.pageBtnDisabled]}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe <= 1}
                >
                  <Text style={styles.pageBtnText}>Anterior</Text>
                </Pressable>
                <Text style={styles.pageIndicator}>
                  Pagina {pageSafe} de {totalPages}
                </Text>
                <Pressable
                  style={[styles.pageBtn, pageSafe >= totalPages && styles.pageBtnDisabled]}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageSafe >= totalPages}
                >
                  <Text style={styles.pageBtnText}>Siguiente</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  col: { flex: 1, minWidth: 220 },
  section: { marginBottom: 14 },
  sectionTitle: { fontWeight: "900", color: COLORS.text, marginBottom: 8, fontSize: 16 },
  sectionCard: {
    backgroundColor: "#F7FAFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDE8FF",
  },
  selectWrap: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  picker: { height: 44, color: COLORS.text },
  toggleRow: { flexDirection: "row", gap: 8 },
  toggleBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  toggleBtnActive: { backgroundColor: "#E8F0FF", borderColor: "#BFD4FF" },
  toggleText: { fontWeight: "900", color: COLORS.text },
  toggleTextActive: { color: COLORS.blue2 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.blue2,
  },
  primaryText: { color: "#fff", fontWeight: "900" },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  secondaryText: { color: COLORS.blue2, fontWeight: "900" },
  error: { marginTop: 8, color: COLORS.muted, fontWeight: "800" },
  info: { marginTop: 8, color: "#0D8A42", fontWeight: "800" },
  empty: { color: COLORS.muted, fontWeight: "800" },
  listHeader: { marginBottom: 6 },
  listHint: { color: COLORS.muted, fontWeight: "700", marginTop: 4 },
  searchWrap: { marginBottom: 10 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#F5F8FF",
  },
  filterChipActive: { backgroundColor: "#E8F0FF", borderColor: "#BFD4FF" },
  filterChipText: { color: COLORS.muted, fontWeight: "800", fontSize: 12 },
  filterChipTextActive: { color: COLORS.blue2 },
  gridList: { gap: 10 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  cardLeft: { flex: 1, paddingRight: 10 },
  cardTitle: { fontWeight: "900", color: COLORS.text, fontSize: 15 },
  cardSub: { marginTop: 2, color: COLORS.muted, fontWeight: "700" },
  anonTag: { marginTop: 6, color: "#C2410C", fontWeight: "900", fontSize: 12 },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },
  badgeActive: { backgroundColor: "#EAF7EF", borderColor: "#BFE7CC" },
  badgeInactive: { backgroundColor: "#FFF2F2", borderColor: "#F3C3C3" },
  badgeText: { fontWeight: "800", color: COLORS.text, fontSize: 12 },
  cardDetail: { marginTop: 6, color: COLORS.muted, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8 },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#E8F0FF",
    borderWidth: 1,
    borderColor: "#BFD4FF",
  },
  smallBtnDanger: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#FFEFEF",
    borderWidth: 1,
    borderColor: "#F3B6B6",
  },
  smallBtnText: { fontWeight: "900", color: COLORS.text, fontSize: 12 },
  paginationRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
  },
  paginationText: { color: COLORS.muted, fontWeight: "700", marginBottom: 8 },
  paginationActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  pageBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFD4FF",
    backgroundColor: "#E8F0FF",
  },
  pageBtnDisabled: { opacity: 0.5 },
  pageBtnText: { color: COLORS.blue2, fontWeight: "900", fontSize: 12 },
  pageIndicator: { color: COLORS.text, fontWeight: "800" },
});
