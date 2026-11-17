import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const userService = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const availabilityService = {
  getAll: (params) => api.get('/availability', { params }),
  getByUserId: (userId) => api.get(`/availability/${userId}`),
  update: (userId, data) => api.patch(`/availability/${userId}`, data),
  getHistory: (params) => api.get('/availability/history', { params }),
};

export const teamService = {
  create: (data) => api.post('/teams', data),
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  update: (id, data) => api.patch(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  addMember: (teamId, userId) => api.post(`/teams/${teamId}/members`, { userId }),
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getTeamStats: () => api.get('/dashboard/team-stats'),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
