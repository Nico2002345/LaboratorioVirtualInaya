import { Link } from "react-router-dom";

export default function AdminHome() {
  return (
    <div className="contenedor">
      <h1>Panel de administración</h1>

      <section>
        <h2>Personas</h2>
        <div className="nav-panel">
          <Link className="boton-iniciar" to="/admin/estudiantes">
            Estudiantes
          </Link>
          <Link className="boton-iniciar" to="/admin/profesores">
            Profesores
          </Link>
        </div>
      </section>

      <section>
        <h2>Contenido académico</h2>
        <div className="nav-panel">
          <Link className="boton-iniciar" to="/admin/grados">
            Grados
          </Link>
          <Link className="boton-iniciar" to="/admin/modulos">
            Módulos
          </Link>
          <Link className="boton-iniciar" to="/admin/contenidos">
            Contenidos por grado
          </Link>
        </div>
      </section>

      <section>
        <h2>Laboratorios y actividades</h2>
        <div className="nav-panel">
          <Link className="boton-iniciar" to="/admin/laboratorios">
            Laboratorios
          </Link>
          <Link className="boton-iniciar" to="/admin/actividades">
            Actividades, entregas y calificaciones
          </Link>
        </div>
      </section>
    </div>
  );
}
