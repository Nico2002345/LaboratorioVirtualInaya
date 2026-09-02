import { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { urlArchivo } from "../../api/client";
import { getGrados, getMisGradosProfesor } from "../../api/academics";
import { useAuth } from "../../auth/AuthContext";

const ContenidoMarkdown = lazy(() => import("../../components/ContenidoMarkdown"));
import {
  actualizarContenido,
  crearContenido,
  crearMaterial,
  crearModuloGrado,
  eliminarContenido,
  eliminarMaterial,
  eliminarModuloGrado,
  getContenidos,
  getMateriales,
  getModulos,
  getModulosGrado,
} from "../../api/content";

const CONTENIDO_VACIO = { titulo: "", descripcion: "", cuerpo: "", orden: 1, publicado: true };
const MATERIAL_VACIO = { nombre: "", tipo: "enlace", enlace: "" };
const TIPOS_MATERIAL = [
  { value: "pdf", label: "PDF" },
  { value: "imagen", label: "Imagen" },
  { value: "video", label: "Video" },
  { value: "enlace", label: "Enlace" },
  { value: "otro", label: "Otro" },
];

function MaterialesContenido({ contenidoId }) {
  const [materiales, setMateriales] = useState(null);
  const [nuevo, setNuevo] = useState(MATERIAL_VACIO);
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMateriales(contenidoId).then(setMateriales);
  }, [contenidoId]);

  const onCrear = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const creado = await crearMaterial({ contenido: contenidoId, ...nuevo, archivo });
      setMateriales([...materiales, creado]);
      setNuevo(MATERIAL_VACIO);
      setArchivo(null);
    } catch {
      setError("Debes adjuntar un archivo o un enlace.");
    }
  };

  const onEliminar = async (id) => {
    await eliminarMaterial(id);
    setMateriales(materiales.filter((m) => m.id !== id));
  };

  if (!materiales) return <p className="cargando">Cargando materiales...</p>;

  return (
    <div className="materiales-contenido">
      <h4>Materiales de apoyo</h4>
      {materiales.length > 0 && (
        <ul className="lista-materiales">
          {materiales.map((m) => (
            <li key={m.id}>
              <span className="material-tipo">{m.tipo}</span>{" "}
              <a href={m.enlace || urlArchivo(m.archivo)} target="_blank" rel="noreferrer">
                {m.nombre}
              </a>
              <button type="button" className="boton-x" onClick={() => onEliminar(m.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="form-gestion form-fila material-form" onSubmit={onCrear}>
        <input
          placeholder="Nombre del material"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          required
        />
        <select value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}>
          {TIPOS_MATERIAL.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          placeholder="Enlace (URL)"
          value={nuevo.enlace}
          onChange={(e) => setNuevo({ ...nuevo, enlace: e.target.value })}
        />
        <input type="file" onChange={(e) => setArchivo(e.target.files[0])} />
        <button type="submit">+ Agregar material</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function ContenidoCard({ contenido, onGuardado, onEliminar }) {
  const [valores, setValores] = useState({
    titulo: contenido.titulo,
    descripcion: contenido.descripcion,
    cuerpo: contenido.cuerpo,
    orden: contenido.orden,
    publicado: contenido.publicado,
  });
  const [guardando, setGuardando] = useState(false);
  const [mostrarMateriales, setMostrarMateriales] = useState(false);
  const [mostrarCuerpo, setMostrarCuerpo] = useState(false);

  const onGuardar = async () => {
    setGuardando(true);
    try {
      const actualizado = await actualizarContenido(contenido.id, { ...contenido, ...valores });
      onGuardado(actualizado);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="contenido-card">
      <div className="form-fila">
        <input value={valores.titulo} onChange={(e) => setValores({ ...valores, titulo: e.target.value })} />
        <input
          value={valores.descripcion}
          onChange={(e) => setValores({ ...valores, descripcion: e.target.value })}
        />
        <input
          type="number"
          className="input-orden"
          value={valores.orden}
          onChange={(e) => setValores({ ...valores, orden: e.target.value })}
        />
        <label className="opcion-checkbox">
          <input
            type="checkbox"
            checked={valores.publicado}
            onChange={(e) => setValores({ ...valores, publicado: e.target.checked })}
          />
          Publicado
        </label>
        <button type="button" onClick={onGuardar} disabled={guardando}>
          Guardar
        </button>
        <button type="button" className="boton-eliminar" onClick={() => onEliminar(contenido.id)}>
          Eliminar
        </button>
        <button type="button" onClick={() => setMostrarMateriales(!mostrarMateriales)}>
          {mostrarMateriales ? "Ocultar materiales" : "Materiales"}
        </button>
        <button type="button" onClick={() => setMostrarCuerpo(!mostrarCuerpo)}>
          {mostrarCuerpo ? "Ocultar cuerpo" : "Editar cuerpo"}
        </button>
      </div>

      {mostrarCuerpo && (
        <div className="cuerpo-contenido">
          <div className="editor-cuerpo-layout">
            <textarea
              rows={8}
              placeholder="Cuerpo del contenido en Markdown: # títulos, **negrita**, - listas, tablas..."
              value={valores.cuerpo}
              onChange={(e) => setValores({ ...valores, cuerpo: e.target.value })}
            />
            <div className="vista-previa-cuerpo">
              <span className="vista-previa-etiqueta">Vista previa</span>
              <Suspense fallback={<p>Cargando vista previa...</p>}>
                <ContenidoMarkdown texto={valores.cuerpo} />
              </Suspense>
            </div>
          </div>
          <button type="button" onClick={onGuardar} disabled={guardando}>
            Guardar cuerpo
          </button>
        </div>
      )}

      {mostrarMateriales && <MaterialesContenido contenidoId={contenido.id} />}
    </div>
  );
}

function GrupoModuloGrado({ moduloGrado, onEliminarAsignacion, puedeGestionarModulos }) {
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
        {puedeGestionarModulos && (
          <button
            type="button"
            className="boton-eliminar"
            onClick={() => onEliminarAsignacion(moduloGrado.id)}
          >
            Quitar módulo de este grado
          </button>
        )}
      </div>

      {!contenidos ? (
        <p className="cargando">Cargando contenidos...</p>
      ) : (
        <>
          {contenidos.map((c) => (
            <ContenidoCard
              key={c.id}
              contenido={c}
              onGuardado={(actualizado) =>
                setContenidos(contenidos.map((x) => (x.id === actualizado.id ? actualizado : x)))
              }
              onEliminar={onEliminarContenido}
            />
          ))}

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
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === "admin";
  const base = esAdmin ? "/admin" : "/profesor";

  const [grados, setGrados] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [modulosGrado, setModulosGrado] = useState(null);
  const [moduloParaAsignar, setModuloParaAsignar] = useState("");
  const [ordenParaAsignar, setOrdenParaAsignar] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([esAdmin ? getGrados() : getMisGradosProfesor(), getModulos()])
      .then(([g, m]) => {
        setGrados(g);
        setModulos(m);
        if (g.length > 0) setGradoSeleccionado(String(g[0].id));
      })
      .catch(() => setError("No se pudo cargar la información."));
  }, [esAdmin]);

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
      <Link className="volver" to={base}>
        ← Volver al inicio
      </Link>
      <h1>{esAdmin ? "Contenidos por grado" : "Mis contenidos"}</h1>
      {esAdmin && (
        <p>
          <Link to="/admin/modulos">Ir al catálogo de módulos →</Link>
        </p>
      )}
      {!esAdmin && (
        <p className="placeholder">
          Puedes crear/editar contenidos y materiales de apoyo en los módulos ya asignados a tus grados. La
          asignación de módulos a un grado la administra el administrador.
        </p>
      )}

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

      {esAdmin && (
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
      )}

      {!modulosGrado ? (
        <p className="cargando">Cargando...</p>
      ) : modulosGrado.length === 0 ? (
        <p className="placeholder">Este grado aún no tiene módulos asignados.</p>
      ) : (
        modulosGrado.map((mg) => (
          <GrupoModuloGrado
            key={mg.id}
            moduloGrado={mg}
            onEliminarAsignacion={onEliminarAsignacion}
            puedeGestionarModulos={esAdmin}
          />
        ))
      )}
    </div>
  );
}
