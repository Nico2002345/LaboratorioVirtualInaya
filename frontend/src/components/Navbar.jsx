import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ETIQUETAS_ROL = {
  admin: "Administrador",
  profesor: "Profesor",
  estudiante: "Estudiante",
};

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-marca">Laboratorio Virtual de Informática</div>
      <div className="navbar-usuario">
        <span>
          {usuario.first_name} {usuario.last_name} · {ETIQUETAS_ROL[usuario.rol]}
        </span>
        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </div>
    </header>
  );
}
