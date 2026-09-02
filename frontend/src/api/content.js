import api from "./client";

export const getMisModulos = () =>
  api.get("/content/mis-modulos/").then((res) => res.data.results ?? res.data);

export const getModulosGrado = (gradoId) =>
  api
    .get("/content/modulo-grado/", { params: gradoId ? { grado: gradoId } : {} })
    .then((res) => res.data.results ?? res.data);

export const getModulos = () => api.get("/content/modulos/").then((res) => res.data.results ?? res.data);

export const crearModulo = (payload) => api.post("/content/modulos/", payload).then((res) => res.data);

export const actualizarModulo = (id, payload) =>
  api.put(`/content/modulos/${id}/`, payload).then((res) => res.data);

export const eliminarModulo = (id) => api.delete(`/content/modulos/${id}/`);

export const crearModuloGrado = (payload) =>
  api.post("/content/modulo-grado/", payload).then((res) => res.data);

export const eliminarModuloGrado = (id) => api.delete(`/content/modulo-grado/${id}/`);

export const getContenidos = (moduloGradoId) =>
  api
    .get("/content/contenidos/", { params: moduloGradoId ? { modulo_grado: moduloGradoId } : {} })
    .then((res) => res.data.results ?? res.data);

export const crearContenido = (payload) =>
  api.post("/content/contenidos/", payload).then((res) => res.data);

export const actualizarContenido = (id, payload) =>
  api.put(`/content/contenidos/${id}/`, payload).then((res) => res.data);

export const eliminarContenido = (id) => api.delete(`/content/contenidos/${id}/`);
