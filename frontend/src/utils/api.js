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
  sendOTPviaSMS: (data) => api.post("/auth/send-otp-sms", data),
  sendOTPDualChannel: (data) => api.post("/auth/send-otp-dual", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

export const votingAPI = {
  // Legacy
  getCandidates: () => api.get("/voting/candidates"),
  getCandidateById: (id) => api.get(`/voting/candidates/${id}`),
  vote: (candidateId) => api.post("/voting/vote", { candidateId }),
  getResults: () => api.get("/voting/results"),

  // Election-based
  voteInElection: (electionId, candidateProfileId) =>
    api.post(`/voting/election/${electionId}/vote`, { candidateProfileId }),
  hasVotedInElection: (electionId) =>
    api.get(`/voting/election/${electionId}/has-voted`),
  getElectionResults: (electionId) =>
    api.get(`/voting/election/${electionId}/results`),
  getUserVoteReceipt: (electionId) =>
    api.get(`/voting/election/${electionId}/receipt`),

  // Vote verification
  verifyReceipt: (data) => api.post("/voting/verify-receipt", data),
};

export const candidateProfileAPI = {
  submit: (data) => api.post("/candidate-profiles/submit", data),
  myProfile: () => api.get("/candidate-profiles/my-profile"),
  update: (profileId, data) =>
    api.put(`/candidate-profiles/${profileId}`, data),
  approved: (electionId) =>
    api.get(`/candidate-profiles/approved?electionId=${electionId}`),
  pending: () => api.get(`/candidate-profiles/pending`),
  approve: (profileId) => api.put(`/candidate-profiles/${profileId}/approve`),
  reject: (profileId, body) =>
    api.put(`/candidate-profiles/${profileId}/reject`, body),
};

export const electionAPI = {
  list: () => api.get("/elections"),
  get: (id) => api.get(`/elections/${id}`),
  candidates: (id) => api.get(`/elections/${id}/candidates`),
  results: (id) => api.get(`/elections/${id}/results`),
  create: (data) => api.post(`/elections`, data),
  start: (id) => api.put(`/elections/${id}/start`),
  stop: (id) => api.put(`/elections/${id}/stop`),
};

export const userAPI = {
  changePassword: (data) => api.post("/user/change-password", data),
  forgotPassword: (data) => api.post("/user/forgot-password", data),
  resetPassword: (data) => api.post("/user/reset-password", data),
  updateProfile: (data) => api.put("/user/profile", data),
  getProfile: () => api.get("/user/profile"),
  deleteAccount: () => api.delete("/user/account"),
};

export const adminAPI = {
  login: (data) => api.post("/admin/login", data),
  getUsers: () => api.get("/admin/users"),
  approveUser: (userId) => api.put(`/admin/users/${userId}/approve`),
  rejectUser: (userId, body) => api.put(`/admin/users/${userId}/reject`, body),
  assignElectionToUser: (userId, body) =>
    api.put(`/admin/users/${userId}/assign-election`, body),
  createAdmin: (data) => api.post(`/admin/create`, data),
  getLogs: () => api.get(`/admin/logs`),

  // Registration management endpoints
  getPendingRegistrations: () => api.get("/admin/pending-registrations"),
  approveRegistration: (userId) =>
    api.put(`/admin/registrations/${userId}/approve`),
  rejectRegistration: (userId, data) =>
    api.put(`/admin/registrations/${userId}/reject`, data),

  // Reports and monitoring endpoints
  getElectionReports: (electionId) =>
    api.get(`/admin/reports/election/${electionId}`),
  getSystemStatistics: () => api.get("/admin/reports/system-statistics"),
  getElectionActivityMonitoring: (electionId) =>
    api.get(`/admin/monitor/election/${electionId}`),
};
