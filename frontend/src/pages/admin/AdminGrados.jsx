import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { actualizarGrado, crearGrado, eliminarGrado, getGrados } from "../../api/academics";

const GRADO_VACIO = { nombre: "", descripcion: "", orden: 0 };

const extraerError = (err, mensajePorDefecto) => {
  const data = err.response?.data;
  if (Array.isArray(data)) return data[0];
  if (Array.isArray(data?.detail)) return data.detail[0];
  if (data?.detail) return data.detail;
  return mensajePorDefecto;
};

function FilaGrado({ grado, onGuardado, onEliminado }) {
  const [descripcion, setDescripcion] = useState(grado.descripcion);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  const onGuardar = async () => {
    setGuardando(true);
    try {
      const actualizado = await actualizarGrado(grado.id, { descripcion });
      onGuardado(actualizado);
    } finally {
      setGuardando(false);
    }
  };

  const onEliminar = async () => {
    if (!window.confirm(`¿Eliminar el grado "${grado.nombre}"? Esta acción no se puede deshacer.`)) return;
    setErrorEliminar("");
    setEliminando(true);
    try {
      await eliminarGrado(grado.id);
      onEliminado(grado.id);
    } catch (err) {
      setErrorEliminar(extraerError(err, "No se pudo eliminar el grado."));
    } finally {
      setEliminando(false);
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
      <td className="acciones-tabla">
        <button type="button" onClick={onGuardar} disabled={guardando}>
          Guardar
        </button>
        <button type="button" className="boton-eliminar" onClick={onEliminar} disabled={eliminando}>
          {eliminando ? "Eliminando..." : "Eliminar"}
        </button>
        {errorEliminar && <p className="error">{errorEliminar}</p>}
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
      setErrorCreacion(err.response?.data?.nombre?.[0] || extraerError(err, "No se pudo crear el grado."));
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
        (ej. "8B", "9C") con el formulario de abajo. Un grado solo se puede eliminar si está
        vacío (sin estudiantes, módulos ni actividades asignadas).
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
                onEliminado={(id) => setGrados(grados.filter((x) => x.id !== id))}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
