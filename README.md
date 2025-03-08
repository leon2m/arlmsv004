# EğitimLMS - Öğrenme Yönetim Sistemi

Modern, kullanıcı dostu ve etkileşimli öğrenme yönetim sistemi. Kurslar, sınavlar, sertifikalar ve daha fazlasını yönetebilirsiniz.

## Bildirimler ve Mesajlar Hakkında

### Veritabanı Hatası Çözümü

Eğer bildirimler ve mesajlar bölümü ile ilgili 404 hatası alıyorsanız (notifications ve messages tabloları bulunamadı), aşağıdaki adımları izleyin:

1. Öncelikle bu tabloların veritabanında oluşturulması gerekiyor. Bunun için iki yöntem var:

### 1. Otomatik Kurulum

Bu script, gerekli tabloları otomatik olarak oluşturacak ve örnek veriler ekleyecektir:

```bash
# Supabase hizmet anahtarını ayarlayın (service role key)
export SUPABASE_SERVICE_KEY=eyJh...  # Supabase'den alınan servis anahtarı

# Kurulum scriptini çalıştırın
node src/setupDatabase.js
```

### 2. Manuel Kurulum

Otomatik kurulum çalışmazsa, aşağıdaki SQL kodunu Supabase SQL Editörü'nde çalıştırın:

```sql
-- Bildirimler tablosu oluşturma
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mesajlar tablosu oluşturma
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  sender_name VARCHAR(255),
  sender_avatar VARCHAR(255),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
```

## Kullanıcı Adı Gösterimi

Eğer kullanıcı adı olarak sadece "Kullanıcı" görünüyorsa, bunun nedeni aşağıdakilerden biri olabilir:

1. `user_profiles` tablosunda ilgili kullanıcı için `full_name` değeri boş olabilir
2. Oturum açma işlemi sırasında kullanıcı profil verileri düzgün alınmamış olabilir

Bunun için çözümler:

1. Kullanıcı profil bilgilerinizi güncelleyin:
   - Ayarlar > Profil menüsünden ad ve soyad bilgilerinizi güncelleyin
   
2. Oturumu kapatıp tekrar açın:
   - Çıkış yapın ve tekrar giriş yapın. Bu işlem profil verilerini yeniden yükleyecektir.

## Sistem Gereksinimleri

- Node.js 18.0 veya üstü
- Supabase hesabı
- Modern bir tarayıcı (Chrome, Firefox, Safari, Edge)

## Geliştirme

Geliştirme sunucusunu başlatmak için:

```bash
npm install
npm run dev
```

## Üretim

Üretim sürümü oluşturmak için:

```bash
npm run build
``` 