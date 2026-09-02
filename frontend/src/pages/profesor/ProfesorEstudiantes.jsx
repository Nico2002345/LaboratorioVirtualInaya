import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEstudiantes, getMisGradosProfesor } from "../../api/academics";

export default function ProfesorEstudiantes() {
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [estudiantes, setEstudiantes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMisGradosProfesor()
      .then((data) => {
        setGrados(data);
        if (data.length > 0) setGradoSeleccionado(String(data[0].id));
      })
      .catch(() => setError("No se pudieron cargar tus grados asignados."));
  }, []);

  useEffect(() => {
    if (!gradoSeleccionado) return;
    setEstudiantes(null);
    getEstudiantes(gradoSeleccionado)
      .then(setEstudiantes)
      .catch(() => setError("No se pudieron cargar los estudiantes."));
  }, [gradoSeleccionado]);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="contenedor">
      <Link className="volver" to="/profesor">
        ← Volver al inicio
      </Link>
      <h1>Mis estudiantes</h1>

      {grados.length === 0 ? (
        <p className="placeholder">Aún no tienes grados asignados.</p>
      ) : (
        <>
          <label className="selector-grado">
            Grado
            <select value={gradoSeleccionado} onChange={(e) => setGradoSeleccionado(e.target.value)}>
              {grados.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </label>

          {!estudiantes ? (
            <p className="cargando">Cargando...</p>
          ) : estudiantes.length === 0 ? (
            <p className="placeholder">Aún no hay estudiantes registrados en este grado.</p>
          ) : (
            <table className="tabla-simple">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Fecha de ingreso</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {e.usuario.first_name} {e.usuario.last_name}
                    </td>
                    <td>{e.usuario.email}</td>
                    <td>{e.fecha_ingreso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
