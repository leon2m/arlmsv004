import React, { useEffect, useRef } from 'react';
import { Radar } from 'react-chartjs-2';
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
import { EditSkills } from './EditSkills';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  skill: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
}

interface SkillsRadarProps {
  skills: UserSkill[];
  onSkillsUpdate: () => void;
}

export const SkillsRadar: React.FC<SkillsRadarProps> = ({ skills, onSkillsUpdate }) => {
  // Chart.js instance'ına referans
  const chartInstanceRef = useRef<ChartJS | null>(null);

  // React render döngüsünden kurtulmak için unique ID
  const canvasId = useRef(`radar-chart-${Math.random().toString(36).substr(2, 9)}`);
  
  // Component unmount edildiğinde chart'ı temizle
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  // Beceri verilerini Chart.js formatına dönüştür
  const chartData = {
    labels: skills.map(skill => skill.skill.name),
    datasets: [
      {
        label: 'Beceri Düzeyi',
        data: skills.map(skill => skill.level),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
      }
    ]
  };

  // Radar chart için options
  const options: ChartOptions<'radar'> = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const skill = skills[context.dataIndex];
            return `${skill.skill.name}: ${context.formattedValue}%`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    responsive: true
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Yetkinlik Haritası</h3>
        <EditSkills userSkills={skills} onSkillsUpdate={onSkillsUpdate} />
      </div>

      <div className="relative h-80">
        {skills.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Henüz beceri düzeyi girilmemiş
          </div>
        ) : (
          <Radar
            id={canvasId.current}
            data={chartData}
            options={options}
            ref={(ref) => {
              if (ref) {
                chartInstanceRef.current = ref;
              }
            }}
          />
        )}
      </div>
    </div>
  );
}; 