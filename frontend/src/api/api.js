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

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }
  return {
    Authorization: `Bearer ${token}`
  };
};

// Family Invitation endpoints
export const createFamilyInvitation = async (data) => {
  try {
    console.log('Sending invitation data:', data);
    const response = await api.post('/family-invitations', data, { headers: getAuthHeaders() });
    console.log('Invitation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Full error details:', error.response?.data);
    throw error;
  }
};

export const getFamilyInvitations = async () => {
  const response = await api.get('/family-invitations', { headers: getAuthHeaders() });
  return response.data;
};

export const acceptFamilyInvitation = async (invitationId) => {
  const response = await api.put(`/family-invitations/${invitationId}/accept`, {}, { headers: getAuthHeaders() });
  return response.data;
};

export const rejectFamilyInvitation = async (invitationId) => {
  const response = await api.put(`/family-invitations/${invitationId}/reject`, {}, { headers: getAuthHeaders() });
  return response.data;
};

// Grocery endpoints
export const getGroceries = async () => api.get('/groceries', { headers: getAuthHeaders() });
export const getGroceryReport = async () => api.get('/groceries/report', { headers: getAuthHeaders() });
export const getGroceryById = async (id) => api.get(`/groceries/${id}`, { headers: getAuthHeaders() });
export const addGrocery = async (grocery) => api.post('/groceries', grocery, { headers: getAuthHeaders() });
export const updateGrocery = async (id, grocery) => api.put(`/groceries/${id}`, grocery, { headers: getAuthHeaders() });
export const deleteGrocery = async (id) => api.delete(`/groceries/${id}`, { headers: getAuthHeaders() });

// Inventory endpoints
export const getInventory = async () => api.get('/inventory', { headers: getAuthHeaders() });
export const getInventoryById = async (id) => api.get(`/inventory/${id}`, { headers: getAuthHeaders() });
export const addInventory = async (inventory) => api.post('/inventory', inventory, { headers: getAuthHeaders() });
export const updateInventory = async (id, inventory) => api.put(`/inventory/${id}`, inventory, { headers: getAuthHeaders() });
export const deleteInventory = async (id) => api.delete(`/inventory/${id}`, { headers: getAuthHeaders() });
export const getInventoryReport = async () => api.get('/inventory/report', { headers: getAuthHeaders() });
