import React, { useState } from 'react';
import { Star, GraduationCap, Flame, Medal } from 'lucide-react';
import { UserStats } from './types';
import { StatCardDetail, StatCardType } from './StatCardDetail';

interface StatCardsProps {
  stats: UserStats | null;
  userId?: string;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, userId }) => {
  const [openCard, setOpenCard] = useState<StatCardType | null>(null);
  
  const handleCardClick = (cardType: StatCardType) => {
    setOpenCard(cardType);
  };
  
  // Eğer stats null ise, yükleniyor durumunu göster
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="stat-card bg-gray-100 animate-pulse">
            <div className="h-24"></div>
            <div className="progress-bar">
              <div></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* XP ve Seviye */}
        <div 
          className="stat-card gradient-bg-1 cursor-pointer transform transition-transform hover:scale-[1.02] hover:shadow-lg"
          onClick={() => handleCardClick('xp')}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">XP & Seviye</h3>
              <p className="text-3xl font-bold mb-2">{stats.xp} XP</p>
              <p className="text-sm opacity-90">Seviye {stats.level}</p>
            </div>
            <Star className="h-8 w-8 text-white opacity-80" />
          </div>
          <div className="progress-bar">
            <div style={{ width: `${(stats.xp % 1000) / 10}%` }} />
          </div>
        </div>

        {/* Tamamlanan Eğitimler */}
        <div 
          className="stat-card gradient-bg-2 cursor-pointer transform transition-transform hover:scale-[1.02] hover:shadow-lg"
          onClick={() => handleCardClick('completedTrainings')}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Tamamlanan Eğitimler</h3>
              <p className="text-3xl font-bold mb-2">{stats.completedTrainings}</p>
              <p className="text-sm opacity-90">Bu ay +{stats.monthlyCompletions}</p>
            </div>
            <GraduationCap className="h-8 w-8 text-white opacity-80" />
          </div>
          <div className="progress-bar">
            <div style={{ width: `${stats.weeklyProgress.efficiency}%` }} />
          </div>
        </div>

        {/* Öğrenme Serisi */}
        <div 
          className="stat-card gradient-bg-3 cursor-pointer transform transition-transform hover:scale-[1.02] hover:shadow-lg"
          onClick={() => handleCardClick('streak')}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Öğrenme Serisi</h3>
              <p className="text-3xl font-bold mb-2">{stats.streak} Gün</p>
              <p className="text-sm opacity-90">En uzun: {stats.longestStreak} gün</p>
            </div>
            <Flame className="h-8 w-8 text-white opacity-80" />
          </div>
          <div className="progress-bar">
            <div style={{ width: `${(stats.streak / stats.longestStreak) * 100}%` }} />
          </div>
        </div>

        {/* Başarı Rozetleri */}
        <div 
          className="stat-card gradient-bg-4 cursor-pointer transform transition-transform hover:scale-[1.02] hover:shadow-lg"
          onClick={() => handleCardClick('badges')}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Başarı Rozetleri</h3>
              <p className="text-3xl font-bold mb-2">{stats.badges}</p>
              <p className="text-sm opacity-90">Son: Frontend Master</p>
            </div>
            <Medal className="h-8 w-8 text-white opacity-80" />
          </div>
          <div className="progress-bar">
            <div style={{ width: `${(stats.badges / 20) * 100}%` }} />
          </div>
        </div>
      </div>
      
      {/* Detail Popup */}
      {openCard && userId && (
        <StatCardDetail 
          open={!!openCard} 
          onOpenChange={(open) => !open && setOpenCard(null)} 
          cardType={openCard} 
          userId={userId}
        />
      )}
    </>
  );
}; 