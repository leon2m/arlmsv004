import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavbarProps } from './types';
import { cn } from '@/lib/utils';
import ProfileDropdown from './ProfileDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import MessagesDropdown from './MessagesDropdown';

const Navbar: React.FC<NavbarProps> = ({
  isCollapsed,
  toggleSidebar,
  user,
  signOut,
  notifications,
  messages,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markMessageAsRead,
  markAllMessagesAsRead
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Logo - en sol kısımda sabit */}
      <div className="absolute top-0 left-0 z-50 flex h-16 items-center justify-center px-3 bg-white border-r border-gray-200 shadow-sm" style={{ width: isCollapsed ? '64px' : '256px' }}>
        <Link to="/" className="flex items-center">
          <img 
            src="https://arlearning.com.tr/uploads/img/general/1732669625-AR%20(1500%20x%20313%20piksel)%20(3).png" 
            alt="AR Learning Logo"
            className="max-h-8 w-auto object-contain transition-all duration-300"
            style={{ maxWidth: isCollapsed ? '40px' : '200px' }}
          />
        </Link>
      </div>
      
      <div className={cn("flex w-full items-center", isCollapsed ? "ml-16" : "ml-64", "transition-all duration-300")}>
        <div className="flex flex-1 items-center justify-between">
          {/* Mobil menü butonu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Arama kutusu */}
          <div className={cn(
            "hidden md:flex items-center",
            isSearchOpen ? "w-full" : "w-96"
          )}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <Input
                type="search"
                placeholder="Kurs, içerik veya kişi ara..."
                className="pl-10 rounded-xl w-full focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {/* Mobil arama butonu */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            {!isSearchOpen ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close Search"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Mobil tam ekran arama */}
          {isSearchOpen && (
            <div className="absolute inset-0 z-50 md:hidden bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500" />
                  </div>
                  <Input
                    type="search"
                    placeholder="Kurs, içerik veya kişi ara..."
                    autoFocus
                    className="pl-10 w-full"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-gray-500"
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Close Search"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Sağ taraf aksiyonlar */}
          <div className="flex items-center gap-2">
            <NotificationsDropdown
              isNotificationsOpen={isNotificationsOpen}
              setIsNotificationsOpen={setIsNotificationsOpen}
              notifications={notifications}
              markAllAsRead={markAllNotificationsAsRead}
              markAsRead={markNotificationAsRead}
            />

            <MessagesDropdown
              isMessagesOpen={isMessagesOpen}
              setIsMessagesOpen={setIsMessagesOpen}
              messages={messages}
              markAllAsRead={markAllMessagesAsRead}
              markAsRead={markMessageAsRead}
            />

            <ProfileDropdown
              isDropdownOpen={isProfileOpen}
              setIsDropdownOpen={setIsProfileOpen}
              user={user}
              signOut={signOut}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 