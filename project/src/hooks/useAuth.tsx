import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Kullanıcı tipi
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  created_at?: string;
}

// AuthContext'in tipini tanımla
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | string | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | string | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | string | null }>;
}

// Varsayılan context değeri oluştur - bu hiçbir zaman undefined olmamalı
export const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null })
};

// AuthContext oluştur
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Helper function to safely ensure auth context
function ensureAuthContext(context: AuthContextType | undefined): AuthContextType {
  if (!context) {
    console.error('AuthContext is undefined! Using default context.');
    return defaultContextValue;
  }
  return context;
}

// AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider bileşeni
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | string | null>(null);

  // Kullanıcı oturumunu kontrol et
  useEffect(() => {
    try {
      // Sayfa yüklendiğinde kullanıcı oturumunu kontrol et
      const checkUserSession = async () => {
        try {
          setLoading(true);
          
          // Veritabanından oturum kontrolü yap
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session check error:', sessionError);
            setError(sessionError.message);
            setUser(null);
            return;
          }
          
          if (session?.user) {
            // Kullanıcı profil bilgilerini getir
            const { data: userData, error: userError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (userError) {
              console.error('User profile fetch error:', userError);
              setError(userError.message);
              setUser(null);
              return;
            }
            
            if (userData) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                firstName: userData.full_name ? userData.full_name.split(' ')[0] : '',
                lastName: userData.full_name ? userData.full_name.split(' ').slice(1).join(' ') : '',
                role: userData.role || 'user',
                avatar: userData.avatar_url,
                created_at: userData.created_at
              });
            }
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          setError(err instanceof Error ? err : String(err));
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
      
      checkUserSession();
      
      // Kullanıcı oturum değişikliklerini dinle
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        } else if (event === 'SIGNED_IN' && session) {
          try {
            // Kullanıcı profil bilgilerini getir
            const { data: userData, error: userError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (userError) {
              console.error('User profile fetch error:', userError);
              setError(userError.message);
              setUser(null);
              return;
            }
            
            if (userData) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                firstName: userData.full_name ? userData.full_name.split(' ')[0] : '',
                lastName: userData.full_name ? userData.full_name.split(' ').slice(1).join(' ') : '',
                role: userData.role || 'user',
                avatar: userData.avatar_url,
                created_at: userData.created_at
              });
              setError(null);
            }
          } catch (err) {
            console.error('Error updating user after sign in:', err);
            setError(err instanceof Error ? err : String(err));
          }
        }
      });
      
      return () => {
        // Listener'ı temizle
        if (authListener && authListener.subscription) {
          authListener.subscription.unsubscribe();
        }
      };
    } catch (err) {
      console.error('Auth provider setup error:', err);
      setError(err instanceof Error ? err : String(err));
      setLoading(false);
    }
  }, []);

  // Giriş fonksiyonu
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gerçek ortamda
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        setError(signInError.message);
        return { error: signInError.message };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Sign in failed:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Kayıt fonksiyonu
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gerçek ortamda
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (signUpError) {
        console.error('Sign up error:', signUpError);
        setError(signUpError.message);
        return { error: signUpError.message };
      }
      
      // Profil oluştur
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              id: data.user.id, 
              full_name: `${firstName} ${lastName}`,
              email: email,
              role: 'user'
            }
          ]);
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          setError(profileError.message);
          return { error: profileError.message };
        }
      }
      
      return { error: null };
    } catch (err) {
      console.error('Sign up failed:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Gerçek ortamda
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('Sign out error:', signOutError);
        setError(signOutError.message);
        return;
      }
      
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Sign out failed:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Şifre sıfırlama fonksiyonu
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gerçek ortamda
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (resetError) {
        console.error('Password reset error:', resetError);
        setError(resetError.message);
        return { error: resetError.message };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Password reset failed:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Şifre güncelleme fonksiyonu
  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gerçek ortamda
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });
      
      if (updateError) {
        console.error('Password update error:', updateError);
        setError(updateError.message);
        return { error: updateError.message };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Password update failed:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // AuthProvider değerleri
  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };

  // AuthContext.Provider ile context değerlerini sağla
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth özel hook - güvenli context erişimi sağlar
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  return ensureAuthContext(context);
};

export default useAuth; 