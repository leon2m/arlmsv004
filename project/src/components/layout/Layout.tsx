import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { LayoutProps, NotificationItem, MessageItem } from './types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import ChatbotWidget from '@/components/ChatbotWidget';

// Veri yükleme durum takibi için tip
interface DataStatus {
  loading: boolean;
  error: string | null;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const auth = useAuth();
  const user = auth?.user;
  const signOut = auth?.signOut;
  const pathname = location.pathname;

  // Sidebar durumu
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Bildirim ve mesaj verileri
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [dataStatus, setDataStatus] = useState<DataStatus>({ loading: false, error: null });

  // localStorage'dan sidebar durumunu yükleme
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Sidebar durumu yüklenirken hata:', error);
    }
  }, []);

  // Sidebar durumunu localStorage'a kaydetme
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    } catch (error) {
      console.error('Sidebar durumu kaydedilirken hata:', error);
    }
  }, [isCollapsed]);

  // Bildirim ve mesajları veritabanından çekme
  useEffect(() => {
    const fetchNotificationsAndMessages = async () => {
      if (!user?.id) return;
      
      setDataStatus({ loading: true, error: null });
      
      try {
        // Notifications tablosunun varlığını kontrol et
        const { error: tableCheckError } = await supabase
          .from('notifications')
          .select('id')
          .limit(1)
          .maybeSingle();
        
        let notificationsData: any[] = [];
        
        // Eğer tablo varsa bildirimleri çek
        if (!tableCheckError) {
          // Bildirimleri Supabase'den çek
          const { data: fetchedNotifications, error: notificationsError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (notificationsError) {
            console.warn(`Bildirimler çekilirken hata: ${notificationsError.message}`);
          } else {
            notificationsData = fetchedNotifications || [];
          }
        } else {
          console.warn('Notifications tablosu bulunamadı');
        }

        // Messages tablosunun varlığını kontrol et
        const { error: messagesTableCheckError } = await supabase
          .from('messages')
          .select('id')
          .limit(1)
          .maybeSingle();
        
        let messagesData: any[] = [];
        
        // Eğer tablo varsa mesajları çek
        if (!messagesTableCheckError) {
          // Mesajları Supabase'den çek
          const { data: fetchedMessages, error: messagesError } = await supabase
            .from('messages')
            .select(`
              id, 
              message, 
              created_at,
              read,
              sender_id,
              sender_name,
              sender_avatar
            `)
            .eq('recipient_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (messagesError) {
            console.warn(`Mesajlar çekilirken hata: ${messagesError.message}`);
          } else {
            messagesData = fetchedMessages || [];
          }
        } else {
          console.warn('Messages tablosu bulunamadı');
        }

        // Verileri formatla
        const formattedNotifications: NotificationItem[] = notificationsData.map(item => ({
          id: item.id,
          title: item.title,
          message: item.message,
          time: new Date(item.created_at).toLocaleDateString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
          }),
          read: item.read,
          type: item.type || 'info'
        }));

        // Mesajları formatla
        const formattedMessages: MessageItem[] = messagesData.map(item => ({
          id: item.id,
          sender: {
            name: item.sender_name || 'İsimsiz Kullanıcı',
            avatar: item.sender_avatar || '/images/avatars/default.jpg'
          },
          message: item.message,
          time: new Date(item.created_at).toLocaleDateString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
          }),
          read: item.read
        }));

        setNotifications(formattedNotifications);
        setMessages(formattedMessages);
        setDataStatus({ loading: false, error: null });
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        setDataStatus({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Bildirim ve mesajlar yüklenirken bir hata oluştu'
        });
        
        // Hata durumunda boş diziler kullan
        setNotifications([]);
        setMessages([]);
      }
    };

    fetchNotificationsAndMessages();
  }, [user?.id]);

  // Bildirim işlemleri
  const markNotificationAsRead = async (id: string) => {
    try {
      // Önce UI'ı güncelle (optimistik güncelleme)
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      // Sonra veritabanını güncelle
      if (user?.id) {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id)
          .eq('user_id', user.id);
          
        if (error) {
          throw new Error(`Bildirim güncellenirken hata: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Bildirim işaretleme hatası:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      // Önce UI'ı güncelle
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Sonra veritabanını güncelle
      if (user?.id) {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .in('id', notifications.map(n => n.id));
          
        if (error) {
          throw new Error(`Bildirimler toplu güncellenirken hata: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Tüm bildirimleri okundu işaretleme hatası:', error);
    }
  };

  // Mesaj işlemleri
  const markMessageAsRead = async (id: string) => {
    try {
      // Önce UI'ı güncelle
      setMessages(prev => 
        prev.map(message => 
          message.id === id ? { ...message, read: true } : message
        )
      );
      
      // Sonra veritabanını güncelle
      if (user?.id) {
        const { error } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('id', id)
          .eq('recipient_id', user.id);
          
        if (error) {
          throw new Error(`Mesaj güncellenirken hata: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Mesaj işaretleme hatası:', error);
    }
  };

  const markAllMessagesAsRead = async () => {
    try {
      // Önce UI'ı güncelle
      setMessages(prev => 
        prev.map(message => ({ ...message, read: true }))
      );
      
      // Sonra veritabanını güncelle
      if (user?.id) {
        const { error } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('recipient_id', user.id)
          .in('id', messages.map(m => m.id));
          
        if (error) {
          throw new Error(`Mesajlar toplu güncellenirken hata: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Tüm mesajları okundu işaretleme hatası:', error);
    }
  };

  // Sidebar geçişini değiştirme
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        user={user}
        signOut={signOut}
        notifications={notifications}
        messages={messages}
        markNotificationAsRead={markNotificationAsRead}
        markAllNotificationsAsRead={markAllNotificationsAsRead}
        markMessageAsRead={markMessageAsRead}
        markAllMessagesAsRead={markAllMessagesAsRead}
      />
      
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        pathname={pathname}
      />
      
      <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'} pt-16 px-4 sm:px-6 md:px-8 pb-8`}>
        {children}
      </main>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default Layout; 