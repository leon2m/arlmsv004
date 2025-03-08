import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Home,
  BookOpen,
  Target,
  Award,
  Calendar,
  Users,
  Settings,
  HelpCircle
} from 'lucide-react';

interface MenuItem {
  icon: React.ElementType;
  title: string;
  path: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { icon: Home, title: 'Ana Sayfa', path: '/dashboard' },
  { icon: Target, title: 'Yetkinliklerim', path: '/competencies' },
  { icon: BookOpen, title: 'Eğitimlerim', path: '/courses' },
  { icon: Award, title: 'Başarılarım', path: '/achievements' },
  { icon: Calendar, title: 'Takvim', path: '/calendar' },
  { icon: Users, title: 'Takımım', path: '/team' },
  { icon: Settings, title: 'Ayarlar', path: '/settings' },
  { icon: HelpCircle, title: 'Yardım', path: '/help' }
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`sidebar bg-white border-r border-gray-200 h-screen fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => !isExpanded && setIsExpanded(true)}
      onMouseLeave={() => !isExpanded && hoveredItem === null && setIsExpanded(false)}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className={`font-semibold text-xl transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          AR LMS
        </h2>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isExpanded ? (
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      <nav className="mt-4 px-2">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`sidebar-item group relative ${location.pathname === item.path ? 'active' : ''}`}
            onMouseEnter={() => setHoveredItem(item.path)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-gray-100">
              <item.icon className={`h-5 w-5 transition-transform duration-200 ${hoveredItem === item.path ? 'scale-110' : ''}`} />
              <span className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                {item.title}
              </span>
            </div>

            {!isExpanded && hoveredItem === item.path && (
              <div className="absolute left-full top-0 ml-2 bg-white rounded-lg shadow-lg py-2 px-4 whitespace-nowrap">
                {item.title}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}