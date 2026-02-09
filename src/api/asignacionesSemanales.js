const API_BASE = "http://localhost:5067/api/AsignacionesSemanales";

function withAuth(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function listarAsignacionesSemanales(token) {
  const res = await fetch(API_BASE, { headers: withAuth(token) });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function crearAsignacionSemanal(token, payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      ...withAuth(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function actualizarAsignacionSemanal(token, id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      ...withAuth(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.text();
}

export async function eliminarAsignacionSemanal(token, id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: withAuth(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.text();
}
