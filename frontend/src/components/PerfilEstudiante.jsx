import { useState } from "react";
import { actualizarPerfil } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

const AVATARES = ["🧑‍🎓", "🤖", "🐱", "🦊", "🦉", "🐙", "🐲", "👽", "🥷", "🦄", "⚡", "🚀"];

function calcularStats(laboratorios, actividades) {
  const labsCompletados = laboratorios.filter((l) => l.mi_progreso.estado === "completado").length;
  const actividadesEntregadas = actividades.filter((a) => a.mi_entrega).length;

  const notas = [
    ...laboratorios
      .filter((l) => l.mi_progreso.calificacion != null)
      .map((l) => Number(l.mi_progreso.calificacion)),
    ...actividades
      .filter((a) => a.mi_entrega?.calificacion)
      .map((a) => (Number(a.mi_entrega.calificacion.nota) / Number(a.puntaje_maximo)) * 5),
  ];
  const promedio = notas.length > 0 ? notas.reduce((s, n) => s + n, 0) / notas.length : null;

  const totalTareas = laboratorios.length + actividades.length;
  const tareasHechas = labsCompletados + actividadesEntregadas;
  const porcentajeAvance = totalTareas > 0 ? Math.round((tareasHechas / totalTareas) * 100) : 0;

  return { labsCompletados, actividadesEntregadas, promedio, porcentajeAvance };
}

function construirLogros({ labsCompletados, actividadesEntregadas, promedio }, laboratorios, actividades) {
  return [
    {
      icono: "🚀",
      titulo: "Primeros pasos",
      descripcion: "Completa un laboratorio o entrega una actividad",
      lograda: labsCompletados > 0 || actividadesEntregadas > 0,
    },
    {
      icono: "🏆",
      titulo: "Laboratorista",
      descripcion: "Completa todos tus laboratorios asignados",
      lograda: laboratorios.length > 0 && labsCompletados === laboratorios.length,
    },
    {
      icono: "📬",
      titulo: "Cumplidor",
      descripcion: "Entrega todas tus actividades asignadas",
      lograda: actividades.length > 0 && actividadesEntregadas === actividades.length,
    },
    {
      icono: "🔥",
      titulo: "En racha",
      descripcion: "Completa 3 o más laboratorios",
      lograda: labsCompletados >= 3,
    },
    {
      icono: "⭐",
      titulo: "Excelencia",
      descripcion: "Mantén un promedio de 4.5 o más",
      lograda: promedio != null && promedio >= 4.5,
    },
  ];
}

export default function PerfilEstudiante({ laboratorios, actividades }) {
  const { usuario, actualizarUsuario } = useAuth();
  const [editando, setEditando] = useState(false);
  const [avatar, setAvatar] = useState(usuario.avatar);
  const [apodo, setApodo] = useState(usuario.apodo || "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const stats = calcularStats(laboratorios, actividades);
  const logros = construirLogros(stats, laboratorios, actividades);
  const logrosObtenidos = logros.filter((l) => l.lograda).length;

  const onGuardar = async () => {
    setGuardando(true);
    setError("");
    try {
      const actualizado = await actualizarPerfil({ avatar, apodo: apodo.trim() });
      actualizarUsuario(actualizado);
      setEditando(false);
    } catch {
      setError("No se pudo guardar tu perfil.");
    } finally {
      setGuardando(false);
    }
  };

  const onCancelar = () => {
    setAvatar(usuario.avatar);
    setApodo(usuario.apodo || "");
    setEditando(false);
  };

  return (
    <section className="panel-perfil">
      <div className="perfil-cabecera">
        <button
          type="button"
          className="perfil-avatar-boton"
          onClick={() => setEditando((v) => !v)}
          title="Editar mi perfil"
        >
          {usuario.avatar}
        </button>
        <div>
          <h1>¡Bienvenido/a, {usuario.apodo || usuario.first_name}!</h1>
          <p className="perfil-editar-link">
            <button type="button" className="boton-enlace" onClick={() => setEditando((v) => !v)}>
              {editando ? "Cerrar edición" : "Editar mi perfil"}
            </button>
          </p>
        </div>
      </div>

      {editando && (
        <div className="perfil-editor">
          <p>Elige tu avatar</p>
          <div className="selector-avatares">
            {AVATARES.map((a) => (
              <button
                key={a}
                type="button"
                className={`opcion-avatar ${avatar === a ? "opcion-avatar-activa" : ""}`}
                onClick={() => setAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <label className="campo-apodo">
            Apodo (opcional)
            <input
              type="text"
              maxLength={30}
              value={apodo}
              onChange={(e) => setApodo(e.target.value)}
              placeholder="¿Cómo quieres que te llamemos?"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="perfil-editor-botones">
            <button type="button" onClick={onGuardar} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" className="boton-secundario" onClick={onCancelar} disabled={guardando}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="panel-progreso">
        <div className="barra-progreso-contenedor">
          <div className="barra-progreso-info">
            <span>Progreso general</span>
            <span>{stats.porcentajeAvance}%</span>
          </div>
          <div className="barra-progreso">
            <div className="barra-progreso-relleno" style={{ width: `${stats.porcentajeAvance}%` }} />
          </div>
        </div>

        <div className="grid-stats">
          <div className="stat-tarjeta">
            <span className="stat-numero">
              {stats.labsCompletados}/{laboratorios.length}
            </span>
            <span className="stat-etiqueta">Laboratorios completados</span>
          </div>
          <div className="stat-tarjeta">
            <span className="stat-numero">
              {stats.actividadesEntregadas}/{actividades.length}
            </span>
            <span className="stat-etiqueta">Actividades entregadas</span>
          </div>
          <div className="stat-tarjeta">
            <span className="stat-numero">{stats.promedio != null ? stats.promedio.toFixed(1) : "—"}</span>
            <span className="stat-etiqueta">Promedio</span>
          </div>
          <div className="stat-tarjeta">
            <span className="stat-numero">
              {logrosObtenidos}/{logros.length}
            </span>
            <span className="stat-etiqueta">Logros</span>
          </div>
        </div>

        <div className="grid-logros">
          {logros.map((logro) => (
            <div
              key={logro.titulo}
              className={`logro-tarjeta ${logro.lograda ? "logro-obtenido" : "logro-bloqueado"}`}
              title={logro.descripcion}
            >
              <span className="logro-icono">{logro.icono}</span>
              <span className="logro-titulo">{logro.titulo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
