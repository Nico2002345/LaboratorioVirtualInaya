import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmarResetPassword } from "../api/auth";
import FondoRobots from "../components/FondoRobots";

export default function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const enlaceInvalido = !uid || !token;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (passwordNueva !== confirmacion) {
      setError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      await confirmarResetPassword(uid, token, passwordNueva);
      setExito(true);
    } catch (err) {
      const detalle = err.response?.data;
      setError(
        detalle?.password_nueva?.[0] ||
          detalle?.non_field_errors?.[0] ||
          detalle?.detail ||
          "No se pudo restablecer la contraseña. El enlace puede haber expirado."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pantalla-auth">
      <FondoRobots />

      <form className="tarjeta-auth" onSubmit={onSubmit}>
        <h1>Restablecer contraseña</h1>
        <p className="subtitulo">Laboratorio Virtual de Informática</p>

        {enlaceInvalido ? (
          <p className="error">
            Este enlace de recuperación no es válido. Solicita uno nuevo desde{" "}
            <Link to="/olvide-password">recuperar contraseña</Link>.
          </p>
        ) : exito ? (
          <p className="resultado-lab">
            Tu contraseña fue actualizada. Ya puedes <Link to="/login">iniciar sesión</Link>.
          </p>
        ) : (
          <>
            <label>
              Nueva contraseña
              <div className="campo-password">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="btn-mostrar-password"
                  onClick={() => setMostrarPassword((v) => !v)}
                  aria-label={mostrarPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                  tabIndex={-1}
                >
                  {mostrarPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            <label>
              Confirmar nueva contraseña
              <div className="campo-password">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="btn-mostrar-password"
                  onClick={() => setMostrarPassword((v) => !v)}
                  aria-label={mostrarPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                  tabIndex={-1}
                >
                  {mostrarPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Restablecer contraseña"}
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
