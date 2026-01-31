import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token (user/admin) to request headers
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("token");

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyOTP: (data) => api.post("/auth/verify-otp", data),
  resendOTP: (data) => api.post("/auth/resend-otp", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

export const votingAPI = {
  getCandidates: () => api.get("/voting/candidates"),
  getCandidateById: (id) => api.get(`/voting/candidates/${id}`),
  vote: (candidateId) => api.post("/voting/vote", { candidateId }),
  getResults: () => api.get("/voting/results"),
  createCandidate: (data) => api.post("/voting/candidates", data),
  deleteCandidate: (id) => api.delete(`/voting/candidates/${id}`),
};

export const adminAPI = {
  login: (data) => api.post("/admin/login", data),
  getUsers: () => api.get("/admin/users"),
};
