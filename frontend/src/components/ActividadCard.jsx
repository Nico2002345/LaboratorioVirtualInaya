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

export default function ActividadCard({ actividad }) {
  const { id, titulo, descripcion, fecha_entrega, puntaje_maximo, mi_entrega } = actividad;
  const estado = mi_entrega?.estado || "pendiente";
  const calificacion = mi_entrega?.calificacion;

  return (
    <article className="tarjeta-laboratorio">
      <div className="tarjeta-laboratorio-header">
        <h3>{titulo}</h3>
        <EstadoBadge estado={estado} />
      </div>
      {descripcion && <p className="lab-descripcion">{descripcion}</p>}
      <p className="lab-fecha">Fecha de entrega: {formatearFecha(fecha_entrega)}</p>
      {calificacion && (
        <p className="actividad-nota">
          Calificación: <strong>{calificacion.nota}</strong> / {puntaje_maximo}
        </p>
      )}
      <Link className="boton-iniciar" to={`/estudiante/actividades/${id}`}>
        {mi_entrega ? "Ver actividad" : "Realizar actividad"}
      </Link>
    </article>
  );
}
