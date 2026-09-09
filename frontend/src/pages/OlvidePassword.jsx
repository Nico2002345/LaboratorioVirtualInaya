import { useState } from "react";
import { Link } from "react-router-dom";
import { solicitarResetPassword } from "../api/auth";
import FondoRobots from "../components/FondoRobots";

export default function OlvidePassword() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await solicitarResetPassword(email);
      setEnviado(true);
    } catch {
      setError("No se pudo procesar la solicitud. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pantalla-auth">
      <FondoRobots />

      <form className="tarjeta-auth" onSubmit={onSubmit}>
        <h1>Recuperar contraseña</h1>
        <p className="subtitulo">Laboratorio Virtual de Informática</p>

        {enviado ? (
          <p className="resultado-lab">
            Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.
            Revisa tu bandeja de entrada (y la carpeta de spam).
          </p>
        ) : (
          <>
            <label>
              Correo electrónico
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>
          </>
        )}

        <p className="ayuda">
          <Link to="/login">Volver a inicio de sesión</Link>
        </p>
      </form>
    </div>
  );
}
