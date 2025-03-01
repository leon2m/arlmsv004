import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { navigation } from './navigationData';
import NavigationItem from './NavigationItem';
import { SidebarProps } from './types';
import { Button } from '@/components/ui/button';

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed,
  setIsCollapsed,
  activeMenu,
  setActiveMenu,
  pathname
}) => {
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSubmenu = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo alanından yükseklik ayarlaması */}
      <div className="h-16 border-b border-gray-200"></div>
      
      {/* Ana navigasyon */}
      <div className="flex flex-1 flex-col overflow-y-auto pt-2 pb-4">
        <div className="px-3 mb-4 flex">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "ml-auto flex h-7 w-7 items-center justify-center rounded-full opacity-70 hover:opacity-100 transition-opacity",
              isCollapsed ? "mx-auto" : ""
            )}
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="px-3">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
                activeMenu={activeMenu}
                toggleSubmenu={toggleSubmenu}
                pathname={pathname}
              />
            ))}
          </nav>
        </div>
      </div>
      
      {/* Alt Destek Alanı */}
      <div className="px-3 py-4 border-t border-gray-200 mt-auto">
        <div className={cn(
          "flex items-center rounded-lg p-3 bg-blue-50 text-blue-600",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          {!isCollapsed && (
            <span className="ml-3 text-sm font-medium">Yardım & Destek</span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 