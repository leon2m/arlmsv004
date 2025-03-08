#!/usr/bin/env node

/**
 * Supabase Kurulum Yardımcısı
 * 
 * Bu script, Supabase projesinin kurulumunu kolaylaştırır.
 * Windows ve PowerShell uyumlu olarak tasarlanmıştır.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';

// ES modules için __dirname tanımla
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Proje kök dizini
const projectRoot = path.resolve(__dirname, '..');

// Supabase dizini
const supabaseDir = path.join(projectRoot, 'supabase');

// Supabase CLI komutları
const commands = {
  // Supabase projesini başlat
  init: {
    cmd: 'supabase',
    args: ['init'],
    description: 'Supabase projesini başlat'
  },
  // Yerel Supabase'i başlat
  start: {
    cmd: 'supabase',
    args: ['start'],
    description: 'Yerel Supabase\'i başlat'
  },
  // Migration'ları çalıştır
  runMigrations: {
    cmd: 'node',
    args: ['scripts/run-migrations.js'],
    description: 'Migration\'ları çalıştır'
  },
  // Supabase durumunu kontrol et
  status: {
    cmd: 'supabase',
    args: ['status'],
    description: 'Supabase durumunu kontrol et'
  }
};

// Kullanıcı girişi için readline arayüzü
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// PowerShell'de komut çalıştırma
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Çalıştırılıyor: ${command} ${args.join(' ')}`);
    
    // Windows'ta PowerShell kullanarak çalıştır
    const isWindows = process.platform === 'win32';
    let spawnCmd, spawnArgs;
    
    if (isWindows) {
      spawnCmd = 'powershell.exe';
      spawnArgs = ['-Command', `& {${command} ${args.join(' ')}}`];
    } else {
      spawnCmd = command;
      spawnArgs = args;
    }
    
    const proc = spawn(spawnCmd, spawnArgs, {
      cwd: projectRoot,
      shell: true,
      ...options
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(output);
    });
    
    proc.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error(output);
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Komut başarısız oldu (${code}): ${stderr}`));
      }
    });
  });
}

// Kullanıcı onayı için sorma
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Supabase CLI kurulu mu kontrol et
async function checkSupabaseCLI() {
  try {
    await runCommand('supabase', ['--version']);
    console.log('✅ Supabase CLI kurulu.\n');
    return true;
  } catch (error) {
    console.error('❌ Supabase CLI kurulu değil veya PATH\'de bulunamıyor.');
    console.log('\nKurulum talimatları için: https://supabase.com/docs/guides/cli/getting-started');
    
    if (process.platform === 'win32') {
      console.log('\nWindows için kurulum:');
      console.log('1. PowerShell\'i yönetici olarak açın');
      console.log('2. Çalıştırın: scoop install supabase');
      console.log('   veya');
      console.log('2. Çalıştırın: choco install supabase-cli');
    } else {
      console.log('\nMac için kurulum:');
      console.log('Çalıştırın: brew install supabase/tap/supabase');
    }
    
    return false;
  }
}

// Supabase projesini başlat
async function initSupabase() {
  try {
    // Supabase dizini varsa
    if (fs.existsSync(supabaseDir)) {
      console.log('Supabase dizini zaten mevcut.');
      const answer = await askQuestion('Yeniden başlatmak ister misiniz? (e/h): ');
      
      if (answer === 'e' || answer === 'evet') {
        console.log('Supabase projesini yeniden başlatma...');
        await runCommand(commands.init.cmd, commands.init.args);
        console.log('✅ Supabase projesi başlatıldı.\n');
      } else {
        console.log('Supabase projesi başlatılmadı.\n');
      }
    } else {
      console.log('Supabase projesini başlatma...');
      await runCommand(commands.init.cmd, commands.init.args);
      console.log('✅ Supabase projesi başlatıldı.\n');
    }
    return true;
  } catch (error) {
    console.error(`❌ Supabase projesi başlatılamadı: ${error.message}`);
    return false;
  }
}

// Yerel Supabase'i başlat
async function startSupabase() {
  try {
    console.log('Yerel Supabase\'i başlatma...');
    await runCommand(commands.start.cmd, commands.start.args);
    console.log('✅ Yerel Supabase başlatıldı.\n');
    return true;
  } catch (error) {
    console.error(`❌ Yerel Supabase başlatılamadı: ${error.message}`);
    return false;
  }
}

// Migration'ları çalıştır
async function runMigrations() {
  try {
    console.log('Migration\'ları çalıştırma...');
    await runCommand(commands.runMigrations.cmd, commands.runMigrations.args);
    console.log('✅ Migration\'lar başarıyla çalıştırıldı.\n');
    return true;
  } catch (error) {
    console.error(`❌ Migration\'lar çalıştırılamadı: ${error.message}`);
    return false;
  }
}

// Supabase durumunu kontrol et
async function checkSupabaseStatus() {
  try {
    console.log('Supabase durumunu kontrol etme...');
    await runCommand(commands.status.cmd, commands.status.args);
    console.log('✅ Supabase durumu kontrol edildi.\n');
    return true;
  } catch (error) {
    console.error(`❌ Supabase durumu kontrol edilemedi: ${error.message}`);
    return false;
  }
}

// Kurulum talimatlarını göster
function displaySetupInstructions() {
  console.log('\n=== Supabase Kurulum Talimatları ===');
  console.log('1. Supabase CLI\'yi yükleyin:');
  console.log('   - Windows: scoop install supabase veya choco install supabase-cli');
  console.log('   - Mac: brew install supabase/tap/supabase');
  console.log('\n2. Scripti çalıştırın: npm run db:setup');
  console.log('\n3. .env dosyasını oluşturun:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=(Supabase başlatıldığında gösterilen anahtar)');
  console.log('\n4. Uygulamayı başlatın: npm run dev');
  console.log('\n===============================\n');
}

// Ana fonksiyon
async function main() {
  console.log('\n=== Supabase Kurulum Yardımcısı ===\n');
  
  // Supabase CLI kurulu mu kontrol et
  const hasSupabaseCLI = await checkSupabaseCLI();
  if (!hasSupabaseCLI) {
    displaySetupInstructions();
    rl.close();
    return;
  }
  
  // Kurulum adımlarını göster
  console.log('\nKurulum adımları:');
  console.log('1. Supabase projesini başlat');
  console.log('2. Yerel Supabase\'i başlat');
  console.log('3. Migration\'ları çalıştır');
  console.log('4. Supabase durumunu kontrol et\n');
  
  const answer = await askQuestion('Kuruluma devam etmek istiyor musunuz? (e/h): ');
  
  if (answer === 'e' || answer === 'evet') {
    // Supabase projesini başlat
    const initSuccess = await initSupabase();
    if (!initSuccess) {
      rl.close();
      return;
    }
    
    // Yerel Supabase'i başlat
    const startSuccess = await startSupabase();
    if (!startSuccess) {
      rl.close();
      return;
    }
    
    // Migration'ları çalıştır
    const migrationsSuccess = await runMigrations();
    if (!migrationsSuccess) {
      rl.close();
      return;
    }
    
    // Supabase durumunu kontrol et
    await checkSupabaseStatus();
    
    console.log('\n✅ Supabase kurulumu tamamlandı!');
    console.log('\nŞimdi .env dosyasını oluşturun ve uygulamayı başlatın:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=(Supabase başlatıldığında gösterilen anahtar)');
  } else {
    console.log('\nKurulum iptal edildi.');
    displaySetupInstructions();
  }
  
  rl.close();
}

// Programı çalıştır
main().catch(error => {
  console.error(`Kurulum hatası: ${error.message}`);
  rl.close();
  process.exit(1);
}); 