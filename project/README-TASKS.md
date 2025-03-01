# Görev Yönetim Sistemi

Bu belge, LMS projesi için Supabase ile entegre edilmiş görev yönetim sisteminin kurulumu ve kullanımı hakkında bilgiler içerir.

## Genel Bakış

Görev yönetim sistemi, kullanıcıların kişisel görevlerini oluşturmasına, düzenlemesine ve takip etmesine olanak tanır. Sistem, Supabase veritabanı ile entegre çalışır ve kullanıcıların görevlerini güvenli bir şekilde saklar.

## Özellikler

- Görev oluşturma, düzenleme ve silme
- Görevleri öncelik ve duruma göre filtreleme
- Görevlere etiket ekleme
- Son tarih belirleme
- Görev durumunu güncelleme (Bekliyor, Devam Ediyor, Tamamlandı)

## Teknik Yapı

Sistem aşağıdaki bileşenlerden oluşur:

1. **Veritabanı Tablosu**: `tasks` tablosu Supabase'de oluşturulur
2. **API Servisi**: `taskService.ts` dosyası Supabase ile iletişim kurar
3. **UI Bileşenleri**: `TaskList.tsx` ve `Tasks.tsx` kullanıcı arayüzünü sağlar

## Kurulum

### 1. Supabase Tablosunu Oluşturma

Supabase projenizde aşağıdaki SQL sorgusunu çalıştırın veya migration dosyasını kullanın:

```sql
-- Migration dosyası: 20240601000000_create_tasks_table.sql
```

Bu migration dosyası:
- `tasks` tablosunu oluşturur
- Satır seviyesinde güvenlik politikalarını (RLS) ayarlar
- Gerekli indeksleri oluşturur
- `updated_at` alanını otomatik güncellemek için bir trigger oluşturur

### 2. Supabase CLI ile Migration Çalıştırma

```bash
supabase migration up
```

## Kullanım

### Görevler Sayfasına Erişim

Görevler sayfasına `/tasks` URL'si üzerinden erişebilirsiniz. Ana menüde "Görevlerim" seçeneği bulunmaktadır.

### Görev Ekleme

1. "Görev Ekle" butonuna tıklayın
2. Görev başlığı, açıklaması, önceliği, son tarihi ve etiketlerini girin
3. "Görev Ekle" butonuna tıklayarak görevi kaydedin

### Görev Düzenleme

1. Düzenlemek istediğiniz görevin sağ üst köşesindeki menü simgesine tıklayın
2. "Düzenle" seçeneğini seçin
3. Görev bilgilerini güncelleyin
4. "Kaydet" butonuna tıklayın

### Görev Durumunu Değiştirme

1. Görevin sağ üst köşesindeki menü simgesine tıklayın
2. "Durum Değiştir" altından istediğiniz durumu seçin:
   - Bekliyor
   - Devam Ediyor
   - Tamamlandı

### Görev Silme

1. Görevin sağ üst köşesindeki menü simgesine tıklayın
2. "Sil" seçeneğini seçin
3. Onay isteğini kabul edin

## Geliştirici Notları

### Veri Modeli

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'in-progress' | 'todo' | 'completed';
  tags: string[];
  user_id?: string;
  created_at?: string;
}
```

### API Servisi

`taskService` aşağıdaki metodları sağlar:

- `getUserTasks(userId: string)`: Kullanıcının görevlerini getirir
- `createTask(taskData: CreateTaskDTO)`: Yeni görev oluşturur
- `updateTask(taskId: string, taskData: UpdateTaskDTO)`: Görevi günceller
- `deleteTask(taskId: string)`: Görevi siler
- `updateTaskStatus(taskId: string, status: string)`: Görev durumunu günceller
- `updateTaskPriority(taskId: string, priority: string)`: Görev önceliğini günceller

## Sorun Giderme

### Yaygın Hatalar

1. **Görevler Yüklenmiyor**: Supabase bağlantınızı kontrol edin ve konsol hatalarına bakın
2. **Görev Eklenemiyor**: Kullanıcı oturumunuzun aktif olduğundan emin olun
3. **RLS Hataları**: Supabase politikalarının doğru yapılandırıldığından emin olun

### Hata Ayıklama

Tarayıcı konsolunda hataları kontrol edin ve gerekirse Supabase konsolunda sorguları izleyin.

## Gelecek Geliştirmeler

- Görevleri sürükle-bırak ile yeniden sıralama
- Görevleri kategorilere ayırma
- Görev hatırlatıcıları ve bildirimler
- Görev atama ve paylaşma özellikleri
- Görev istatistikleri ve raporlama 