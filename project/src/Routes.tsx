import React, { useMemo, useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorPage } from './pages/ErrorPage';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { Analytics } from './pages/Analytics';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { TrainingContents } from './pages/TrainingContents';
import { Exams } from './pages/Exams';
import { Surveys } from './pages/Surveys';
import { Certificates } from './pages/Certificates';
import Tasks from './pages/Tasks';
import { PrivateRoute } from './components/PrivateRoute';
import { visibilityService } from './services/visibilityService';

// Auth sayfaları
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Unauthorized from './pages/auth/Unauthorized';

// Yükleme komponenti - Geliştirilmiş versiyon
const LoadingSpinner = () => {
  const [showSpinner, setShowSpinner] = useState(false);

  // Yalnızca kısa bir gecikme sonrasında spinner'ı göster
  // Bu flash durumlarını önlemeye yardımcı olur
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // Sadece sayfa görünürse spinner'ı göster
    const checkVisibility = () => {
      // Sayfa gizliyse spinner'ı gösterme
      if (document.hidden) {
        setShowSpinner(false);
        return;
      }
      
      // Kısa bir gecikme sonra spinner'ı göster
      timer = setTimeout(() => {
        // Son bir kontrol daha yap, sayfa hala görünür durumdaysa spinner'ı göster
        if (!document.hidden) {
          setShowSpinner(true);
        }
      }, 300);
    };
    
    // İlk görünürlük kontrolü
    checkVisibility();
    
    // Görünürlük değişikliklerini dinle
    document.addEventListener('visibilitychange', checkVisibility);
    
    // Temizleme
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', checkVisibility);
    };
  }, []);

  // Hiçbir şey gösterme veya spinner'ı göster
  if (!showSpinner) return null;

  return (
    <div className="min-h-screen flex items-center justify-center loading-indicator" data-loading="true">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};

// Layout wrapper - geliştirilmiş
const WithLayout = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  
  // Sayfa görünürlüğünü izle
  useEffect(() => {
    const handleVisibilityChange = (visible: boolean) => {
      console.log(`WithLayout: Görünürlük değişti -> ${visible ? 'görünür' : 'gizli'}`);
      setIsVisible(visible);
    };
    
    // Görünürlük hizmetine abone ol
    const unsubscribe = visibilityService.subscribe(handleVisibilityChange);
    return () => unsubscribe();
  }, []);
  
  // Eğer sayfa gizli durumdaysa, asla fallback gösterme
  const suspenseFallback = useMemo(() => {
    return isVisible ? <LoadingSpinner /> : null;
  }, [isVisible]);
  
  return (
    <ErrorBoundary>
      <React.Suspense fallback={suspenseFallback}>
        <PrivateRoute>
          <Layout>{children}</Layout>
        </PrivateRoute>
      </React.Suspense>
    </ErrorBoundary>
  );
};

// Error wrapper
const WithError = ({ error }: { error: any }) => (
  <WithLayout>
    <ErrorPage error={error} />
  </WithLayout>
);

const Routes = () => {
  // visibilityService'i başlat
  useEffect(() => {
    visibilityService.initialize();
    return () => visibilityService.cleanup();
  }, []);

  const router = createBrowserRouter([
    // Auth routes
    {
      path: "/auth/login",
      element: <Login />,
      errorElement: <ErrorPage error={{ status: 500 }} />
    },
    {
      path: "/auth/register",
      element: <Register />,
      errorElement: <ErrorPage error={{ status: 500 }} />
    },
    {
      path: "/auth/forgot-password",
      element: <ForgotPassword />,
      errorElement: <ErrorPage error={{ status: 500 }} />
    },
    {
      path: "/unauthorized",
      element: <Unauthorized />,
      errorElement: <ErrorPage error={{ status: 401 }} />
    },
    
    // Protected routes
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
      errorElement: <WithError error={{ status: 404 }} />
    },
    {
      path: "/dashboard",
      element: <WithLayout><Dashboard /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/tasks",
      element: <WithLayout><Tasks /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/training-contents",
      element: <WithLayout><TrainingContents /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/courses",
      element: <WithLayout><Courses /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/exams",
      element: <WithLayout><Exams /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/surveys",
      element: <WithLayout><Surveys /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/certificates",
      element: <WithLayout><Certificates /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/analytics",
      element: <WithLayout><Analytics /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/users",
      element: <WithLayout><Users /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/settings",
      element: <WithLayout><Settings /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/settings/:tab",
      element: <WithLayout><Settings /></WithLayout>,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "/profile",
      element: <Navigate to="/settings/profile" replace />,
      errorElement: <WithError error={{ status: 500 }} />
    },
    {
      path: "*",
      element: <WithLayout><ErrorPage error={{ status: 404 }} /></WithLayout>,
      errorElement: <WithError error={{ status: 404 }} />
    }
  ], {
    future: {
      v7_relativeSplatPath: true
    }
  });
  
  return <RouterProvider router={router} />;
};

export default Routes;
