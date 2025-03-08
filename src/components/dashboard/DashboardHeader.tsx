import React from 'react';
import { Clock, Trophy } from 'lucide-react';
import { UserProfile, UserStats } from './types';

interface DashboardHeaderProps {
  userProfile: UserProfile | null;
  userStats: UserStats | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userProfile, userStats }) => {
  // XP çubuğu için hesaplama
  const calculateProgress = () => {
    if (!userStats) return 0;
    
    // nextLevelXp özelliği yoksa hesaplayalım
    const currentLevel = userStats.level || 1;
    const currentXp = userStats.xp || 0;
    const baseXp = 1000; // Temel XP değeri
    const nextLevelXp = userStats.nextLevelXp || baseXp * Math.pow(1.5, currentLevel - 1);
    
    return Math.min(100, Math.round((currentXp / nextLevelXp) * 100));
  };

  // XP göstergesi
  const renderXpProgress = () => {
    if (!userStats) return null;
    
    const currentLevel = userStats.level || 1;
    const currentXp = userStats.xp || 0;
    const baseXp = 1000; // Temel XP değeri
    const nextLevelXp = userStats.nextLevelXp || baseXp * Math.pow(1.5, currentLevel - 1);
    
    return (
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium">{currentXp} / {nextLevelXp} XP</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Üst Bar - Seviye ve Deneyim Puanı Bilgisi */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="level-badge flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Seviye {userStats?.level || 1}
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-gray-600">Deneyim İlerlemesi</div>
            {renderXpProgress()}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Ara..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <select
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="last7Days">Son 7 Gün</option>
            <option value="last30Days">Son 30 Gün</option>
            <option value="last90Days">Son 90 Gün</option>
          </select>
        </div>
      </div>
    </>
  );
}; 