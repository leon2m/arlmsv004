import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { ProfileDropdownProps } from './types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userService } from '@/services/userService';

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isDropdownOpen,
  setIsDropdownOpen,
  user,
  signOut
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = React.useState<any>(null);

  // Kullanıcı profil bilgilerini yükle
  React.useEffect(() => {
    async function loadUserProfile() {
      if (user?.id) {
        try {
          const profile = await userService.getUserProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Profil yüklenirken hata:', error);
        }
      }
    }
    
    loadUserProfile();
  }, [user]);

  // Dışarıya tıklama ile dropdown'ı kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsDropdownOpen]);

  const menuItems = [
    { 
      icon: <LucideIcons.User className="mr-2 h-4 w-4" />,
      label: 'Profilim',
      href: '/profile'
    },
    { 
      icon: <LucideIcons.Award className="mr-2 h-4 w-4" />,
      label: 'Başarılarım',
      href: '/achievements'
    },
    { 
      icon: <LucideIcons.BookOpen className="mr-2 h-4 w-4" />,
      label: 'Kurslarım',
      href: '/my-courses'
    },
    { 
      icon: <LucideIcons.BarChart className="mr-2 h-4 w-4" />,
      label: 'İlerleme Durumum',
      href: '/progress'
    },
    { 
      icon: <LucideIcons.Settings className="mr-2 h-4 w-4" />,
      label: 'Ayarlar',
      href: '/settings'
    }
  ];

  // Kullanıcı adını doğru şekilde oluştur
  const username = userProfile?.full_name || user?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
  const userEmail = user?.email || userProfile?.email || 'kullanici@example.com';
  const userAvatar = userProfile?.avatar_url || user?.avatar_url || '';
  
  // Kullanıcı adının baş harflerini al
  const userInitials = username
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border bg-muted/30",
          isDropdownOpen && "bg-muted"
        )}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        aria-label="Profil menüsü"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={userAvatar} alt={username} />
          <AvatarFallback className="bg-blue-600 text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={userAvatar} alt={username} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium text-gray-900">{username}</div>
                <div className="text-xs text-gray-500 truncate max-w-[180px]">{userEmail}</div>
              </div>
            </div>
          </div>

          <div className="py-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 px-4 py-2">
            <button
              className="flex w-full items-center text-sm text-red-600 hover:text-red-700"
              onClick={async () => {
                try {
                  setIsDropdownOpen(false);
                  await signOut();
                  // signOut fonksiyonu içinde yönlendirme yapıldığı için burada yapmaya gerek yok
                } catch (error) {
                  console.error('Çıkış yapılırken hata:', error);
                  // Hata durumunda kullanıcıya bilgi ver
                  alert('Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
                }
              }}
            >
              <LucideIcons.LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown; 