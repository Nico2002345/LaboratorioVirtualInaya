import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cambiarPassword } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

const RUTA_POR_ROL = {
  admin: "/admin",
  profesor: "/profesor",
  estudiante: "/estudiante",
};

export default function CambiarPassword() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const base = RUTA_POR_ROL[usuario?.rol] || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito(false);

    if (passwordNueva !== confirmacion) {
      setError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      await cambiarPassword(passwordActual, passwordNueva);
      setExito(true);
      setPasswordActual("");
      setPasswordNueva("");
      setConfirmacion("");
    } catch (err) {
      const detalle = err.response?.data;
      setError(
        detalle?.password_actual?.[0] ||
          detalle?.password_nueva?.[0] ||
          detalle?.detail ||
          "No se pudo cambiar la contraseña."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contenedor">
      <Link className="volver" to={base}>
        ← Volver al inicio
      </Link>
      <h1>Cambiar contraseña</h1>

      <form className="form-gestion" onSubmit={onSubmit}>
        <label>
          Contraseña actual
          <input
            type="password"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            required
          />
        </label>

        <label>
          Nueva contraseña
          <input
            type="password"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            minLength={8}
            required
          />
        </label>

        <label>
          Confirmar nueva contraseña
          <input
            type="password"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            minLength={8}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}
        {exito && <p className="resultado-lab">Contraseña actualizada correctamente.</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </div>
  );
}
