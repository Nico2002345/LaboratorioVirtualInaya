import { useEffect, useState } from "react";
import { getMiPerfilEstudiante } from "../../api/academics";

export default function EstudianteHome() {
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMiPerfilEstudiante()
      .then(setPerfil)
      .catch(() => setError("No se pudo cargar tu información."));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!perfil) return <p className="cargando">Cargando...</p>;

  return (
    <div className="contenedor">
      <h1>Inicio</h1>
      <p className="mi-grado">
        Mi grado: <strong>{perfil.grado.nombre}</strong>
      </p>

      <section>
        <h2>Mis módulos</h2>
        <p className="placeholder">
          Aquí aparecerán los módulos de {perfil.grado.nombre} (se cargarán cuando esté listo el módulo de
          contenidos).
        </p>
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
