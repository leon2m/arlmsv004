import React, { useRef, useEffect } from 'react';
import { MessageSquare, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessagesDropdownProps } from './types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MessagesDropdown: React.FC<MessagesDropdownProps> = ({
  isMessagesOpen,
  setIsMessagesOpen,
  messages,
  markAllAsRead,
  markAsRead
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = messages.filter(m => !m.read).length;

  // Dışarıya tıklama ile dropdown'ı kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsMessagesOpen]);

  // Mesajı kısaltma
  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message;
    return `${message.substring(0, maxLength)}...`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setIsMessagesOpen(!isMessagesOpen)}
        aria-expanded={isMessagesOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Mesajları Görüntüle</span>
        <div className="relative">
          <MessageSquare className="h-6 w-6" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
      </button>

      {isMessagesOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
            <h3 className="text-sm font-semibold text-gray-900">Mesajlar</h3>
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
            {messages.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150',
                      !message.read ? 'bg-blue-50/50' : ''
                    )}
                    onClick={() => markAsRead(message.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                      <AvatarFallback>
                        {message.sender.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{message.sender.name}</p>
                        <p className="text-xs text-gray-400">{message.time}</p>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {truncateMessage(message.message)}
                      </p>
                    </div>
                    {!message.read && (
                      <div className="ml-2 flex-shrink-0 self-start">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500">Mesajınız bulunmuyor.</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-2">
            <Link
              to="/messages"
              className="block text-center text-xs font-medium text-blue-600 hover:text-blue-800"
              onClick={() => setIsMessagesOpen(false)}
            >
              Tüm Mesajları Görüntüle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesDropdown; 