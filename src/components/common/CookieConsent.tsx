import React, { useState, useEffect } from 'react';
import { hasCacheConsent, setCacheConsent } from '@/services/cacheService';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Bileşenin tarayıcıda monte edildiğini işaretle
    setIsMounted(true);
    
    // Kullanıcı daha önce onay vermediyse bildirim göster
    const hasConsent = hasCacheConsent();
    setShowConsent(!hasConsent);
  }, []);

  const handleAccept = () => {
    setCacheConsent(true);
    setShowConsent(false);
  };

  const handleDecline = () => {
    setCacheConsent(false);
    setShowConsent(false);
  };

  // Bileşen henüz monte edilmediyse (sunucu tarafında render ediliyorsa) hiçbir şey gösterme
  if (!isMounted || !showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-50 p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">Çerez ve Önbellek Kullanımı</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Daha iyi bir kullanıcı deneyimi sunmak için çerezleri ve yerel depolamayı kullanıyoruz. 
            Bu, sayfanın daha hızlı yüklenmesini ve oturum açık kaldığı sürece verilerinizin 
            önbelleğe alınmasını sağlar. Onay verirseniz, verileriniz cihazınızda güvenli bir şekilde saklanacaktır.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDecline}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Reddet
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Kabul Et
          </Button>
        </div>
        <button 
          onClick={() => setShowConsent(false)} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Kapat"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}; 