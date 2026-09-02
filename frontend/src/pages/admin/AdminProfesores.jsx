import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { asignarGradosProfesor, crearProfesor, getGrados, getProfesores } from "../../api/academics";

const PROFESOR_VACIO = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  especialidad: "",
  grados: [],
};

function SelectorGrados({ grados, seleccionados, onCambiar }) {
  const alternar = (gradoId) => {
    const yaEsta = seleccionados.includes(gradoId);
    onCambiar(yaEsta ? seleccionados.filter((g) => g !== gradoId) : [...seleccionados, gradoId]);
  };

  return (
    <div className="selector-multiple">
      {grados.map((g) => (
        <label key={g.id} className="opcion-checkbox">
          <input
            type="checkbox"
            checked={seleccionados.includes(g.id)}
            onChange={() => alternar(g.id)}
          />
          {g.nombre}
        </label>
      ))}
    </div>
  );
}

function FilaProfesor({ profesor, grados, onActualizado }) {
  const [seleccionados, setSeleccionados] = useState(profesor.grados.map((g) => g.id));
  const [guardando, setGuardando] = useState(false);

  const onGuardar = async () => {
    setGuardando(true);
    try {
      const actualizado = await asignarGradosProfesor(profesor.id, seleccionados);
      onActualizado(actualizado);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <tr>
      <td>
        {profesor.usuario.first_name} {profesor.usuario.last_name}
      </td>
      <td>{profesor.usuario.email}</td>
      <td>{profesor.especialidad}</td>
      <td>
        <SelectorGrados grados={grados} seleccionados={seleccionados} onCambiar={setSeleccionados} />
      </td>
      <td>
        <button type="button" onClick={onGuardar} disabled={guardando}>
          Guardar grados
        </button>
      </td>
    </tr>
  );
}

export default function AdminProfesores() {
  const [profesores, setProfesores] = useState(null);
  const [grados, setGrados] = useState([]);
  const [nuevo, setNuevo] = useState(PROFESOR_VACIO);
  const [error, setError] = useState("");
  const [creando, setCreando] = useState(false);

  const cargar = () => {
    Promise.all([getProfesores(), getGrados()])
      .then(([p, g]) => {
        setProfesores(p);
        setGrados(g);
      })
      .catch(() => setError("No se pudo cargar la información."));
  };

  useEffect(cargar, []);

  const onCambiarNuevo = (campo) => (e) => setNuevo({ ...nuevo, [campo]: e.target.value });

  const onCrear = async (e) => {
    e.preventDefault();
    setError("");
    setCreando(true);
    try {
      await crearProfesor(nuevo);
      setNuevo(PROFESOR_VACIO);
      cargar();
    } catch {
      setError("No se pudo crear el profesor. Verifica que el correo no esté en uso.");
    } finally {
      setCreando(false);
    }
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="contenedor">
      <Link className="volver" to="/admin">
        ← Volver al inicio
      </Link>
      <h1>Profesores</h1>

      <form className="form-gestion" onSubmit={onCrear}>
        <h2>Crear profesor</h2>
        <label>
          Nombres
          <input value={nuevo.first_name} onChange={onCambiarNuevo("first_name")} required />
        </label>
        <label>
          Apellidos
          <input value={nuevo.last_name} onChange={onCambiarNuevo("last_name")} required />
        </label>
        <label>
          Correo electrónico
          <input type="email" value={nuevo.email} onChange={onCambiarNuevo("email")} required />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={nuevo.password}
            onChange={onCambiarNuevo("password")}
            minLength={8}
            required
          />
        </label>
        <label>
          Especialidad (opcional)
          <input value={nuevo.especialidad} onChange={onCambiarNuevo("especialidad")} />
        </label>
        <label>
          Grados asignados
          <SelectorGrados
            grados={grados}
            seleccionados={nuevo.grados}
            onCambiar={(grados) => setNuevo({ ...nuevo, grados })}
          />
        </label>
        <button type="submit" disabled={creando}>
          {creando ? "Creando..." : "Crear profesor"}
        </button>
      </form>

      <h2>Profesores existentes</h2>
      {!profesores ? (
        <p className="cargando">Cargando...</p>
      ) : profesores.length === 0 ? (
        <p className="placeholder">Aún no hay profesores registrados.</p>
      ) : (
        <table className="tabla-simple">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Especialidad</th>
              <th>Grados asignados</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {profesores.map((p) => (
              <FilaProfesor
                key={p.id}
                profesor={p}
                grados={grados}
                onActualizado={(actualizado) =>
                  setProfesores(profesores.map((x) => (x.id === actualizado.id ? actualizado : x)))
                }
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
