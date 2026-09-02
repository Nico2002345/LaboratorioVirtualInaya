import { Suspense, lazy, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MEDIA_BASE_URL } from "../../api/client";
import { entregarArchivo, getLaboratorio, iniciarLaboratorio, responderQuiz } from "../../api/labs";
import EstadoBadge from "../../components/EstadoBadge";
import DireccionamientoIPPlayer from "../../labs-engine/DireccionamientoIP/DireccionamientoIPPlayer";
import EnsamblePCPlayer from "../../labs-engine/EnsamblePC/EnsamblePCPlayer";

// CodeMirror pesa bastante: se carga solo cuando el estudiante abre un laboratorio de este tipo.
const EditorWebPlayer = lazy(() => import("../../labs-engine/EditorWeb/EditorWebPlayer"));
const SimuladorBDPlayer = lazy(() => import("../../labs-engine/SimuladorBD/SimuladorBDPlayer"));

function QuizPlayer({ laboratorio, onCompletado }) {
  const [respuestas, setRespuestas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const completado = laboratorio.mi_progreso.estado === "completado";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const progreso = await responderQuiz(laboratorio.id, respuestas);
      onCompletado(progreso);
    } catch {
      setError("No se pudo enviar el cuestionario. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (completado) {
    return (
      <div className="resultado-lab">
        <p>Ya completaste este cuestionario.</p>
        <p className="calificacion">Calificación: {laboratorio.mi_progreso.calificacion} / 5.0</p>
      </div>
    );
  }

  const preguntas = laboratorio.configuracion.preguntas || [];

  return (
    <form className="form-quiz" onSubmit={onSubmit}>
      {preguntas.map((p, idx) => (
        <fieldset key={p.id}>
          <legend>
            {idx + 1}. {p.enunciado}
          </legend>
          {p.opciones.map((opcion) => (
            <label key={opcion} className="opcion-quiz">
              <input
                type="radio"
                name={`pregunta-${p.id}`}
                value={opcion}
                required
                onChange={() => setRespuestas({ ...respuestas, [p.id]: opcion })}
              />
              {opcion}
            </label>
          ))}
        </fieldset>
      ))}
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar respuestas"}
      </button>
    </form>
  );
}

function EntregaArchivoPlayer({ laboratorio, onCompletado }) {
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const { estado, archivo_entrega } = laboratorio.mi_progreso;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    setError("");
    setEnviando(true);
    try {
      const progreso = await entregarArchivo(laboratorio.id, archivo);
      onCompletado(progreso);
    } catch {
      setError("No se pudo enviar el archivo. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      {estado === "completado" && archivo_entrega && (
        <p>
          Ya entregaste un archivo:{" "}
          <a href={`${MEDIA_BASE_URL}${archivo_entrega}`} target="_blank" rel="noreferrer">
            ver archivo
          </a>
        </p>
      )}
      <form className="form-entrega" onSubmit={onSubmit}>
        <label>
          {estado === "completado" ? "Reemplazar archivo" : "Selecciona tu archivo"}
          <input type="file" onChange={(e) => setArchivo(e.target.files[0])} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={enviando || !archivo}>
          {enviando ? "Enviando..." : "Entregar"}
        </button>
      </form>
    </div>
  );
}

export default function LaboratorioDetalle() {
  const { id } = useParams();
  const [laboratorio, setLaboratorio] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    getLaboratorio(id)
      .then(async (lab) => {
        if (lab.mi_progreso.estado === "no_iniciado") {
          await iniciarLaboratorio(id);
          lab = { ...lab, mi_progreso: { ...lab.mi_progreso, estado: "en_progreso" } };
        }
        if (activo) setLaboratorio(lab);
      })
      .catch(() => activo && setError("No se pudo cargar el laboratorio."));
    return () => {
      activo = false;
    };
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!laboratorio) return <p className="cargando">Cargando...</p>;

  const actualizarProgreso = (progreso) => {
    setLaboratorio({ ...laboratorio, mi_progreso: progreso });
  };

  return (
    <div className="contenedor">
      <Link className="volver" to="/estudiante">
        ← Volver al inicio
      </Link>
      <div className="detalle-lab-header">
        <h1>{laboratorio.titulo}</h1>
        <EstadoBadge estado={laboratorio.mi_progreso.estado} />
      </div>

      {laboratorio.descripcion && <p>{laboratorio.descripcion}</p>}
      {laboratorio.objetivo && (
        <p>
          <strong>Objetivo:</strong> {laboratorio.objetivo}
        </p>
      )}
      {laboratorio.instrucciones && (
        <p>
          <strong>Instrucciones:</strong> {laboratorio.instrucciones}
        </p>
      )}

      <section>
        {laboratorio.tipo === "quiz" && (
          <QuizPlayer laboratorio={laboratorio} onCompletado={actualizarProgreso} />
        )}
        {laboratorio.tipo === "entrega_archivo" && (
          <EntregaArchivoPlayer laboratorio={laboratorio} onCompletado={actualizarProgreso} />
        )}
        {laboratorio.tipo === "direccionamiento_ip" && (
          <DireccionamientoIPPlayer laboratorio={laboratorio} onProgresoActualizado={actualizarProgreso} />
        )}
        {laboratorio.tipo === "ensamble_pc" && (
          <EnsamblePCPlayer laboratorio={laboratorio} onProgresoActualizado={actualizarProgreso} />
        )}
        {laboratorio.tipo === "editor_web" && (
          <Suspense fallback={<p className="cargando">Cargando editor...</p>}>
            <EditorWebPlayer laboratorio={laboratorio} onProgresoActualizado={actualizarProgreso} />
          </Suspense>
        )}
        {laboratorio.tipo === "simulador_bd" && (
          <Suspense fallback={<p className="cargando">Cargando simulador...</p>}>
            <SimuladorBDPlayer laboratorio={laboratorio} onProgresoActualizado={actualizarProgreso} />
          </Suspense>
        )}
      </section>
    </div>
  );
}
