import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { actualizarModulo, crearModulo, eliminarModulo, getModulos } from "../../api/content";
import { useAuth } from "../../auth/AuthContext";

const VACIO = { nombre: "", descripcion: "", icono: "" };

function FilaModulo({ modulo, onGuardado, onEliminar }) {
  const [valores, setValores] = useState({
    nombre: modulo.nombre,
    descripcion: modulo.descripcion,
    icono: modulo.icono,
  });
  const [guardando, setGuardando] = useState(false);

  const onGuardar = async () => {
    setGuardando(true);
    try {
      const actualizado = await actualizarModulo(modulo.id, valores);
      onGuardado(actualizado);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <tr>
      <td>
        <input
          className="input-icono"
          value={valores.icono}
          onChange={(e) => setValores({ ...valores, icono: e.target.value })}
        />
      </td>
      <td>
        <input value={valores.nombre} onChange={(e) => setValores({ ...valores, nombre: e.target.value })} />
      </td>
      <td>
        <input
          value={valores.descripcion}
          onChange={(e) => setValores({ ...valores, descripcion: e.target.value })}
        />
      </td>
      <td className="acciones-tabla">
        <button type="button" onClick={onGuardar} disabled={guardando}>
          Guardar
        </button>
        <button type="button" className="boton-eliminar" onClick={() => onEliminar(modulo)}>
          Eliminar
        </button>
      </td>
    </tr>
  );
}

export default function AdminModulos() {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === "admin";
  const base = esAdmin ? "/admin" : "/profesor";

  const [modulos, setModulos] = useState(null);
  const [nuevo, setNuevo] = useState(VACIO);
  const [error, setError] = useState("");

  const cargar = () => {
    getModulos()
      .then(setModulos)
      .catch(() => setError("No se pudieron cargar los módulos."));
  };

  useEffect(cargar, []);

  const onCrear = async (e) => {
    e.preventDefault();
    try {
      const creado = await crearModulo(nuevo);
      setModulos([...modulos, creado]);
      setNuevo(VACIO);
    } catch {
      setError("No se pudo crear el módulo.");
    }
  };

  const onEliminar = async (modulo) => {
    if (!window.confirm(`¿Eliminar el módulo "${modulo.nombre}"? Esto también elimina sus asignaciones a grados y contenidos.`))
      return;
    try {
      await eliminarModulo(modulo.id);
      setModulos(modulos.filter((m) => m.id !== modulo.id));
    } catch {
      setError("No se pudo eliminar el módulo.");
    }
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="contenedor">
      <Link className="volver" to={base}>
        ← Volver al inicio
      </Link>
      <h1>Catálogo de módulos</h1>
      <p>
        <Link to={`${base}/contenidos`}>Ir a asignación de módulos por grado y contenidos →</Link>
      </p>

      <form className="form-gestion form-fila" onSubmit={onCrear}>
        <input
          className="input-icono"
          placeholder="🖥️"
          value={nuevo.icono}
          onChange={(e) => setNuevo({ ...nuevo, icono: e.target.value })}
        />
        <input
          placeholder="Nombre del módulo"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          required
        />
        <input
          placeholder="Descripción"
          value={nuevo.descripcion}
          onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
        />
        <button type="submit">+ Agregar módulo</button>
      </form>

      {!modulos ? (
        <p className="cargando">Cargando...</p>
      ) : (
        <table className="tabla-simple">
          <thead>
            <tr>
              <th>Ícono</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {modulos.map((m) => (
              <FilaModulo
                key={m.id}
                modulo={m}
                onGuardado={(actualizado) =>
                  setModulos(modulos.map((x) => (x.id === actualizado.id ? actualizado : x)))
                }
                onEliminar={onEliminar}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
