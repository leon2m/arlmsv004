import { UserProfile, UserStats } from '@/components/dashboard/types';
import { CompetencySet } from '@/services/competencyService';
import { Task } from '@/components/dashboard/types';

// Tarayıcı ortamında olup olmadığımızı kontrol et
const isBrowser = typeof window !== 'undefined';

// Önbellek anahtarları
const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_STATS: 'user_stats',
  COMPETENCY_SETS: 'competency_sets',
  ASSIGNED_TASKS: 'assigned_tasks',
  CACHE_TIMESTAMP: 'cache_timestamp',
  CACHE_CONSENT: 'cache_consent'
};

// Önbellek süresi (milisaniye cinsinden) - 1 saat
const CACHE_DURATION = 60 * 60 * 1000;

// localStorage'a güvenli erişim
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage.getItem hatası:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage.setItem hatası:', error);
    }
  },
  
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage.removeItem hatası:', error);
    }
  }
};

// Önbellek izni kontrolü
export const hasCacheConsent = (): boolean => {
  return safeLocalStorage.getItem(CACHE_KEYS.CACHE_CONSENT) === 'true';
};

// Önbellek izni ayarla
export const setCacheConsent = (consent: boolean): void => {
  safeLocalStorage.setItem(CACHE_KEYS.CACHE_CONSENT, consent.toString());
};

// Önbelleğe veri kaydetme
export const saveToCache = <T>(key: string, data: T): void => {
  if (!isBrowser || !hasCacheConsent()) return;
  
  try {
    safeLocalStorage.setItem(key, JSON.stringify(data));
    // Önbellek zaman damgasını güncelle
    safeLocalStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error(`Veri önbelleğe kaydedilirken hata oluştu (${key}):`, error);
  }
};

// Önbellekten veri alma
export const getFromCache = <T>(key: string): T | null => {
  if (!isBrowser || !hasCacheConsent()) return null;
  
  try {
    const cachedData = safeLocalStorage.getItem(key);
    if (!cachedData) return null;
    
    // Önbellek zaman damgasını kontrol et
    const timestamp = safeLocalStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
    if (!timestamp) return null;
    
    const cacheTime = parseInt(timestamp);
    const now = Date.now();
    
    // Önbellek süresi dolmuşsa null döndür
    if (now - cacheTime > CACHE_DURATION) {
      return null;
    }
    
    return JSON.parse(cachedData) as T;
  } catch (error) {
    console.error(`Veri önbellekten alınırken hata oluştu (${key}):`, error);
    return null;
  }
};

// Önbelleği temizleme
export const clearCache = (): void => {
  if (!isBrowser) return;
  
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      safeLocalStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Önbellek temizlenirken hata oluştu:', error);
  }
};

// Kullanıcı profili önbelleği
export const cacheUserProfile = (profile: UserProfile): void => {
  saveToCache(CACHE_KEYS.USER_PROFILE, profile);
};

export const getCachedUserProfile = (): UserProfile | null => {
  return getFromCache<UserProfile>(CACHE_KEYS.USER_PROFILE);
};

// Kullanıcı istatistikleri önbelleği
export const cacheUserStats = (stats: UserStats): void => {
  saveToCache(CACHE_KEYS.USER_STATS, stats);
};

export const getCachedUserStats = (): UserStats | null => {
  return getFromCache<UserStats>(CACHE_KEYS.USER_STATS);
};

// Yetkinlik setleri önbelleği
export const cacheCompetencySets = (sets: CompetencySet[]): void => {
  saveToCache(CACHE_KEYS.COMPETENCY_SETS, sets);
};

export const getCachedCompetencySets = (): CompetencySet[] | null => {
  return getFromCache<CompetencySet[]>(CACHE_KEYS.COMPETENCY_SETS);
};

// Görevler önbelleği
export const cacheAssignedTasks = (tasks: Task[]): void => {
  saveToCache(CACHE_KEYS.ASSIGNED_TASKS, tasks);
};

export const getCachedAssignedTasks = (): Task[] | null => {
  return getFromCache<Task[]>(CACHE_KEYS.ASSIGNED_TASKS);
};

// Önbellek durumunu kontrol et
export const isCacheValid = (): boolean => {
  if (!isBrowser || !hasCacheConsent()) return false;
  
  const timestamp = safeLocalStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
  if (!timestamp) return false;
  
  const cacheTime = parseInt(timestamp);
  const now = Date.now();
  
  return now - cacheTime <= CACHE_DURATION;
};

// Kullanıcı değiştiğinde önbelleği temizle
export const clearUserCache = (): void => {
  if (!isBrowser) return;
  
  safeLocalStorage.removeItem(CACHE_KEYS.USER_PROFILE);
  safeLocalStorage.removeItem(CACHE_KEYS.USER_STATS);
  safeLocalStorage.removeItem(CACHE_KEYS.COMPETENCY_SETS);
  safeLocalStorage.removeItem(CACHE_KEYS.ASSIGNED_TASKS);
  safeLocalStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
}; 