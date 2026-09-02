import api from "./client";

export const getMisModulos = () =>
  api.get("/content/mis-modulos/").then((res) => res.data.results ?? res.data);
