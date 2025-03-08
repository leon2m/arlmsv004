import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

// Kullanıcı tipi
interface User {
  id: string;
  user_id?: string; // Geriye dönük uyumluluk için
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

// Kimlik doğrulama bağlamı tipi
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Kimlik doğrulama bağlamı oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Kimlik doğrulama sağlayıcısı
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sayfa yüklendiğinde kullanıcı oturumunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Supabase oturumunu kontrol et
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Oturum kontrolü hatası:', sessionError);
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (data.session) {
          // Kullanıcı bilgilerini al
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Kullanıcı bilgileri alınamadı:', userError);
            setUser(null);
            setLoading(false);
            return;
          }
          
          if (userData.user) {
            // Kullanıcı nesnesini oluştur
            const userObj: User = {
              id: userData.user.id,
              user_id: userData.user.id, // Geriye dönük uyumluluk için
              name: userData.user.user_metadata?.full_name || 'Kullanıcı',
              email: userData.user.email || '',
              role: userData.user.user_metadata?.role || 'user',
              avatar_url: userData.user.user_metadata?.avatar_url
            };
            
            console.log('Authenticated user:', userObj);
            setUser(userObj);
          } else {
            // Token var ama kullanıcı bilgisi yoksa
            console.log('No user data found in session');
            setUser(null);
          }
        } else {
          // Token yoksa
          console.log('No active session found');
          setUser(null);
        }
      } catch (err) {
        console.error('Kimlik doğrulama hatası:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Giriş yap
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Supabase ile giriş yap
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (loginError) {
        throw loginError;
      }
      
      if (data.user) {
        // Kullanıcı nesnesini oluştur
        const userObj: User = {
          id: data.user.id,
          user_id: data.user.id, // Geriye dönük uyumluluk için
          name: data.user.user_metadata?.full_name || 'Kullanıcı',
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'user',
          avatar_url: data.user.user_metadata?.avatar_url
        };
        
        setUser(userObj);
      }
    } catch (err: any) {
      console.error('Giriş hatası:', err);
      setError(err.message || 'Giriş yapılırken bir hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Kayıt ol
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gerçek API isteği
      // const response = await api.post('/auth/register', { name, email, password });
      // const { token, refreshToken, user } = response.data;
      
      // Mock yanıt
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const token = 'mock-token';
      const refreshToken = 'mock-refresh-token';
      const userData: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        name,
        email,
        role: 'user',
        avatar_url: 'https://i.pravatar.cc/150?img=1'
      };
      
      // Token'ları kaydet
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Kullanıcı bilgilerini ayarla
      setUser(userData);
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Çıkış yap
  const logout = async () => {
    try {
      setLoading(true);
      
      // Supabase ile çıkış yap
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Çıkış yapılırken hata:', error);
        throw error;
      }
      
      // Kullanıcı durumunu sıfırla
      setUser(null);
      
      // Yerel depolamayı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Yetkisiz sayfasına yönlendirme için window.location kullan
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('Çıkış yapma hatası:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // signOut fonksiyonu (logout için alias)
  const signOut = async () => {
    return logout();
  };

  // Şifremi unuttum
  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gerçek API isteği
      // await api.post('/auth/forgot-password', { email });
      
      // Mock yanıt
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err: any) {
      console.error('Şifre sıfırlama hatası:', err);
      setError(err.response?.data?.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Şifre sıfırla
  const resetPassword = async (token: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gerçek API isteği
      // await api.post('/auth/reset-password', { token, password });
      
      // Mock yanıt
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err: any) {
      console.error('Şifre sıfırlama hatası:', err);
      setError(err.response?.data?.message || 'Şifre sıfırlanırken bir hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Profil güncelle
  const updateProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gerçek API isteği
      // const response = await api.put('/auth/profile', userData);
      // setUser(response.data);
      
      // Mock yanıt
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kullanıcı bilgilerini güncelle
      setUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (err: any) {
      console.error('Profil güncelleme hatası:', err);
      setError(err.response?.data?.message || 'Profil güncellenirken bir hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bağlam değerini oluştur
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth hook'u
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 