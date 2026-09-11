import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  alternarActivoEstudiante,
  eliminarEstudiante,
  getEstudiantes,
  getGrados,
  getMisGradosProfesor,
  restablecerPasswordEstudiante,
} from "../../api/academics";
import { useAuth } from "../../auth/AuthContext";

const nombreCompleto = (e) => `${e.usuario.first_name} ${e.usuario.last_name}`;

const ordenarPorNombre = (lista) =>
  [...lista].sort((a, b) =>
    nombreCompleto(a).localeCompare(nombreCompleto(b), "es", { sensitivity: "base" })
  );

export default function ProfesorEstudiantes() {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === "admin";

  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [estudiantes, setEstudiantes] = useState(null);
  const [error, setError] = useState("");
  const [passwordGenerada, setPasswordGenerada] = useState(null);

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
      .then((data) => setEstudiantes(ordenarPorNombre(data)))
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

  const onRestablecerPassword = async (estudiante) => {
    const nombre = nombreCompleto(estudiante);
    if (!window.confirm(`¿Generar una contraseña temporal nueva para ${nombre}?`)) return;
    try {
      const { password_temporal } = await restablecerPasswordEstudiante(estudiante.id);
      setPasswordGenerada({ nombre, password: password_temporal });
    } catch {
      setError("No se pudo restablecer la contraseña.");
    }
  };

  const onEliminar = async (estudiante) => {
    const nombre = nombreCompleto(estudiante);
    if (!window.confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarEstudiante(estudiante.id);
      setEstudiantes(estudiantes.filter((e) => e.id !== estudiante.id));
    } catch {
      setError("No se pudo eliminar el estudiante.");
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
                  <th>N°</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Fecha de ingreso</th>
                  <th>Estado</th>
                  {esAdmin && <th></th>}
                  {esAdmin && <th></th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((e, indice) => (
                  <tr key={e.id}>
                    <td>{indice + 1}</td>
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
                    {esAdmin && (
                      <td>
                        <button
                          type="button"
                          className="boton-eliminar"
                          onClick={() => onRestablecerPassword(e)}
                        >
                          Restablecer contraseña
                        </button>
                      </td>
                    )}
                    <td>
                      <button type="button" className="boton-eliminar" onClick={() => onEliminar(e)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {passwordGenerada && (
        <div className="modal-overlay">
          <div className="modal-caja">
            <h2>Contraseña temporal generada</h2>
            <p>
              Entrégasela a <strong>{passwordGenerada.nombre}</strong> ahora: por seguridad no se
              podrá volver a consultar.
            </p>
            <p className="password-generada">{passwordGenerada.password}</p>
            <button type="button" onClick={() => setPasswordGenerada(null)}>
              Ya la copié / la entregué
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
