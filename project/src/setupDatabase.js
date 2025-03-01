/**
 * Veritabanı Kurulum Scripti
 * Bu script database.sql dosyasını okur ve Supabase'e gönderir.
 * 
 * Kullanım:
 * 1. Konsolu açın ve proje klasörüne gidin
 * 2. Aşağıdaki komutu çalıştırın:
 *    node setupDatabase.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase bağlantı bilgileri
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nhoicbtdhhppzhlwzjto.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // service_role anahtarı gerekli

// Anahtar yoksa uyarı ver
if (!SUPABASE_SERVICE_KEY) {
  console.error('\x1b[31mHata: SUPABASE_SERVICE_KEY çevre değişkeni ayarlanmamış!\x1b[0m');
  console.log('\x1b[33mÖrnek kullanım:\x1b[0m');
  console.log('SUPABASE_SERVICE_KEY=eyJh... node setupDatabase.js');
  process.exit(1);
}

// Supabase istemcisini oluştur
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// SQL dosyasını oku
const sqlFilePath = path.join(__dirname, 'lib', 'database.sql');
fs.readFile(sqlFilePath, 'utf8', async (err, sqlContent) => {
  if (err) {
    console.error('\x1b[31mSQL dosyası okunamadı:\x1b[0m', err);
    return;
  }

  console.log('\x1b[36mVeritabanı şeması kuruluyor...\x1b[0m');
  
  try {
    // SQL'i Supabase'de çalıştır
    const { data, error } = await supabase.rpc('exec_sql', {
      query_text: sqlContent
    });

    if (error) throw error;
    
    console.log('\x1b[32mVeritabanı başarıyla kuruldu!\x1b[0m');
    console.log('Şema oluşturma sonucu:', data);
    
    // Örnek veriler ekle
    await addSampleData();
  } catch (error) {
    if (error.message.includes('function "exec_sql" does not exist')) {
      console.error('\x1b[33mUyarı: "exec_sql" fonksiyonu bulunamadı. SQL Admin UI üzerinden manuel olarak SQL\'i çalıştırmanız gerekebilir.\x1b[0m');
      console.log('\x1b[36mSQL içeriği:\x1b[0m');
      console.log(sqlContent);
    } else {
      console.error('\x1b[31mVeritabanı kurulumu sırasında hata:\x1b[0m', error);
    }
  }
});

// Örnek veriler ekle
async function addSampleData() {
  console.log('\x1b[36mÖrnek bildirimler ve mesajlar ekleniyor...\x1b[0m');
  
  try {
    // Aktif kullanıcıyı getir
    const { data: userProfiles, error: userError } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .limit(1);
    
    if (userError) throw userError;
    
    if (!userProfiles || userProfiles.length === 0) {
      console.log('\x1b[33mKullanıcı profili bulunamadı, örnek veriler eklenemedi.\x1b[0m');
      return;
    }
    
    const userId = userProfiles[0].id;
    
    // Örnek bildirimler ekle
    const notifications = [
      {
        user_id: userId,
        title: 'Hoş Geldiniz',
        message: 'EğitimLMS sistemine hoş geldiniz!',
        type: 'info'
      },
      {
        user_id: userId,
        title: 'Yeni Kurs Eklendi',
        message: 'İlgilenebileceğiniz yeni "React ile Modern Web Uygulamaları" kursu eklendi.',
        type: 'success'
      },
      {
        user_id: userId,
        title: 'Sınavınız Var',
        message: 'Yarın "TypeScript Temelleri" kursunun final sınavı var.',
        type: 'warning'
      }
    ];
    
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (notificationError) {
      console.error('\x1b[31mBildirimler eklenirken hata:\x1b[0m', notificationError);
    } else {
      console.log('\x1b[32mÖrnek bildirimler başarıyla eklendi!\x1b[0m');
    }
    
    // Örnek mesajlar ekle
    const messages = [
      {
        sender_id: userId, // Kendine mesaj göndermek için örnek
        recipient_id: userId,
        message: 'Merhaba, nasıl yardımcı olabilirim?',
        sender_name: userProfiles[0].full_name,
        sender_avatar: '/images/avatars/admin.jpg'
      },
      {
        sender_id: userId,
        recipient_id: userId,
        message: 'Yeni eğitim materyalleriniz hazır, inceleyebilirsiniz.',
        sender_name: 'Sistem Yöneticisi',
        sender_avatar: '/images/avatars/system.jpg'
      }
    ];
    
    const { error: messageError } = await supabase
      .from('messages')
      .insert(messages);
    
    if (messageError) {
      console.error('\x1b[31mMesajlar eklenirken hata:\x1b[0m', messageError);
    } else {
      console.log('\x1b[32mÖrnek mesajlar başarıyla eklendi!\x1b[0m');
    }
    
  } catch (error) {
    console.error('\x1b[31mÖrnek veriler eklenirken hata:\x1b[0m', error);
  }
} 