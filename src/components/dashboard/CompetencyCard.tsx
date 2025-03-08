import React from 'react';
import { Trophy, Target, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface CompetencyCardProps {
  title: string;
  description: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
  category: string;
  lastAssessment?: string;
  nextAssessment?: string;
  onViewDetails: () => void;
}

export function CompetencyCard({
  title,
  description,
  currentLevel,
  targetLevel,
  progress,
  category,
  lastAssessment,
  nextAssessment,
  onViewDetails
}: CompetencyCardProps) {
  return (
    <div className="competency-card group hover:border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <button
          onClick={onViewDetails}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>Current Level: {currentLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span>Target Level: {targetLevel}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-gray-100 group-hover:bg-blue-50 transition-colors"
          />
        </div>

        {(lastAssessment || nextAssessment) && (
          <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            {lastAssessment && (
              <span>Last Assessment: {new Date(lastAssessment).toLocaleDateString('tr-TR')}</span>
            )}
            {nextAssessment && (
              <span>Next Assessment: {new Date(nextAssessment).toLocaleDateString('tr-TR')}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}