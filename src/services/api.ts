import axios from 'axios';
import type { 
  LoginRequest, 
  LoginResponse, 
  DashboardStats, 
  User,
  CreateUserRequest,
  AssignCustomerRequest,
  Customer,
  ApiResponse 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.flexisb.com';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
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

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/Auth/login', credentials);
    return response.data;
  },

  verify: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/Auth/verify');
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/api/Dashboard/stats');
    return response.data;
  },
};

// User Management API
export const userApi = {
  list: async (): Promise<ApiResponse<{ users: User[] }>> => {
    const response = await api.get<ApiResponse<{ users: User[] }>>('/api/User/list');
    return response.data;
  },

  create: async (userData: CreateUserRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/api/User/create', userData);
    return response.data;
  },

  updateRole: async (userId: number, role: string): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/api/User/update-role', { userId, role });
    return response.data;
  },

  assignCustomer: async (data: AssignCustomerRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/api/User/assign-customer', data);
    return response.data;
  },

  getAssignedCustomers: async (editorId: number): Promise<ApiResponse<{ customers: Customer[] }>> => {
    const response = await api.get<ApiResponse<{ customers: Customer[] }>>(`/api/User/assigned-customers/${editorId}`);
    return response.data;
  },
};

// Shipment API
export const shipmentApi = {
  query: async (orderCodes: string[]): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/api/Shipment/query', { orderCodes });
    return response.data;
  },

  list: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/Shipment/list');
    return response.data;
  },
};

// Customer API
export const customerApi = {
  list: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/Customer/list');
    return response.data;
  },

  detail: async (customerId: number): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>(`/api/Customer/detail/${customerId}`);
    return response.data;
  },

  stats: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/Customer/stats');
    return response.data;
  },
};

// PDF API
export const pdfApi = {
  download: async (orderCode: string, flexCode?: string): Promise<Blob> => {
    const url = flexCode 
      ? `/api/Pdf/download/${orderCode}?flexCode=${encodeURIComponent(flexCode)}`
      : `/api/Pdf/download/${orderCode}`;
    
    const response = await axios.get(API_URL + url, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    return response.data;
  },
};

export default api;
