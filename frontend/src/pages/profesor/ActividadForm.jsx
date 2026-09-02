import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMisGradosProfesor } from "../../api/academics";
import {
  actualizarActividad,
  actualizarPregunta,
  crearActividad,
  crearPregunta,
  eliminarPregunta,
  getActividadProfesor,
} from "../../api/assignments";
import { getLaboratoriosProfesor } from "../../api/labs";
import { datetimeLocalAIso, isoADatetimeLocal } from "../../utils/fecha";

const VACIO = {
  grado: "",
  laboratorio: "",
  titulo: "",
  descripcion: "",
  instrucciones: "",
  fecha_entrega: "",
  puntaje_maximo: 5,
};

const PREGUNTA_VACIA = {
  enunciado: "",
  tipo: "abierta",
  opciones: "",
  respuesta_correcta: "",
  puntaje: 1,
};

function PreguntaRow({ pregunta, onGuardado, onEliminar }) {
  const [valores, setValores] = useState({
    enunciado: pregunta.enunciado,
    tipo: pregunta.tipo,
    opciones: (pregunta.opciones || []).join(", "),
    respuesta_correcta: pregunta.respuesta_correcta || "",
    puntaje: pregunta.puntaje,
  });
  const [guardando, setGuardando] = useState(false);

  const onGuardar = async () => {
    setGuardando(true);
    try {
      const opciones =
        valores.tipo === "opcion_multiple"
          ? valores.opciones
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : valores.tipo === "verdadero_falso"
            ? ["Verdadero", "Falso"]
            : [];
      const actualizada = await actualizarPregunta(pregunta.id, {
        actividad: pregunta.actividad,
        enunciado: valores.enunciado,
        tipo: valores.tipo,
        opciones,
        respuesta_correcta: valores.tipo === "abierta" ? "" : valores.respuesta_correcta,
        puntaje: valores.puntaje,
        orden: pregunta.orden,
      });
      onGuardado(actualizada);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pregunta-row">
      <textarea
        rows={2}
        value={valores.enunciado}
        onChange={(e) => setValores({ ...valores, enunciado: e.target.value })}
      />
      <select value={valores.tipo} onChange={(e) => setValores({ ...valores, tipo: e.target.value })}>
        <option value="abierta">Respuesta abierta</option>
        <option value="opcion_multiple">Opción múltiple</option>
        <option value="verdadero_falso">Verdadero o falso</option>
      </select>
      {valores.tipo === "opcion_multiple" && (
        <input
          placeholder="Opciones separadas por coma"
          value={valores.opciones}
          onChange={(e) => setValores({ ...valores, opciones: e.target.value })}
        />
      )}
      {valores.tipo !== "abierta" && (
        <input
          placeholder="Respuesta correcta"
          value={valores.respuesta_correcta}
          onChange={(e) => setValores({ ...valores, respuesta_correcta: e.target.value })}
        />
      )}
      <input
        type="number"
        step="0.5"
        className="input-puntaje"
        value={valores.puntaje}
        onChange={(e) => setValores({ ...valores, puntaje: e.target.value })}
      />
      <button type="button" onClick={onGuardar} disabled={guardando}>
        Guardar
      </button>
      <button type="button" className="boton-eliminar" onClick={() => onEliminar(pregunta.id)}>
        Eliminar
      </button>
    </div>
  );
}

export default function ActividadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [grados, setGrados] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [preguntas, setPreguntas] = useState([]);
  const [nuevaPregunta, setNuevaPregunta] = useState(PREGUNTA_VACIA);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [gradosData, laboratoriosData] = await Promise.all([
          getMisGradosProfesor(),
          getLaboratoriosProfesor(),
        ]);
        setGrados(gradosData);
        setLaboratorios(laboratoriosData);

        if (esEdicion) {
          const actividad = await getActividadProfesor(id);
          setForm({
            grado: actividad.grado,
            laboratorio: actividad.laboratorio || "",
            titulo: actividad.titulo,
            descripcion: actividad.descripcion,
            instrucciones: actividad.instrucciones,
            fecha_entrega: isoADatetimeLocal(actividad.fecha_entrega),
            puntaje_maximo: actividad.puntaje_maximo,
          });
          setPreguntas(actividad.preguntas);
        } else if (gradosData.length > 0) {
          setForm((f) => ({ ...f, grado: gradosData[0].id }));
        }
      } catch {
        setError("No se pudo cargar la información necesaria.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id, esEdicion]);

  const onCambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const laboratoriosDelGrado = laboratorios.filter(
    (lab) => String(lab.modulo_grado_detalle.grado.id) === String(form.grado)
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const payload = {
        grado: Number(form.grado),
        laboratorio: form.laboratorio ? Number(form.laboratorio) : null,
        titulo: form.titulo,
        descripcion: form.descripcion,
        instrucciones: form.instrucciones,
        fecha_entrega: datetimeLocalAIso(form.fecha_entrega),
        puntaje_maximo: form.puntaje_maximo,
      };
      if (esEdicion) {
        await actualizarActividad(id, payload);
        navigate("/profesor/actividades");
      } else {
        const creada = await crearActividad(payload);
        navigate(`/profesor/actividades/${creada.id}/editar`);
      }
    } catch {
      setError("No se pudo guardar la actividad. Verifica los datos.");
    } finally {
      setEnviando(false);
    }
  };

  const onAgregarPregunta = async (e) => {
    e.preventDefault();
    const opciones =
      nuevaPregunta.tipo === "opcion_multiple"
        ? nuevaPregunta.opciones
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : nuevaPregunta.tipo === "verdadero_falso"
          ? ["Verdadero", "Falso"]
          : [];
    const pregunta = await crearPregunta({
      actividad: Number(id),
      enunciado: nuevaPregunta.enunciado,
      tipo: nuevaPregunta.tipo,
      opciones,
      respuesta_correcta: nuevaPregunta.tipo === "abierta" ? "" : nuevaPregunta.respuesta_correcta,
      puntaje: nuevaPregunta.puntaje,
      orden: preguntas.length + 1,
    });
    setPreguntas([...preguntas, pregunta]);
    setNuevaPregunta(PREGUNTA_VACIA);
  };

  const onEliminarPregunta = async (preguntaId) => {
    await eliminarPregunta(preguntaId);
    setPreguntas(preguntas.filter((p) => p.id !== preguntaId));
  };

  if (cargando) return <p className="cargando">Cargando...</p>;

  return (
    <div className="contenedor">
      <Link className="volver" to="/profesor/actividades">
        ← Volver a mis actividades
      </Link>
      <h1>{esEdicion ? "Editar actividad" : "Nueva actividad"}</h1>

      <form className="form-gestion" onSubmit={onSubmit}>
        <label>
          Grado
          <select value={form.grado} onChange={onCambiar("grado")} required>
            {grados.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Laboratorio relacionado (opcional)
          <select value={form.laboratorio} onChange={onCambiar("laboratorio")}>
            <option value="">Ninguno (actividad independiente)</option>
            {laboratoriosDelGrado.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.titulo}
              </option>
            ))}
          </select>
        </label>

        <label>
          Título
          <input value={form.titulo} onChange={onCambiar("titulo")} required />
        </label>

        <label>
          Descripción
          <textarea rows={2} value={form.descripcion} onChange={onCambiar("descripcion")} />
        </label>

        <label>
          Instrucciones
          <textarea rows={2} value={form.instrucciones} onChange={onCambiar("instrucciones")} />
        </label>

        <label>
          Fecha de entrega
          <input type="datetime-local" value={form.fecha_entrega} onChange={onCambiar("fecha_entrega")} />
        </label>

        <label>
          Puntaje máximo
          <input
            type="number"
            step="0.5"
            value={form.puntaje_maximo}
            onChange={onCambiar("puntaje_maximo")}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear actividad"}
        </button>
      </form>

      {esEdicion && (
        <section>
          <h2>Preguntas</h2>
          {preguntas.length === 0 && <p className="placeholder">Aún no has agregado preguntas.</p>}
          {preguntas.map((p) => (
            <PreguntaRow
              key={p.id}
              pregunta={p}
              onGuardado={(actualizada) =>
                setPreguntas(preguntas.map((x) => (x.id === actualizada.id ? actualizada : x)))
              }
              onEliminar={onEliminarPregunta}
            />
          ))}

          <form className="pregunta-row pregunta-nueva" onSubmit={onAgregarPregunta}>
            <textarea
              rows={2}
              placeholder="Enunciado de la nueva pregunta"
              value={nuevaPregunta.enunciado}
              onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, enunciado: e.target.value })}
              required
            />
            <select
              value={nuevaPregunta.tipo}
              onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, tipo: e.target.value })}
            >
              <option value="abierta">Respuesta abierta</option>
              <option value="opcion_multiple">Opción múltiple</option>
              <option value="verdadero_falso">Verdadero o falso</option>
            </select>
            {nuevaPregunta.tipo === "opcion_multiple" && (
              <input
                placeholder="Opciones separadas por coma"
                value={nuevaPregunta.opciones}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, opciones: e.target.value })}
              />
            )}
            {nuevaPregunta.tipo !== "abierta" && (
              <input
                placeholder="Respuesta correcta"
                value={nuevaPregunta.respuesta_correcta}
                onChange={(e) =>
                  setNuevaPregunta({ ...nuevaPregunta, respuesta_correcta: e.target.value })
                }
              />
            )}
            <input
              type="number"
              step="0.5"
              className="input-puntaje"
              value={nuevaPregunta.puntaje}
              onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, puntaje: e.target.value })}
            />
            <button type="submit">+ Agregar pregunta</button>
          </form>
        </section>
      )}
    </div>
  );
}
