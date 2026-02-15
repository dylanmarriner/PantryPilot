import axios from 'axios';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'
  : 'https://your-production-api.com/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  getAuthToken() {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.warn('Failed to get auth token from localStorage:', error);
      return null;
    }
  }

  setAuthToken(token) {
    try {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.warn('Failed to set auth token in localStorage:', error);
    }
  }

  clearAuthToken() {
    this.setAuthToken(null);
  }

  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  handleError(error) {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }

  // Sync-specific methods for offline queue management
  async syncRequest(endpoint, data = {}, maxRetries = 3) {
    let retries = 0;

    while (retries < maxRetries) {
      try {
        return await this.post(endpoint, data);
      } catch (error) {
        if (error.code === 'NETWORK_ERROR' && retries < maxRetries - 1) {
          retries++;
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          continue;
        }
        throw error;
      }
    }
  }

  async getSyncStatus() {
    return await this.get('/sync/status');
  }

  async initiateSync(syncData) {
    return await this.post('/sync/initiate', syncData);
  }

  async getPendingOperations(clientId) {
    return await this.get('/sync/pending', { clientId });
  }
}

export const apiService = new ApiService();

// Named export for sync service
export const api = apiService;

export const useApi = () => {
  return {
    get: apiService.get.bind(apiService),
    post: apiService.post.bind(apiService),
    put: apiService.put.bind(apiService),
    delete: apiService.delete.bind(apiService),
    setAuthToken: apiService.setAuthToken.bind(apiService),
    clearAuthToken: apiService.clearAuthToken.bind(apiService),
    syncRequest: apiService.syncRequest.bind(apiService),
    getSyncStatus: apiService.getSyncStatus.bind(apiService),
    initiateSync: apiService.initiateSync.bind(apiService),
    getPendingOperations: apiService.getPendingOperations.bind(apiService),
  };
};

export default apiService;
