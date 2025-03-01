import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface MenuItem {
  id: string;
  title: string;
  icon: LucideIcon;
  path: string;
  color?: string;
  badge?: number;
}

export interface NavigationItemBase {
  id: string;
  title: string;
  icon: LucideIcon;
}

export interface NavigationLeafItem extends NavigationItemBase {
  href: string;
}

export interface NavigationParentItem extends NavigationItemBase {
  children: (NavigationLeafItem & { icon?: LucideIcon })[];
}

export type NavigationItem = NavigationLeafItem | NavigationParentItem;

export interface NavigationItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  activeMenu: string | null;
  toggleSubmenu: (menu: string) => void;
  pathname: string;
}

export interface LayoutProps {
  children: ReactNode;
}

export interface ProfileDropdownProps {
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: any; // Gerçek user türü burada genişletilebilir
  signOut: () => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface NotificationsDropdownProps {
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notifications: NotificationItem[];
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
}

export interface MessageItem {
  id: string;
  sender: {
    name: string;
    avatar: string;
  };
  message: string;
  time: string;
  read: boolean;
}

export interface MessagesDropdownProps {
  isMessagesOpen: boolean;
  setIsMessagesOpen: React.Dispatch<React.SetStateAction<boolean>>;
  messages: MessageItem[];
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
}

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  activeMenu: string | null;
  setActiveMenu: React.Dispatch<React.SetStateAction<string | null>>;
  pathname: string;
}

export interface NavbarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  user: any; // Gerçek user türü burada genişletilebilir
  signOut: () => void;
  notifications: NotificationItem[];
  messages: MessageItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  markMessageAsRead: (id: string) => void;
  markAllMessagesAsRead: () => void;
} 