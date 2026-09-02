import { useEffect, useState } from "react";
import { getMisGradosProfesor } from "../../api/academics";

export default function ProfesorHome() {
  const [grados, setGrados] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getMisGradosProfesor()
      .then(setGrados)
      .catch(() => setError("No se pudieron cargar tus grados asignados."));
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
        <h2>Estudiantes, laboratorios y actividades</h2>
        <p className="placeholder">
          Próximo módulo a construir: consulta de estudiantes por grado, creación de laboratorios y
          actividades, revisión de entregas y calificación.
        </p>
      </section>
    </div>
  );
}
