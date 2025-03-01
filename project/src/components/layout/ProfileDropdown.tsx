import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, Settings, BarChart, Award, BookOpen } from 'lucide-react';
import { ProfileDropdownProps } from './types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isDropdownOpen,
  setIsDropdownOpen,
  user,
  signOut
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      icon: <User className="mr-2 h-4 w-4" />,
      label: 'Profilim',
      href: '/profile'
    },
    { 
      icon: <Award className="mr-2 h-4 w-4" />,
      label: 'Başarılarım',
      href: '/achievements'
    },
    { 
      icon: <BookOpen className="mr-2 h-4 w-4" />,
      label: 'Kurslarım',
      href: '/my-courses'
    },
    { 
      icon: <BarChart className="mr-2 h-4 w-4" />,
      label: 'İlerleme Durumum',
      href: '/progress'
    },
    { 
      icon: <Settings className="mr-2 h-4 w-4" />,
      label: 'Ayarlar',
      href: '/settings'
    }
  ];

  // Kullanıcı adını doğru şekilde oluştur
  const username = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.full_name || 'Kullanıcı';
    
  const userEmail = user?.email || 'kullanici@example.com';
  const userAvatar = user?.avatar || '';
  const userInitials = username.split(' ').map((n: string) => n[0]).join('');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-3 focus:outline-none"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Kullanıcı Menüsü</span>
        <div className="hidden md:block text-right">
          <div className="text-sm font-medium text-gray-900">{username}</div>
          <div className="text-xs text-gray-500 truncate max-w-[140px]">{userEmail}</div>
        </div>
        <Avatar className="h-8 w-8 transition duration-300 transform hover:scale-110">
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
              onClick={() => {
                signOut();
                setIsDropdownOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown; 