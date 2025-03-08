import { 
  UserProfile, 
  UserStats, 
  Activity as ActivityType,
  Event as EventType,
  Task as TaskType,
  Achievement as AchievementType,
  Course as CourseType,
  Certificate as CertificateType,
  AIRecommendation,
  ChartData
} from '../components/dashboard';
import { BookOpen, Award, TrendingUp, Target, Activity, Trophy, Medal, Rocket, Users, GraduationCap } from 'lucide-react';
import React from 'react';

// SVG ikonlar
export const images = {
  courses: {
    // Framework ikonları - SVG formatında
    react: "https://www.svgrepo.com/show/452092/react.svg", // React ikonu
    angular: "https://www.svgrepo.com/show/452156/angular.svg", // Angular ikonu
    vue: "https://www.svgrepo.com/show/452130/vue.svg", // Vue.js ikonu
    node: "https://www.svgrepo.com/show/452075/node-js.svg" // Node.js ikonu
  },
  certificates: {
    // Sertifika ikonları - SVG formatında
    webDev: "https://www.svgrepo.com/show/530444/availability.svg", // Web geliştirme ikonu
    mobileDev: "https://www.svgrepo.com/show/530452/mobile-app.svg", // Mobil geliştirme ikonu
    cloudComputing: "https://www.svgrepo.com/show/530438/ddos-protection.svg", // Cloud computing ikonu
    dataScience: "https://www.svgrepo.com/show/530447/all-covered.svg" // Veri bilimi ikonu
  }
};

// Örnek aktivite verileri
export const mockActivities: ActivityType[] = [
  {
    title: 'React.js Kursunu Tamamladı',
    timestamp: '2 saat önce',
    icon: React.createElement(Trophy, { className: "h-4 w-4 text-yellow-500" }),
    iconBg: 'bg-yellow-100'
  },
  {
    title: 'Yeni Rozet Kazandı: TypeScript Master',
    timestamp: '4 saat önce',
    icon: React.createElement(Medal, { className: "h-4 w-4 text-purple-500" }),
    iconBg: 'bg-purple-100'
  },
  {
    title: 'Node.js Projesine Başladı',
    timestamp: '1 gün önce',
    icon: React.createElement(Rocket, { className: "h-4 w-4 text-blue-500" }),
    iconBg: 'bg-blue-100'
  },
  {
    title: 'Yeni Hedef: GraphQL Öğrenimi',
    timestamp: '2 gün önce',
    icon: React.createElement(Target, { className: "h-4 w-4 text-green-500" }),
    iconBg: 'bg-green-100'
  }
];

// Örnek yaklaşan etkinlikler
export const mockUpcomingEvents: EventType[] = [
  {
    title: 'React Workshop',
    date: '24 Şubat 2025',
    icon: React.createElement(BookOpen, { className: "h-4 w-4 text-blue-500" }),
    iconBg: 'bg-blue-100'
  },
  {
    title: 'TypeScript Webinar',
    date: '26 Şubat 2025',
    icon: React.createElement(GraduationCap, { className: "h-4 w-4 text-purple-500" }),
    iconBg: 'bg-purple-100'
  },
  {
    title: 'Team Code Review',
    date: '28 Şubat 2025',
    icon: React.createElement(Users, { className: "h-4 w-4 text-green-500" }),
    iconBg: 'bg-green-100'
  }
];

// Öğrenme yolu verileri
export const mockLearningPathData = {
  currentCourse: {
    title: 'Advanced React Patterns',
    progress: 75,
    nextLesson: 'Higher Order Components',
    timeSpent: '12.5 saat',
    deadline: '2025-03-01'
  },
  recommendedPaths: [
    {
      title: 'Frontend Architect',
      description: 'Modern frontend mimarisi ve performans optimizasyonu',
      courses: 8,
      duration: '48 saat',
      matchRate: 95
    },
    {
      title: 'Full Stack Developer',
      description: 'Tam yığın web uygulamaları geliştirme',
      courses: 12,
      duration: '72 saat',
      matchRate: 85
    }
  ],
  nextMilestones: [
    {
      title: 'React Performance Expert',
      description: 'React uygulamalarında ileri düzey performans optimizasyonu',
      requiredSkills: ['React', 'Redux', 'Webpack'],
      estimatedTime: '24 saat'
    },
    {
      title: 'Cloud Architecture Specialist',
      description: 'AWS üzerinde ölçeklenebilir uygulamalar tasarlama',
      requiredSkills: ['AWS', 'Docker', 'Kubernetes'],
      estimatedTime: '36 saat'
    }
  ]
};

// Grafik verileri
export const mockSkillsData: ChartData = {
  labels: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Testing', 'DevOps'],
  datasets: [{
    label: 'Yetkinlikler',
    data: [85, 75, 65, 70, 60, 55],
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
    pointBackgroundColor: '#6366f1'
  }]
};

export const mockProgressData: ChartData = {
  labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
  datasets: [{
    label: 'Tamamlanan Eğitimler',
    data: [4, 6, 8, 12, 15, 18],
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    tension: 0.4,
    fill: true
  }]
};

export const mockLearningStyleData: ChartData = {
  labels: ['Görsel', 'İşitsel', 'Uygulamalı'],
  datasets: [{
    data: [40, 30, 30],
    backgroundColor: [
      'rgba(99, 102, 241, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(139, 92, 246, 0.8)'
    ]
  }]
};

// Önerilen kurslar
export const mockRecommendedCourses = [
  {
    id: 'course-001',
    title: 'Advanced React Patterns',
    duration: '6 saat',
    level: 'İleri Seviye',
    match: 95,
    rating: 4.8,
    progress: 85,
    instructor: {
      name: 'Mehmet Yılmaz',
      title: 'Senior React Developer',
      rating: 4.9
    },
    topics: [
      'Higher Order Components',
      'Render Props',
      'Custom Hooks',
      'Performance Optimization'
    ],
    skills: ['React', 'TypeScript', 'Redux'],
    prerequisites: ['React Fundamentals', 'JavaScript ES6+']
  },
  {
    id: 'course-002',
    title: 'TypeScript Best Practices',
    duration: '4 saat',
    level: 'Orta Seviye',
    match: 90,
    rating: 4.7,
    progress: 60,
    instructor: {
      name: 'Ayşe Kara',
      title: 'TypeScript Expert',
      rating: 4.8
    },
    topics: [
      'Advanced Types',
      'Generics',
      'Decorators',
      'Type Guards'
    ],
    skills: ['TypeScript', 'JavaScript'],
    prerequisites: ['JavaScript Fundamentals']
  },
  {
    id: 'course-003',
    title: 'Node.js Performance',
    duration: '5 saat',
    level: 'İleri Seviye',
    match: 85,
    rating: 4.9,
    progress: 40,
    instructor: {
      name: 'Ali Demir',
      title: 'Backend Architect',
      rating: 4.9
    },
    topics: [
      'Memory Management',
      'Clustering',
      'Caching Strategies',
      'Database Optimization'
    ],
    skills: ['Node.js', 'MongoDB', 'Redis'],
    prerequisites: ['Node.js Basics', 'Database Fundamentals']
  }
];

// Başarılar
export const mockAchievements: AchievementType[] = [
  {
    id: 'achievement-001',
    title: 'Frontend Master',
    description: '100 frontend görevi tamamla',
    progress: 85,
    icon: '🏆',
    criteria: {
      total: 100,
      completed: 85,
      remaining: 15
    },
    rewards: {
      xp: 1000,
      badge: 'Frontend Master',
      certificate: true
    },
    dateStarted: '2025-01-01',
    estimatedCompletion: '2025-03-15'
  },
  {
    id: 'achievement-002',
    title: 'Sürekli Öğrenme',
    description: '30 gün kesintisiz öğrenme',
    progress: 70,
    icon: '🎯',
    criteria: {
      total: 30,
      completed: 21,
      remaining: 9
    },
    rewards: {
      xp: 500,
      badge: 'Learning Streak',
      certificate: false
    },
    dateStarted: '2025-02-01',
    estimatedCompletion: '2025-03-01'
  },
  {
    id: 'achievement-003',
    title: 'Takım Oyuncusu',
    description: '50 yorum yap',
    progress: 90,
    icon: '🌟',
    criteria: {
      total: 50,
      completed: 45,
      remaining: 5
    },
    rewards: {
      xp: 300,
      badge: 'Team Player',
      certificate: false
    },
    dateStarted: '2025-01-15',
    estimatedCompletion: '2025-02-28'
  }
];

// Popüler eğitimler
export const mockPopularCourses: CourseType[] = [
  {
    id: 'pop-course-001',
    title: 'React Performance Optimization',
    instructor: 'Mehmet Yılmaz',
    duration: '4 saat',
    rating: 4.9,
    students: 1250,
    image: "https://www.svgrepo.com/show/521303/react-16.svg",
    price: 299,
    level: 'İleri Seviye',
    language: 'Türkçe',
    lastUpdated: '2025-02-15',
    topics: [
      'React.memo',
      'useMemo',
      'useCallback',
      'Code Splitting',
      'Lazy Loading'
    ],
    includes: [
      '4 saat video',
      '15 alıştırma',
      '5 proje',
      'Sertifika'
    ]
  },
  {
    id: 'pop-course-002',
    title: 'TypeScript Advanced Types',
    instructor: 'Ayşe Kara',
    duration: '3.5 saat',
    rating: 4.8,
    students: 980,
    image: "https://www.svgrepo.com/show/342317/typescript.svg",
    price: 249,
    level: 'Orta Seviye',
    language: 'Türkçe',
    lastUpdated: '2025-02-10',
    topics: [
      'Generic Types',
      'Utility Types',
      'Mapped Types',
      'Conditional Types'
    ],
    includes: [
      '3.5 saat video',
      '12 alıştırma',
      '3 proje',
      'Sertifika'
    ]
  },
  {
    id: 'pop-course-003',
    title: 'Node.js Microservices',
    instructor: 'Ali Demir',
    duration: '6 saat',
    rating: 4.7,
    students: 850,
    image: "https://www.svgrepo.com/show/369459/nodejs.svg",
    price: 399,
    level: 'İleri Seviye',
    language: 'Türkçe',
    lastUpdated: '2025-02-01',
    topics: [
      'Microservice Architecture',
      'Docker',
      'Kubernetes',
      'API Gateway'
    ],
    includes: [
      '6 saat video',
      '20 alıştırma',
      '4 proje',
      'Sertifika'
    ]
  },
  {
    id: 'pop-course-004',
    title: 'Advanced Level Python',
    instructor: 'Ramazan Çakıcı',
    duration: '6 saat',
    rating: 4.7,
    students: 1250,
    image: "https://www.svgrepo.com/show/512738/python-127.svg",
    price: 399,
    level: 'İleri Seviye',
    language: 'Türkçe',
    lastUpdated: '2025-02-01',
    topics: [
      'Microservice Architecture',
      'Docker',
      'Kubernetes',
      'API Gateway'
    ],
    includes: [
      '6 saat video',
      '20 alıştırma',
      '4 proje',
      'Sertifika'
    ]
  }
];

// Sertifikalar
export const mockCertificates: CertificateType[] = [
  {
    id: 'cert-001',
    title: 'Web Geliştirme',
    description: 'Full Stack Developer Sertifikası',
    progress: 85,
    image: images.certificates.webDev
  },
  {
    id: 'cert-002',
    title: 'Mobil Geliştirme',
    description: 'Cross-Platform Developer Sertifikası',
    progress: 60,
    image: images.certificates.mobileDev
  },
  {
    id: 'cert-003',
    title: 'Cloud Computing',
    description: 'AWS Solutions Architect Sertifikası',
    progress: 40,
    image: images.certificates.cloudComputing
  },
  {
    id: 'cert-004',
    title: 'Veri Bilimi',
    description: 'Data Scientist Sertifikası',
    progress: 25,
    image: images.certificates.dataScience
  }
];

// AI Önerileri
export const mockAIRecommendations: AIRecommendation[] = [
  {
    id: '1',
    title: 'React Hooks Eğitimi',
    description: 'React Hooks konusunda kendinizi geliştirmek için önerilen eğitim.',
    priority: 'high' as const,
    type: 'course',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'TypeScript Temelleri',
    description: 'TypeScript temellerini öğrenmek için önerilen eğitim.',
    priority: 'medium' as const,
    type: 'course',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Next.js ile SSR',
    description: 'Next.js ile sunucu taraflı render konusunda kendinizi geliştirin.',
    priority: 'low' as const,
    type: 'course',
    createdAt: new Date().toISOString()
  }
];

// Öğrenme alışkanlıkları
export const mockLearningHabits = {
  mostProductiveTime: '09:00 - 12:00',
  focusDuration: '45 dk'
};

// Öğrenme stilleri
export const mockLearningStyles = {
  visual: 40,
  auditory: 30,
  kinesthetic: 30
}; 