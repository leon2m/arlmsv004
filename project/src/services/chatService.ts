import { supabase } from '../lib/supabase';
import OpenAI from 'openai';

const baseURL = import.meta.env.VITE_AI_API_URL;
const apiKey = import.meta.env.VITE_AI_API_KEY;

const api = new OpenAI({
  apiKey,
  baseURL,
  dangerouslyAllowBrowser: true
});

export interface ChatMessage {
  id: number;
  content: string;
  type: 'user' | 'bot';
  created_at: string;
}

export interface ChatSession {
  id: number;
  title: string;
  course_id?: number;
  lesson_id?: number;
  created_at: string;
}

export const chatService = {
  async createSession(userId: string, title: string, courseId?: number, lessonId?: number): Promise<ChatSession> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title,
        course_id: courseId,
        lesson_id: lessonId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMessages(sessionId: number): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async addMessage(sessionId: number, content: string, type: 'user' | 'bot', userId: string): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        content,
        type,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async generateBotResponse(prompt: string, systemMessage: string = "Sen bir eğitim asistanısın. Türkçe cevap ver."): Promise<string> {
    try {
      const completion = await api.chat.completions.create({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 256
      });

      return completion.choices[0].message.content || 'Üzgünüm, bir yanıt oluşturulamadı.';
    } catch (error) {
      console.error('Bot yanıtı oluşturma hatası:', error);
      throw error;
    }
  }
};