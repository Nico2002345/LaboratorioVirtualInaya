const ETIQUETAS = {
  no_iniciado: "No iniciado",
  en_progreso: "En progreso",
  completado: "Completado",
  pendiente: "Pendiente",
  entregado: "Entregado",
  tarde: "Entregado tarde",
  revisado: "Calificado",
};

export default function EstadoBadge({ estado }) {
  return <span className={`badge-estado badge-${estado}`}>{ETIQUETAS[estado] || estado}</span>;
}
