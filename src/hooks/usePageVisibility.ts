import { useState, useEffect, useCallback } from 'react';

/**
 * Sayfa görünürlüğünü izlemek için custom hook
 * 
 * @returns Sayfanın görünür olup olmadığını ve odakta olup olmadığını kontrol eden değerler
 */
export function usePageVisibility() {
  // Tarayıcı ortamında olup olmadığımızı kontrol et
  const isBrowser = typeof window !== 'undefined';
  
  // Varsayılan değerler (sunucu tarafında render edilirken)
  const [isVisible, setIsVisible] = useState(true);
  const [isFocused, setIsFocused] = useState(true);
  
  const handleVisibilityChange = useCallback(() => {
    if (!isBrowser) return;
    setIsVisible(!document.hidden);
  }, [isBrowser]);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);
  
  useEffect(() => {
    // Tarayıcı ortamında değilsek hiçbir şey yapma
    if (!isBrowser) return;
    
    // İlk değerleri ayarla
    setIsVisible(!document.hidden);
    setIsFocused(document.hasFocus());
    
    // Sayfa görünürlük olayını dinle
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Sekme odak olaylarını dinle
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Temizleme fonksiyonu
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleVisibilityChange, handleFocus, handleBlur, isBrowser]);
  
  return { isVisible, isFocused };
} 