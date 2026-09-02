import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { alternarActivoEstudiante, getEstudiantes, getGrados, getMisGradosProfesor } from "../../api/academics";
import { useAuth } from "../../auth/AuthContext";

export default function ProfesorEstudiantes() {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === "admin";

  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [estudiantes, setEstudiantes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarGrados = esAdmin ? getGrados : getMisGradosProfesor;
    cargarGrados()
      .then((data) => {
        setGrados(data);
        if (data.length > 0) setGradoSeleccionado(String(data[0].id));
      })
      .catch(() => setError("No se pudieron cargar los grados."));
  }, [esAdmin]);

  useEffect(() => {
    if (!gradoSeleccionado) return;
    setEstudiantes(null);
    getEstudiantes(gradoSeleccionado)
      .then(setEstudiantes)
      .catch(() => setError("No se pudieron cargar los estudiantes."));
  }, [gradoSeleccionado]);

  const onAlternarActivo = async (estudiante) => {
    try {
      const actualizado = await alternarActivoEstudiante(estudiante.id);
      setEstudiantes(estudiantes.map((e) => (e.id === estudiante.id ? actualizado : e)));
    } catch {
      setError("No se pudo cambiar el estado del estudiante.");
    }
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="contenedor">
      <Link className="volver" to={esAdmin ? "/admin" : "/profesor"}>
        ← Volver al inicio
      </Link>
      <h1>{esAdmin ? "Estudiantes" : "Mis estudiantes"}</h1>

      {grados.length === 0 ? (
        <p className="placeholder">Aún no hay grados disponibles.</p>
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
                  <th>Estado</th>
                  {esAdmin && <th></th>}
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
                    <td>{e.usuario.is_active ? "Activo" : "Inactivo"}</td>
                    {esAdmin && (
                      <td>
                        <button
                          type="button"
                          className="boton-eliminar"
                          onClick={() => onAlternarActivo(e)}
                        >
                          {e.usuario.is_active ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    )}
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
