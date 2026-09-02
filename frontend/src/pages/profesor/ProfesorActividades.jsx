import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { eliminarActividad, getActividadesProfesor } from "../../api/assignments";

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha límite";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProfesorActividades() {
  const [actividades, setActividades] = useState(null);
  const [error, setError] = useState("");

  const cargar = () => {
    getActividadesProfesor()
      .then(setActividades)
      .catch(() => setError("No se pudieron cargar las actividades."));
  };

  useEffect(cargar, []);

  const onEliminar = async (act) => {
    if (!window.confirm(`¿Eliminar la actividad "${act.titulo}"?`)) return;
    try {
      await eliminarActividad(act.id);
      setActividades(actividades.filter((a) => a.id !== act.id));
    } catch {
      setError("No se pudo eliminar la actividad.");
    }
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="contenedor">
      <Link className="volver" to="/profesor">
        ← Volver al inicio
      </Link>
      <div className="encabezado-lista">
        <h1>Mis actividades</h1>
        <Link className="boton-iniciar" to="/profesor/actividades/nueva">
          + Nueva actividad
        </Link>
      </div>

      {!actividades ? (
        <p className="cargando">Cargando...</p>
      ) : actividades.length === 0 ? (
        <p className="placeholder">Aún no has creado actividades.</p>
      ) : (
        <table className="tabla-simple">
          <thead>
            <tr>
              <th>Título</th>
              <th>Grado</th>
              <th>Fecha de entrega</th>
              <th>Preguntas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((act) => (
              <tr key={act.id}>
                <td>{act.titulo}</td>
                <td>{act.grado_detalle.nombre}</td>
                <td>{formatearFecha(act.fecha_entrega)}</td>
                <td>{act.preguntas.length}</td>
                <td className="acciones-tabla">
                  <Link to={`/profesor/actividades/${act.id}/editar`}>Editar</Link>
                  <Link to={`/profesor/actividades/${act.id}`}>Revisar entregas</Link>
                  <button type="button" className="boton-eliminar" onClick={() => onEliminar(act)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
