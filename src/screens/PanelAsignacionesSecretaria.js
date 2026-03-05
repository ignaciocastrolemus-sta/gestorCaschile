import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TextInput, TouchableOpacity, 
  StyleSheet, ActivityIndicator, Modal, ScrollView 
} from 'react-native';
import { listarViajes } from '../api/viajesGastos'; // Tu API

export default function PanelAsignacionesSecretaria({ token }) {
  const [viajesOriginales, setViajesOriginales] = useState([]);
  const [viajesFiltrados, setViajesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Modal
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const dataViajes = await listarViajes(token); 
      setViajesOriginales(dataViajes);
      setViajesFiltrados(dataViajes);
    } catch (error) {
      console.error("Error al cargar viajes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let resultado = viajesOriginales;

    if (filtroEstado !== 'Todos') {
      resultado = resultado.filter(v => v.estado === filtroEstado);
    }

    if (busqueda.trim() !== '') {
      const lowerBusqueda = busqueda.toLowerCase();
      resultado = resultado.filter(v => 
        (v.razonSocialCliente && v.razonSocialCliente.toLowerCase().includes(lowerBusqueda)) ||
        (v.nombreCapacitador && v.nombreCapacitador.toLowerCase().includes(lowerBusqueda)) ||
        (v.codigoOt && v.codigoOt.toLowerCase().includes(lowerBusqueda))
      );
    }

    setViajesFiltrados(resultado);
  }, [filtroEstado, busqueda, viajesOriginales]);

  const getBadgeColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return '#f59e0b';
      case 'asignado': return '#3b82f6';
      case 'rechazada': return '#ef4444';
      case 'rendido': return '#10b981';
      default: return '#6b7280';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        setViajeSeleccionado(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.capacitadorNombre}>{item.nombreCapacitador || 'Sin asignar'}</Text>
        <View style={[styles.badge, { backgroundColor: getBadgeColor(item.estado) }]}>
          <Text style={styles.badgeText}>{item.estado || 'N/A'}</Text>
        </View>
      </View>
      
      {/* Ajustado a los nombres de tu DTO */}
      <Text style={styles.destinoText}>🏢 Cliente: {item.razonSocialCliente || 'N/A'}</Text>
      <Text style={styles.destinoText}>🏷️ OT: {item.codigoOt}</Text>
      <Text style={styles.fechaText}>📅 {item.fechaInicio} al {item.fechaTermino} ({item.totalDias} días)</Text>
      <Text style={styles.montoText}>💰 Presupuesto: ${item.totalPresupuesto?.toLocaleString('es-CL')}</Text>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <View style={styles.container}>
      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar por capacitador, cliente u OT..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsContainer}>
          {['Todos', 'Pendiente', 'Asignado', 'Rechazada', 'Rendido'].map((estado) => (
            <TouchableOpacity 
              key={estado}
              style={[styles.pill, filtroEstado === estado && styles.pillActiva]}
              onPress={() => setFiltroEstado(estado)}
            >
              <Text style={[styles.pillText, filtroEstado === estado && styles.pillTextActiva]}>
                {estado}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={viajesFiltrados}
        keyExtractor={(item) => item.idAsignacionViaje?.toString() || Math.random().toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron viajes.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {viajeSeleccionado && (
              <>
                <Text style={styles.modalTitle}>Detalle del Viaje</Text>
                <Text>Capacitador: {viajeSeleccionado.nombreCapacitador}</Text>
                <Text>Cliente: {viajeSeleccionado.razonSocialCliente}</Text>
                <Text>Código OT: {viajeSeleccionado.codigoOt}</Text>
                <Text>Estado: {viajeSeleccionado.estado}</Text>
                <View style={styles.separador} />
                <Text style={styles.modalSubtitle}>Fechas y Presupuesto</Text>
                <Text>Desde: {viajeSeleccionado.fechaInicio}</Text>
                <Text>Hasta: {viajeSeleccionado.fechaTermino}</Text>
                <Text style={{fontWeight: 'bold', marginTop: 10}}>Total: ${viajeSeleccionado.totalPresupuesto?.toLocaleString('es-CL')}</Text>
                
                <TouchableOpacity style={styles.btnCerrar} onPress={() => setModalVisible(false)}>
                  <Text style={styles.btnCerrarText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 15 },
  filtrosContainer: { marginBottom: 15 },
  inputBusqueda: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 10 },
  pillsContainer: { flexDirection: 'row', marginBottom: 5 },
  pill: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#e5e7eb', borderRadius: 20, marginRight: 10 },
  pillActiva: { backgroundColor: '#3b82f6' },
  pillText: { color: '#374151', fontWeight: 'bold' },
  pillTextActiva: { color: '#fff' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  capacitadorNombre: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  destinoText: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  fechaText: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  montoText: { fontSize: 14, fontWeight: 'bold', color: '#059669', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#6b7280' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, minHeight: '40%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#111827' },
  modalSubtitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#374151' },
  separador: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },
  btnCerrar: { marginTop: 20, backgroundColor: '#374151', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnCerrarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});