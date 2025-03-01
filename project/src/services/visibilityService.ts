/**
 * Sayfa görünürlüğü servis modülü
 * Bu servis, sayfa görünürlüğü değişikliklerini merkezi bir şekilde yönetir
 * ve uygulama içindeki bileşenlere bu bilgiyi sağlar.
 */

type VisibilitySubscriber = (isVisible: boolean) => void;

// Servis API'sini tanımlama
interface IVisibilityService {
  isVisible: boolean;
  subscribe: (callback: VisibilitySubscriber) => () => void;
  setVisibility: (isVisible: boolean) => void;
  initialize: () => void;
  cleanup: () => void;
}

class PageVisibilityService implements IVisibilityService {
  private subscribers = new Set<VisibilitySubscriber>();
  private isInitialized = false;
  private _isVisible = false; // Varsayılan değer
  private visibilityTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    try {
      // Browser ortamında olduğumuzu kontrol et
      if (typeof document !== 'undefined' && document.hidden !== undefined) {
        this._isVisible = !document.hidden;
      }
      console.log('VisibilityService: Oluşturuldu', { isVisible: this._isVisible });
    } catch (error) {
      console.error('VisibilityService: Başlatma hatası:', error);
      // Güvenli varsayılan değer olarak görünür ayarla
      this._isVisible = true;
    }
  }

  // Servisi başlat (event listener'ları ekle)
  public initialize(): void {
    try {
      if (this.isInitialized) return;
      
      // Browser ortamında olduğumuzu kontrol et
      if (typeof document === 'undefined') return;
      
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('beforeunload', this.cleanup);
      this.isInitialized = true;
      
      // İlk durumu bildir
      this.notifySubscribers();
      
      console.log('VisibilityService: Başlatıldı');
    } catch (error) {
      console.error('VisibilityService: Başlatma hatası:', error);
    }
  }
  
  // Servisi temizle (event listener'ları kaldır)
  public cleanup = (): void => {
    try {
      if (typeof document === 'undefined') return;
      
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('beforeunload', this.cleanup);
      
      if (this.visibilityTimeout) {
        clearTimeout(this.visibilityTimeout);
        this.visibilityTimeout = null;
      }
      
      this.isInitialized = false;
      console.log('VisibilityService: Temizlendi');
    } catch (error) {
      console.error('VisibilityService: Temizleme hatası:', error);
    }
  }

  // Görünürlük değişikliği olayını debounce ile ele al
  private handleVisibilityChange = (): void => {
    try {
      if (typeof document === 'undefined') return;
      
      const newVisibility = !document.hidden;
      
      // Eğer durumda bir değişiklik yoksa, işlem yapma
      if (this._isVisible === newVisibility) return;
      
      this._isVisible = newVisibility;
      console.log(`VisibilityService: Görünürlük değişti -> ${newVisibility ? 'görünür' : 'gizli'}`);
      
      // Hızlı değişiklerde debounce uygula (100ms)
      if (this.visibilityTimeout) {
        clearTimeout(this.visibilityTimeout);
      }
      
      this.visibilityTimeout = setTimeout(() => {
        this.notifySubscribers();
        this.visibilityTimeout = null;
      }, 100);
    } catch (error) {
      console.error('VisibilityService: Görünürlük değişikliği hatası:', error);
    }
  };

  // Tüm abonelere görünürlük durumunu bildir
  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(this._isVisible);
      } catch (error) {
        console.error('VisibilityService: Abone bildirimi sırasında hata:', error);
      }
    });
  }

  // Görünürlük değişikliklerine abone ol
  public subscribe(callback: VisibilitySubscriber): () => void {
    try {
      // İlk abone eklendiğinde servisi başlat
      if (!this.isInitialized && this.subscribers.size === 0) {
        this.initialize();
      }
      
      this.subscribers.add(callback);
      
      // Hemen mevcut durumu bildir
      try {
        callback(this._isVisible);
      } catch (error) {
        console.error('VisibilityService: İlk bildirim sırasında hata:', error);
      }
      
      // Abonelikten çıkma fonksiyonunu döndür
      return () => {
        try {
          this.subscribers.delete(callback);
          
          // Son abone kaldırıldığında servisi temizle
          if (this.subscribers.size === 0) {
            this.cleanup();
          }
        } catch (error) {
          console.error('VisibilityService: Abonelikten çıkma hatası:', error);
        }
      };
    } catch (error) {
      console.error('VisibilityService: Abonelik hatası:', error);
      // Boş bir fonksiyon döndür, hata durumunda güvenli olmak için
      return () => {};
    }
  }

  // Görünürlük durumunu manuel olarak ayarla (test için kullanışlı)
  public setVisibility(isVisible: boolean): void {
    try {
      if (this._isVisible !== isVisible) {
        this._isVisible = isVisible;
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('VisibilityService: Görünürlük ayarlama hatası:', error);
    }
  }

  // Mevcut görünürlük durumunu getir
  public get isVisible(): boolean {
    return this._isVisible;
  }
}

// Güvenli bir singleton örneği yaratma
let visibilityServiceInstance: IVisibilityService;

try {
  visibilityServiceInstance = new PageVisibilityService();
  
  // Tarayıcı ortamında ise başlat
  if (typeof window !== 'undefined') {
    // Sayfanın yüklenmesini bekle
    if (document.readyState === 'complete') {
      visibilityServiceInstance.initialize();
    } else {
      window.addEventListener('load', () => {
        visibilityServiceInstance.initialize();
      });
    }
  }
} catch (error) {
  console.error('VisibilityService oluşturulurken hata:', error);
  // Hata durumunda basit bir nesne döndür - interface'i kullanarak
  visibilityServiceInstance = {
    isVisible: true,
    subscribe: () => () => {},
    setVisibility: () => {},
    initialize: () => {},
    cleanup: () => {}
  };
}

export const visibilityService = visibilityServiceInstance;
export default visibilityService; 