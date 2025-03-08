import { NotificationItem, MessageItem } from '@/components/layout/types';

/**
 * Kullanıcı tipi
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  created_at?: string;
}

// Veri tiplerini belirleme
type DataType = 'notifications' | 'messages' | 'user' | 'all';

/**
 * Rastgele bildirim ve mesaj verileri üreten fonksiyon
 * Kullanıcıya özgü mock veriler üretmek için kullanılır
 * 
 * @param dataType - Üretilecek veri tipi (tümü için all)
 * @returns İstenen veri tipini içeren objeler
 */
export function generateMockData(dataType: DataType = 'all') {
  // Rastgele bildirimler oluştur
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Yeni Kurs Eklendi',
      message: 'İlgilenebileceğiniz "React.js ile Modern Web Geliştirme" kursu eklendi.',
      time: '1 saat önce',
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Ödeviniz Değerlendirildi',
      message: 'JavaScript Temelleri kursundaki ödevinize 90/100 puan verildi.',
      time: '3 saat önce',
      read: false,
      type: 'success'
    },
    {
      id: '3',
      title: 'Yaklaşan Sınav Hatırlatması',
      message: 'Veri Yapıları sınavınız 2 gün sonra başlayacak.',
      time: '5 saat önce',
      read: true,
      type: 'warning'
    },
    {
      id: '4',
      title: 'Sisteme Erişim Problemi',
      message: 'Dün yaşanan sistem kesintisinden dolayı özür dileriz. Tüm servisler şu anda aktif.',
      time: '1 gün önce',
      read: true,
      type: 'error'
    },
    {
      id: '5',
      title: 'Sertifikanız Hazır',
      message: 'Web Geliştirme kursu sertifikanız hazır. Profilinizden indirebilirsiniz.',
      time: '2 gün önce',
      read: true,
      type: 'success'
    }
  ];

  // Rastgele mesajlar oluştur
  const messages: MessageItem[] = [
    {
      id: '1',
      sender: {
        name: 'Ahmet Yılmaz',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      message: 'Merhaba, React projesi için hazırladığın dökümanı inceledim. Harika görünüyor!',
      time: '10 dk önce',
      read: false
    },
    {
      id: '2',
      sender: {
        name: 'Ayşe Demir',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      message: 'Yarınki çalışma grubu toplantısı 14:00\'e alındı. Katılabilecek misin?',
      time: '30 dk önce',
      read: false
    },
    {
      id: '3',
      sender: {
        name: 'Mehmet Öz',
        avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
      },
      message: 'Node.js projesinde yardıma ihtiyacım var. Müsait olduğunda bir göz atabilir misin?',
      time: '2 saat önce',
      read: true
    },
    {
      id: '4',
      sender: {
        name: 'Zeynep Kaya',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
      },
      message: 'Merhaba, JavaScript kursunda paylaştığın kaynaklar için teşekkür ederim. Çok yardımcı oldu.',
      time: '1 gün önce',
      read: true
    },
    {
      id: '5',
      sender: {
        name: 'Hasan Demir',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
      },
      message: 'Grup projesine katılımınız için teşekkür ederiz. Detayları e-posta ile gönderdim.',
      time: '2 gün önce',
      read: true
    }
  ];

  // Rastgele kullanıcı oluştur
  const user: User = {
    id: 'user-' + Math.floor(Math.random() * 10000),
    email: 'user' + Math.floor(Math.random() * 100) + '@example.com',
    firstName: 'Test',
    lastName: 'Kullanıcı',
    role: 'admin',
    avatar: '/images/avatars/avatar_' + Math.floor(Math.random() * 10 + 1) + '.jpg',
    created_at: new Date().toISOString()
  };

  // İstenen veri tipini döndür
  if (dataType === 'notifications') {
    return { notifications };
  } else if (dataType === 'messages') {
    return { messages };
  } else if (dataType === 'user') {
    return user;
  } else {
    return { notifications, messages };
  }
}

/**
 * Kullanıcı profil verisi üreten fonksiyon - Eski fonksiyon, uyumluluk için
 */
export function generateUserProfile(): User {
  return generateMockData('user') as User;
} 