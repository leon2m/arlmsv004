import { useState, useEffect } from 'react';

/**
 * localStorage'a entegre bir state hook'u
 * T tipinde bir değeri localStorage üzerinde saklar ve yönetir
 * 
 * @param key - localStorage anahtarı
 * @param initialValue - başlangıç değeri
 * @returns - [değer, değiştiren fonksiyon] ikilisi (useState gibi)
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // localStorage'dan değeri okuma veya varsayılan değeri kullanma
  const getStoredValue = (): T => {
    try {
      // Tarayıcı tarafında çalışıyor muyuz kontrol et
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        // Değer varsa parse et, yoksa varsayılan değeri döndür
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error('useLocalStorage getStoredValue error:', error);
      return initialValue;
    }
  };

  // State oluştur
  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // localStorage'a kaydetme fonksiyonu
  const setValue = (value: T) => {
    try {
      // State'i güncelle
      setStoredValue(value);
      
      // Tarayıcı tarafında çalışıyor muyuz kontrol et
      if (typeof window !== 'undefined') {
        // localStorage'a kaydet
        window.localStorage.setItem(key, JSON.stringify(value));
        
        // Diğer tarayıcı sekmelerinde de senkronize et
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: JSON.stringify(value)
        }));
      }
    } catch (error) {
      console.error('useLocalStorage setValue error:', error);
    }
  };

  // Storage olaylarını dinle (farklı sekmeler arası senkronizasyon için)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };
    
    // Olayı dinle
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      // Temizleme
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [key]);

  return [storedValue, setValue];
} 