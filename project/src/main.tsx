import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Sayfa görünürlük problemlerini daha derin seviyede ele almak için
// Sayfa gizlendiğinde içeriğin kaybolmasını önlemek için özel bir çözüm

// Görünürlük değişimlerini izleyen değişkenler
let isPageVisible = !document.hidden;
let appElement: HTMLElement | null = null;
let appContainer: HTMLElement | null = null;
let appRendered = false;

// DOM içeriğini saklayacak değişkenler
let lastKnownDOMContent: string | null = null;
let visibilityChangeCount = 0;

// DOM içeriğini saklamak için bir fonksiyon
function saveDOMState() {
  try {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      lastKnownDOMContent = rootElement.innerHTML;
      console.log('DOM durumu saklandı', visibilityChangeCount);
    }
  } catch (e) {
    console.error('DOM durumu saklanırken hata:', e);
  }
}

// DOM içeriğini geri yüklemek için bir fonksiyon
function restoreDOMState() {
  try {
    if (lastKnownDOMContent) {
      const rootElement = document.getElementById('root');
      if (rootElement && rootElement.innerHTML.includes('loading-indicator')) {
        console.log('Yükleme göstergesi algılandı, DOM durumu geri yükleniyor...');
        rootElement.innerHTML = lastKnownDOMContent;
        console.log('DOM durumu geri yüklendi', visibilityChangeCount);
        
        // Yükleme göstergelerini gizle
        const loadingIndicators = document.querySelectorAll('.loading-indicator');
        loadingIndicators.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
          }
        });
        
        return true;
      }
    }
  } catch (e) {
    console.error('DOM durumu geri yüklenirken hata:', e);
  }
  return false;
}

// Görünürlük değişikliklerini izle
document.addEventListener('visibilitychange', () => {
  visibilityChangeCount++;
  const wasVisible = isPageVisible;
  isPageVisible = !document.hidden;
  
  console.log(`Sayfa görünürlüğü değişti (${visibilityChangeCount}): ${wasVisible ? 'görünür->gizli' : 'gizli->görünür'}`);
  
  if (wasVisible && !isPageVisible) {
    // Sayfa gizlenmeden önce DOM durumunu sakla
    saveDOMState();
  } else if (!wasVisible && isPageVisible) {
    // Sayfa tekrar görünür olduğunda
    // Eğer içerik yükleme göstergesine dönüştüyse, önceki durumu geri yükle
    if (!restoreDOMState()) {
      console.log('DOM geri yüklenmedi, sayfa normal durumda ya da saklanmış durum yok');
    }
    
    // Yükleme göstergelerini gizle (her ihtimale karşı)
    setTimeout(() => {
      const loadingIndicators = document.querySelectorAll('.loading-indicator');
      loadingIndicators.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none';
        }
      });
    }, 100);
  }
});

// React uygulamasını başlat
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// React uygulaması yüklendikten sonra DOM durumunu sakla
setTimeout(saveDOMState, 2000); // İlk yüklemeden sonra DOM durumunu sakla
