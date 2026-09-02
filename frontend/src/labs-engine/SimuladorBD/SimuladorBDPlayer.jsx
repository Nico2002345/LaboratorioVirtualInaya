import { useState } from "react";
import { verificarBD } from "../../api/labs";
import "./SimuladorBD.css";

const TIPOS_CAMPO = ["texto", "entero", "decimal", "fecha", "booleano"];

const generarId = (prefijo) => `${prefijo}-${Math.random().toString(36).slice(2, 8)}`;

function TablaCard({ tabla, onCambiar, onEliminar }) {
  const cambiarNombre = (nombre) => onCambiar({ ...tabla, nombre });

  const agregarCampo = () => {
    const campo = { id: generarId("c"), nombre: "campo", tipo: "texto" };
    onCambiar({ ...tabla, campos: [...tabla.campos, campo] });
  };

  const cambiarCampo = (campoId, patch) => {
    onCambiar({
      ...tabla,
      campos: tabla.campos.map((c) => (c.id === campoId ? { ...c, ...patch } : c)),
    });
  };

  const eliminarCampo = (campoId) => {
    onCambiar({
      ...tabla,
      campos: tabla.campos.filter((c) => c.id !== campoId),
      registros: tabla.registros.map((r) => {
        const valores = { ...r.valores };
        delete valores[campoId];
        return { ...r, valores };
      }),
    });
  };

  const agregarRegistro = () => {
    const registro = { id: generarId("r"), valores: {} };
    onCambiar({ ...tabla, registros: [...tabla.registros, registro] });
  };

  const cambiarValor = (registroId, campoId, valor) => {
    onCambiar({
      ...tabla,
      registros: tabla.registros.map((r) =>
        r.id === registroId ? { ...r, valores: { ...r.valores, [campoId]: valor } } : r
      ),
    });
  };

  const eliminarRegistro = (registroId) => {
    onCambiar({ ...tabla, registros: tabla.registros.filter((r) => r.id !== registroId) });
  };

  return (
    <div className="tabla-card">
      <div className="tabla-card-header">
        <input
          className="tabla-nombre"
          value={tabla.nombre}
          onChange={(e) => cambiarNombre(e.target.value)}
        />
        <button type="button" className="boton-eliminar" onClick={onEliminar}>
          Eliminar tabla
        </button>
      </div>

      <table className="tabla-datos">
        <thead>
          <tr>
            {tabla.campos.map((campo) => (
              <th key={campo.id}>
                <input
                  className="campo-nombre"
                  value={campo.nombre}
                  onChange={(e) => cambiarCampo(campo.id, { nombre: e.target.value })}
                />
                <select
                  value={campo.tipo}
                  onChange={(e) => cambiarCampo(campo.id, { tipo: e.target.value })}
                >
                  {TIPOS_CAMPO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button type="button" className="boton-x" onClick={() => eliminarCampo(campo.id)}>
                  ×
                </button>
              </th>
            ))}
            <th>
              <button type="button" onClick={agregarCampo}>
                + Campo
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {tabla.registros.map((registro) => (
            <tr key={registro.id}>
              {tabla.campos.map((campo) => (
                <td key={campo.id}>
                  <input
                    value={registro.valores?.[campo.id] || ""}
                    onChange={(e) => cambiarValor(registro.id, campo.id, e.target.value)}
                  />
                </td>
              ))}
              <td>
                <button type="button" className="boton-x" onClick={() => eliminarRegistro(registro.id)}>
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" onClick={agregarRegistro} disabled={tabla.campos.length === 0}>
        + Registro
      </button>
    </div>
  );
}

function RelacionRow({ relacion, tablas, onCambiar, onEliminar }) {
  const tablaOrigen = tablas.find((t) => t.id === relacion.tabla_origen);
  const tablaDestino = tablas.find((t) => t.id === relacion.tabla_destino);

  return (
    <div className="relacion-row">
      <select
        value={relacion.tabla_origen}
        onChange={(e) => onCambiar({ ...relacion, tabla_origen: e.target.value, campo_origen: "" })}
      >
        <option value="">Tabla origen</option>
        {tablas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre}
          </option>
        ))}
      </select>
      <select
        value={relacion.campo_origen}
        onChange={(e) => onCambiar({ ...relacion, campo_origen: e.target.value })}
        disabled={!tablaOrigen}
      >
        <option value="">Campo</option>
        {tablaOrigen?.campos.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
      <span className="flecha-relacion">→</span>
      <select
        value={relacion.tabla_destino}
        onChange={(e) => onCambiar({ ...relacion, tabla_destino: e.target.value, campo_destino: "" })}
      >
        <option value="">Tabla destino</option>
        {tablas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre}
          </option>
        ))}
      </select>
      <select
        value={relacion.campo_destino}
        onChange={(e) => onCambiar({ ...relacion, campo_destino: e.target.value })}
        disabled={!tablaDestino}
      >
        <option value="">Campo</option>
        {tablaDestino?.campos.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
      <button type="button" className="boton-x" onClick={onEliminar}>
        ×
      </button>
    </div>
  );
}

export default function SimuladorBDPlayer({ laboratorio, onProgresoActualizado }) {
  const modeloPrevio = laboratorio.mi_progreso.datos_estado?.modelo;
  const [modelo, setModelo] = useState(modeloPrevio || { tablas: [], relaciones: [] });
  const [resultado, setResultado] = useState(laboratorio.mi_progreso.datos_estado?.resultado || null);
  const [correcto, setCorrecto] = useState(laboratorio.mi_progreso.estado === "completado");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const agregarTabla = () => {
    const tabla = { id: generarId("t"), nombre: "NuevaTabla", campos: [], registros: [] };
    setModelo({ ...modelo, tablas: [...modelo.tablas, tabla] });
  };

  const cambiarTabla = (tablaId, tablaActualizada) => {
    setModelo({
      ...modelo,
      tablas: modelo.tablas.map((t) => (t.id === tablaId ? tablaActualizada : t)),
    });
  };

  const eliminarTabla = (tablaId) => {
    setModelo({
      tablas: modelo.tablas.filter((t) => t.id !== tablaId),
      relaciones: modelo.relaciones.filter(
        (r) => r.tabla_origen !== tablaId && r.tabla_destino !== tablaId
      ),
    });
  };

  const agregarRelacion = () => {
    const relacion = {
      id: generarId("rel"),
      tabla_origen: "",
      campo_origen: "",
      tabla_destino: "",
      campo_destino: "",
    };
    setModelo({ ...modelo, relaciones: [...modelo.relaciones, relacion] });
  };

  const cambiarRelacion = (relacionId, relacionActualizada) => {
    setModelo({
      ...modelo,
      relaciones: modelo.relaciones.map((r) => (r.id === relacionId ? relacionActualizada : r)),
    });
  };

  const eliminarRelacion = (relacionId) => {
    setModelo({ ...modelo, relaciones: modelo.relaciones.filter((r) => r.id !== relacionId) });
  };

  const onVerificar = async () => {
    setError("");
    setEnviando(true);
    try {
      const data = await verificarBD(laboratorio.id, modelo);
      setResultado(data.resultado);
      setCorrecto(data.correcto);
      onProgresoActualizado(data.progreso);
    } catch {
      setError("No se pudo guardar tu modelo. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="simulador-bd">
      {correcto && <p className="banner-correcto">✓ ¡Modelo completo!</p>}

      {laboratorio.configuracion.consigna && (
        <p className="consigna-bd">{laboratorio.configuracion.consigna}</p>
      )}

      <div className="tablas-bd">
        {modelo.tablas.map((tabla) => (
          <TablaCard
            key={tabla.id}
            tabla={tabla}
            onCambiar={(t) => cambiarTabla(tabla.id, t)}
            onEliminar={() => eliminarTabla(tabla.id)}
          />
        ))}
        <button type="button" onClick={agregarTabla} className="boton-agregar-tabla">
          + Agregar tabla
        </button>
      </div>

      <div className="relaciones-bd">
        <h4>Relaciones</h4>
        {modelo.relaciones.map((relacion) => (
          <RelacionRow
            key={relacion.id}
            relacion={relacion}
            tablas={modelo.tablas}
            onCambiar={(r) => cambiarRelacion(relacion.id, r)}
            onEliminar={() => eliminarRelacion(relacion.id)}
          />
        ))}
        <button type="button" onClick={agregarRelacion} disabled={modelo.tablas.length < 2}>
          + Agregar relación
        </button>
      </div>

      {resultado && resultado.length > 0 && (
        <ul className="lista-criterios">
          {resultado.map((c, idx) => (
            <li key={idx} className={c.correcto ? "criterio-ok" : "criterio-falta"}>
              {c.correcto ? "✓" : "✗"} {c.mensaje}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="error">{error}</p>}

      <button type="button" className="boton-guardar" onClick={onVerificar} disabled={enviando}>
        {enviando ? "Guardando..." : "Guardar y verificar"}
      </button>
    </div>
  );
}
