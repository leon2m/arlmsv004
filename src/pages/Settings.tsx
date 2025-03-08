import React, { useState, useEffect } from 'react';
import { Save, Loader2, Sliders, Users, FileText, Link2, Database, Lock, Bell, Palette, Shield, User, Globe, Mail, Layout, BarChart, Key, MessageSquare, Camera, Phone, MapPin, Building } from 'lucide-react';
import { supabase } from '../services/api';
import { SectionCard } from '@/components/Settings/SectionCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '@/services/userService';

// Ayarlar sekmeleri
const settingsTabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'preferences', label: 'Tercihler', icon: Sliders },
  { id: 'notifications', label: 'Bildirimler', icon: Bell },
  { id: 'appearance', label: 'Görünüm', icon: Palette },
  { id: 'security', label: 'Güvenlik', icon: Lock },
  { id: 'system', label: 'Sistem Ayarları', icon: Database, adminOnly: true },
  { id: 'integrations', label: 'Entegrasyonlar', icon: Link2, adminOnly: true },
];

// Tercihler bölümü ayarları
const preferencesSettings: SettingsSection[] = [
  {
    id: 'general',
    title: 'Genel Tercihler',
    icon: Globe,
    adminOnly: false,
    fields: [
      { id: 'language', label: 'Dil', type: 'select', options: ['Türkçe', 'English'] },
      { id: 'timezone', label: 'Zaman Dilimi', type: 'select', options: ['(GMT+03:00) İstanbul', '(GMT+00:00) UTC', '(GMT-05:00) New York'] },
      { id: 'dateFormat', label: 'Tarih Formatı', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
      { id: 'startPage', label: 'Başlangıç Sayfası', type: 'select', options: ['Dashboard', 'Kurslarım', 'Takvim'] }
    ]
  },
  {
    id: 'accessibility',
    title: 'Erişilebilirlik',
    icon: Users,
    adminOnly: false,
    fields: [
      { id: 'highContrast', label: 'Yüksek Kontrast', type: 'toggle' },
      { id: 'largeText', label: 'Büyük Yazı Tipi', type: 'toggle' },
      { id: 'reducedMotion', label: 'Azaltılmış Hareket', type: 'toggle' },
      { id: 'screenReader', label: 'Ekran Okuyucu Uyumluluğu', type: 'toggle' }
    ]
  }
];

// Bildirim ayarları
const notificationSettings: SettingsSection[] = [
  {
    id: 'emailNotifications',
    title: 'E-posta Bildirimleri',
    icon: Mail,
    adminOnly: false,
    fields: [
      { id: 'courseUpdates', label: 'Kurs Güncellemeleri', type: 'toggle' },
      { id: 'assignments', label: 'Ödev Bildirimleri', type: 'toggle' },
      { id: 'messages', label: 'Mesaj Bildirimleri', type: 'toggle' },
      { id: 'systemAnnouncements', label: 'Sistem Duyuruları', type: 'toggle' }
    ]
  },
  {
    id: 'pushNotifications',
    title: 'Anlık Bildirimler',
    icon: Bell,
    adminOnly: false,
    fields: [
      { id: 'newMessages', label: 'Yeni Mesajlar', type: 'toggle' },
      { id: 'deadlineReminders', label: 'Son Tarih Hatırlatıcıları', type: 'toggle' },
      { id: 'courseNotifications', label: 'Kurs Bildirimleri', type: 'toggle' },
      { id: 'loginAlerts', label: 'Giriş Uyarıları', type: 'toggle' }
    ]
  }
];

// Görünüm ayarları
const appearanceSettings: SettingsSection[] = [
  {
    id: 'theme',
    title: 'Tema Ayarları',
    icon: Palette,
    adminOnly: false,
    fields: [
      { id: 'colorTheme', label: 'Renk Teması', type: 'select', options: ['Sistem', 'Açık', 'Koyu', 'Mavi', 'Yeşil'] },
      { id: 'fontFamily', label: 'Yazı Tipi', type: 'select', options: ['System', 'Roboto', 'Open Sans', 'Montserrat'] },
      { id: 'fontSize', label: 'Yazı Boyutu', type: 'select', options: ['Küçük', 'Normal', 'Büyük'] },
      { id: 'compactMode', label: 'Kompakt Mod', type: 'toggle' }
    ]
  },
  {
    id: 'layout',
    title: 'Düzen Ayarları',
    icon: Layout,
    adminOnly: false,
    fields: [
      { id: 'sidebarPosition', label: 'Kenar Çubuğu Pozisyonu', type: 'select', options: ['Sol', 'Sağ'] },
      { id: 'menuCollapsed', label: 'Menü Daraltılmış Başlat', type: 'toggle' },
      { id: 'showBreadcrumbs', label: 'Gezinti Yolunu Göster', type: 'toggle' },
      { id: 'denseLayout', label: 'Yoğun Düzen', type: 'toggle' }
    ]
  }
];

// Güvenlik ayarları
const securitySettings: SettingsSection[] = [
  {
    id: 'accountSecurity',
    title: 'Hesap Güvenliği',
    icon: Lock,
    adminOnly: false,
    fields: [
      { id: 'twoFactorAuth', label: 'İki Faktörlü Kimlik Doğrulama', type: 'toggle' },
      { id: 'sessionTimeout', label: 'Oturum Zaman Aşımı (dakika)', type: 'number' },
      { id: 'loginNotifications', label: 'Giriş Bildirimleri', type: 'toggle' },
      { id: 'passwordChangeReminder', label: 'Şifre Değiştirme Hatırlatıcısı (gün)', type: 'number' }
    ]
  },
  {
    id: 'privacy',
    title: 'Gizlilik Ayarları',
    icon: Shield,
    adminOnly: false,
    fields: [
      { id: 'profileVisibility', label: 'Profil Görünürlüğü', type: 'select', options: ['Herkes', 'Sadece Kurslarım', 'Sadece Yöneticiler'] },
      { id: 'activityTracking', label: 'Aktivite İzleme', type: 'toggle' },
      { id: 'dataSharing', label: 'Veri Paylaşımı', type: 'toggle' },
      { id: 'cookiePreferences', label: 'Çerez Tercihleri', type: 'select', options: ['Tümü', 'Gerekli', 'Hiçbiri'] }
    ]
  }
];

// Sistem ayarları (sadece admin)
const systemSettings: SettingsSection[] = [
  {
    id: 'general',
    title: 'Genel Sistem Ayarları',
    icon: Sliders,
    adminOnly: true,
    fields: [
      { id: 'siteTitle', label: 'Site Başlığı', type: 'text' },
      { id: 'defaultLanguage', label: 'Varsayılan Dil', type: 'select', options: ['tr', 'en'] },
      { id: 'timezone', label: 'Zaman Dilimi', type: 'text' },
      { id: 'maintenanceMode', label: 'Bakım Modu', type: 'toggle' }
    ]
  },
  {
    id: 'users',
    title: 'Kullanıcı Yönetimi',
    icon: Users,
    adminOnly: true,
    fields: [
      { id: 'userRegistration', label: 'Kullanıcı Kaydı', type: 'toggle' },
      { id: 'defaultRole', label: 'Varsayılan Rol', type: 'select', options: ['user', 'admin'] },
      { id: 'autoApprove', label: 'Otomatik Onay', type: 'toggle' },
      { id: 'maxLoginAttempts', label: 'Maksimum Giriş Denemesi', type: 'number' }
    ]
  },
  {
    id: 'content',
    title: 'İçerik Ayarları',
    icon: FileText,
    adminOnly: true,
    fields: [
      { id: 'maxFileSize', label: 'Maksimum Dosya Boyutu (MB)', type: 'number' },
      { id: 'allowedFileTypes', label: 'İzin Verilen Dosya Türleri', type: 'text' },
      { id: 'autoBackup', label: 'Otomatik Yedekleme', type: 'toggle' },
      { id: 'contentApproval', label: 'İçerik Onayı Gerekli', type: 'toggle' }
    ]
  }
];

// Entegrasyon ayarları (sadece admin)
const integrationSettings: SettingsSection[] = [
  {
    id: 'analytics',
    title: 'Analitik Entegrasyonları',
    icon: BarChart,
    adminOnly: true,
    fields: [
      { id: 'googleAnalyticsId', label: 'Google Analytics ID', type: 'text' },
      { id: 'matomoUrl', label: 'Matomo URL', type: 'text' },
      { id: 'matomoSiteId', label: 'Matomo Site ID', type: 'number' },
      { id: 'enableAnalytics', label: 'Analitik Etkin', type: 'toggle' }
    ]
  },
  {
    id: 'authentication',
    title: 'Kimlik Doğrulama Entegrasyonları',
    icon: Key,
    adminOnly: true,
    fields: [
      { id: 'ssoEnabled', label: 'SSO Aktif', type: 'toggle' },
      { id: 'googleAuth', label: 'Google ile Giriş', type: 'toggle' },
      { id: 'microsoftAuth', label: 'Microsoft ile Giriş', type: 'toggle' },
      { id: 'ldapIntegration', label: 'LDAP Entegrasyonu', type: 'toggle' }
    ]
  },
  {
    id: 'communication',
    title: 'İletişim Entegrasyonları',
    icon: MessageSquare,
    adminOnly: true,
    fields: [
      { id: 'smtpServer', label: 'SMTP Sunucu', type: 'text' },
      { id: 'smtpPort', label: 'SMTP Port', type: 'number' },
      { id: 'smtpUser', label: 'SMTP Kullanıcı', type: 'text' },
      { id: 'smsProvider', label: 'SMS Sağlayıcı', type: 'select', options: ['Twilio', 'Nexmo', 'Custom'] }
    ]
  }
];

// Profil türü tanımı
interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  company: string | null;
  role: string | null;
  bio: string | null;
}

// Field tipi tanımı
interface SettingsField {
  id: string;
  label: string;
  type: string;
  options?: string[];
}

// Section tipi tanımı
interface SettingsSection {
  id: string;
  title: string;
  icon: React.ElementType;
  adminOnly: boolean;
  fields: SettingsField[];
}

export const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'superadmin'>('user');
  const [settings, setSettings] = useState<any>({});
  const { user } = useAuth();
  const { toast } = useToast();

  // Profil bilgileri için state
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    checkUserRole();
    fetchSettings();
    // Profil bilgilerini yükle
    if (activeTab === 'profile') {
      loadProfile();
    }
  }, []);

  // URL değiştiğinde sekmeyi güncelle
  useEffect(() => {
    // URL'den aktif sekmeyi belirle
    const path = location.pathname;
    if (path.includes('/settings/profile')) {
      setActiveTab('profile');
    } else if (path.includes('/settings/notifications')) {
      setActiveTab('notifications');
    } else if (path.includes('/settings/security')) {
      setActiveTab('security');
    } else if (path.includes('/settings/appearance')) {
      setActiveTab('appearance');
    } else {
      setActiveTab('profile');
      navigate('/settings/profile');
    }
  }, [location, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const profile = await userService.getUserProfile(user.id);
      if (!profile) throw new Error('Profile not found');
      setProfile(profile);
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      toast({
        title: "Hata",
        description: "Profil bilgileri yüklenemedi",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          company: profile.company,
          role: profile.role,
          bio: profile.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast({
        title: "Başarılı",
        description: "Profil başarıyla güncellendi",
        variant: "default"
      });
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      toast({
        title: "Hata",
        description: "Profil güncellenemedi",
        variant: "destructive"
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Dosya adını benzersiz yap
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}${fileExt ? `.${fileExt}` : ''}`;
      const filePath = `avatars/${fileName}`;

      // Dosyayı yükle
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Profili güncelle
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // State'i güncelle
      setProfile(prev => prev ? { ...prev, avatar_url: filePath } : null);
      toast({
        title: "Başarılı",
        description: "Profil fotoğrafı güncellendi",
        variant: "default"
      });
    } catch (error) {
      console.error('Profil fotoğrafı güncellenirken hata:', error);
      toast({
        title: "Hata",
        description: "Profil fotoğrafı güncellenemedi",
        variant: "destructive"
      });
    }
  };

  const checkUserRole = async () => {
    try {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role || 'user');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data.settings || {});
      } else {
        // Kullanıcı ayarları yoksa varsayılan ayarları oluştur
        const defaultSettings = {
          preferences: {
            general: {
              language: 'Türkçe',
              timezone: '(GMT+03:00) İstanbul',
              dateFormat: 'DD/MM/YYYY',
              startPage: 'Dashboard'
            },
            accessibility: {
              highContrast: false,
              largeText: false,
              reducedMotion: false,
              screenReader: false
            }
          },
          notifications: {
            emailNotifications: {
              courseUpdates: true,
              assignments: true,
              messages: true,
              systemAnnouncements: true
            },
            pushNotifications: {
              newMessages: true,
              deadlineReminders: true,
              courseNotifications: true,
              loginAlerts: true
            }
          },
          appearance: {
            theme: {
              colorTheme: 'Sistem',
              fontFamily: 'System',
              fontSize: 'Normal',
              compactMode: false
            },
            layout: {
              sidebarPosition: 'Sol',
              menuCollapsed: false,
              showBreadcrumbs: true,
              denseLayout: false
            }
          },
          security: {
            accountSecurity: {
              twoFactorAuth: false,
              sessionTimeout: 30,
              loginNotifications: true,
              passwordChangeReminder: 90
            },
            privacy: {
              profileVisibility: 'Herkes',
              activityTracking: true,
              dataSharing: true,
              cookiePreferences: 'Tümü'
            }
          }
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Hata",
        description: "Ayarlar yüklenirken hata oluştu!",
        variant: "destructive"
      });
    }
  };

  const handleSave = async (sectionId: string, categoryId: string, updatedSettings: any) => {
    setIsLoading(true);
    try {
      // Mevcut ayarları güncelle
      const newSettings = {
        ...settings,
        [activeTab]: {
          ...settings[activeTab],
          [sectionId]: {
            ...settings[activeTab]?.[sectionId],
            ...updatedSettings
          }
        }
      };
      
      setSettings(newSettings);
      
      // Veritabanına kaydet
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          settings: newSettings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      if (error) throw error;
      toast({
        title: "Başarılı",
        description: "Ayarlar başarıyla kaydedildi!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken hata oluştu!",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Aktif sekmeye göre ayarları getir
  const getSettingsForActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return null; // Profil sayfası ayrı bir bileşen
      case 'preferences':
        return preferencesSettings;
      case 'notifications':
        return notificationSettings;
      case 'appearance':
        return appearanceSettings;
      case 'security':
        return securitySettings;
      case 'system':
        return systemSettings;
      case 'integrations':
        return integrationSettings;
      default:
        return [];
    }
  };

  // Sekmeyi değiştirme fonksiyonu
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/settings/${tab}`);
  };

  // Sekme içeriğini render et
  const renderTabContent = () => {
    if (activeTab === 'profile') {
      if (profileLoading) {
        return (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        );
      }

      if (!profile) {
        return (
          <div className="mt-6">
            <Card className="p-6">
              <p className="text-center text-gray-600">
                Profil bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.
              </p>
            </Card>
          </div>
        );
      }

      return (
        <div className="mt-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Profil Bilgileri</h3>
                <p className="text-sm text-gray-500">Kişisel bilgilerinizi güncelleyin</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  id="avatar"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <label
                  htmlFor="avatar"
                  className="cursor-pointer flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </label>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Ad Soyad</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="phone"
                      name="phone"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="address"
                      name="address"
                      value={profile.address || ''}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Şirket</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="company"
                      name="company"
                      value={profile.company || ''}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Pozisyon</Label>
                  <Input
                    id="role"
                    value={profile.role || ''}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Hakkımda</Label>
                <Input
                  id="bio"
                  name="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={profileSaving}>
                  {profileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Değişiklikleri Kaydet
                </Button>
              </div>
            </form>
          </Card>
        </div>
      );
    }

    const currentSettings = getSettingsForActiveTab();
    
    if (!currentSettings) return null;
    
    return (
      <div className="space-y-8 mt-6">
        {currentSettings.map((section) => {
          // Admin kontrolü
          if (section.adminOnly && userRole !== 'admin' && userRole !== 'superadmin') {
            return null;
          }

          return (
            <Card key={section.id} className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <section.icon className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-medium text-gray-900">
                  {section.title}
                </h3>
              </div>

              <div className="space-y-6">
                {section.fields.map((field) => (
                  <div key={field.id} className="flex flex-col">
                    <label
                      htmlFor={field.id}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {field.label}
                    </label>

                    {field.type === 'toggle' ? (
                      <button
                        type="button"
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          settings[activeTab]?.[section.id]?.[field.id] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        onClick={() => {
                          const newValue = !settings[activeTab]?.[section.id]?.[field.id];
                          handleSave(section.id, activeTab, { [field.id]: newValue });
                        }}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            settings[activeTab]?.[section.id]?.[field.id] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    ) : field.type === 'select' ? (
                      <select
                        id={field.id}
                        value={settings[activeTab]?.[section.id]?.[field.id] || ''}
                        onChange={(e) => handleSave(section.id, activeTab, { [field.id]: e.target.value })}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        {field.options && field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        id={field.id}
                        value={settings[activeTab]?.[section.id]?.[field.id] || ''}
                        onChange={(e) => {
                          const value = field.type === 'number' ? Number(e.target.value) : e.target.value;
                          handleSave(section.id, activeTab, { [field.id]: value });
                        }}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Ayarlar</h1>
        {activeTab !== 'profile' && (
          <Button
            onClick={() => handleSave('all', activeTab, settings[activeTab])}
            disabled={isLoading}
            className="inline-flex items-center"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Değişiklikleri Kaydet
          </Button>
        )}
      </div>

      {/* Sekmeler */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {settingsTabs.map((tab) => {
            // Admin kontrolü
            if (tab.adminOnly && userRole !== 'admin' && userRole !== 'superadmin') {
              return null;
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sekme içeriği */}
      {renderTabContent()}
    </div>
  );
}

export default Settings;