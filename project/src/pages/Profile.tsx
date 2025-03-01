import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import { Loader2, Camera, Mail, Phone, MapPin, Building } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

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
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
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
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4">
        <Card className="p-6">
          <p className="text-center text-gray-600">
            Profil bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profil Bilgileri</h1>
            <p className="text-gray-600">Kişisel bilgilerinizi güncelleyin</p>
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
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input
                id="fullName"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="phone"
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
            <textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Değişiklikleri Kaydet
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
