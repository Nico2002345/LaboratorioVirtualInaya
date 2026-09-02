import { useEffect, useState } from "react";
import { urlArchivo } from "../../api/client";
import { getMiPerfilEstudiante } from "../../api/academics";
import { getMisModulos } from "../../api/content";
import { getMisLaboratorios } from "../../api/labs";
import { getMisActividades } from "../../api/submissions";
import LaboratorioCard from "../../components/LaboratorioCard";
import ActividadCard from "../../components/ActividadCard";

export default function EstudianteHome() {
  const [perfil, setPerfil] = useState(null);
  const [modulos, setModulos] = useState(null);
  const [laboratorios, setLaboratorios] = useState(null);
  const [actividades, setActividades] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMiPerfilEstudiante(), getMisModulos(), getMisLaboratorios(), getMisActividades()])
      .then(([perfilData, modulosData, laboratoriosData, actividadesData]) => {
        setPerfil(perfilData);
        setModulos(modulosData);
        setLaboratorios(laboratoriosData);
        setActividades(actividadesData);
      })
      .catch(() => setError("No se pudo cargar tu información."));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!perfil || !modulos || !laboratorios || !actividades) return <p className="cargando">Cargando...</p>;

  return (
    <div className="contenedor">
      <h1>Inicio</h1>
      <p className="mi-grado">
        Mi grado: <strong>{perfil.grado.nombre}</strong>
      </p>

      <section>
        <h2>Mis módulos</h2>
        {modulos.length === 0 ? (
          <p className="placeholder">Aún no hay módulos publicados para tu grado.</p>
        ) : (
          <div className="grid-modulos">
            {modulos.map((mg) => (
              <article key={mg.id} className="tarjeta-modulo">
                <div className="tarjeta-modulo-titulo">
                  <span className="icono-modulo">{mg.modulo.icono}</span>
                  <h3>{mg.modulo.nombre}</h3>
                </div>
                {mg.modulo.descripcion && <p className="modulo-descripcion">{mg.modulo.descripcion}</p>}
                {mg.contenidos.length > 0 && (
                  <div className="lista-contenidos">
                    {mg.contenidos.map((c) => (
                      <details key={c.id} className="contenido-detalle">
                        <summary>{c.titulo}</summary>
                        {c.descripcion && <p className="contenido-descripcion">{c.descripcion}</p>}
                        {c.cuerpo && <p className="contenido-cuerpo">{c.cuerpo}</p>}
                        {c.materiales.length > 0 && (
                          <ul className="lista-materiales-estudiante">
                            {c.materiales.map((m) => (
                              <li key={m.id}>
                                <a
                                  href={m.enlace || urlArchivo(m.archivo)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  📎 {m.nombre}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </details>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Mis laboratorios</h2>
        {laboratorios.length === 0 ? (
          <p className="placeholder">Aún no tienes laboratorios asignados.</p>
        ) : (
          <div className="grid-laboratorios">
            {laboratorios.map((lab) => (
              <LaboratorioCard key={lab.id} laboratorio={lab} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Mis actividades</h2>
        {actividades.length === 0 ? (
          <p className="placeholder">Aún no tienes actividades asignadas.</p>
        ) : (
          <div className="grid-laboratorios">
            {actividades.map((act) => (
              <ActividadCard key={act.id} actividad={act} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
