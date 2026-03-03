import React, { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { apiGet, apiPost, apiPut } from "../api/httpClient";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { bajaSeguraUsuario, buildAnonUserView } from "../api/usuarios";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import useDebouncedValue from "../hooks/useDebouncedValue";

// Admin Usuarios: crear/editar/desactivar usuarios y asignar rol

export default function AdminUsuarios({ token, title }) {
  const ROLE_UI = {
    Administrador: { hint: "Acceso total", color: "#1E5AC8" },
    Secretaria: { hint: "Gestiona asignaciones", color: "#E2871B" },
    Contadora: { hint: "Aprueba rendiciones", color: "#198754" },
    "Usuario Terreno": { hint: "Ingresa gastos", color: "#5F6B7A" },
  };
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
  const [bancoQuery, setBancoQuery] = useState("");
  const [showBancoOptions, setShowBancoOptions] = useState(false);
  const busquedaDebounced = useDebouncedValue(busqueda, 250);
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
  const bancosFiltrados = useMemo(() => {
    const q = bancoQuery.trim().toLowerCase();
    if (!q) return BANCOS_CHILE;
    return BANCOS_CHILE.filter((b) => b.toLowerCase().includes(q));
  }, [bancoQuery]);
  const selectedRole = useMemo(
    () => roleItems.find((it) => Number(it.value) === Number(form.rolId || roleItems[0]?.value))?.label || "",
    [roleItems, form.rolId]
  );
  const usuariosFiltrados = useMemo(() => {
    let base = usuarios;
    if (filtroListado === "activos") base = base.filter((u) => Boolean(u.activo));
    if (filtroListado === "inactivos") base = base.filter((u) => !u.activo);

    const q = busquedaDebounced.trim().toLowerCase();
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
  }, [usuarios, filtroListado, busquedaDebounced]);
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
      const [usersData, rolesData] = await Promise.all([apiGet("/Usuarios", { token }), apiGet("/Roles", { token })]);
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
  }, [filtroListado, busquedaDebounced]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setBancoQuery(form.banco || "");
  }, [form.banco]);

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
    if (loading) return;
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
      if (editing) {
        await apiPut(`/Usuarios/${editing.id}`, payload, { token });
      } else {
        await apiPost("/Usuarios", payload, { token });
      }
      resetForm();
      await load();
      setInfo(editing ? "Usuario actualizado." : "Usuario creado.");
    } catch (e) {
      setError(e?.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (u) => {
    if (loading) return;
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
    if (loading) return;
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
                <View style={styles.roleChipsWrap}>
                  {roleItems.map((it) => {
                    const active = Number(form.rolId || roleItems[0]?.value) === Number(it.value);
                    const accent = ROLE_UI[it.label]?.color || COLORS.blue2;
                    return (
                      <Pressable
                        key={String(it.value)}
                        style={[
                          styles.roleChip,
                          { borderColor: `${accent}55`, backgroundColor: active ? `${accent}22` : "#fff" },
                        ]}
                        onPress={() => setField("rolId", it.value)}
                      >
                        <Text style={[styles.roleChipTitle, { color: active ? accent : COLORS.text }]}>{it.label}</Text>
                        <Text style={styles.roleChipHint}>{ROLE_UI[it.label]?.hint || "Perfil operativo"}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {!!selectedRole && (
                  <View style={[styles.roleHint, { borderColor: `${ROLE_UI[selectedRole]?.color || COLORS.blue2}66` }]}>
                    <Text style={[styles.roleHintText, { color: ROLE_UI[selectedRole]?.color || COLORS.blue2 }]}>
                      {ROLE_UI[selectedRole]?.hint || "Perfil operativo"}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={dash.label}>Activo</Text>
                <View style={styles.switchRow}>
                  <Pressable
                    style={[styles.switchTrack, form.activo && styles.switchTrackActive]}
                    onPress={() => setField("activo", !form.activo)}
                  >
                    <View style={[styles.switchThumb, form.activo && styles.switchThumbActive]} />
                  </Pressable>
                  <Text style={[styles.switchText, form.activo && styles.switchTextActive]}>
                    {form.activo ? "Si" : "No"}
                  </Text>
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
                <View style={styles.bankCombobox}>
                  <TextInput
                    value={bancoQuery}
                    onChangeText={(v) => {
                      setBancoQuery(v);
                      setShowBancoOptions(true);
                      setField("banco", "");
                    }}
                    onFocus={() => setShowBancoOptions(true)}
                    onBlur={() => {
                      const exacto = BANCOS_CHILE.find((b) => b.toLowerCase() === bancoQuery.trim().toLowerCase());
                      if (exacto) {
                        setField("banco", exacto);
                        setBancoQuery(exacto);
                      }
                      // Da tiempo al click en una opcion antes de cerrar.
                      setTimeout(() => setShowBancoOptions(false), 220);
                    }}
                    placeholder="Buscar banco..."
                    placeholderTextColor={COLORS.muted}
                    style={styles.bankInput}
                  />
                  {showBancoOptions && (
                    <View style={styles.bankList}>
                      <ScrollView nestedScrollEnabled style={styles.bankListScroll}>
                        {bancosFiltrados.map((b) => (
                          <Pressable
                            key={b}
                            style={styles.bankItem}
                            onPressIn={() => {
                              setField("banco", b);
                              setBancoQuery(b);
                            }}
                            onPress={() => {
                              setShowBancoOptions(false);
                            }}
                          >
                            <Text style={styles.bankItemText}>{b}</Text>
                          </Pressable>
                        ))}
                        {bancosFiltrados.length === 0 ? <Text style={styles.bankEmpty}>Sin resultados</Text> : null}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <Text style={styles.bankSelected}>{form.banco ? `Seleccionado: ${form.banco}` : "Selecciona un banco"}</Text>
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={dash.label}>Tipo de cuenta</Text>
                <View style={styles.typeChips}>
                  {TIPOS_CUENTA.map((tipo) => {
                    const active = form.cuentaTipo === tipo;
                    return (
                      <Pressable
                        key={tipo}
                        style={[styles.typeChip, active && styles.typeChipActive]}
                        onPress={() => setField("cuentaTipo", tipo)}
                      >
                        <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{tipo}</Text>
                      </Pressable>
                    );
                  })}
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
          <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={onSave} disabled={loading}>
            <Text style={styles.primaryText}>
              {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}
            </Text>
          </Pressable>
          {editing && (
            <Pressable style={styles.secondaryBtn} onPress={resetForm} disabled={loading}>
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
          )}
        </View>
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}
        {!!info && (
          <View style={styles.infoBox}>
            <Text style={styles.info}>{info}</Text>
          </View>
        )}
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
                  <View style={styles.nameRow}>
                    <View style={styles.avatarMini}>
                      <Text style={styles.avatarMiniText}>{String(u.nombre || "?").trim().charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{u.nombre}</Text>
                      <Text style={styles.cardSub}>{u.email}</Text>
                    </View>
                  </View>
                  {isUsuarioAnonimizado(u) ? <Text style={styles.anonTag}>Cuenta anonimizada</Text> : null}
                  <View style={styles.metaRow}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: `${ROLE_UI[u.rolNombre]?.color || COLORS.blue2}15`, borderColor: `${ROLE_UI[u.rolNombre]?.color || COLORS.blue2}55` },
                      ]}
                    >
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
                  <Pressable style={styles.smallBtn} onPress={() => onEdit(u)} disabled={loading}>
                    <Text style={styles.smallBtnText}>Editar</Text>
                  </Pressable>
                  <Pressable style={styles.smallBtnDanger} onPress={() => onDeleteAccount(u)} disabled={loading}>
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
  roleChipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleChip: {
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  roleChipTitle: { fontWeight: "900", fontSize: 13 },
  roleChipHint: { marginTop: 3, color: COLORS.muted, fontWeight: "700", fontSize: 12 },
  roleHint: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F8FBFF",
  },
  roleHintText: { fontWeight: "800", fontSize: 12 },
  bankCombobox: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  bankInput: { ...dash.input, borderWidth: 0, borderRadius: 0, marginBottom: 0, height: 44 },
  bankList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    backgroundColor: "#fff",
    maxHeight: 220,
  },
  bankListScroll: { maxHeight: 220 },
  bankItem: { paddingVertical: 10, paddingHorizontal: 12 },
  bankItemText: { color: COLORS.text, fontWeight: "700" },
  bankEmpty: { paddingVertical: 10, paddingHorizontal: 12, color: COLORS.muted, fontWeight: "700" },
  bankSelected: { marginTop: 6, color: COLORS.muted, fontWeight: "700", fontSize: 12 },
  typeChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    borderWidth: 1,
    borderColor: "#D9E5FF",
    backgroundColor: "#F7FAFF",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  typeChipActive: { borderColor: "#AFC8FF", backgroundColor: "#E8F0FF" },
  typeChipText: { color: COLORS.text, fontWeight: "800", fontSize: 12 },
  typeChipTextActive: { color: COLORS.blue2 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 2 },
  switchTrack: {
    width: 54,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#CFD5E0",
    padding: 2,
    justifyContent: "center",
  },
  switchTrackActive: { backgroundColor: "#D9F2E4", borderColor: "#9AD5B7" },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CFD5E0",
  },
  switchThumbActive: { transform: [{ translateX: 22 }], borderColor: "#8BC9AB" },
  switchText: { fontWeight: "800", color: COLORS.muted },
  switchTextActive: { color: "#0D8A42" },
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
  errorBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F6C7CC",
    backgroundColor: "#FFF1F2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  infoBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#B9E6C9",
    backgroundColor: "#ECFDF3",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  error: { color: "#B42318", fontWeight: "800" },
  info: { color: "#0D8A42", fontWeight: "800" },
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
  nameRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 2 },
  avatarMini: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#E9F0FF",
    borderWidth: 1,
    borderColor: "#C8D8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMiniText: { fontWeight: "900", color: COLORS.blue2 },
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
