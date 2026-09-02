import api from "./client";

export const getMisModulos = () =>
  api.get("/content/mis-modulos/").then((res) => res.data.results ?? res.data);

export const getModulosGrado = (gradoId) =>
  api
    .get("/content/modulo-grado/", { params: gradoId ? { grado: gradoId } : {} })
    .then((res) => res.data.results ?? res.data);
