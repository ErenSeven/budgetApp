import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axiosInstance';  // Yeni axios instance dosyan
import {jwtDecode} from 'jwt-decode';

interface User {
  _id: string;
  email: string;
  paymentLimit: number;
}

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const hasRefreshToken = document.cookie.includes('refreshToken');

        if (token) {
            setAccessToken(token);
            axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            fetchUser(token); 
        } else if (hasRefreshToken) {
            refreshAccessToken(); 
        } else {
            logout();
        }
    }, []);

    const refreshAccessToken = async () => {
        try {
            const res = await axiosInstance.post('/users/token/refresh');
            const newAccessToken = res.data.accessToken;

            setAccessToken(newAccessToken);
            localStorage.setItem('accessToken', newAccessToken);
            axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;

            return newAccessToken;
        } catch (error) {
            logout();
            setLoading(false);
        }
    };


    const fetchUser = async (tokenParam?: string) => {
        let token = tokenParam || accessToken;

        // Eğer token yoksa direkt refresh dene
        if (!token) {
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
                logout();
                return;
            }
            token = refreshed;
        }

        // 🔐 Token süresi dolmuş mu kontrol et
        try {
            const decoded: JwtPayload = jwtDecode(token as string);
            const now = Date.now() / 1000;

            if (decoded.exp < now) {
                const refreshed = await refreshAccessToken();
                if (!refreshed) {
                    logout();
                    return;
                }
                token = refreshed;
            }
        } catch (err) {
            // Decode edilemeyen token varsa logout
            logout();
            return;
        }

        // 🟢 Token geçerli, istek yap
        try {
            axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            const res = await axiosInstance.get('/users/authenticate');
            setUser(res.data.user);
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    };



    const login = async (email: string, password: string) => {
        try {
        const res = await axiosInstance.post('/users/login', { email, password });
        const { accessToken, user } = res.data;

        setAccessToken(accessToken);
        setUser(user);
        localStorage.setItem('accessToken', accessToken);

        // Authorization header güncelle
        axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;

        router.push('/profile');
        } catch (error: any) {
        // Hata fırlatmayı dışarıya bırak
        throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/users/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('accessToken');
            delete axiosInstance.defaults.headers.common['Authorization'];
            setLoading(false);

            // Yalnızca eğer mevcut sayfa değilse yönlendirme yap
            if (router.pathname !== '/login') {
            router.push('/login');
            }
        }
    };

    return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
        {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
