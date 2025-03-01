import React, { useEffect, useRef } from 'react';
import { Radar } from 'react-chartjs-2';
import { ChartData } from './types';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend,
  ChartOptions
} from 'chart.js';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SkillsRadarProps {
  data: ChartData;
}

export const SkillsRadar: React.FC<SkillsRadarProps> = ({ data }) => {
  // Chart.js instance'ına referans
  const chartInstanceRef = useRef<ChartJS | null>(null);

  // React render döngüsünden kurtulmak için unique ID
  const canvasId = useRef(`radar-chart-${Math.random().toString(36).substr(2, 9)}`);
  
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

  // Radar chart için options
  const options: ChartOptions<'radar'> = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    },
    maintainAspectRatio: false,
    responsive: true
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover-card">
      <h3 className="text-lg font-semibold mb-6">Yetkinlik Haritası</h3>
      <div className="relative h-80">
        <Radar
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
  );
}; 