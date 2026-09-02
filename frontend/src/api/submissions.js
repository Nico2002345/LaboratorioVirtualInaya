import api from "./client";

export const getMisActividades = () =>
  api.get("/submissions/mis-actividades/").then((res) => res.data.results ?? res.data);

export const getActividad = async (id) => {
  const actividades = await getMisActividades();
  const actividad = actividades.find((a) => String(a.id) === String(id));
  if (!actividad) throw new Error("Actividad no encontrada");
  return actividad;
};

export const entregarActividad = (id, { respuestas, archivo }) => {
  const formData = new FormData();
  formData.append("respuestas", JSON.stringify(respuestas));
  if (archivo) formData.append("archivo", archivo);
  return api
    .post(`/submissions/actividades/${id}/entregar/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const getEntregasActividad = (id) =>
  api.get(`/submissions/actividades/${id}/entregas/`).then((res) => res.data.results ?? res.data);

export const calificarEntrega = (entregaId, { nota, observaciones }) =>
  api
    .post(`/submissions/entregas/${entregaId}/calificar/`, { nota, observaciones })
    .then((res) => res.data);
