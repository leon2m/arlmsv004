import React, { useEffect, useState } from 'react';
import Routes from './Routes';
import { AuthProvider } from './hooks/useAuth';
import { visibilityService } from './services/visibilityService';
import './index.css';
// Geçici olarak kaldırıyoruz
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { tr } from 'date-fns/locale';

// Hata sınırı bileşeni ekleme
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uygulama hatası:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container p-4 m-4 text-center bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Bir Hata Oluştu</h2>
          <p className="text-gray-700 mb-4">Uygulama yüklenirken bir sorun oluştu.</p>
          <p className="text-sm text-gray-500 mb-4">Hata: {this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [pageHidden, setPageHidden] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  
  // Doğru auth durumunu kontrol et
  useEffect(() => {
    try {
      // Auth durumunu kontrol et (localStorage'dan vb.)
      const hasAuth = localStorage.getItem('user') !== null;
      setAuthReady(true);
      console.log('Auth durumu hazır:', hasAuth ? 'Oturum açık' : 'Oturum kapalı');
    } catch (error) {
      console.error('Auth durumu kontrol edilirken hata:', error);
      setAuthReady(true); // Yine de devam et, AuthProvider içinde error handling var
    }
  }, []);
  
  // Sayfa görünürlüğünü merkezi servis üzerinden takip et
  useEffect(() => {
    // visibilityService'e abone ol
    const unsubscribe = visibilityService.subscribe((isVisible) => {
      setPageHidden(!isVisible);
      
      if (isVisible) {
        console.log('Sayfa görünür hale geldi, uygulama durumunu güncelleniyor...');
        
        // Önceki yükleme durumunu temizle (loading state)
        const loadingElements = document.querySelectorAll('.loading-indicator');
        loadingElements.forEach(el => {
          el.classList.add('hidden');
        });
        
        // Uygulamaya "ben buradayım" sinyali gönder (sayfa yenilenmeden)
        window.dispatchEvent(new Event('app:visible'));
      } else {
        // Sayfa gizlendiğinde - sadece log, içeriği ASLA kaldırma veya gizleme
        console.log('Sayfa arkaplan durumuna geçti, içerik korunuyor');
        
        // Arkaplanda olduğunu bildiren bir data özniteliği ekle
        // Ancak içeriği gizleme veya kaldırma
        document.documentElement.setAttribute('data-visibility', 'hidden');
        
        // Sayfada mevcut olan loading göstergelerini gizle
        const loadingElements = document.querySelectorAll('.loading-indicator');
        loadingElements.forEach(el => {
          el.classList.add('hidden');
        });
        
        // Opsiyonel: Arkaplanda iken belli işlemleri durdurabilirsiniz
        window.dispatchEvent(new Event('app:hidden'));
      }
    });
    
    // Temizleme fonksiyonu - aboneliği kaldır
    return unsubscribe;
  }, []);
  
  if (!authReady) {
    return <div className="loading-app">Uygulama yükleniyor...</div>;
  }
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}> */}
          <div 
            className={`app-container ${pageHidden ? 'app-background-mode' : 'app-visible-mode'}`}
            data-visibility={pageHidden ? 'hidden' : 'visible'} // Debug için veri özniteliği
          >
            <Routes />
          </div>
        {/* </LocalizationProvider> */}
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;