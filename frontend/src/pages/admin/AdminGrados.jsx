import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { actualizarGrado, getGrados } from "../../api/academics";

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
  const [error, setError] = useState("");

  useEffect(() => {
    getGrados()
      .then(setGrados)
      .catch(() => setError("No se pudieron cargar los grados."));
  }, []);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="contenedor">
      <Link className="volver" to="/admin">
        ← Volver al inicio
      </Link>
      <h1>Grados</h1>
      <p className="placeholder">
        Los 4 grados (8° a 11°) son fijos: no se pueden crear ni eliminar, solo editar su descripción.
      </p>

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
