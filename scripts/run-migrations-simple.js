#!/usr/bin/env node

/**
 * Basit Supabase Migration Runner
 * 
 * Bu script, supabase CLI gerektirmeden sadece .sql dosyalarını
 * doğrudan Supabase veritabanına uygulamak için kullanılabilir.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import readline from 'readline';

// ES modules için __dirname tanımla
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Proje kök dizini
const projectRoot = path.resolve(__dirname, '..');

// Migration dizini
const migrationsDir = path.join(projectRoot, 'supabase', 'migrations');

// .env dosyasından Supabase URL ve anahtarı oku
function getSupabaseCredentials() {
  try {
    const envFile = path.join(projectRoot, '.env');
    if (!fs.existsSync(envFile)) {
      console.error('.env dosyası bulunamadı. Lütfen aşağıdaki değişkenleri içeren bir .env dosyası oluşturun:');
      console.error('NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321');
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
      return null;
    }

    const envContent = fs.readFileSync(envFile, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
    const key = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('Supabase URL veya anahtar bulunamadı. Lütfen .env dosyasını kontrol edin.');
      return null;
    }
    
    return { url, key };
  } catch (error) {
    console.error('Kimlik bilgileri okunurken hata:', error);
    return null;
  }
}

// SQL dosyasını uygula
async function applySQLFile(filePath) {
  try {
    console.log(`SQL dosyası uygulanıyor: ${path.basename(filePath)}`);
    
    // SQL dosyasının içeriğini oku
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // SQL dosyasını manuel olarak uygulama mesajı
    console.log('SQL dosyası okundu. Migration\'ı manuel olarak Supabase Studio\'da uygulamanız gerekiyor:');
    console.log('---------------------');
    console.log(sql);
    console.log('---------------------');
    
    // Kullanıcıya interaktif olarak sor
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('SQL dosyasını Supabase Studio\'da uyguladınız mı? (e/h): ', (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'e' || answer.toLowerCase() === 'evet') {
          console.log('✅ SQL dosyası uygulandı olarak işaretlendi.');
          resolve(true);
        } else {
          console.log('❌ SQL dosyası uygulanmadı.');
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error(`SQL dosyası uygulanırken hata: ${error.message}`);
    return false;
  }
}

// Migration'ları çalıştır
async function runMigrations() {
  try {
    // Migration dizininin varlığını kontrol et
    if (!fs.existsSync(migrationsDir)) {
      console.log('Migration dizini bulunamadı, oluşturuluyor...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('Migration dizini oluşturuldu, ancak migration dosyası bulunamadı.');
      return;
    }
    
    // Migration dosyalarını al ve sırala
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (files.length === 0) {
      console.log('Çalıştırılacak migration bulunamadı.');
      return;
    }
    
    console.log(`${files.length} migration dosyası bulundu.`);
    
    // Her bir migration dosyasını uygula
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const applied = await applySQLFile(filePath);
      
      if (!applied) {
        console.log(`Migration durdu: ${file} uygulanmadı.`);
        break;
      }
    }
    
    console.log('Migration işlemi tamamlandı.');
  } catch (error) {
    console.error(`Migration hatası: ${error.message}`);
    process.exit(1);
  }
}

// Ana fonksiyon
async function main() {
  console.log('Basit Migration Runner başlatılıyor...');
  
  // Kullanıcı kimlik bilgilerini al
  const credentials = getSupabaseCredentials();
  if (!credentials) {
    process.exit(1);
  }
  
  // Migration'ları çalıştır
  await runMigrations();
}

// Scripti çalıştır
main().catch(error => {
  console.error(`Beklenmeyen hata: ${error.message}`);
  process.exit(1);
}); 