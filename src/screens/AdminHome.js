import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import dash from "../styles/dashboardStyles";
import { COLORS } from "../constants/colors";
import MenuItem from "../components/MenuItem";
import AdminUsuarios from "./AdminUsuarios";
import AdminRoles from "./AdminRoles";
import AdminPeriodos from "./AdminPeriodos";
import AdminCatalogos from "./AdminCatalogos";
import AdminTarifas from "./AdminTarifas";
import ListadoAsignacionesSemanales from "./ListadoAsignacionesSemanales";
import SecretariaHome from "./SecretariaHome";
import ContadoraHome from "./ContadoraHome";
import CapacitadorHome from "./CapacitadorHome";
import EncuadreRendiciones from "./EncuadreRendiciones";

// Vista Admin: acceso a roles/usuarios y vistas principales

export default function AdminHome({ token, onLogout, email = "" }) {
  const [activeMenu, setActiveMenu] = useState("secretaria");

  const title = useMemo(() => {
    if (activeMenu === "roles") return "Roles";
    if (activeMenu === "usuarios") return "Usuarios";
    if (activeMenu === "periodos") return "Periodos";
    if (activeMenu === "encuadre") return "Encuadre";
    if (activeMenu === "tarifas") return "Tarifas";
    if (activeMenu === "catalogos") return "Catalogos";
    if (activeMenu === "listados") return "Listados";
    if (activeMenu === "contadora") return "Contadora";
    if (activeMenu === "capacitador") return "Capacitador";
    return "Secretaria";
  }, [activeMenu]);

  return (
    <View style={dash.root}>
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

      <View style={dash.body}>
        <View style={dash.sidebar}>
          <View style={dash.profileBox}>
            <View style={dash.avatar} />
            <View>
              <Text style={dash.profileName}>{email || "Administrador"}</Text>
              <Text style={dash.profileRole}>Administrador</Text>
            </View>
          </View>

          <Text style={dash.menuTitle}>ADMIN</Text>

          <MenuItem
            label="Secretaria"
            active={activeMenu === "secretaria"}
            onPress={() => setActiveMenu("secretaria")}
          />
          <MenuItem
            label="Contadora"
            active={activeMenu === "contadora"}
            onPress={() => setActiveMenu("contadora")}
          />
          <MenuItem
            label="Capacitador"
            active={activeMenu === "capacitador"}
            onPress={() => setActiveMenu("capacitador")}
          />
          <MenuItem
            label="Usuarios"
            active={activeMenu === "usuarios"}
            onPress={() => setActiveMenu("usuarios")}
          />
          <MenuItem
            label="Catalogos"
            active={activeMenu === "catalogos"}
            onPress={() => setActiveMenu("catalogos")}
          />
          <MenuItem
            label="Tarifas"
            active={activeMenu === "tarifas"}
            onPress={() => setActiveMenu("tarifas")}
          />
          <MenuItem
            label="Listados"
            active={activeMenu === "listados"}
            onPress={() => setActiveMenu("listados")}
          />
          <MenuItem
            label="Periodos"
            active={activeMenu === "periodos"}
            onPress={() => setActiveMenu("periodos")}
          />
          <MenuItem
            label="Roles"
            active={activeMenu === "roles"}
            onPress={() => setActiveMenu("roles")}
          />
          <MenuItem
            label="Encuadre"
            active={activeMenu === "encuadre"}
            onPress={() => setActiveMenu("encuadre")}
          />
        </View>

        <View style={dash.content}>
          {activeMenu === "roles" ? (
            <AdminRoles token={token} title={title} />
          ) : activeMenu === "usuarios" ? (
            <AdminUsuarios token={token} title={title} />
          ) : activeMenu === "catalogos" ? (
            <AdminCatalogos token={token} />
          ) : activeMenu === "tarifas" ? (
            <AdminTarifas token={token} />
          ) : activeMenu === "listados" ? (
            <ListadoAsignacionesSemanales token={token} />
          ) : activeMenu === "periodos" ? (
            <AdminPeriodos token={token} />
          ) : activeMenu === "encuadre" ? (
            <EncuadreRendiciones token={token} />
          ) : activeMenu === "contadora" ? (
            <ContadoraHome token={token} onLogout={onLogout} embedded />
          ) : activeMenu === "capacitador" ? (
            <CapacitadorHome token={token} onLogout={onLogout} embedded />
          ) : (
            <SecretariaHome onLogout={onLogout} token={token} embedded />
          )}
        </View>
      </View>
    </View>
  );
}

