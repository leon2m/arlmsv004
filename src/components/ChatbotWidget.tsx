import * as React from 'react';
import { useAuth } from '../hooks/useAuth';
import { GeminiService } from '../services/GeminiService';
import '../styles/chatbotWidget.css';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const geminiService = new GeminiService();

  // Sohbet açıldığında hoşgeldin mesajı ekle
  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          content: "Merhaba! Ben AR Eğitim Asistanı. Size nasıl yardımcı olabilirim?",
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Yeni mesaj eklendiğinde otomatik kaydırma
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Chatbot'u aç/kapat
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    // Açıldığında input'a focus ol
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };

  // Mesaj gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // AI yanıtı almak için GeminiService'i kullan
      const aiResponse = await geminiService.generateResponse(userMessage.content);
      
      setMessages(prevMessages => [
        ...prevMessages,
        {
          content: aiResponse,
          isUser: false,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Yanıt alınırken hata oluştu:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
          isUser: false,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button 
          className="chatbot-toggle-button"
          onClick={toggleChatbot}
          aria-label="Eğitim Asistanını Aç"
        >
          <span>?</span>
        </button>
      )}

      <div className={`chatbot-window ${isOpen ? 'opening' : 'closing'}`}>
        <div className="chatbot-header">
          <h3>AR Eğitim Asistanı</h3>
          <button onClick={toggleChatbot}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="chatbot-messages">
          <div>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.isUser ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">{msg.content}</div>
                <div className="message-timestamp">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai-message">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form className="chatbot-input" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Bir soru sormak için yazın..."
            className="slide-up"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`${isLoading ? '' : 'pulse-animation'}`}
            disabled={isLoading || !inputValue.trim()}
          >
            <span aria-hidden="true">➤</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotWidget; 