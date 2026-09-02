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
