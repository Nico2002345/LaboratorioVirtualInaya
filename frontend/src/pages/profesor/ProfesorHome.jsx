import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMisGradosProfesor } from "../../api/academics";
import { getActividadesProfesor } from "../../api/assignments";

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha límite";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProfesorHome() {
  const [grados, setGrados] = useState([]);
  const [actividades, setActividades] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMisGradosProfesor(), getActividadesProfesor()])
      .then(([gradosData, actividadesData]) => {
        setGrados(gradosData);
        setActividades(actividadesData);
      })
      .catch(() => setError("No se pudo cargar tu información."));
  }, []);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="contenedor">
      <h1>Inicio</h1>

      <section>
        <h2>Mis grados asignados</h2>
        {grados.length === 0 ? (
          <p className="placeholder">Aún no tienes grados asignados. Contacta al administrador.</p>
        ) : (
          <ul className="lista-grados">
            {grados.map((g) => (
              <li key={g.id}>{g.nombre}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Gestión</h2>
        <div className="nav-panel">
          <Link className="boton-iniciar" to="/profesor/estudiantes">
            Mis estudiantes
          </Link>
          <Link className="boton-iniciar" to="/profesor/contenidos">
            Mis contenidos
          </Link>
          <Link className="boton-iniciar" to="/profesor/laboratorios">
            Mis laboratorios
          </Link>
          <Link className="boton-iniciar" to="/profesor/actividades">
            Mis actividades
          </Link>
        </div>
      </section>

      <section>
        <h2>Actividades recientes</h2>
        {!actividades ? (
          <p className="cargando">Cargando...</p>
        ) : actividades.length === 0 ? (
          <p className="placeholder">Aún no has creado actividades para tus grados.</p>
        ) : (
          <div className="grid-laboratorios">
            {actividades.slice(0, 4).map((act) => (
              <article key={act.id} className="tarjeta-laboratorio">
                <div className="tarjeta-laboratorio-header">
                  <h3>{act.titulo}</h3>
                  <span className="badge-estado badge-en_progreso">{act.grado_detalle.nombre}</span>
                </div>
                <p className="lab-fecha">Fecha de entrega: {formatearFecha(act.fecha_entrega)}</p>
                <Link className="boton-iniciar" to={`/profesor/actividades/${act.id}`}>
                  Revisar entregas
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
