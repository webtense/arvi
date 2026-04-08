/* eslint-disable react/prop-types */
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('arviUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const syncSession = async () => {
            const token = localStorage.getItem('arvi_token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await api.getCurrentUser();
                if (data?.user) {
                    setUser(data.user);
                    localStorage.setItem('arviUser', JSON.stringify(data.user));
                } else {
                    throw new Error('Sesion invalida');
                }
            } catch (error) {
                api.logout();
                setUser(null);
                localStorage.removeItem('arviUser');
            } finally {
                setLoading(false);
            }
        };

        syncSession();
    }, []);

    useEffect(() => {
        const handleAuthExpired = () => {
            setUser(null);
            setLoading(false);
        };

        window.addEventListener('arvi:auth-expired', handleAuthExpired);
        return () => window.removeEventListener('arvi:auth-expired', handleAuthExpired);
    }, []);

    const login = async (username, password) => {
        try {
            const data = await api.login(username, password);
            if (data.token && data.user) {
                const userData = { 
                    username: data.user.username, 
                    role: data.user.role,
                    id: data.user.id,
                    email: data.user.email
                };
                setUser(userData);
                localStorage.setItem('arviUser', JSON.stringify(userData));
                return { success: true, role: data.user.role };
            }
            return { success: false, error: 'Respuesta inválida del servidor' };
        } catch (error) {
            return { success: false, error: error.message || 'Credenciales incorrectas' };
        }
    };

    const logout = () => {
        api.logout();
        setUser(null);
        localStorage.removeItem('arviUser');
        localStorage.removeItem('arvi_token');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
