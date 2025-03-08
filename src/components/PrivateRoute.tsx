import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Unauthorized from '../pages/auth/Unauthorized';
import { visibilityService } from '../services/visibilityService';

interface PrivateRouteProps {
  children: React.ReactNode;
}

// Hata tipi tanımı
type AuthError = string | Error | unknown;

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Güvenli bir şekilde useAuth hook'unu kullan
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading || false;
  const error = auth?.error as AuthError;
  
  const location = useLocation();
  const contentRef = useRef<React.ReactNode | null>(null);
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [showLoading, setShowLoading] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  
  // Hata var mı kontrol et
  useEffect(() => {
    if (error) {
      console.error('PrivateRoute: Authentication error:', error);
    }
  }, [error]);
  
  // Sayfa görünürlüğünü takip et
  useEffect(() => {
    const handleVisibilityChange = (visible: boolean) => {
      try {
        console.log(`PrivateRoute: Görünürlük değişti -> ${visible ? 'görünür' : 'gizli'}`);
        setIsVisible(visible);
        
        // Sayfa görünür hale geldiğinde
        if (visible) {
          // Eğer içerik daha önce yüklenmişse, loading göstergesini gösterme
          if (contentRef.current !== null) {
            console.log('PrivateRoute: Kaydedilmiş içerik kullanılıyor, loading gösterilmeyecek');
            setShowLoading(false);
          } else if (loading) {
            // İçerik yüklenmemişse ve hala yükleme durumundaysa, kısa bir gecikme sonrası göster
            // Bu sayede hızlı sayfa geçişlerinde gereksiz göstergeler görünmez
            if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
            loadingTimerRef.current = setTimeout(() => {
              if (loading && !contentRef.current) setShowLoading(true);
            }, 800); // 800ms gecikme - kullanıcı deneyimini daha sorunsuz hale getirir
          }
        } else {
          // Sayfa gizli olduğunda
          setShowLoading(false); // Hiçbir zaman loading gösterme
          
          // Timer'ı temizle
          if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
            loadingTimerRef.current = null;
          }
          
          // Sayfa gizlendiğinde içeriği korumak için açık bir log bırak
          console.log('PrivateRoute: Sayfa gizlendi, ancak içerik korunuyor');
        }
      } catch (err) {
        console.error('PrivateRoute: Visibility handler error:', err);
      }
    };
    
    // İlk render için görünürlük kontrolü
    try {
      handleVisibilityChange(!document.hidden);
      
      // Görünürlük hizmetine abone ol
      const unsubscribe = visibilityService.subscribe(handleVisibilityChange);
      
      return () => {
        try {
          unsubscribe();
          if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
          }
        } catch (err) {
          console.error('PrivateRoute: Cleanup error:', err);
        }
      };
    } catch (err) {
      console.error('PrivateRoute: Visibility setup error:', err);
      return () => {};
    }
  }, [loading]);
  
  // Eğer içerik başarıyla yüklendiyse, onu referansta sakla
  useEffect(() => {
    try {
      if (!loading && user) {
        console.log('PrivateRoute: İçerik referansı güncellendi');
        contentRef.current = children;
        
        // İçerik yüklendiğinde, asla loading gösterme
        setShowLoading(false);
        
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
      }
    } catch (err) {
      console.error('PrivateRoute: Content reference update error:', err);
    }
  }, [loading, user, children]);
  
  // Sayfa ilk kez yüklendiğinde ve 2 saniyeden uzun süredir yükleniyorsa
  // loading göstergesini göster
  useEffect(() => {
    try {
      const timeSinceMount = Date.now() - mountTimeRef.current;
      
      if (loading && isVisible && timeSinceMount > 2000 && !contentRef.current) {
        setShowLoading(true);
      } else if (!loading || !isVisible || contentRef.current) {
        setShowLoading(false);
      }
    } catch (err) {
      console.error('PrivateRoute: Loading indicator error:', err);
    }
  }, [loading, isVisible]);
  
  // Bileşenden ayrılırken timer'ı temizle
  useEffect(() => {
    return () => {
      try {
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
        }
      } catch (err) {
        console.error('PrivateRoute: Timer cleanup error:', err);
      }
    };
  }, []);
  
  // Hata durumunda
  if (error) {
    console.log('PrivateRoute: Hata durumu gösteriliyor');
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100" data-testid="error-container">
        <div className="text-red-600 text-xl mb-4">Authentication Error</div>
        <div className="text-gray-600">{errorMessage}</div>
        <button 
          onClick={() => window.location.href = '/login'} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Return to Login
        </button>
      </div>
    );
  }
  
  // Kimlik doğrulama durumu yüklenirken ve loading gösterilmesi gerekiyorsa
  // ve sayfa görünür durumdaysa bir bekleme arayüzü göster
  if (showLoading && isVisible && !contentRef.current) {
    console.log('PrivateRoute: Yükleme göstergesi gösteriliyor');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" data-testid="loading-container">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 loading-indicator"></div>
      </div>
    );
  }

  // Kullanıcı oturum açmamışsa ve yükleme tamamlandıysa, yetkisiz erişim sayfasını göster
  if (!loading && !user) {
    console.log('PrivateRoute: Yetkisiz erişim sayfası gösteriliyor');
    return <Unauthorized />;
  }

  // Eğer kaydedilmiş içerik varsa ve hala yükleme durumundaysa, eski içeriği göster
  if (loading && contentRef.current) {
    console.log('PrivateRoute: Yükleme sırasında kaydedilmiş içerik gösteriliyor');
    return <>{contentRef.current}</>;
  }

  // Normal durum: Kullanıcı giriş yapmış ve içerik hazır
  console.log('PrivateRoute: Normal içerik gösteriliyor');
  return <>{children}</>;
};

export default PrivateRoute;