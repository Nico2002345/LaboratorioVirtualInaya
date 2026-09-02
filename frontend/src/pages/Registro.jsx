import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getGrados, registrarEstudiante } from "../api/academics";
import { useAuth } from "../auth/AuthContext";
import FondoRobots from "../components/FondoRobots";

export default function Registro() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [grados, setGrados] = useState([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    grado: "",
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getGrados().then(setGrados).catch(() => setError("No se pudo cargar la lista de grados."));
  }, []);

  const onChange = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await registrarEstudiante({ ...form, grado: Number(form.grado) });
      const usuario = await login(form.email, form.password);
      navigate(usuario.rol === "estudiante" ? "/estudiante" : "/");
    } catch (err) {
      const detalle = err.response?.data;
      setError(
        detalle?.email?.[0] || detalle?.detail || "No se pudo completar el registro. Verifica los datos."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pantalla-auth">
      <FondoRobots />

      <form className="tarjeta-auth" onSubmit={onSubmit}>
        <h1>Registro de estudiante</h1>
        <p className="subtitulo">Laboratorio Virtual de Informática</p>

        <label>
          Nombres
          <input value={form.first_name} onChange={onChange("first_name")} required />
        </label>

        <label>
          Apellidos
          <input value={form.last_name} onChange={onChange("last_name")} required />
        </label>

        <label>
          Correo electrónico
          <input type="email" value={form.email} onChange={onChange("email")} required />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={onChange("password")}
            minLength={8}
            required
          />
        </label>

        <label>
          Grado
          <select value={form.grado} onChange={onChange("grado")} required>
            <option value="" disabled>
              Selecciona tu grado
            </option>
            {grados.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="ayuda">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
