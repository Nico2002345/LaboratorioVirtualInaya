import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MEDIA_BASE_URL } from "../../api/client";
import { entregarActividad, getActividad } from "../../api/submissions";
import EstadoBadge from "../../components/EstadoBadge";

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha límite";
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function respuestasIniciales(actividad) {
  const previas = {};
  actividad.mi_entrega?.respuestas.forEach((r) => {
    previas[r.pregunta] = r.contenido;
  });
  return previas;
}

export default function ActividadDetalle() {
  const { id } = useParams();
  const [actividad, setActividad] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let activo = true;
    getActividad(id)
      .then((act) => {
        if (!activo) return;
        setActividad(act);
        setRespuestas(respuestasIniciales(act));
      })
      .catch(() => activo && setError("No se pudo cargar la actividad."));
    return () => {
      activo = false;
    };
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!actividad) return <p className="cargando">Cargando...</p>;

  const estado = actividad.mi_entrega?.estado || "pendiente";
  const calificacion = actividad.mi_entrega?.calificacion;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const entrega = await entregarActividad(actividad.id, { respuestas, archivo });
      setActividad({ ...actividad, mi_entrega: entrega });
      setArchivo(null);
    } catch {
      setError("No se pudo enviar tu entrega. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contenedor">
      <Link className="volver" to="/estudiante">
        ← Volver al inicio
      </Link>
      <div className="detalle-lab-header">
        <h1>{actividad.titulo}</h1>
        <EstadoBadge estado={estado} />
      </div>

      {actividad.descripcion && <p>{actividad.descripcion}</p>}
      {actividad.instrucciones && (
        <p>
          <strong>Instrucciones:</strong> {actividad.instrucciones}
        </p>
      )}
      <p className="lab-fecha">Fecha de entrega: {formatearFecha(actividad.fecha_entrega)}</p>

      {actividad.laboratorio && (
        <p>
          <Link to={`/estudiante/laboratorios/${actividad.laboratorio}`}>
            Ir al laboratorio relacionado →
          </Link>
        </p>
      )}

      {calificacion && (
        <div className="resultado-lab">
          <p className="calificacion">
            Calificación: {calificacion.nota} / {actividad.puntaje_maximo}
          </p>
          {calificacion.observaciones && (
            <p>
              <strong>Observaciones del profesor:</strong> {calificacion.observaciones}
            </p>
          )}
        </div>
      )}

      {actividad.preguntas.length > 0 && (
        <form className="form-quiz" onSubmit={onSubmit}>
          {actividad.preguntas.map((p, idx) => (
            <fieldset key={p.id}>
              <legend>
                {idx + 1}. {p.enunciado}
              </legend>
              {p.tipo === "opcion_multiple" &&
                p.opciones.map((opcion) => (
                  <label key={opcion} className="opcion-quiz">
                    <input
                      type="radio"
                      name={`pregunta-${p.id}`}
                      value={opcion}
                      checked={respuestas[p.id] === opcion}
                      onChange={() => setRespuestas({ ...respuestas, [p.id]: opcion })}
                    />
                    {opcion}
                  </label>
                ))}
              {p.tipo === "verdadero_falso" &&
                ["Verdadero", "Falso"].map((opcion) => (
                  <label key={opcion} className="opcion-quiz">
                    <input
                      type="radio"
                      name={`pregunta-${p.id}`}
                      value={opcion}
                      checked={respuestas[p.id] === opcion}
                      onChange={() => setRespuestas({ ...respuestas, [p.id]: opcion })}
                    />
                    {opcion}
                  </label>
                ))}
              {p.tipo === "abierta" && (
                <textarea
                  rows={3}
                  value={respuestas[p.id] || ""}
                  onChange={(e) => setRespuestas({ ...respuestas, [p.id]: e.target.value })}
                />
              )}
            </fieldset>
          ))}

          <label className="campo-archivo">
            Archivo adjunto (opcional)
            <input type="file" onChange={(e) => setArchivo(e.target.files[0])} />
          </label>
          {actividad.mi_entrega?.archivo && (
            <p>
              Archivo actual:{" "}
              <a href={`${MEDIA_BASE_URL}${actividad.mi_entrega.archivo}`} target="_blank" rel="noreferrer">
                ver archivo
              </a>
            </p>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : actividad.mi_entrega ? "Actualizar entrega" : "Entregar"}
          </button>
        </form>
      )}
    </div>
  );
}
