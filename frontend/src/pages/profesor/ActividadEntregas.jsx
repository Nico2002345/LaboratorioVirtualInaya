import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MEDIA_BASE_URL } from "../../api/client";
import { getActividadProfesor } from "../../api/assignments";
import { calificarEntrega, getEntregasActividad } from "../../api/submissions";
import EstadoBadge from "../../components/EstadoBadge";

function FormularioCalificar({ entrega, puntajeMaximo, onCalificado }) {
  const [nota, setNota] = useState(entrega.calificacion?.nota ?? "");
  const [observaciones, setObservaciones] = useState(entrega.calificacion?.observaciones ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const actualizada = await calificarEntrega(entrega.id, { nota, observaciones });
      onCalificado(actualizada);
    } catch {
      setError("No se pudo guardar la calificación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="form-calificar" onSubmit={onSubmit}>
      <label>
        Nota (sobre {puntajeMaximo})
        <input
          type="number"
          step="0.1"
          min="0"
          max={puntajeMaximo}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          required
        />
      </label>
      <label>
        Observaciones
        <textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={enviando}>
        {enviando ? "Guardando..." : "Guardar calificación"}
      </button>
    </form>
  );
}

export default function ActividadEntregas() {
  const { id } = useParams();
  const [actividad, setActividad] = useState(null);
  const [entregas, setEntregas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getActividadProfesor(id), getEntregasActividad(id)])
      .then(([act, ents]) => {
        setActividad(act);
        setEntregas(ents);
      })
      .catch(() => setError("No se pudo cargar la actividad."));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!actividad || !entregas) return <p className="cargando">Cargando...</p>;

  const mapaPreguntas = Object.fromEntries(actividad.preguntas.map((p) => [p.id, p.enunciado]));

  const actualizarEntrega = (entregaActualizada) => {
    setEntregas(entregas.map((e) => (e.id === entregaActualizada.id ? entregaActualizada : e)));
  };

  return (
    <div className="contenedor">
      <Link className="volver" to="/profesor">
        ← Volver al inicio
      </Link>
      <h1>{actividad.titulo}</h1>
      <p>{actividad.descripcion}</p>

      {entregas.length === 0 ? (
        <p className="placeholder">Aún no hay entregas para esta actividad.</p>
      ) : (
        entregas.map((entrega) => (
          <section key={entrega.id}>
            <div className="tarjeta-laboratorio-header">
              <h3>
                {entrega.estudiante.usuario.first_name} {entrega.estudiante.usuario.last_name}
              </h3>
              <EstadoBadge estado={entrega.estado} />
            </div>

            {entrega.archivo && (
              <p>
                Archivo:{" "}
                <a href={`${MEDIA_BASE_URL}${entrega.archivo}`} target="_blank" rel="noreferrer">
                  ver archivo
                </a>
              </p>
            )}

            {entrega.respuestas.length > 0 && (
              <ul className="lista-respuestas">
                {entrega.respuestas.map((r) => (
                  <li key={r.pregunta}>
                    <strong>{mapaPreguntas[r.pregunta] || `Pregunta ${r.pregunta}`}:</strong>{" "}
                    {r.contenido}
                    {r.es_correcta !== null && (
                      <span className={r.es_correcta ? "mensaje-ok" : "mensaje-error"}>
                        {r.es_correcta ? " ✓ correcta" : " ✗ incorrecta"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <FormularioCalificar
              entrega={entrega}
              puntajeMaximo={actividad.puntaje_maximo}
              onCalificado={actualizarEntrega}
            />
          </section>
        ))
      )}
    </div>
  );
}
