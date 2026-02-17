export function groupRendicionesByCapacitador(items) {
  const map = new Map();
  (items || []).forEach((item) => {
    const nombre = String(item?.viaje?.capacitador || "Sin nombre").trim() || "Sin nombre";
    if (!map.has(nombre)) map.set(nombre, []);
    map.get(nombre).push(item);
  });

  return Array.from(map.entries())
    .map(([capacitador, rows]) => {
      const ordenadas = [...rows].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
      const totalAsignado = ordenadas.reduce((acc, r) => acc + Number(r?.totalAsignado || 0), 0);
      const totalRendido = ordenadas.reduce((acc, r) => acc + Number(r?.totalRendido || 0), 0);
      return {
        key: capacitador,
        capacitador,
        rows: ordenadas,
        count: ordenadas.length,
        totalAsignado,
        totalRendido,
      };
    })
    .sort((a, b) => a.capacitador.localeCompare(b.capacitador, "es"));
}

