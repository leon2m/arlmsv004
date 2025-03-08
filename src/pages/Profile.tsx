import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { userService, UserProfile } from '@/services/userService';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        if (!user) return;

        const userProfile = await userService.getUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          toast({
            title: "Profil yüklenemedi",
            description: "Profil bilgileriniz yüklenirken bir hata oluştu.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        toast({
          title: "Profil yüklenemedi",
          description: "Profil bilgileriniz yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, toast]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    
    if (!profile || !user) return;
    
    try {
      setSaving(true);
      
      // userService ile profil güncelleme
      const updatedProfile = await userService.updateUserProfile(user.id, {
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        company: profile.company,
        role: profile.role,
        bio: profile.bio
      });
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({
          title: "Profil güncellendi",
          description: "Profil bilgileriniz başarıyla güncellendi.",
        });
      } else {
        toast({
          title: "Profil güncellenemedi",
          description: "Profil bilgileriniz güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      toast({
        title: "Profil güncellenemedi",
        description: "Profil bilgileriniz güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    try {
      setSaving(true);
      
      // Dosya yükleme işlemi
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        throw uploadError;
      }
      
      const avatarUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
      
      // userService ile avatar güncelleme
      const updatedProfile = await userService.updateUserProfile(user.id, {
        avatar_url: avatarUrl
      });
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({
          title: "Profil fotoğrafı güncellendi",
          description: "Profil fotoğrafınız başarıyla güncellendi.",
        });
      }
    } catch (error) {
      console.error('Avatar güncellenirken hata:', error);
      toast({
        title: "Profil fotoğrafı güncellenemedi",
        description: "Profil fotoğrafınız güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <LucideIcons.Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Profil Bilgilerim</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profil fotoğrafı" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <LucideIcons.Camera className="h-12 w-12 text-primary/40" />
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer">
                <LucideIcons.Camera className="h-4 w-4" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                  disabled={saving}
                />
              </label>
            </div>
            <h2 className="text-xl font-semibold">{profile?.full_name || 'İsimsiz Kullanıcı'}</h2>
            <p className="text-gray-500">{profile?.role || 'Rol belirtilmemiş'}</p>
          </div>
        </Card>
        
        <Card className="p-6 col-span-1 md:col-span-2">
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">E-posta</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <LucideIcons.Mail className="h-4 w-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    onChange={(e) => setProfile(profile ? { ...profile, email: e.target.value } : null)}
                    className="rounded-l-none"
                    disabled
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="full_name">Ad Soyad</Label>
                <Input
                  id="full_name"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(profile ? { ...profile, full_name: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <LucideIcons.Phone className="h-4 w-4" />
                  </span>
                  <Input
                    id="phone"
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile(profile ? { ...profile, phone: e.target.value } : null)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Adres</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <LucideIcons.MapPin className="h-4 w-4" />
                  </span>
                  <Input
                    id="address"
                    value={profile?.address || ''}
                    onChange={(e) => setProfile(profile ? { ...profile, address: e.target.value } : null)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="company">Şirket</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <LucideIcons.Building className="h-4 w-4" />
                  </span>
                  <Input
                    id="company"
                    value={profile?.company || ''}
                    onChange={(e) => setProfile(profile ? { ...profile, company: e.target.value } : null)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="role">Rol / Pozisyon</Label>
                <Input
                  id="role"
                  value={profile?.role || ''}
                  onChange={(e) => setProfile(profile ? { ...profile, role: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Hakkımda</Label>
                <textarea
                  id="bio"
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile(profile ? { ...profile, bio: e.target.value } : null)}
                  className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : 'Profili Güncelle'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
