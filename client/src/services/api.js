import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response;
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            throw error;
        }
    },
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    },
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile')
};

export const tradingService = {
    buyStock: (stockId, quantity) => 
        api.post('/trading/buy', { stockId, quantity: parseInt(quantity) }),
    sellStock: (stockId, quantity) => 
        api.post('/trading/sell', { stockId, quantity: parseInt(quantity) })
};

export const stockService = {
    getStock: (stockId) => api.get(`/stocks/${stockId}`),
    getAllStocks: () => api.get('/stocks')
};

export const portfolioService = {
    getPortfolio: () => api.get('/portfolio')
};

export const transactionService = {
    getTransactions: () => api.get('/transactions')
};

export const leaderboardService = {
    getLeaderboard: () => api.get('/leaderboard')
}; 