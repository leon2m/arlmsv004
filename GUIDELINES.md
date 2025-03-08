# AR LMS Geliştirme Kılavuzu

## Temel Prensipler

### 1. İletişim ve Dil
- Tüm kullanıcı arayüzü ve iletişim Türkçe olmalıdır
- Kod içi yorumlar ve dokümantasyon İngilizce olmalıdır

### 2. Sistem Odağı
- LMS (Öğrenme Yönetim Sistemi) geliştirmeleri önceliklidir
- Tüm özellikler eğitim ve öğrenme deneyimini geliştirmeye yönelik olmalıdır

### 3. Veritabanı ve Backend Yapısı
- Her yeni özellik için Supabase'de uygun tablo ve ilişkiler oluşturulmalıdır
- RLS (Row Level Security) politikaları her tablo için tanımlanmalıdır
- Tüm veritabanı işlemleri services/ dizini altındaki servis katmanı üzerinden yapılmalıdır

### 4. Sistem Bütünlüğü
- Sistem dosyaları (.env, config dosyaları vb.) değiştirilmemeli veya silinmemelidir
- Mevcut modüller ve işlevsellik korunmalıdır
- Hata düzeltmeleri mevcut yapıyı bozmadan yapılmalıdır

### 5. Geliştirme Standartları

#### Kod Organizasyonu
- DRY (Don't Repeat Yourself) prensibi takip edilmelidir
- Tekrar eden UI elementleri için components/ dizininde yeniden kullanılabilir bileşenler oluşturulmalıdır
- Sayfa bileşenleri pages/ dizininde tutulmalıdır
- Veri işlemleri services/ dizinindeki servisler üzerinden yapılmalıdır

#### Tip Güvenliği
- TypeScript interface'leri types/ dizininde tanımlanmalıdır
- Any tipinden kaçınılmalıdır
- Supabase sorguları için tip güvenliği sağlanmalıdır

#### State Yönetimi
- Yerel state için React hooks kullanılmalıdır
- Karmaşık state yönetimi için custom hooks oluşturulmalıdır
- Global state ihtiyacı için Context API tercih edilmelidir

### 6. UI/UX Tasarım İlkeleri
- Apple tasarım prensipleri takip edilmelidir:
  - Sade ve minimal arayüz
  - Beyaz alan kullanımı
  - Yumuşak geçişler ve animasyonlar
- Tailwind CSS class'ları düzenli ve tutarlı kullanılmalıdır
- Responsive tasarım tüm bileşenler için zorunludur
- Loading states ve error handling her işlem için implement edilmelidir

### 7. Performans Optimizasyonu
- Gereksiz re-render'lardan kaçınılmalıdır
- Büyük listeler için sanallaştırma kullanılmalıdır
- Resimler optimize edilmelidir
- Bundle size kontrol edilmelidir

### 8. Veri Yönetimi
- Mock data kullanılmamalıdır
- Tüm veriler Supabase üzerinden alınmalıdır
- Veri önbelleğe alma stratejileri uygulanmalıdır
- Batch işlemler için uygun stratejiler kullanılmalıdır

### 9. Hata Yönetimi
- Try-catch blokları ile hata yakalama yapılmalıdır
- Kullanıcı dostu hata mesajları gösterilmelidir
- Hata logları console.error ile kaydedilmelidir
- Kritik hatalar için fallback UI'lar hazırlanmalıdır

### 10. Geliştirme Süreci
- Tüm değişiklikler dokümante edilmelidir
- Kod kalitesi için ESLint kuralları takip edilmelidir

### 11. Güvenlik
- Kullanıcı girişleri validate edilmelidir
- RLS politikaları test edilmelidir
- Hassas veriler client tarafında tutulmamalıdır
- API anahtarları ve credentials güvenli şekilde saklanmalıdır

### 12. Test ve Kalite
- Kritik bileşenler için unit testler yazılmalıdır
- UI bileşenleri için snapshot testler kullanılmalıdır
- E2E testler önemli user flow'lar için hazırlanmalıdır
- Kod review süreçleri takip edilmelidir

# Add global rules and guidelines for Cascade to follow across all workspaces.

The best guidelines are clear and concise, for example:

# Add global rules and guidelines for Cascade to follow across all workspaces.

The best guidelines are clear and concise, for example:

1. Speak to me in Turkish.  
2. My system focus is LMS improvements.  
3. Ensure all added features have a backend structure and are fully functional.  
4. Don't modify or delete any system files.  
5. Fix errors without removing modules or breaking existing functionality.  
6. Maintain compatibility with the current system.  
7. Always document changes clearly.  
8. UI/UX design must always be **premium, elegant, and interactive**, inspired by Apple’s design philosophy. The interface should feel **smooth, modern, and high-end**, offering a seamless user experience.  
9. The design must include **subtle yet effective animations** that enhance usability without straining system performance. Transitions should be fluid, and interactions should feel natural.  
10. The UI should be **highly interactive**, ensuring an engaging user experience. Components should be designed with **user engagement and intuitive navigation** in mind.  
11. Always use **semantic coding principles**, ensuring that the code is **well-structured, meaningful, and easy to understand**.  
12. Keep project dependencies optimized and avoid unnecessary long blocks of code—**break code into modular, reusable components** to enhance readability and maintainability.  
13. Avoid unnecessary code repetition; use reusable components to maintain a clean and efficient codebase.  
14. Never use mock data or mock APIs—always work with real, live, and simulatable data from the database to ensure a true system integration.  
15. The project must always follow a **database → system** structure for real-world functionality.  
16. Code should always be optimized and effective—no excessive or redundant code that bloats the system.  
17. Follow **modern coding standards** and ensure a **modular structure**—no single file should exceed **400 lines of code**. Code should be **divided into smaller, maintainable parts**, following a **library-based approach** for better scalability and organization.  
18. Always use **Supabase** as the database structure when adding data.  
19. Before executing SQL queries, **analyze the existing schema** to ensure compatibility. Read the current SQL table structures before attempting any modifications to avoid incorrect column references.  
20. If SQL queries are required, **send them to me first before execution**, so I can review and integrate them into the database manually if needed.  
21. Any added or modified modules must always follow a **modular structure**—never exceed **400 lines per file**. Code must be imported and structured in small, reusable parts.  
22. Always follow a **documentation-first approach**, ensuring that code is well-documented, clear, and easy to understand for team collaboration.  
23. Code should be written in an **infographic-friendly manner**, making it easy for a new developer to read and understand the system logic at a glance.  
