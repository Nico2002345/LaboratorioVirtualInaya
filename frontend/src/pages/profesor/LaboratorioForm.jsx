import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getGrados, getMisGradosProfesor } from "../../api/academics";
import { getModulosGrado } from "../../api/content";
import { actualizarLaboratorio, crearLaboratorio, getLaboratorioProfesor } from "../../api/labs";
import { isoADatetimeLocal, datetimeLocalAIso } from "../../utils/fecha";
import { PLANTILLAS_CONFIGURACION, TIPOS_LABORATORIO } from "./plantillasLaboratorio";
import { useAuth } from "../../auth/AuthContext";

const VACIO = {
  modulo_grado: "",
  titulo: "",
  descripcion: "",
  objetivo: "",
  instrucciones: "",
  tipo: "quiz",
  fecha_limite: "",
  activo: true,
};

export default function LaboratorioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === "admin";
  const esEdicion = Boolean(id);

  const [modulosGrado, setModulosGrado] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [configuracionTexto, setConfiguracionTexto] = useState(
    JSON.stringify(PLANTILLAS_CONFIGURACION.quiz, null, 2)
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const grados = await (esAdmin ? getGrados() : getMisGradosProfesor());
        const listas = await Promise.all(grados.map((g) => getModulosGrado(g.id)));
        setModulosGrado(listas.flat());

        if (esEdicion) {
          const lab = await getLaboratorioProfesor(id);
          setForm({
            modulo_grado: lab.modulo_grado,
            titulo: lab.titulo,
            descripcion: lab.descripcion,
            objetivo: lab.objetivo,
            instrucciones: lab.instrucciones,
            tipo: lab.tipo,
            fecha_limite: isoADatetimeLocal(lab.fecha_limite),
            activo: lab.activo,
          });
          setConfiguracionTexto(JSON.stringify(lab.configuracion, null, 2));
        }
      } catch {
        setError("No se pudo cargar la información necesaria.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id, esEdicion, esAdmin]);

  const onCambiar = (campo) => (e) => {
    const valor = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [campo]: valor });
  };

  const onCargarPlantilla = () => {
    setConfiguracionTexto(JSON.stringify(PLANTILLAS_CONFIGURACION[form.tipo] ?? {}, null, 2));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let configuracion;
    try {
      configuracion = JSON.parse(configuracionTexto);
    } catch {
      setError("La configuración no es un JSON válido.");
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        ...form,
        modulo_grado: Number(form.modulo_grado),
        fecha_limite: datetimeLocalAIso(form.fecha_limite),
        configuracion,
      };
      if (esEdicion) {
        await actualizarLaboratorio(id, payload);
      } else {
        await crearLaboratorio(payload);
      }
      navigate(esAdmin ? "/admin/laboratorios" : "/profesor/laboratorios");
    } catch {
      setError("No se pudo guardar el laboratorio. Verifica los datos.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p className="cargando">Cargando...</p>;

  return (
    <div className="contenedor">
      <Link className="volver" to={esAdmin ? "/admin/laboratorios" : "/profesor/laboratorios"}>
        ← Volver a laboratorios
      </Link>
      <h1>{esEdicion ? "Editar laboratorio" : "Nuevo laboratorio"}</h1>

      <form className="form-gestion" onSubmit={onSubmit}>
        <label>
          Módulo y grado
          <select value={form.modulo_grado} onChange={onCambiar("modulo_grado")} required>
            <option value="" disabled>
              Selecciona módulo y grado
            </option>
            {modulosGrado.map((mg) => (
              <option key={mg.id} value={mg.id}>
                {mg.grado.nombre} — {mg.modulo.nombre}
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
          Objetivo
          <textarea rows={2} value={form.objetivo} onChange={onCambiar("objetivo")} />
        </label>

        <label>
          Instrucciones
          <textarea rows={2} value={form.instrucciones} onChange={onCambiar("instrucciones")} />
        </label>

        <label>
          Tipo de laboratorio
          <select value={form.tipo} onChange={onCambiar("tipo")}>
            {TIPOS_LABORATORIO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fecha de entrega
          <input type="datetime-local" value={form.fecha_limite} onChange={onCambiar("fecha_limite")} />
        </label>

        <label className="campo-checkbox">
          <input type="checkbox" checked={form.activo} onChange={onCambiar("activo")} />
          Laboratorio activo (visible para los estudiantes)
        </label>

        <label>
          Configuración (JSON){" "}
          <button type="button" className="boton-plantilla" onClick={onCargarPlantilla}>
            Cargar plantilla para este tipo
          </button>
          <textarea
            className="textarea-json"
            rows={10}
            value={configuracionTexto}
            onChange={(e) => setConfiguracionTexto(e.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear laboratorio"}
        </button>
      </form>
    </div>
  );
}
