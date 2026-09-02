import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eliminarLaboratorio, getLaboratoriosProfesor } from "../../api/labs";
import { TIPOS_LABORATORIO } from "./plantillasLaboratorio";

const ETIQUETA_TIPO = Object.fromEntries(TIPOS_LABORATORIO.map((t) => [t.value, t.label]));

export default function ProfesorLaboratorios() {
  const [laboratorios, setLaboratorios] = useState(null);
  const [error, setError] = useState("");

  const cargar = () => {
    getLaboratoriosProfesor()
      .then(setLaboratorios)
      .catch(() => setError("No se pudieron cargar los laboratorios."));
  };

  useEffect(cargar, []);

  const onEliminar = async (lab) => {
    if (!window.confirm(`¿Eliminar el laboratorio "${lab.titulo}"?`)) return;
    try {
      await eliminarLaboratorio(lab.id);
      setLaboratorios(laboratorios.filter((l) => l.id !== lab.id));
    } catch {
      setError("No se pudo eliminar el laboratorio.");
    }
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="contenedor">
      <Link className="volver" to="/profesor">
        ← Volver al inicio
      </Link>
      <div className="encabezado-lista">
        <h1>Mis laboratorios</h1>
        <Link className="boton-iniciar" to="/profesor/laboratorios/nuevo">
          + Nuevo laboratorio
        </Link>
      </div>

      {!laboratorios ? (
        <p className="cargando">Cargando...</p>
      ) : laboratorios.length === 0 ? (
        <p className="placeholder">Aún no has creado laboratorios.</p>
      ) : (
        <table className="tabla-simple">
          <thead>
            <tr>
              <th>Título</th>
              <th>Grado</th>
              <th>Módulo</th>
              <th>Tipo</th>
              <th>Activo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {laboratorios.map((lab) => (
              <tr key={lab.id}>
                <td>{lab.titulo}</td>
                <td>{lab.modulo_grado_detalle.grado.nombre}</td>
                <td>{lab.modulo_grado_detalle.modulo.nombre}</td>
                <td>{ETIQUETA_TIPO[lab.tipo] || lab.tipo}</td>
                <td>{lab.activo ? "Sí" : "No"}</td>
                <td className="acciones-tabla">
                  <Link to={`/profesor/laboratorios/${lab.id}/editar`}>Editar</Link>
                  <button type="button" className="boton-eliminar" onClick={() => onEliminar(lab)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
