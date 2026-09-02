import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const RUTA_POR_ROL = {
  admin: "/admin",
  profesor: "/profesor",
  estudiante: "/estudiante",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const usuario = await login(email, password);
      navigate(RUTA_POR_ROL[usuario.rol] || "/");
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pantalla-auth">
      <form className="tarjeta-auth" onSubmit={onSubmit}>
        <h1>Laboratorio Virtual de Informática</h1>
        <p className="subtitulo">Inicia sesión</p>

        <label>
          Correo electrónico
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="ayuda">
          ¿Eres estudiante y no tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
}
