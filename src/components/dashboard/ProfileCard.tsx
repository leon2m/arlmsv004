import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { UserProfile } from '@/types/user';

interface ProfileCardProps {
  userProfile: UserProfile | null;
  stats: {
    badges: number;
    level: string;
    learningHours: number;
  };
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ userProfile, stats }) => {
  if (!userProfile) {
    return (
      <Card className="w-full md:w-64">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-sm text-gray-500">
              Profil bilgileri yüklenemiyor
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // İsmin baş harflerini al
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <Card className="w-full md:w-64">
      <CardContent className="p-6">
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={userProfile.avatar_url || undefined} alt={userProfile.full_name} />
            <AvatarFallback>{getInitials(userProfile.full_name)}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold mb-1">{userProfile.full_name}</h3>
          <p className="text-sm text-gray-500 mb-4">{userProfile.role}</p>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.badges}</div>
              <div className="text-xs text-gray-500">Rozetler</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.level}</div>
              <div className="text-xs text-gray-500">Seviye</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.learningHours}</div>
              <div className="text-xs text-gray-500">Saat</div>
            </div>
          </div>
          
          {userProfile.organization && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">Organizasyon</div>
              <div className="font-medium">{userProfile.organization}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 