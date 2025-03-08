#!/usr/bin/env node

/**
 * Supabase Migration Runner
 * 
 * Bu script, Supabase CLI kullanarak migration'ları çalıştırır.
 * Windows ve PowerShell uyumlu olarak tasarlanmıştır.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES modules için __dirname tanımla
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Proje kök dizini
const projectRoot = path.resolve(__dirname, '..');

// Migration dizini
const migrationsDir = path.join(projectRoot, 'supabase', 'migrations');

// Supabase CLI komutları
const commands = {
  // Migration'ları çalıştır
  runMigrations: {
    cmd: 'supabase',
    args: ['migration', 'up'],
    description: 'Tüm migration\'ları çalıştır'
  },
  // Migration durumunu kontrol et
  checkStatus: {
    cmd: 'supabase',
    args: ['migration', 'list'],
    description: 'Migration durumunu kontrol et'
  },
  // Yeni migration oluştur
  createMigration: {
    cmd: 'supabase',
    args: ['migration', 'new'],
    description: 'Yeni migration oluştur'
  }
};

// PowerShell'de komut çalıştırma
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Çalıştırılıyor: ${command} ${args.join(' ')}`);
    
    // Windows'ta PowerShell kullanarak çalıştır
    const isWindows = process.platform === 'win32';
    let spawnCmd, spawnArgs;
    
    if (isWindows) {
      // Windows'ta doğrudan komut çalıştır
      spawnCmd = command;
      spawnArgs = args;
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

// Migration'ları kontrol et
async function checkMigrations() {
  try {
    // Migration dizininin varlığını kontrol et
    if (!fs.existsSync(migrationsDir)) {
      console.log('Migration dizini bulunamadı, oluşturuluyor...');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Migration dosyalarını kontrol et
    const files = fs.readdirSync(migrationsDir);
    console.log(`${files.length} migration dosyası bulundu.`);
    
    // Migration durumunu kontrol et
    await runCommand(commands.checkStatus.cmd, commands.checkStatus.args);
    
    return files.length > 0;
  } catch (error) {
    console.error('Migration kontrolü sırasında hata:', error);
    return false;
  }
}

// Migration'ları çalıştır
async function runMigrations() {
  try {
    const hasMigrations = await checkMigrations();
    
    if (!hasMigrations) {
      console.log('Çalıştırılacak migration bulunamadı.');
      return;
    }
    
    console.log('Migration\'lar çalıştırılıyor...');
    await runCommand(commands.runMigrations.cmd, commands.runMigrations.args);
    
    console.log('Migration\'lar başarıyla tamamlandı!');
  } catch (error) {
    console.error('Migration çalıştırılırken hata:', error);
    process.exit(1);
  }
}

// Ana fonksiyon
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await checkMigrations();
      break;
    case 'create':
      const migrationName = process.argv[3];
      if (!migrationName) {
        console.error('Migration adı belirtilmedi. Kullanım: node run-migrations.js create <migration-name>');
        process.exit(1);
      }
      await runCommand(commands.createMigration.cmd, [...commands.createMigration.args, migrationName]);
      break;
    case 'run':
    default:
      await runMigrations();
      break;
  }
}

// Scripti çalıştır
main().catch(error => {
  console.error('Beklenmeyen hata:', error);
  process.exit(1);
}); 