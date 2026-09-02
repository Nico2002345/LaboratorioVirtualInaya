import api from "./client";

export const getGrados = () => api.get("/academics/grados/").then((res) => res.data.results ?? res.data);

export const registrarEstudiante = (payload) =>
  api.post("/academics/estudiantes/registro/", payload).then((res) => res.data);

export const getMiPerfilEstudiante = () =>
  api.get("/academics/estudiantes/me/").then((res) => res.data);

export const getMisGradosProfesor = () =>
  api.get("/academics/profesores/mis-grados/").then((res) => res.data);

export const getEstudiantes = (gradoId) =>
  api
    .get("/academics/estudiantes/", { params: gradoId ? { grado: gradoId } : {} })
    .then((res) => res.data.results ?? res.data);

export const alternarActivoEstudiante = (id) =>
  api.post(`/academics/estudiantes/${id}/alternar_activo/`).then((res) => res.data);

export const actualizarGrado = (id, payload) =>
  api.patch(`/academics/grados/${id}/`, payload).then((res) => res.data);

export const crearGrado = (payload) => api.post("/academics/grados/", payload).then((res) => res.data);

export const getProfesores = () =>
  api.get("/academics/profesores/").then((res) => res.data.results ?? res.data);

export const crearProfesor = (payload) =>
  api.post("/academics/profesores/", payload).then((res) => res.data);

export const asignarGradosProfesor = (id, grados) =>
  api.post(`/academics/profesores/${id}/asignar_grados/`, { grados }).then((res) => res.data);
