import api from "./client";

export const getActividadesProfesor = () =>
  api.get("/assignments/actividades/").then((res) => res.data.results ?? res.data);

export const getActividadProfesor = (id) =>
  api.get(`/assignments/actividades/${id}/`).then((res) => res.data);

export const crearActividad = (payload) =>
  api.post("/assignments/actividades/", payload).then((res) => res.data);

export const actualizarActividad = (id, payload) =>
  api.put(`/assignments/actividades/${id}/`, payload).then((res) => res.data);

export const eliminarActividad = (id) => api.delete(`/assignments/actividades/${id}/`);

export const crearPregunta = (payload) =>
  api.post("/assignments/preguntas/", payload).then((res) => res.data);

export const actualizarPregunta = (id, payload) =>
  api.put(`/assignments/preguntas/${id}/`, payload).then((res) => res.data);

export const eliminarPregunta = (id) => api.delete(`/assignments/preguntas/${id}/`);
