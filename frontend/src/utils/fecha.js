export const isoADatetimeLocal = (iso) => {
  if (!iso) return "";
  const fecha = new Date(iso);
  const offset = fecha.getTimezoneOffset();
  const local = new Date(fecha.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export const datetimeLocalAIso = (valor) => (valor ? new Date(valor).toISOString() : null);
