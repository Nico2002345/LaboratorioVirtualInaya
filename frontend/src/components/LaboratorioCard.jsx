import { Link } from "react-router-dom";
import EstadoBadge from "./EstadoBadge";

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha límite";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function LaboratorioCard({ laboratorio }) {
  const { id, titulo, descripcion, objetivo, fecha_limite, mi_progreso } = laboratorio;

  return (
    <article className="tarjeta-laboratorio">
      <div className="tarjeta-laboratorio-header">
        <h3>{titulo}</h3>
        <EstadoBadge estado={mi_progreso.estado} />
      </div>
      {descripcion && <p className="lab-descripcion">{descripcion}</p>}
      {objetivo && (
        <p className="lab-objetivo">
          <strong>Objetivo:</strong> {objetivo}
        </p>
      )}
      <p className="lab-fecha">Fecha de entrega: {formatearFecha(fecha_limite)}</p>
      <Link className="boton-iniciar" to={`/estudiante/laboratorios/${id}`}>
        {mi_progreso.estado === "no_iniciado" ? "Iniciar laboratorio" : "Continuar laboratorio"}
      </Link>
    </article>
  );
}
