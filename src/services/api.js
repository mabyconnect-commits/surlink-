import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const marketAPI = {
  getPrice: async (symbol) => {
    const response = await api.get(`/market/price/${symbol}`);
    return response.data;
  },
  getMarketData: async (symbol, interval = '1h', limit = 100) => {
    const response = await api.get(`/market/data/${symbol}`, {
      params: { interval, limit },
    });
    return response.data;
  },
};

export const signalsAPI = {
  getSignals: async (limit = 50) => {
    const response = await api.get('/signals', { params: { limit } });
    return response.data;
  },
  generateSignal: async (symbol) => {
    const response = await api.post(`/signals/generate/${symbol}`);
    return response.data;
  },
  scanAll: async () => {
    const response = await api.post('/signals/scan');
    return response.data;
  },
};

export const tradesAPI = {
  getTrades: async (limit = 50) => {
    const response = await api.get('/trades', { params: { limit } });
    return response.data;
  },
  executeTrade: async (signalId) => {
    const response = await api.post(`/trades/execute/${signalId}`);
    return response.data;
  },
};

export const settingsAPI = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  updateSettings: async (settings) => {
    const response = await api.put('/settings', settings);
    return response.data;
  },
};

export const performanceAPI = {
  getMetrics: async () => {
    const response = await api.get('/performance');
    return response.data;
  },
};

export const walletAPI = {
  getWallet: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },
  resetWallet: async (initialBalance = 10000) => {
    const response = await api.post('/wallet/reset', { initial_balance: initialBalance });
    return response.data;
  },
  getTransactions: async (limit = 50) => {
    const response = await api.get('/wallet/transactions', { params: { limit } });
    return response.data;
  },
};

export const tradeManagementAPI = {
  closeTrade: async (tradeId) => {
    const response = await api.post(`/trades/close/${tradeId}`);
    return response.data;
  },
  updateStopLoss: async (tradeId, newStopLoss) => {
    const response = await api.put(`/trades/${tradeId}/stop-loss`, { new_stop_loss: newStopLoss });
    return response.data;
  },
  updateTakeProfit: async (tradeId, newTakeProfit) => {
    const response = await api.put(`/trades/${tradeId}/take-profit`, { new_take_profit: newTakeProfit });
    return response.data;
  },
};

export default api;