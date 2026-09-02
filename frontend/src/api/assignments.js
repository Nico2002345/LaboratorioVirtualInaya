import api from "./client";

export const getActividadesProfesor = () =>
  api.get("/assignments/actividades/").then((res) => res.data.results ?? res.data);

export const getActividadProfesor = async (id) => {
  const actividades = await getActividadesProfesor();
  const actividad = actividades.find((a) => String(a.id) === String(id));
  if (!actividad) throw new Error("Actividad no encontrada");
  return actividad;
};
