import api from "./client";

export const getMisLaboratorios = () =>
  api.get("/labs/mis-laboratorios/").then((res) => res.data);

export const getLaboratorio = async (id) => {
  const laboratorios = await getMisLaboratorios();
  const laboratorio = laboratorios.find((l) => String(l.id) === String(id));
  if (!laboratorio) throw new Error("Laboratorio no encontrado");
  return laboratorio;
};

export const iniciarLaboratorio = (id) =>
  api.post(`/labs/laboratorios/${id}/iniciar/`).then((res) => res.data);

export const responderQuiz = (id, respuestas) =>
  api.post(`/labs/laboratorios/${id}/responder/`, { respuestas }).then((res) => res.data);

export const verificarDireccionamientoIP = (id, datos) =>
  api.post(`/labs/laboratorios/${id}/verificar-ip/`, datos).then((res) => res.data);

export const verificarEnsamble = (id, colocaciones) =>
  api.post(`/labs/laboratorios/${id}/verificar-ensamble/`, { colocaciones }).then((res) => res.data);

export const verificarCodigo = (id, codigo) =>
  api.post(`/labs/laboratorios/${id}/verificar-codigo/`, codigo).then((res) => res.data);

export const verificarBD = (id, modelo) =>
  api.post(`/labs/laboratorios/${id}/verificar-bd/`, modelo).then((res) => res.data);

export const entregarArchivo = (id, archivo) => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  return api
    .post(`/labs/laboratorios/${id}/entregar/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};
