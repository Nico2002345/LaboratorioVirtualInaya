import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function AdminHome() {
  const { usuario } = useAuth();
  return (
    <div className="contenedor">
      <h1>¡Bienvenido/a, {usuario?.first_name}!</h1>
      <p className="subtitulo">Panel de administración</p>

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

      <section>
        <h2>Mi cuenta</h2>
        <div className="nav-panel">
          <Link className="boton-iniciar" to="/cambiar-password">
            Cambiar contraseña
          </Link>
        </div>
      </section>
    </div>
  );
}
