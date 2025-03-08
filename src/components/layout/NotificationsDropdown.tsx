import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NotificationsDropdownProps, NotificationItem } from './types';
import { cn } from '@/lib/utils';

const NotificationIcon = ({ type }: { type: NotificationItem['type'] }) => {
  const iconClasses = {
    info: 'bg-blue-100 text-blue-500',
    warning: 'bg-amber-100 text-amber-500',
    success: 'bg-green-100 text-green-500',
    error: 'bg-red-100 text-red-500'
  };

  const iconMap = {
    info: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    warning: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    success: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    error: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  };

  return (
    <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', iconClasses[type])}>
      {iconMap[type]}
    </div>
  );
};

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isNotificationsOpen,
  setIsNotificationsOpen,
  notifications,
  markAllAsRead,
  markAsRead
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Dışarıya tıklama ile dropdown'ı kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsNotificationsOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        aria-expanded={isNotificationsOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Bildirimleri Görüntüle</span>
        <div className="relative">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
      </button>

      {isNotificationsOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
            <h3 className="text-sm font-semibold text-gray-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                onClick={markAllAsRead}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Tümünü Okundu İşaretle
              </Button>
            )}
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150',
                      !notification.read ? 'bg-blue-50/50' : ''
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <NotificationIcon type={notification.type} />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{notification.message}</p>
                      <p className="mt-2 text-xs text-gray-400">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 flex-shrink-0 self-start">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500">Bildiriminiz bulunmuyor.</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-2">
            <Link
              to="/notifications"
              className="block text-center text-xs font-medium text-blue-600 hover:text-blue-800"
              onClick={() => setIsNotificationsOpen(false)}
            >
              Tüm Bildirimleri Görüntüle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown; 