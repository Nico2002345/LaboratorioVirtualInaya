import api from "./client";

export const login = (email, password) =>
  api.post("/auth/login/", { email, password }).then((res) => res.data);

export const getMe = () => api.get("/auth/me/").then((res) => res.data);

export const cambiarPassword = (passwordActual, passwordNueva) =>
  api
    .post("/auth/cambiar-password/", { password_actual: passwordActual, password_nueva: passwordNueva })
    .then((res) => res.data);
