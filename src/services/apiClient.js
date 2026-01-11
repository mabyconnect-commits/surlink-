import axios from 'axios';

// Base URLs from environment variables
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - logout user
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===========================
// AUTHENTICATION APIs
// ===========================

export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/auth/password', { oldPassword, newPassword });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/auth/settings', settings);
    return response.data;
  },
};

// ===========================
// SERVICES APIs
// ===========================

export const servicesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/services', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  getByCategory: async (category, params = {}) => {
    const response = await api.get(`/services/category/${category}`, { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/services', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  search: async (query, filters = {}) => {
    const response = await api.get('/services', {
      params: { search: query, ...filters },
    });
    return response.data;
  },
};

// ===========================
// BOOKINGS APIs
// ===========================

export const bookingsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  accept: async (id) => {
    const response = await api.put(`/bookings/${id}/accept`);
    return response.data;
  },

  start: async (id) => {
    const response = await api.put(`/bookings/${id}/start`);
    return response.data;
  },

  complete: async (id) => {
    const response = await api.put(`/bookings/${id}/complete`);
    return response.data;
  },

  cancel: async (id, reason) => {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },
};

// ===========================
// REVIEWS APIs
// ===========================

export const reviewsAPI = {
  create: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  getProviderReviews: async (providerId, params = {}) => {
    const response = await api.get(`/reviews/provider/${providerId}`, { params });
    return response.data;
  },

  getBookingReview: async (bookingId) => {
    const response = await api.get(`/reviews/booking/${bookingId}`);
    return response.data;
  },

  getMyReviews: async (params = {}) => {
    const response = await api.get('/reviews/my-reviews', { params });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

// ===========================
// USERS/PROVIDERS APIs
// ===========================

export const usersAPI = {
  getProviders: async (params = {}) => {
    const response = await api.get('/users/providers', { params });
    return response.data;
  },

  getProviderById: async (id) => {
    const response = await api.get(`/users/providers/${id}`);
    return response.data;
  },

  search: async (query, params = {}) => {
    const response = await api.get('/users/search', {
      params: { q: query, ...params },
    });
    return response.data;
  },
};

// ===========================
// WALLET APIs
// ===========================

export const walletAPI = {
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  getTransactions: async (params = {}) => {
    const response = await api.get('/wallet/transactions', { params });
    return response.data;
  },

  fundWallet: async (amount) => {
    const response = await api.post('/wallet/fund', { amount });
    return response.data;
  },

  withdraw: async (amount, bankAccountId) => {
    const response = await api.post('/wallet/withdraw', { amount, bank_account_id: bankAccountId });
    return response.data;
  },

  getWithdrawals: async (params = {}) => {
    const response = await api.get('/wallet/withdrawals', { params });
    return response.data;
  },

  addBankAccount: async (data) => {
    const response = await api.post('/wallet/bank-account', data);
    return response.data;
  },

  getBankAccounts: async () => {
    const response = await api.get('/wallet/bank-accounts');
    return response.data;
  },

  setDefaultBankAccount: async (id) => {
    const response = await api.put(`/wallet/bank-account/${id}/default`);
    return response.data;
  },

  deleteBankAccount: async (id) => {
    const response = await api.delete(`/wallet/bank-account/${id}`);
    return response.data;
  },
};

// ===========================
// MESSAGING APIs
// ===========================

export const messagesAPI = {
  getConversations: async (params = {}) => {
    const response = await api.get('/messages/conversations', { params });
    return response.data;
  },

  getOrCreateConversation: async (participantId, bookingId) => {
    const response = await api.post('/messages/conversation', {
      participant_id: participantId,
      booking_id: bookingId,
    });
    return response.data;
  },

  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(`/messages/${conversationId}`, { params });
    return response.data;
  },

  sendMessage: async (conversationId, text, attachments = []) => {
    const response = await api.post(`/messages/${conversationId}`, {
      text,
      attachments,
    });
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/messages/conversation/${conversationId}`);
    return response.data;
  },
};

// ===========================
// REFERRALS APIs
// ===========================

export const referralsAPI = {
  getStats: async () => {
    const response = await api.get('/referrals/stats');
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await api.get('/referrals/history', { params });
    return response.data;
  },

  getEarnings: async (params = {}) => {
    const response = await api.get('/referrals/earnings', { params });
    return response.data;
  },
};

// ===========================
// KYC APIs
// ===========================

export const kycAPI = {
  submit: async (data) => {
    const response = await api.post('/kyc/submit', data);
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/kyc/status');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/kyc/update', data);
    return response.data;
  },
};

// ===========================
// NOTIFICATIONS APIs
// ===========================

export const notificationsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
};

// ===========================
// FILE UPLOAD APIs
// ===========================

export const uploadAPI = {
  single: async (file, folder = 'uploads') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  multiple: async (files, folder = 'uploads') => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);

    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (fileUrl) => {
    const response = await api.delete('/upload', { data: { file_url: fileUrl } });
    return response.data;
  },

  getSignedUrl: async (filePath) => {
    const response = await api.get('/upload/signed-url', {
      params: { file_path: filePath },
    });
    return response.data;
  },
};

// Export default axios instance for custom requests
export default api;
