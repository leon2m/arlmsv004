import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EditButton } from './EditButton';
import { ProfileCard } from './ProfileCard';
import { ProfileSummaryCardProps } from './types';

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ userProfile, stats }) => {
  // stats null veya undefined ise varsayılan değerler kullan
  const safeStats = stats || {
    badges: 0,
    totalHours: 0
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Genel Profil</CardTitle>
        <EditButton onClick={() => alert('Profil düzenleme sayfasına yönlendirme')} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <ProfileCard 
            userProfile={userProfile} 
            stats={{
              badges: safeStats.badges || 0,
              level: 'İleri Düzey',
              learningHours: safeStats.totalHours || 0
            }} 
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">Beceri Düzeyleri</h3>
            <div className="space-y-4">
              {stats && stats.skillLevels && Object.entries(stats.skillLevels).map(([skill, level]) => (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium capitalize">{skill}</span>
                    <span className="text-sm text-gray-500">{level}%</span>
                  </div>
                  <Progress value={typeof level === 'number' ? level : 0} className="h-1.5" />
                </div>
              ))}
              {(!stats || !stats.skillLevels) && (
                <div className="text-sm text-gray-500 py-2">
                  Beceri düzeyleri yüklenemiyor
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 