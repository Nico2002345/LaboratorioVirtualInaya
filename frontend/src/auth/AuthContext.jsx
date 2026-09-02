import { createContext, useContext, useEffect, useState } from "react";
import { getMe, login as loginRequest } from "../api/auth";
import { tokenStorage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarSesion = async () => {
      if (tokenStorage.getAccess()) {
        try {
          const data = await getMe();
          setUsuario(data);
        } catch {
          tokenStorage.clear();
        }
      }
      setCargando(false);
    };
    cargarSesion();
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    tokenStorage.setTokens(data.access, data.refresh);
    setUsuario(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    tokenStorage.clear();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
