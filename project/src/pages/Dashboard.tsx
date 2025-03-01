import React from 'react';
import {
  DashboardHeader,
  StatCards,
  PerformanceChart,
  SkillsRadar,
  LearningAnalytics,
  ProfileCard,
  ActivityFeed,
  UpcomingEvents,
  TaskList,
  Achievements,
  PopularCourses,
  Certificates,
  AIAssistant
} from '../components/dashboard';
import { EditButton } from '../components/dashboard/EditButton';
import { useDashboardData } from '../hooks/useDashboardData';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import '../styles/dashboard.css';

// Mock veriler
import {
  mockActivities,
  mockUpcomingEvents,
  mockAchievements,
  mockPopularCourses,
  mockCertificates,
  mockAIRecommendations,
  mockProgressData,
  mockSkillsData,
  mockLearningStyleData,
  mockLearningHabits,
  mockLearningStyles
} from '../data/dashboardMockData';

export const Dashboard: React.FC = () => {
  // Veri hook'u
  const {
    loading,
    userProfile,
    userStats,
    assignedTasks,
    handleTaskActions
  } = useDashboardData();

  const handleRefreshRecommendations = () => {
    console.log('Öneriler yenileniyor...');
    // Burada AI önerilerini yenileme işlemi yapılabilir
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <DashboardHeader userProfile={userProfile} userStats={userStats} />

      {/* Stat Cards */}
      <StatCards stats={userStats} userId={userProfile?.id} />

      {/* Ana Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sol Panel - İstatistikler ve Grafikler */}
        <div className="col-span-8 space-y-6">
          {/* Performans Grafiği */}
          <PerformanceChart data={mockProgressData} />

          {/* Yetkinlik Haritası ve Öğrenme Analizi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkillsRadar data={mockSkillsData} />
            <LearningAnalytics 
              data={mockLearningStyleData} 
              learningHabits={mockLearningHabits}
              learningStyles={mockLearningStyles}
            />
          </div>
        </div>

        {/* Sağ Panel - İstatistikler ve Aktiviteler */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* Profil Kartı */}
          <ProfileSummaryCard userProfile={userProfile} stats={userStats} />

          {/* Aktivite Akışı */}
          <ActivityFeed activities={mockActivities} />

          {/* Yaklaşan Etkinlikler */}
          <UpcomingEvents events={mockUpcomingEvents} />

          {/* Görev Listesi */}
          <TaskList 
            tasks={assignedTasks} 
            onAddTask={handleTaskActions.addTask}
            onUpdateTask={handleTaskActions.updateTask}
            onDeleteTask={handleTaskActions.deleteTask}
          />
        </div>
      </div>

      {/* AI Asistanı */}
      <div className="mt-8">
        <AIAssistant 
          recommendations={mockAIRecommendations}
          onRefresh={handleRefreshRecommendations}
        />
      </div>

      {/* Başarılar ve Rozetler */}
      <Achievements achievements={mockAchievements} />

      {/* Popüler Eğitimler */}
      <PopularCourses courses={mockPopularCourses} />

      {/* Sertifikalar */}
      <Certificates certificates={mockCertificates} />
    </div>
  );
};

// Profil özet kartı
const ProfileSummaryCard = ({ userProfile, stats }: { userProfile: any, stats: any }) => {
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
              badges: stats?.badges || 0,
              level: 'İleri Düzey',
              learningHours: stats?.totalHours || 0
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