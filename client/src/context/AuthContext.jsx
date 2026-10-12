import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const response = await authService.getProfile();
            if (response.data) {
                setUser(response.data);
            } else {
                // Clear invalid token
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Clear invalid token
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Check auth status when component mounts
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                return response.data;
            }
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const loginDemo = () => {
        const demoUser = {
            _id: 'demo-user-123',
            username: 'demotrader',
            email: 'demotrader@stockerx.com',
            virtualBalance: 100000,
            portfolio: []
        };
        localStorage.setItem('token', 'demo-token');
        setUser(demoUser);
        return demoUser;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            register,
            loginDemo,
            checkAuthStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 