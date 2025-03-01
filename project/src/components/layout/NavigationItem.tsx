import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationItemProps, NavigationParentItem } from './types';

const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  isCollapsed,
  activeMenu,
  toggleSubmenu,
  pathname
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isParentItem = 'children' in item;
  const isActive = isParentItem 
    ? item.children.some(child => child.href === pathname)
    : item.href === pathname;
  const isOpen = activeMenu === item.id;

  // Parent item ile leaf item için ortak stiller
  const commonClasses = cn(
    'flex items-center rounded-md p-2 text-sm font-medium transition-all duration-200',
    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
  );

  // Başlık için stil (daraltılmış durumda görünmez)
  const titleClasses = cn(
    'ml-3 transition-all duration-200',
    isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible'
  );

  // Menü ögesi daraltılmış durumda değilse (normal) ve alt menüleri varsa
  if (isParentItem && !isCollapsed) {
    return (
      <div className="py-1">
        <button
          onClick={() => toggleSubmenu(item.id)}
          className={cn(
            commonClasses,
            'justify-between w-full pr-2',
            isOpen ? 'bg-gray-100' : ''
          )}
        >
          <span className="flex items-center">
            {item.icon && <item.icon className="h-5 w-5" />}
            <span className={titleClasses}>{item.title}</span>
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {isOpen && (
          <div className="mt-1 ml-4 space-y-1">
            {(item as NavigationParentItem).children.map(child => (
              <Link
                key={child.id}
                to={child.href}
                className={cn(
                  'flex items-center rounded-md py-2 pl-9 pr-2 text-sm font-medium transition-all duration-200',
                  pathname === child.href 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                <span>{child.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Daraltılmış durumda (tooltip ile) veya alt menüleri olmayan durum
  return isParentItem ? (
    <div className="group relative py-1">
      <button
        onClick={() => toggleSubmenu(item.id)}
        className={cn(
          commonClasses,
          'justify-center w-full',
          isOpen ? 'bg-gray-100' : ''
        )}
      >
        {item.icon && <item.icon className="h-5 w-5" />}
        <span className={titleClasses}>{item.title}</span>
      </button>

      {/* Hover tooltip for collapsed parent items */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 -translate-y-1/2 top-1/2 rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity z-50">
          {item.title}
        </div>
      )}

      {/* Submenu for collapsed parent (appears on the right) */}
      {isCollapsed && isOpen && (
        <div className="absolute left-full top-0 ml-2 z-50 bg-white rounded-md border border-gray-200 shadow-lg p-2 min-w-[180px]">
          {(item as NavigationParentItem).children.map(child => (
            <Link
              key={child.id}
              to={child.href}
              className={cn(
                'flex items-center rounded-md p-2 text-sm font-medium transition-all duration-200',
                pathname === child.href
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {child.icon && <child.icon className="mr-2 h-4 w-4" />}
              <span>{child.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  ) : (
    <div className="group relative py-1">
      <Link to={item.href} className={cn(commonClasses, isCollapsed ? 'justify-center' : '')}>
        {item.icon && <item.icon className="h-5 w-5" />}
        <span className={titleClasses}>{item.title}</span>
      </Link>
      
      {/* Hover tooltip for collapsed leaf items */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 -translate-y-1/2 top-1/2 rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity z-50">
          {item.title}
        </div>
      )}
    </div>
  );
};

export default NavigationItem; 