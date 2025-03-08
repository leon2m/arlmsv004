import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

interface Window {
  particlesJS: any;
}

declare global {
  interface Window {
    particlesJS: any;
  }
}

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    // Particles.js konfigürasyonu
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: '#3b82f6',
          },
          shape: {
            type: 'circle',
            stroke: {
              width: 0,
              color: '#000000',
            },
            polygon: {
              nb_sides: 5,
            },
          },
          opacity: {
            value: 0.5,
            random: false,
            anim: {
              enable: false,
              speed: 1,
              opacity_min: 0.1,
              sync: false,
            },
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: false,
              speed: 40,
              size_min: 0.1,
              sync: false,
            },
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#3b82f6',
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 3,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: false,
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
              mode: 'grab',
            },
            onclick: {
              enable: true,
              mode: 'push',
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 1,
              },
            },
            bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
            push: {
              particles_nb: 4,
            },
            remove: {
              particles_nb: 2,
            },
          },
        },
        retina_detect: true,
      });
    }

    // Countdown timer to redirect after 5 seconds
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Start exit animation before redirecting
      setAnimateOut(true);
      const redirectTimer = setTimeout(() => {
        navigate('/auth/login');
      }, 1000); // Wait for animation to complete
      return () => clearTimeout(redirectTimer);
    }
  }, [countdown, navigate]);

  return (
    <div className={`unauthorized-container ${animateOut ? 'fade-out' : ''}`}>
      <div className="particles-container" id="particles-js"></div>
      
      <div className="unauthorized-card">
        <div className="lock-icon">
          <div className="lock-top"></div>
          <div className="lock-body">
            <div className="lock-hole"></div>
          </div>
        </div>
        
        <h1 className="title">Erişim Kısıtlandı</h1>
        <p className="message">Bu sayfayı görüntülemek için giriş yapmanız gerekmektedir.</p>
        
        <div className="pulse-ring"></div>
        
        <div className="countdown">
          <div className="countdown-ring">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle 
                className="countdown-circle-bg" 
                cx="60" 
                cy="60" 
                r="54" 
                fill="none" 
                stroke="#e2e8f0" 
                strokeWidth="6"
              />
              <circle 
                className="countdown-circle" 
                cx="60" 
                cy="60" 
                r="54" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="6" 
                strokeDasharray="339.3" 
                strokeDashoffset={339.3 * (1 - countdown / 5)}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="countdown-number">{countdown}</div>
          </div>
          <p>saniye içinde yönlendiriliyorsunuz</p>
        </div>
        
        <button 
          className="login-now-button"
          onClick={() => {
            setAnimateOut(true);
            setTimeout(() => navigate('/auth/login'), 500);
          }}
        >
          <span>Hemen Giriş Yap</span>
          <div className="button-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </button>
      </div>
      
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
    </div>
  );
};

export default Unauthorized; 