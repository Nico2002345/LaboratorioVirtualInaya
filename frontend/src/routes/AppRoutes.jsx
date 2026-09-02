import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import RequireAuth from "../auth/RequireAuth";
import { useAuth } from "../auth/AuthContext";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import AdminHome from "../pages/admin/AdminHome";
import ProfesorHome from "../pages/profesor/ProfesorHome";
import EstudianteHome from "../pages/estudiante/EstudianteHome";
import LaboratorioDetalle from "../pages/estudiante/LaboratorioDetalle";
import ActividadDetalle from "../pages/estudiante/ActividadDetalle";
import ActividadEntregas from "../pages/profesor/ActividadEntregas";
import ProfesorEstudiantes from "../pages/profesor/ProfesorEstudiantes";
import ProfesorLaboratorios from "../pages/profesor/ProfesorLaboratorios";
import LaboratorioForm from "../pages/profesor/LaboratorioForm";
import ProfesorActividades from "../pages/profesor/ProfesorActividades";
import ActividadForm from "../pages/profesor/ActividadForm";
import AdminGrados from "../pages/admin/AdminGrados";
import AdminProfesores from "../pages/admin/AdminProfesores";
import AdminModulos from "../pages/admin/AdminModulos";
import AdminContenidos from "../pages/admin/AdminContenidos";

const RUTA_POR_ROL = {
  admin: "/admin",
  profesor: "/profesor",
  estudiante: "/estudiante",
};

function Inicio() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <p className="cargando">Cargando...</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  return <Navigate to={RUTA_POR_ROL[usuario.rol]} replace />;
}

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/admin"
          element={
            <RequireAuth roles={["admin"]}>
              <AdminHome />
            </RequireAuth>
          }
        />
        <Route
          path="/profesor"
          element={
            <RequireAuth roles={["profesor"]}>
              <ProfesorHome />
            </RequireAuth>
          }
        />
        <Route
          path="/estudiante"
          element={
            <RequireAuth roles={["estudiante"]}>
              <EstudianteHome />
            </RequireAuth>
          }
        />
        <Route
          path="/estudiante/laboratorios/:id"
          element={
            <RequireAuth roles={["estudiante"]}>
              <LaboratorioDetalle />
            </RequireAuth>
          }
        />
        <Route
          path="/estudiante/actividades/:id"
          element={
            <RequireAuth roles={["estudiante"]}>
              <ActividadDetalle />
            </RequireAuth>
          }
        />
        <Route
          path="/profesor/estudiantes"
          element={
            <RequireAuth roles={["profesor", "admin"]}>
              <ProfesorEstudiantes />
            </RequireAuth>
          }
        />
        <Route
          path="/profesor/laboratorios"
          element={
            <RequireAuth roles={["profesor", "admin"]}>
              <ProfesorLaboratorios />
            </RequireAuth>
          }
        />
        <Route
          path="/profesor/laboratorios/nuevo"
          element={
            <RequireAuth roles={["profesor", "admin"]}>
              <LaboratorioForm />
            </RequireAuth>
          }
        />
        <Route
          path="/profesor/laboratorios/:id/editar"
          element={
            <RequireAuth roles={["profesor", "admin"]}>
              <LaboratorioForm />
            </RequireAuth>
          }
        />
        <Route
          path="/profesor/actividades"
          element={
            <RequireAuth roles={["profesor", "admin"]}>
              <ProfesorActividades />
            </RequireAuth>
          }
        />
        <Route
          path="/profesor/actividades/nueva"
          element={
            <RequireAuth roles={["profesor", "admin"]}>
              <ActividadForm />
            </RequireAuth>
          }
        />
        <Route
          path="/profesor/actividades/:id/editar"
          element={
            <RequireAuth roles={["profesor", "admin"]}>
              <ActividadForm />
            </RequireAuth>
          }
        />
        <Route
          path="/profesor/actividades/:id"
          element={
            <RequireAuth roles={["profesor", "admin"]}>
              <ActividadEntregas />
            </RequireAuth>
          }
        />

        {/* El admin reutiliza los mismos componentes de gestión que el profesor, con alcance
            a todos los grados en vez de solo los asignados (ver branching por rol en cada página). */}
        <Route
          path="/admin/estudiantes"
          element={
            <RequireAuth roles={["admin"]}>
              <ProfesorEstudiantes />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/profesores"
          element={
            <RequireAuth roles={["admin"]}>
              <AdminProfesores />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/grados"
          element={
            <RequireAuth roles={["admin"]}>
              <AdminGrados />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/modulos"
          element={
            <RequireAuth roles={["admin"]}>
              <AdminModulos />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/contenidos"
          element={
            <RequireAuth roles={["admin"]}>
              <AdminContenidos />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/laboratorios"
          element={
            <RequireAuth roles={["admin"]}>
              <ProfesorLaboratorios />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/laboratorios/nuevo"
          element={
            <RequireAuth roles={["admin"]}>
              <LaboratorioForm />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/laboratorios/:id/editar"
          element={
            <RequireAuth roles={["admin"]}>
              <LaboratorioForm />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/actividades"
          element={
            <RequireAuth roles={["admin"]}>
              <ProfesorActividades />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/actividades/nueva"
          element={
            <RequireAuth roles={["admin"]}>
              <ActividadForm />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/actividades/:id/editar"
          element={
            <RequireAuth roles={["admin"]}>
              <ActividadForm />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/actividades/:id"
          element={
            <RequireAuth roles={["admin"]}>
              <ActividadEntregas />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}
