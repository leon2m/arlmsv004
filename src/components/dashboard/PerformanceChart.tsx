import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartData } from './types';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceChartProps {
  data: ChartData;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const [activePeriod, setActivePeriod] = useState<string>('Haftalık');
  
  // Chart.js instance'ına referans
  const chartInstanceRef = useRef<ChartJS | null>(null);

  // React render döngüsünden kurtulmak için unique ID
  const canvasId = useRef(`line-chart-${Math.random().toString(36).substr(2, 9)}`);
  
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

  // Line chart için options
  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Öğrenme Performansı</h3>
        <div className="flex gap-2">
          {['Günlük', 'Haftalık', 'Aylık'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1 text-sm rounded-full ${
                activePeriod === period 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'hover:bg-indigo-50 text-indigo-600'
              }`}
              onClick={() => setActivePeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      
      <Line
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
  );
}; 