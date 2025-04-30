import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Grocery endpoints
export const getGroceries = async () => api.get('/groceries');
export const getGroceryReport = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }
  return api.get('/groceries/report', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
export const getGroceryById = async (id) => api.get(`/groceries/${id}`);
export const addGrocery = async (grocery) => api.post('/groceries', grocery);
export const updateGrocery = async (id, grocery) => api.put(`/groceries/${id}`, grocery);
export const deleteGrocery = async (id) => api.delete(`/groceries/${id}`);

// Inventory endpoints
export const getInventory = async () => api.get('/inventory');
export const getInventoryById = async (id) => api.get(`/inventory/${id}`);
export const addInventory = async (inventory) => api.post('/inventory', inventory);
export const updateInventory = async (id, inventory) => api.put(`/inventory/${id}`, inventory);
export const deleteInventory = async (id) => api.delete(`/inventory/${id}`);
