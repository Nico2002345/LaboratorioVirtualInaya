import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const MEDIA_BASE_URL = API_URL.replace(/\/api\/?$/, "");

// Según el endpoint, el backend devuelve la ruta de un archivo como absoluta
// (vistas basadas en ListAPIView/ModelViewSet, que inyectan el request en el
// serializer) o relativa (vistas APIView manuales, sin ese contexto). Esta
// función normaliza ambos casos para construir siempre un enlace válido.
export const urlArchivo = (ruta) => {
  if (!ruta) return null;
  return ruta.startsWith("http") ? ruta : `${MEDIA_BASE_URL}${ruta}`;
};

const ACCESS_KEY = "lv_access";
const REFRESH_KEY = "lv_refresh";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthRoute = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !original._retry && !isAuthRoute && tokenStorage.getRefresh()) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios
            .post(`${API_URL}/auth/refresh/`, { refresh: tokenStorage.getRefresh() })
            .then((res) => {
              tokenStorage.setTokens(res.data.access);
              return res.data.access;
            })
            .finally(() => {
              refreshing = null;
            });
        }
        const newAccess = await refreshing;
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch {
        tokenStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
