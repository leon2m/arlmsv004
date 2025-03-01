import React from 'react';
import { Trophy, Star, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserProfile } from './types';

interface ProfileCardProps {
  userProfile: UserProfile | null;
  stats: {
    badges: number;
    level: string;
    learningHours: number;
  };
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ userProfile, stats }) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userProfile?.avatar_url || ''} />
            <AvatarFallback>
              {userProfile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{userProfile?.full_name || 'Kullanıcı'}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {userProfile?.title || 'Öğrenci'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Başarılar</p>
              <p className="text-xs text-muted-foreground">{stats.badges} Rozet Kazanıldı</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Star className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Seviye</p>
              <p className="text-xs text-muted-foreground">{stats.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Öğrenme Süresi</p>
              <p className="text-xs text-muted-foreground">{stats.learningHours} Saat</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 