import { css as cssLang } from "@codemirror/lang-css";
import { html as htmlLang } from "@codemirror/lang-html";
import { javascript as jsLang } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useState } from "react";
import { verificarCodigo } from "../../api/labs";
import "./EditorWeb.css";

const PESTANAS = [
  { id: "html", label: "HTML", extension: htmlLang() },
  { id: "css", label: "CSS", extension: cssLang() },
  { id: "js", label: "JavaScript", extension: jsLang() },
];

function construirPreview(html, css, js) {
  return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;
}

export default function EditorWebPlayer({ laboratorio, onProgresoActualizado }) {
  const codigoPrevio = laboratorio.mi_progreso.datos_estado?.codigo;
  const { html_inicial, css_inicial, js_inicial } = laboratorio.configuracion;

  const [codigo, setCodigo] = useState({
    html: codigoPrevio?.html ?? html_inicial ?? "",
    css: codigoPrevio?.css ?? css_inicial ?? "",
    js: codigoPrevio?.js ?? js_inicial ?? "",
  });
  const [pestanaActiva, setPestanaActiva] = useState("html");
  const [preview, setPreview] = useState(() => construirPreview(codigo.html, codigo.css, codigo.js));
  const [resultado, setResultado] = useState(laboratorio.mi_progreso.datos_estado?.resultado || null);
  const [correcto, setCorrecto] = useState(laboratorio.mi_progreso.estado === "completado");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setPreview(construirPreview(codigo.html, codigo.css, codigo.js));
    }, 400);
    return () => clearTimeout(temporizador);
  }, [codigo]);

  const actualizarCodigo = (valor) => {
    setCodigo((prev) => ({ ...prev, [pestanaActiva]: valor }));
  };

  const onGuardarYVerificar = async () => {
    setError("");
    setEnviando(true);
    try {
      const data = await verificarCodigo(laboratorio.id, codigo);
      setResultado(data.resultado);
      setCorrecto(data.correcto);
      onProgresoActualizado(data.progreso);
    } catch {
      setError("No se pudo guardar tu código. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const pestana = PESTANAS.find((p) => p.id === pestanaActiva);

  return (
    <div className="editor-web">
      {correcto && <p className="banner-correcto">✓ ¡Laboratorio completado!</p>}

      <div className="editor-web-layout">
        <div className="editor-panel">
          <div className="tabs-editor">
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`tab-boton ${pestanaActiva === p.id ? "tab-activa" : ""}`}
                onClick={() => setPestanaActiva(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <CodeMirror
            value={codigo[pestanaActiva]}
            height="280px"
            extensions={[pestana.extension]}
            onChange={actualizarCodigo}
          />
        </div>

        <div className="preview-panel">
          <h4>Vista previa</h4>
          <iframe
            title="Vista previa"
            className="preview-frame"
            sandbox="allow-scripts"
            srcDoc={preview}
          />
        </div>
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

      <button type="button" className="boton-guardar" onClick={onGuardarYVerificar} disabled={enviando}>
        {enviando ? "Guardando..." : "Guardar y verificar"}
      </button>
    </div>
  );
}
