import { useEffect, useState } from "react";
import { getMiPerfilEstudiante } from "../../api/academics";
import { getMisModulos } from "../../api/content";

export default function EstudianteHome() {
  const [perfil, setPerfil] = useState(null);
  const [modulos, setModulos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMiPerfilEstudiante(), getMisModulos()])
      .then(([perfilData, modulosData]) => {
        setPerfil(perfilData);
        setModulos(modulosData);
      })
      .catch(() => setError("No se pudo cargar tu información."));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!perfil || !modulos) return <p className="cargando">Cargando...</p>;

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
                  <ul className="lista-contenidos">
                    {mg.contenidos.map((c) => (
                      <li key={c.id}>{c.titulo}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Mis laboratorios</h2>
        <p className="placeholder">
          Aquí aparecerán tus laboratorios asignados, cada uno con nombre, descripción, objetivo,
          instrucciones, estado, fecha de entrega y el botón "Iniciar laboratorio" (próximo módulo a
          construir).
        </p>
      </section>
    </div>
  );
}
