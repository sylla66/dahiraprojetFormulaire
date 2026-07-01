import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  register: (data) => api.post("/auth/register", data),
  getLocalites: () => api.get("/auth/localites"),
};

export const admin = {
  getMembres: (params) => api.get("/admin/membres", { params }),
  createMembre: (data) => api.post("/admin/membres", data),
  updateMembre: (id, data) => api.put(`/admin/membres/${id}`, data),
  deleteMembre: (id) => api.delete(`/admin/membres/${id}`),
  getEvenements: () => api.get("/admin/evenements"),
  createEvenement: (data) => api.post("/admin/evenements", data),
  getEvenement: (id) => api.get(`/admin/evenements/${id}`),
  inscrire: (id, data) => api.post(`/admin/evenements/${id}/inscrire`, data),
  cotisation: (id, data) => api.post(`/admin/evenements/${id}/cotisation`, data),
  cloturer: (id) => api.post(`/admin/evenements/${id}/cloturer`),
  deleteCotisation: (id) => api.delete(`/admin/cotisations/${id}`),
  deleteInscription: (id) => api.delete(`/admin/inscriptions/${id}`),
  getHistorique: () => api.get("/admin/historique"),
};

export const forms = {
  getAll: () => api.get("/forms"),
  create: (data) => api.post("/forms", data),
  getOne: (id) => api.get(`/forms/${id}`),
  update: (id, data) => api.put(`/forms/${id}`, data),
  delete: (id) => api.delete(`/forms/${id}`),
};

export const dashboard = {
  getStats: () => api.get("/dashboard"),
  getEvenement: (id) => api.get(`/dashboard/evenement/${id}`),
  exportData: (evenementId, type) => api.get(`/dashboard/export/${evenementId}/${type}`),
};

export const superAdmin = {
  getDashboard: () => api.get("/super-admin/dashboard"),
  getUtilisateurs: () => api.get("/super-admin/utilisateurs"),
  toggleUser: (id) => api.post(`/super-admin/utilisateurs/${id}/toggle`),
  deleteUser: (id) => api.delete(`/super-admin/utilisateurs/${id}`),
  getCompile: (params) => api.get("/super-admin/compile", { params }),
  getLocalites: () => api.get("/super-admin/localites"),
  createLocalite: (data) => api.post("/super-admin/localites", data),
  deleteLocalite: (id) => api.delete(`/super-admin/localites/${id}`),
  getActivites: (params) => api.get("/super-admin/activites", { params }),
  exportGlobal: () => api.get("/super-admin/export"),
};

export default api;
