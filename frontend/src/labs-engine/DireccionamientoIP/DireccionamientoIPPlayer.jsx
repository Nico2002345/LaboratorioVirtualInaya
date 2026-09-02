import { useState } from "react";
import { verificarDireccionamientoIP } from "../../api/labs";
import "./DireccionamientoIP.css";

function CampoResultado({ label, id, tipo, value, onChange, opciones, resultado }) {
  const estadoClase = resultado ? (resultado.correcto ? "campo-correcto" : "campo-incorrecto") : "";

  return (
    <label className={`campo-ip ${estadoClase}`}>
      {label}
      {opciones ? (
        <select id={id} value={value} onChange={onChange} required>
          <option value="" disabled>
            Selecciona una máscara
          </option>
          {opciones.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} type="text" value={value} onChange={onChange} placeholder={tipo} required />
      )}
      {resultado && (
        <span className={resultado.correcto ? "mensaje-ok" : "mensaje-error"}>
          {resultado.correcto ? "✓ " : "✗ "}
          {resultado.mensaje}
        </span>
      )}
    </label>
  );
}

export default function DireccionamientoIPPlayer({ laboratorio, onProgresoActualizado }) {
  const intentoPrevio = laboratorio.mi_progreso.datos_estado?.ultimo_intento;
  const [ip, setIp] = useState(intentoPrevio?.ip || "");
  const [mascara, setMascara] = useState(intentoPrevio?.mascara || "");
  const [gateway, setGateway] = useState(intentoPrevio?.gateway || "");
  const [resultado, setResultado] = useState(laboratorio.mi_progreso.datos_estado?.resultado || null);
  const [correcto, setCorrecto] = useState(laboratorio.mi_progreso.estado === "completado");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const { red, prefijo, gateway_esperado: gatewayEsperado, mascaras_opciones: mascarasOpciones = [] } =
    laboratorio.configuracion;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const data = await verificarDireccionamientoIP(laboratorio.id, { ip, mascara, gateway });
      setResultado(data.resultado);
      setCorrecto(data.correcto);
      onProgresoActualizado(data.progreso);
    } catch {
      setError("No se pudo verificar la configuración. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="simulador-ip">
      <div className="escenario-ip">
        <p>
          <strong>Red asignada:</strong> {red}/{prefijo}
        </p>
        <p>
          <strong>Gateway de la red:</strong> {gatewayEsperado}
        </p>
      </div>

      {correcto && <p className="banner-correcto">✓ Configuración correcta.</p>}

      <form className="form-ip" onSubmit={onSubmit}>
        <CampoResultado
          label="Dirección IP"
          id="ip"
          tipo="ej: 192.168.10.10"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          resultado={resultado?.ip}
        />
        <CampoResultado
          label="Máscara de subred"
          id="mascara"
          value={mascara}
          onChange={(e) => setMascara(e.target.value)}
          opciones={mascarasOpciones}
          resultado={resultado?.mascara}
        />
        <CampoResultado
          label="Gateway"
          id="gateway"
          tipo="ej: 192.168.10.1"
          value={gateway}
          onChange={(e) => setGateway(e.target.value)}
          resultado={resultado?.gateway}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Verificando..." : "Verificar configuración"}
        </button>
      </form>
    </div>
  );
}
