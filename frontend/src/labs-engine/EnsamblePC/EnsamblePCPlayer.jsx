import { useState } from "react";
import { verificarEnsamble } from "../../api/labs";
import "./EnsamblePC.css";

function Pieza({ pieza, seleccionada, resultado, onClick, onDragStart }) {
  const estadoClase = resultado ? (resultado.correcto ? "pieza-correcta" : "pieza-incorrecta") : "";
  return (
    <div
      className={`pieza ${seleccionada ? "pieza-seleccionada" : ""} ${estadoClase}`}
      draggable
      onDragStart={(e) => onDragStart(e, pieza.id)}
      onClick={() => onClick(pieza.id)}
    >
      {pieza.nombre}
    </div>
  );
}

export default function EnsamblePCPlayer({ laboratorio, onProgresoActualizado }) {
  const { piezas, zonas } = laboratorio.configuracion;
  const [colocaciones, setColocaciones] = useState(
    laboratorio.mi_progreso.datos_estado?.ultimas_colocaciones || {}
  );
  const [seleccionada, setSeleccionada] = useState(null);
  const [resultado, setResultado] = useState(laboratorio.mi_progreso.datos_estado?.resultado || null);
  const [correcto, setCorrecto] = useState(laboratorio.mi_progreso.estado === "completado");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const piezasDisponibles = piezas.filter((p) => !(p.id in colocaciones));

  const colocarEnZona = (piezaId, zonaId) => {
    setColocaciones((prev) => {
      const next = {};
      Object.entries(prev).forEach(([pid, zid]) => {
        if (zid !== zonaId) next[pid] = zid;
      });
      next[piezaId] = zonaId;
      return next;
    });
    setSeleccionada(null);
  };

  const quitarPieza = (piezaId) => {
    setColocaciones((prev) => {
      const next = { ...prev };
      delete next[piezaId];
      return next;
    });
  };

  const onDragStart = (e, piezaId) => {
    e.dataTransfer.setData("text/plain", piezaId);
  };

  const onDropZona = (e, zonaId) => {
    e.preventDefault();
    const piezaId = e.dataTransfer.getData("text/plain");
    if (piezaId) colocarEnZona(piezaId, zonaId);
  };

  const onDropBandeja = (e) => {
    e.preventDefault();
    const piezaId = e.dataTransfer.getData("text/plain");
    if (piezaId) quitarPieza(piezaId);
  };

  const onClickPieza = (piezaId) => {
    setSeleccionada((actual) => (actual === piezaId ? null : piezaId));
  };

  const onClickZona = (zonaId) => {
    if (seleccionada) colocarEnZona(seleccionada, zonaId);
  };

  const onVerificar = async () => {
    setError("");
    setEnviando(true);
    try {
      const data = await verificarEnsamble(laboratorio.id, colocaciones);
      setResultado(data.resultado);
      setCorrecto(data.correcto);
      onProgresoActualizado(data.progreso);
    } catch {
      setError("No se pudo verificar el ensamble. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="simulador-ensamble">
      {correcto && <p className="banner-correcto">✓ ¡Ensamble correcto!</p>}

      <p className="instruccion-dnd">Arrastra cada pieza a su lugar, o haz clic en una pieza y luego en la zona.</p>

      <div className="tablero-ensamble">
        <div
          className="bandeja-piezas"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropBandeja}
        >
          <h4>Piezas disponibles</h4>
          {piezasDisponibles.length === 0 && <p className="bandeja-vacia">Todas las piezas están ubicadas.</p>}
          {piezasDisponibles.map((p) => (
            <Pieza
              key={p.id}
              pieza={p}
              seleccionada={seleccionada === p.id}
              resultado={resultado?.[p.id]}
              onClick={onClickPieza}
              onDragStart={onDragStart}
            />
          ))}
        </div>

        <div className="gabinete">
          <h4>Gabinete</h4>
          <div className="grid-zonas">
            {zonas.map((zona) => {
              const piezaId = Object.keys(colocaciones).find((pid) => colocaciones[pid] === zona.id);
              const pieza = piezaId && piezas.find((p) => p.id === piezaId);
              const estadoClase = resultado?.[piezaId]
                ? resultado[piezaId].correcto
                  ? "zona-correcta"
                  : "zona-incorrecta"
                : "";
              return (
                <div
                  key={zona.id}
                  className={`zona-drop ${estadoClase} ${pieza ? "zona-ocupada" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDropZona(e, zona.id)}
                  onClick={() => onClickZona(zona.id)}
                >
                  <span className="zona-nombre">{zona.nombre}</span>
                  {pieza && (
                    <div
                      className="pieza-colocada"
                      draggable
                      onDragStart={(e) => onDragStart(e, pieza.id)}
                    >
                      {pieza.nombre}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <button type="button" onClick={onVerificar} disabled={enviando}>
        {enviando ? "Verificando..." : "Verificar ensamble"}
      </button>
    </div>
  );
}
