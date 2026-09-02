import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { actualizarGrado, crearGrado, getGrados } from "../../api/academics";

const GRADO_VACIO = { nombre: "", descripcion: "", orden: 0 };

function FilaGrado({ grado, onGuardado }) {
  const [descripcion, setDescripcion] = useState(grado.descripcion);
  const [guardando, setGuardando] = useState(false);

  const onGuardar = async () => {
    setGuardando(true);
    try {
      const actualizado = await actualizarGrado(grado.id, { descripcion });
      onGuardado(actualizado);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <tr>
      <td>
        <strong>{grado.nombre}</strong>
      </td>
      <td>
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </td>
      <td>
        <button type="button" onClick={onGuardar} disabled={guardando}>
          Guardar
        </button>
      </td>
    </tr>
  );
}

export default function AdminGrados() {
  const [grados, setGrados] = useState(null);
  const [nuevo, setNuevo] = useState(GRADO_VACIO);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");
  const [errorCreacion, setErrorCreacion] = useState("");

  useEffect(() => {
    getGrados()
      .then(setGrados)
      .catch(() => setError("No se pudieron cargar los grados."));
  }, []);

  const onCrear = async (e) => {
    e.preventDefault();
    setErrorCreacion("");
    setCreando(true);
    try {
      const creado = await crearGrado({ ...nuevo, orden: Number(nuevo.orden) || 0 });
      setGrados([...grados, creado]);
      setNuevo(GRADO_VACIO);
    } catch (err) {
      setErrorCreacion(err.response?.data?.nombre?.[0] || "No se pudo crear el grado.");
    } finally {
      setCreando(false);
    }
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="contenedor">
      <Link className="volver" to="/admin">
        ← Volver al inicio
      </Link>
      <h1>Grados</h1>
      <p className="placeholder">
        Los 4 grados base (8° a 11°) vienen precargados. Puedes agregar secciones adicionales
        (ej. "8B", "9C") con el formulario de abajo; no se pueden eliminar grados, solo editar su
        descripción.
      </p>

      <form className="form-gestion form-fila" onSubmit={onCrear}>
        <input
          placeholder="Nombre (ej. 8B)"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          maxLength={10}
          required
        />
        <input
          placeholder="Descripción (opcional)"
          value={nuevo.descripcion}
          onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
        />
        <input
          type="number"
          className="input-orden"
          placeholder="Orden"
          value={nuevo.orden}
          onChange={(e) => setNuevo({ ...nuevo, orden: e.target.value })}
        />
        <button type="submit" disabled={creando}>
          {creando ? "Creando..." : "+ Agregar grado"}
        </button>
      </form>
      {errorCreacion && <p className="error">{errorCreacion}</p>}

      {!grados ? (
        <p className="cargando">Cargando...</p>
      ) : (
        <table className="tabla-simple">
          <thead>
            <tr>
              <th>Grado</th>
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {grados.map((g) => (
              <FilaGrado
                key={g.id}
                grado={g}
                onGuardado={(actualizado) =>
                  setGrados(grados.map((x) => (x.id === actualizado.id ? actualizado : x)))
                }
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
