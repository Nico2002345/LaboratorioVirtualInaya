const ETIQUETAS = {
  no_iniciado: "No iniciado",
  en_progreso: "En progreso",
  completado: "Completado",
};

export default function EstadoBadge({ estado }) {
  return <span className={`badge-estado badge-${estado}`}>{ETIQUETAS[estado] || estado}</span>;
}
