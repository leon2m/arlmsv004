import { 
  LayoutDashboard,
  BookOpen,
  FileText,
  FileQuestion,
  ScrollText,
  Calendar,
  MessageSquare,
  FolderOpen,
  Users,
  Library,
  Microscope,
  MonitorPlay,
  Headphones,
  Rocket,
  UserPlus,
  BarChart,
  Code2,
  FileSpreadsheet,
  Share2,
  Globe2,
  Palette,
  Wrench,
  Database,
  Lightbulb,
  Network,
  Bell,
  Settings,
  Award,
  Briefcase,
  GraduationCap,
  Target,
  User,
  Mail,
  AlertCircle,
  CheckSquare
} from 'lucide-react';

import { MenuItem, NavigationItem, NavigationLeafItem, NavigationParentItem } from './types';

// Menü öğeleri (genişletilmiş mod için)
export const menuItems: MenuItem[] = [
  { id: 'courses', title: 'Kurslarım', icon: BookOpen, path: '/courses', color: 'text-blue-500', badge: 12 },
  { id: 'assignments', title: 'Ödevler', icon: FileText, path: '/assignments', color: 'text-purple-500', badge: 5 },
  { id: 'exams', title: 'Sınavlar', icon: FileQuestion, path: '/exams', color: 'text-red-500', badge: 3 },
  { id: 'certificates', title: 'Sertifikalar', icon: ScrollText, path: '/certificates', color: 'text-green-500', badge: 8 },
  { id: 'calendar', title: 'Takvim', icon: Calendar, path: '/calendar', color: 'text-yellow-500', badge: 4 },
  { id: 'messages', title: 'Mesajlar', icon: MessageSquare, path: '/messages', color: 'text-pink-500', badge: 15 },
  { id: 'resources', title: 'Kaynaklar', icon: FolderOpen, path: '/resources', color: 'text-orange-500', badge: 25 },
  { id: 'meetings', title: 'Toplantılar', icon: Users, path: '/meetings', color: 'text-teal-500', badge: 2 },
  { id: 'library', title: 'Dijital Kütüphane', icon: Library, path: '/library', color: 'text-indigo-500', badge: 150 },
  { id: 'labs', title: 'Sanal Laboratuvarlar', icon: Microscope, path: '/labs', color: 'text-cyan-500', badge: 8 },
  { id: 'webinars', title: 'Webinarlar', icon: MonitorPlay, path: '/webinars', color: 'text-rose-500', badge: 6 },
  { id: 'podcasts', title: 'Eğitim Podcastleri', icon: Headphones, path: '/podcasts', color: 'text-amber-500', badge: 45 },
  { id: 'projects', title: 'Proje Çalışmaları', icon: Rocket, path: '/projects', color: 'text-lime-500', badge: 10 },
  { id: 'mentorship', title: 'Mentörlük', icon: UserPlus, path: '/mentorship', color: 'text-emerald-500', badge: 3 },
  { id: 'analytics', title: 'Analitik Raporlar', icon: BarChart, path: '/analytics', color: 'text-sky-500', badge: 12 },
  { id: 'coding', title: 'Kod Örnekleri', icon: Code2, path: '/coding', color: 'text-violet-500', badge: 89 },
  { id: 'spreadsheets', title: 'Çalışma Dokümanları', icon: FileSpreadsheet, path: '/spreadsheets', color: 'text-fuchsia-500', badge: 34 },
  { id: 'collaboration', title: 'İş Birliği Alanı', icon: Share2, path: '/collaboration', color: 'text-blue-600', badge: 7 },
  { id: 'global', title: 'Global Öğrenme', icon: Globe2, path: '/global', color: 'text-purple-600', badge: 15 },
  { id: 'design', title: 'Tasarım Galerisi', icon: Palette, path: '/design', color: 'text-pink-600', badge: 28 },
  { id: 'tools', title: 'Öğrenme Araçları', icon: Wrench, path: '/tools', color: 'text-orange-600', badge: 19 },
  { id: 'database', title: 'Bilgi Bankası', icon: Database, path: '/database', color: 'text-teal-600', badge: 56 },
  { id: 'ideas', title: 'Fikir Havuzu', icon: Lightbulb, path: '/ideas', color: 'text-yellow-600', badge: 42 },
  { id: 'network', title: 'Öğrenci Ağı', icon: Network, path: '/network', color: 'text-green-600', badge: 234 }
];

// Ana navigasyon gruplaması
export const navigation: NavigationItem[] = [
  {
    id: 'overview',
    title: 'Genel Bakış',
    icon: LayoutDashboard,
    href: '/'
  } as NavigationLeafItem,
  {
    id: 'tasks',
    title: 'Görevlerim',
    icon: CheckSquare,
    href: '/tasks'
  } as NavigationLeafItem,
  {
    id: 'learning',
    title: 'Eğitimler',
    icon: BookOpen,
    children: [
      { id: 'my-courses', title: 'Kurslarım', href: '/my-courses', icon: BookOpen },
      { id: 'course-catalog', title: 'Kurs Kataloğu', href: '/courses', icon: Library },
      { id: 'learning-paths', title: 'Öğrenme Yolları', href: '/learning-paths', icon: Rocket },
      { id: 'assignments', title: 'Ödevler', href: '/assignments', icon: FileText },
      { id: 'exams', title: 'Sınavlar', href: '/exams', icon: FileQuestion }
    ]
  } as NavigationParentItem,
  {
    id: 'development',
    title: 'Kariyer Gelişimi',
    icon: Target,
    children: [
      { id: 'competencies', title: 'Yetkinliklerim', href: '/competencies', icon: Target },
      { id: 'certificates', title: 'Sertifikalarım', href: '/certificates', icon: Award },
      { id: 'mentorship', title: 'Mentörlük', href: '/mentorship', icon: UserPlus },
      { id: 'career-path', title: 'Kariyer Yolum', href: '/career-path', icon: GraduationCap }
    ]
  } as NavigationParentItem,
  {
    id: 'resources',
    title: 'Kaynaklar',
    icon: FolderOpen,
    children: [
      { id: 'library', title: 'Dijital Kütüphane', href: '/library', icon: Library },
      { id: 'webinars', title: 'Webinarlar', href: '/webinars', icon: MonitorPlay },
      { id: 'podcasts', title: 'Podcastler', href: '/podcasts', icon: Headphones },
      { id: 'coding', title: 'Kod Örnekleri', href: '/coding', icon: Code2 },
      { id: 'documents', title: 'Dokümanlar', href: '/documents', icon: FileSpreadsheet }
    ]
  } as NavigationParentItem,
  {
    id: 'collaboration',
    title: 'İş Birliği',
    icon: Share2,
    children: [
      { id: 'meetings', title: 'Toplantılar', href: '/meetings', icon: Users },
      { id: 'projects', title: 'Projeler', href: '/projects', icon: Briefcase },
      { id: 'network', title: 'Öğrenci Ağı', href: '/network', icon: Network },
      { id: 'global-learning', title: 'Global Öğrenme', href: '/global', icon: Globe2 }
    ]
  } as NavigationParentItem,
  {
    id: 'tools',
    title: 'Araçlar',
    icon: Wrench,
    children: [
      { id: 'calendar', title: 'Takvim', href: '/calendar', icon: Calendar },
      { id: 'labs', title: 'Sanal Laboratuvarlar', href: '/labs', icon: Microscope },
      { id: 'idea-pool', title: 'Fikir Havuzu', href: '/ideas', icon: Lightbulb },
      { id: 'knowledge-base', title: 'Bilgi Bankası', href: '/database', icon: Database }
    ]
  } as NavigationParentItem,
  {
    id: 'communication',
    title: 'İletişim',
    icon: MessageSquare,
    children: [
      { id: 'messages', title: 'Mesajlar', href: '/messages', icon: Mail },
      { id: 'notifications', title: 'Bildirimler', href: '/notifications', icon: Bell },
      { id: 'announcements', title: 'Duyurular', href: '/announcements', icon: AlertCircle }
    ]
  } as NavigationParentItem,
  {
    id: 'analytics',
    title: 'Analitik',
    icon: BarChart,
    children: [
      { id: 'progress', title: 'İlerleme', href: '/analytics/progress', icon: Target },
      { id: 'performance', title: 'Performans', href: '/analytics/performance', icon: BarChart },
      { id: 'engagement', title: 'Katılım', href: '/analytics/engagement', icon: Users }
    ]
  } as NavigationParentItem,
  {
    id: 'settings',
    title: 'Ayarlar',
    icon: Settings,
    children: [
      { id: 'profile', title: 'Profil', href: '/settings/profile', icon: User },
      { id: 'account', title: 'Hesap', href: '/settings/account', icon: Settings }
    ]
  } as NavigationParentItem
]; 