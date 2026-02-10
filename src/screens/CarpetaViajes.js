import React, { useEffect, useState } from "react";
import { API_BASE } from "../config/api";
import { ScrollView, View, Text, Pressable, Alert } from "react-native";
import dash from "../styles/dashboardStyles";

// Secretaria: rendiciones recibidas y envÃ­o a contadora
export default function CarpetaViajes({ token }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/Rendiciones/secretaria`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al cargar rendiciones");
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar rendiciones");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onEnviarContadora = async (id) => {
    try {
      setInfo("");
      const res = await fetch(`${API_BASE}/Rendiciones/${id}/enviar-contadora`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "No se pudo enviar");
      }
      setItems((prev) => prev.filter((r) => r.id !== id));
      setInfo("Rendicion enviada a contadora.");
    } catch (e) {
      setInfo(e?.message || "No se pudo enviar.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={dash.h1}>Carpeta de viajes</Text>
      <Text style={dash.h2}>Documentos enviados por capacitador</Text>

      <View style={dash.panel}>
        <Text style={dash.panelTitle}>Pendientes de revision</Text>
        {!!error && <Text style={{ color: "#6B7280", fontWeight: "700" }}>{error}</Text>}
        {!!info && <Text style={{ color: "#6B7280", fontWeight: "700" }}>{info}</Text>}

        {items.length === 0 ? (
          <Text style={{ color: "#6B7280", fontWeight: "700", marginTop: 8 }}>
            No hay rendiciones pendientes.
          </Text>
        ) : (
          items.map((item) => (
            <ViajeRowCard key={item.id} data={item} onEnviar={() => onEnviarContadora(item.id)} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function ViajeRowCard({ data, onEnviar }) {
  const onDownload = () => {
    Alert.alert("Adjuntos", "Los adjuntos se validan en backend. Descarga sera agregada luego.");
  };
  const detalles = Array.isArray(data.detalles) ? data.detalles : [];
  const totalAdjuntos = detalles.reduce((acc, d) => acc + (d.adjuntos?.length || 0), 0);
  return (
    <View style={dash.docRow}>
      <View style={{ flex: 1 }}>
        <Text style={dash.docTitle}>Rendicion #{data.id}</Text>
        <Text style={dash.docSub}>
          Capacitador: {data.viaje?.capacitador || "-"} - {data.viaje?.regionNombre || "-"} -{" "}
          {data.viaje?.municipio || "-"}
        </Text>
        <Text style={dash.docSub}>
          Fechas: {formatRango(data.viaje?.fechaInicio, data.viaje?.fechaTermino)}
        </Text>
        <Text style={dash.docSub}>
          Asignado: $ {Number(data.totalAsignado || 0).toLocaleString("es-CL")} - Rendido: $ {Number(data.totalRendido || 0).toLocaleString("es-CL")}
        </Text>
        <Text style={dash.docSub}>Adjuntos: {totalAdjuntos}</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Pressable style={dash.docBtn} onPress={onDownload}>
          <Text style={dash.docBtnText}>Ver adjuntos</Text>
        </Pressable>
        <Pressable style={[dash.docBtn, { backgroundColor: "#1D4ED8" }]} onPress={onEnviar}>
          <Text style={dash.docBtnText}>Enviar a contadora</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatRango(inicio, termino) {
  if (!inicio || !termino) return "";
  const start = new Date(inicio);
  const end = new Date(termino);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const fmt = (d) =>
    String(d.getDate()).padStart(2, "0") +
    "/" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "/" +
    d.getFullYear();
  return `${fmt(start)} - ${fmt(end)}`;
}



