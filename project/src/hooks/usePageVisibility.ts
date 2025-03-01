import { useState, useEffect, useCallback } from 'react';

/**
 * Sayfa görünürlüğünü izlemek için custom hook
 * 
 * @returns Sayfanın görünür olup olmadığını ve odakta olup olmadığını kontrol eden değerler
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [isFocused, setIsFocused] = useState(document.hasFocus());
  
  const handleVisibilityChange = useCallback(() => {
    setIsVisible(!document.hidden);
  }, []);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);
  
  useEffect(() => {
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
  }, [handleVisibilityChange, handleFocus, handleBlur]);
  
  return { isVisible, isFocused };
} 