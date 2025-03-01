import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Achievement } from './types';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {achievements.map((achievement) => (
        <div key={achievement.id} className="bg-white p-6 rounded-lg shadow-sm hover-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">{achievement.title}</h4>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-green-600">{achievement.progress}%</span>
            </div>
          </div>
          <Progress value={achievement.progress} className="h-2" />
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <span>{achievement.criteria.completed}/{achievement.criteria.total} tamamlandı</span>
            <span>Ödül: {achievement.rewards.xp} XP</span>
          </div>
        </div>
      ))}
    </div>
  );
}; 