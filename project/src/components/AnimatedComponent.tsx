import React, { useEffect, useState } from 'react';

/**
 * Görünürlük duyarlı animasyon komponenti
 * Pencere durumu değiştiğinde animasyonlarını kontrol edebilir
 */
export const AnimatedComponent: React.FC = () => {
  const [animationActive, setAnimationActive] = useState(true);
  
  useEffect(() => {
    // Sayfa görünür olduğunda animasyonu etkinleştir
    const handleVisible = () => {
      console.log('Animasyon etkinleştiriliyor...');
      setAnimationActive(true);
    };
    
    // Sayfa arkaplanda olduğunda animasyonu duraklat
    const handleHidden = () => {
      console.log('Animasyon duraklatılıyor...');
      setAnimationActive(false);
    };
    
    // Event listener'ları ekle
    window.addEventListener('app:visible', handleVisible);
    window.addEventListener('app:hidden', handleHidden);
    
    // Temizleme
    return () => {
      window.removeEventListener('app:visible', handleVisible);
      window.removeEventListener('app:hidden', handleHidden);
    };
  }, []);
  
  return (
    <div className="my-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">Animasyon Test Komponenti</h2>
      
      <div className="flex flex-col space-y-4">
        {/* Sürekli animasyon */}
        <div className={`p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white 
                        ${animationActive ? 'animate-float' : 'animation-pause'}`}>
          <p className="font-medium">Bu öğe sürekli animasyon içerir</p>
          <p className="text-sm opacity-80">
            {animationActive 
              ? 'Animasyon aktif: Sayfa görünür durumda' 
              : 'Animasyon duraklatıldı: Sayfa arkaplanda'}
          </p>
        </div>
        
        {/* Pulsing animasyon */}
        <div className={`p-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg text-white
                        ${animationActive ? 'animate-pulse-slow' : 'animation-pause'}`}>
          <p className="font-medium">Bu öğe atım animasyonu içerir</p>
          <p className="text-sm opacity-80">
            {animationActive 
              ? 'Animasyon aktif: Sayfa görünür durumda' 
              : 'Animasyon duraklatıldı: Sayfa arkaplanda'}
          </p>
        </div>
        
        {/* Durum göstergesi */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <p className="font-medium">Sayfa Durumu:</p>
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${animationActive ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <p>{animationActive ? 'Aktif' : 'Arkaplanda'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedComponent; 