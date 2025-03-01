import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { GeminiService } from '@/services/GeminiService';

interface Message {
  id?: number;
  session_id: number;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  last_message?: string;
}

export const ChatBot = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentSession, setCurrentSession] = useState<number | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const geminiService = new GeminiService();
  
  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);
  
  // Mevcut oturum değiştiğinde, o oturumdaki mesajları yükle
  useEffect(() => {
    if (currentSession) {
      loadMessagesForSession(currentSession);
    }
  }, [currentSession]);
  
  // Otomatik scroll özelliği
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Kullanıcının tüm chat oturumlarını yükle
  const loadChatSessions = async () => {
    try {
      if (!user || !user.id) {
        console.error('Kullanıcı bulunamadı');
        return;
      }
      
      // Oturum yenileme işlemi - RLS için önemli
      await refreshSession();
      
      // RPC fonksiyonu kullanarak oturumları al - RLS problemlerini aşmak için
      const { data, error } = await supabase.rpc('get_user_chat_sessions', {
        p_user_id: user.id
      });
        
      if (error) {
        console.error('Chat oturumları yüklenirken hata:', error);
        throw error;
      }
      
      // RPC veri yapısını bileşen için uygun formata dönüştür
      const formattedSessions = Array.isArray(data) ? data : [];
      
      setChatSessions(formattedSessions);
      
      // Eğer oturum yoksa, yeni bir tane oluştur
      if (formattedSessions.length > 0) {
        setCurrentSession(formattedSessions[0].id);
      } else {
        initializeChat();
      }
    } catch (error) {
      console.error('Chat oturumları yüklenirken hata:', error);
      // Hata durumunda chat oturumu oluşturmayı dene
      initializeChat();
    }
  };
  
  // Supabase oturumunu yenile
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Oturum yenilenirken hata:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Oturum yenileme hatası:', error);
      throw error;
    }
  };
  
  // Yeni bir chat oturumu başlat
  const initializeChat = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user || !user.id) {
        console.error('Kullanıcı oturumu geçerli değil');
        setError(new Error('Kullanıcı oturumu geçerli değil. Lütfen yeniden giriş yapın.'));
        setIsLoading(false);
        return;
      }
      
      console.log('Sohbet oturumu oluşturuluyor... Kullanıcı ID:', user.id);
      
      // Önce Supabase oturumunu yenile - RLS sorunları için önemli
      await refreshSession();
      
      // Doğrudan RPC ile oluştur (RLS bypass için)
      console.log('RPC yöntemi ile oturum oluşturuluyor...');
      const { data: sessionId, error: rpcError } = await supabase.rpc('create_chat_session', {
        p_user_id: user.id,
        p_title: 'Yeni Sohbet'
      });
      
      if (rpcError) {
        console.error('RPC hatası:', rpcError);
        throw new Error(rpcError.message || 'Sohbet oturumu oluşturulamadı');
      }
      
      if (sessionId) {
        console.log('RPC yöntemi başarılı. Oturum ID:', sessionId);
        setCurrentSession(sessionId);
        await setupChatSession(sessionId);
        return;
      } else {
        throw new Error('Oturum ID bulunamadı');
      }
    } catch (error) {
      console.error('Sohbet başlatma hatası:', error);
      setError(error instanceof Error ? error : new Error('Bilinmeyen bir hata oluştu'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Chat oturumu için karşılama mesajı ve diğer ayarlar
  const setupChatSession = async (sessionId: number) => {
    try {
      setMessages([]);
      
      // Chatbot'tan bir karşılama mesajı ekle
      const welcomeMessage: Message = {
        session_id: sessionId,
        content: "Merhaba! Size nasıl yardımcı olabilirim?",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      await saveMessageToDatabase(welcomeMessage);
      setMessages([welcomeMessage]);
      
      // Oturumları yeniden yükle
      await loadChatSessions();
    } catch (error) {
      console.error('Karşılama mesajı oluşturma hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Belirli bir oturumdaki mesajları yükle
  const loadMessagesForSession = async (sessionId: number) => {
    setIsLoading(true);
    try {
      // Oturum yenileme işlemi - RLS için önemli
      await refreshSession();
      
      // RPC kullanarak mesajları al
      const { data, error } = await supabase.rpc('get_chat_messages', {
        p_session_id: sessionId
      });
        
      if (error) {
        console.error('Mesajlar yüklenirken hata:', error);
        throw error;
      }
      
      // Mesajları düzenle
      const formattedMessages: Message[] = Array.isArray(data) ? data.map(msg => ({
        id: msg.id,
        session_id: msg.session_id,
        content: msg.content,
        isUser: msg.is_user,
        timestamp: msg.timestamp
      })) : [];
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      setError(error instanceof Error ? error : new Error('Bilinmeyen bir hata oluştu'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mesajı veritabanına kaydet
  const saveMessageToDatabase = async (message: Message) => {
    try {
      // Oturum yenileme işlemi - RLS için önemli
      await refreshSession();
      
      // RPC ile mesaj kaydet
      const { error } = await supabase.rpc('save_chat_message', {
        p_session_id: message.session_id,
        p_content: message.content,
        p_is_user: message.isUser,
        p_timestamp: message.timestamp
      });
        
      if (error) {
        console.error('Mesaj kaydedilirken hata:', error);
        throw error;
      }
    } catch (error) {
      console.error('Mesaj kaydedilirken hata:', error);
      throw error;
    }
  };
  
  // Mesajı gönder
  const handleSendMessage = async () => {
    if (!message.trim() || !currentSession || isLoading) return;
    
    const userMessage: Message = {
      session_id: currentSession,
      content: message.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setIsLoading(true);
    setMessage(''); // Input'u temizle
    
    try {
      // Kullanıcı mesajını UI'da ve veritabanında güncelle
      setMessages(prevMessages => [...prevMessages, userMessage]);
      await saveMessageToDatabase(userMessage);
      
      // AI yanıtını oluştur
      const response = await geminiService.generateResponse(message.trim());
      
      // AI yanıtını ekle
      const aiMessage: Message = {
        session_id: currentSession,
        content: response || "Üzgünüm, yanıt oluşturulamadı. Lütfen tekrar deneyin.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      await saveMessageToDatabase(aiMessage);
      
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      setError(error instanceof Error ? error : new Error('Mesaj gönderilemedi'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Otomatik scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>AI Asistan</span>
          {currentSession && (
            <Button variant="outline" size="icon" onClick={() => {}}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar>
                  {msg.isUser ? (
                    <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center">U</div>
                  ) : (
                    <div className="bg-muted text-muted-foreground rounded-full w-10 h-10 flex items-center justify-center">AI</div>
                  )}
                </Avatar>
                <div className={`max-w-xs p-3 rounded-lg ${msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {isLoading && <div className="text-center py-4">Yükleniyor...</div>}
        {error && (
          <div className="text-center py-4 text-destructive">
            Hata: {error.message || 'Bir hata oluştu'}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={() => {
                setError(null);
                initializeChat();
              }}
            >
              Tekrar Dene
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <form 
          className="flex w-full space-x-2" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Textarea 
            placeholder="Mesajınızı yazın..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow"
            disabled={isLoading || !currentSession}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !message.trim() || !currentSession}
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}; 