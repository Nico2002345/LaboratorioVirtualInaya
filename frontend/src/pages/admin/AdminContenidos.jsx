import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGrados } from "../../api/academics";
import {
  actualizarContenido,
  crearContenido,
  crearModuloGrado,
  eliminarContenido,
  eliminarModuloGrado,
  getContenidos,
  getModulos,
  getModulosGrado,
} from "../../api/content";

const CONTENIDO_VACIO = { titulo: "", descripcion: "", cuerpo: "", orden: 1, publicado: true };

function FilaContenido({ contenido, onGuardado, onEliminar }) {
  const [valores, setValores] = useState({
    titulo: contenido.titulo,
    descripcion: contenido.descripcion,
    orden: contenido.orden,
    publicado: contenido.publicado,
  });
  const [guardando, setGuardando] = useState(false);

  const onGuardar = async () => {
    setGuardando(true);
    try {
      const actualizado = await actualizarContenido(contenido.id, {
        ...contenido,
        ...valores,
      });
      onGuardado(actualizado);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <tr>
      <td>
        <input value={valores.titulo} onChange={(e) => setValores({ ...valores, titulo: e.target.value })} />
      </td>
      <td>
        <input
          value={valores.descripcion}
          onChange={(e) => setValores({ ...valores, descripcion: e.target.value })}
        />
      </td>
      <td>
        <input
          type="number"
          className="input-orden"
          value={valores.orden}
          onChange={(e) => setValores({ ...valores, orden: e.target.value })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={valores.publicado}
          onChange={(e) => setValores({ ...valores, publicado: e.target.checked })}
        />
      </td>
      <td className="acciones-tabla">
        <button type="button" onClick={onGuardar} disabled={guardando}>
          Guardar
        </button>
        <button type="button" className="boton-eliminar" onClick={() => onEliminar(contenido.id)}>
          Eliminar
        </button>
      </td>
    </tr>
  );
}

function GrupoModuloGrado({ moduloGrado, onEliminarAsignacion }) {
  const [contenidos, setContenidos] = useState(null);
  const [nuevo, setNuevo] = useState(CONTENIDO_VACIO);

  const cargar = () => {
    getContenidos(moduloGrado.id).then(setContenidos);
  };

  useEffect(cargar, [moduloGrado.id]);

  const onCrear = async (e) => {
    e.preventDefault();
    const creado = await crearContenido({ ...nuevo, modulo_grado: moduloGrado.id });
    setContenidos([...contenidos, creado]);
    setNuevo({ ...CONTENIDO_VACIO, orden: contenidos.length + 2 });
  };

  const onEliminarContenido = async (id) => {
    await eliminarContenido(id);
    setContenidos(contenidos.filter((c) => c.id !== id));
  };

  return (
    <div className="grupo-modulo-grado">
      <div className="grupo-header">
        <h3>
          {moduloGrado.modulo.icono} {moduloGrado.modulo.nombre}{" "}
          <span className="orden-tag">orden {moduloGrado.orden}</span>
        </h3>
        <button
          type="button"
          className="boton-eliminar"
          onClick={() => onEliminarAsignacion(moduloGrado.id)}
        >
          Quitar módulo de este grado
        </button>
      </div>

      {!contenidos ? (
        <p className="cargando">Cargando contenidos...</p>
      ) : (
        <>
          {contenidos.length > 0 && (
            <table className="tabla-simple">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Orden</th>
                  <th>Publicado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contenidos.map((c) => (
                  <FilaContenido
                    key={c.id}
                    contenido={c}
                    onGuardado={(actualizado) =>
                      setContenidos(contenidos.map((x) => (x.id === actualizado.id ? actualizado : x)))
                    }
                    onEliminar={onEliminarContenido}
                  />
                ))}
              </tbody>
            </table>
          )}

          <form className="form-gestion form-fila" onSubmit={onCrear}>
            <input
              placeholder="Título del contenido"
              value={nuevo.titulo}
              onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
              required
            />
            <input
              placeholder="Descripción breve"
              value={nuevo.descripcion}
              onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
            />
            <textarea
              placeholder="Cuerpo del contenido (texto/markdown)"
              rows={2}
              value={nuevo.cuerpo}
              onChange={(e) => setNuevo({ ...nuevo, cuerpo: e.target.value })}
            />
            <button type="submit">+ Agregar contenido</button>
          </form>
        </>
      )}
    </div>
  );
}

export default function AdminContenidos() {
  const [grados, setGrados] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [modulosGrado, setModulosGrado] = useState(null);
  const [moduloParaAsignar, setModuloParaAsignar] = useState("");
  const [ordenParaAsignar, setOrdenParaAsignar] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getGrados(), getModulos()])
      .then(([g, m]) => {
        setGrados(g);
        setModulos(m);
        if (g.length > 0) setGradoSeleccionado(String(g[0].id));
      })
      .catch(() => setError("No se pudo cargar la información."));
  }, []);

  const cargarModulosGrado = (gradoId) => {
    setModulosGrado(null);
    getModulosGrado(gradoId).then(setModulosGrado);
  };

  useEffect(() => {
    if (gradoSeleccionado) cargarModulosGrado(gradoSeleccionado);
  }, [gradoSeleccionado]);

  const onAsignar = async (e) => {
    e.preventDefault();
    if (!moduloParaAsignar) return;
    try {
      await crearModuloGrado({
        modulo_id: Number(moduloParaAsignar),
        grado_id: Number(gradoSeleccionado),
        orden: Number(ordenParaAsignar),
      });
      cargarModulosGrado(gradoSeleccionado);
      setModuloParaAsignar("");
    } catch {
      setError("No se pudo asignar el módulo (¿ya está asignado a este grado?).");
    }
  };

  const onEliminarAsignacion = async (moduloGradoId) => {
    if (!window.confirm("¿Quitar este módulo del grado? Se eliminarán también sus contenidos.")) return;
    await eliminarModuloGrado(moduloGradoId);
    cargarModulosGrado(gradoSeleccionado);
  };

  if (error) return <p className="error">{error}</p>;

  const modulosDisponibles = modulos.filter(
    (m) => !modulosGrado?.some((mg) => mg.modulo.id === m.id)
  );

  return (
    <div className="contenedor">
      <Link className="volver" to="/admin">
        ← Volver al inicio
      </Link>
      <h1>Contenidos por grado</h1>
      <p>
        <Link to="/admin/modulos">Ir al catálogo de módulos →</Link>
      </p>

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

      <form className="form-gestion form-fila" onSubmit={onAsignar}>
        <select value={moduloParaAsignar} onChange={(e) => setModuloParaAsignar(e.target.value)}>
          <option value="">Selecciona un módulo para asignar</option>
          {modulosDisponibles.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="input-orden"
          value={ordenParaAsignar}
          onChange={(e) => setOrdenParaAsignar(e.target.value)}
        />
        <button type="submit">+ Asignar al grado</button>
      </form>

      {!modulosGrado ? (
        <p className="cargando">Cargando...</p>
      ) : modulosGrado.length === 0 ? (
        <p className="placeholder">Este grado aún no tiene módulos asignados.</p>
      ) : (
        modulosGrado.map((mg) => (
          <GrupoModuloGrado key={mg.id} moduloGrado={mg} onEliminarAsignacion={onEliminarAsignacion} />
        ))
      )}
    </div>
  );
}
