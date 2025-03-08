import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Particles.js script'ini dinamik olarak yükle
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      window.particlesJS && window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: '#6366f1',
          },
          shape: {
            type: 'circle',
          },
          opacity: {
            value: 0.5,
            random: false,
          },
          size: {
            value: 3,
            random: true,
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#6366f1',
            opacity: 0.2,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200,
            },
          },
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: true,
              mode: 'repulse',
            },
            onclick: {
              enable: true,
              mode: 'push',
            },
            resize: true,
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
            push: {
              particles_nb: 4,
            },
          },
        },
        retina_detect: true,
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showNotification('Lütfen tüm alanları doldurun', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!auth || !auth.login) {
        throw new Error('Kimlik doğrulama servisi kullanılamıyor');
      }
      
      await auth.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'error' | 'success' = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg animate-fadeIn z-50 ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-fadeOut');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative py-8" style={{ overflowX: 'hidden' }}>
      <div id="particles-js" className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden flex transform transition-all duration-700 hover:shadow-2xl animate-fadeIn">
          <div className="w-1/2 p-12">
            <div className="mb-12">
              <h1 className="text-3xl font-bold mb-2">AR LMS</h1>
              <p className="text-gray-600">Kurumsal Öğrenme Platformu</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="input-group">
                <div className="relative">
                  <i className="ri-user-line"></i>
                  <input 
                    type="email" 
                    placeholder=" " 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label>E-posta</label>
                </div>
              </div>
              
              <div className="input-group">
                <div className="relative">
                  <i className="ri-lock-line"></i>
                  <input 
                    type="password" 
                    placeholder=" " 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label>Şifre</label>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-button hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
            
            <div className="mt-8">
              <div className="text-center text-gray-500 mb-4">veya</div>
              <button
                className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-button hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:border-primary/30"
                onClick={() => showNotification('Microsoft ile giriş özelliği henüz aktif değil', 'error')}
              >
                <i className="ri-microsoft-fill text-[#00A4EF]"></i>
                <span>Microsoft 365 ile Giriş Yap</span>
              </button>
              
              <div className="mt-6 text-center">
                <Link to="/auth/forgot-password" className="text-primary hover:underline">
                  Şifremi Unuttum
                </Link>
                <span className="mx-2 text-gray-400">|</span>
                <Link to="/auth/register" className="text-primary hover:underline">
                  Kayıt Ol
                </Link>
              </div>
            </div>
          </div>
          
          <div className="w-1/2 gradient-bg p-12 relative overflow-hidden group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 relative z-10 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:rotate-1">
              <img
                src="https://public.readdy.ai/ai/img_res/8160fa096975831368c8f1877237ad6a.jpg"
                className="rounded-xl w-full h-auto object-cover transition-all duration-500 ease-in-out group-hover:shadow-xl"
                alt="AR LMS"
              />
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-white rounded-full flex items-center justify-center transition-transform duration-500 ease-in-out group-hover:rotate-45">
                <i className="ri-lightbulb-flash-line text-primary text-xl"></i>
              </div>
            </div>
            
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-[20%] left-[10%] w-8 h-8 bg-white/10 rounded-full transition-transform duration-700 ease-in-out group-hover:translate-x-4"></div>
              <div className="absolute bottom-[30%] right-[20%] w-12 h-12 bg-white/10 rounded-full transition-transform duration-700 ease-in-out group-hover:-translate-y-4"></div>
              <div className="absolute top-[60%] left-[30%] w-6 h-6 bg-white/10 rounded-full transition-transform duration-700 ease-in-out group-hover:translate-x-2 group-hover:translate-y-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 