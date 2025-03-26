export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        const { token } = response.data;
        localStorage.setItem('token', token);
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response?.data?.message || error.message);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token'); // Remove token on logout
    // ... rest of logout logic
}; 