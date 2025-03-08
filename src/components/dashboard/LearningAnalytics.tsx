import React, { useEffect, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Clock, Target } from 'lucide-react';
import { ChartData } from './types';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  ChartOptions
} from 'chart.js';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface LearningAnalyticsProps {
  data: ChartData;
  learningHabits: {
    mostProductiveTime: string;
    focusDuration: string;
  };
  learningStyles: {
    visual: number;
    auditory: number;
    kinesthetic: number;
  };
}

export const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({ 
  data, 
  learningHabits, 
  learningStyles 
}) => {
  // Chart.js instance'ına referans
  const chartInstanceRef = useRef<ChartJS | null>(null);

  // React render döngüsünden kurtulmak için unique ID
  const canvasId = useRef(`doughnut-chart-${Math.random().toString(36).substr(2, 9)}`);
  
  // Component unmount edildiğinde chart'ı temizle
  useEffect(() => {
    return () => {
      // Ref üzerinden chart instance'ı temizle
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  // Doughnut chart için options
  const options: ChartOptions<'doughnut'> = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      }
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover-card">
      <h3 className="text-lg font-semibold mb-6">Öğrenme Analizi</h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Haftalık İlerleme</h4>
            <p className="text-sm text-gray-600">Son 7 günde 12 saat çalışma</p>
          </div>
          <div className="w-32 h-32">
            <Doughnut
              id={canvasId.current}
              data={data}
              options={options}
              ref={(ref) => {
                if (ref) {
                  chartInstanceRef.current = ref;
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Öğrenme Alışkanlıkları</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">En Verimli Saat</span>
              </div>
              <p className="text-lg font-semibold text-indigo-600">{learningHabits.mostProductiveTime}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Odak Süresi</span>
              </div>
              <p className="text-lg font-semibold text-green-600">{learningHabits.focusDuration}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">Öğrenme Tarzı Dağılımı</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Görsel Öğrenme</span>
                <span>{learningStyles.visual}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${learningStyles.visual}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>İşitsel Öğrenme</span>
                <span>{learningStyles.auditory}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${learningStyles.auditory}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Uygulamalı Öğrenme</span>
                <span>{learningStyles.kinesthetic}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${learningStyles.kinesthetic}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 