import { GoogleGenerativeAI } from '@google/generative-ai';

// Eğer varsa, window.__ENV__ nesnesini kullan (index.html'de tanımlanabilir)
declare global {
  interface Window {
    __ENV__?: {
      REACT_APP_GEMINI_API_KEY?: string;
      GEMINI_MODEL?: string;
    };
  }
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  
  constructor() {
    // API anahtarını çeşitli kaynaklardan alma, process.env kullanmadan
    // NOT: Bu yalnızca geliştirme için; gerçek bir uygulamada API anahtarınızı kodda saklamayın!
    const apiKey = this.getApiKey();
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Daha güvenli model adı kontrolü
    const modelName = this.getModelName();
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }
  
  // API anahtarını güvenli bir şekilde almaya çalışan yardımcı fonksiyon
  private getApiKey(): string {
    // 1. window.__ENV__ kontrol et (önerilen yaklaşım)
    if (window.__ENV__?.REACT_APP_GEMINI_API_KEY) {
      return window.__ENV__.REACT_APP_GEMINI_API_KEY;
    }
    
    // 2. Fallback - TEST İÇİN - Gerçek uygulamada bu şekilde kullanmayın
    // Geçici bir API anahtarı - gerçek anahtarla değiştirin
    return 'GEMINIAPIKEY';
  }
  
  // Model adını almak için yardımcı fonksiyon
  private getModelName(): string {
    // window.__ENV__'den model adını almayı dene
    if (window.__ENV__?.GEMINI_MODEL) {
      return window.__ENV__.GEMINI_MODEL;
    }
    
    // Standart model adı
    return 'gemini-pro';
  }
  
  async generateResponse(prompt: string): Promise<string> {
    try {
      console.log('Gemini API isteği gönderiliyor:', prompt);
      
      // API isteklerinin bekleyebileceği tüm seçenekleri yapılandırın
      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      };
      
      // Safety settings ve diğer ayarlar
      const safetySettings = [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ];
      
      // Yanıt oluşturma
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings
      });
      
      const response = result.response;
      
      if (!response || !response.text) {
        console.error('API yanıtı boş veya geçersiz', response);
        return 'Üzgünüm, bir cevap oluşturulamadı. Lütfen tekrar deneyin.';
      }
      
      console.log('Gemini API yanıtı alındı:', response.text());
      return response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Hata mesajına göre farklı geri dönüşler
      if (error instanceof Error && error.message.includes('API key')) {
        return 'API anahtarı geçersiz veya eksik. Lütfen sistem yöneticinizle iletişime geçin.';
      } else if (error instanceof Error && error.message.includes('not found')) {
        return 'Kullanılan AI modeli mevcut değil. Lütfen sistem yöneticinizle iletişime geçin.';
      }
      
      return 'Yanıt oluşturulurken bir hata meydana geldi. Lütfen daha sonra tekrar deneyin.';
    }
  }
  
  // Farklı yanıt formatları için ek metodlar eklenebilir
  async generateCodeResponse(prompt: string): Promise<string> {
    return this.generateResponse(`Bu bir kod talebidir. Lütfen sadece işlevsel kod yanıtı ver: ${prompt}`);
  }
  
  async generateStudentResponse(prompt: string): Promise<string> {
    return this.generateResponse(`Bu bir öğrenci sorusudur. Lütfen eğitimsel ve açıklayıcı bir yanıt ver: ${prompt}`);
  }

  async analyzeLearningPattern(data: Record<string, any>): Promise<string> {
    const prompt = `Analyze this learning data and provide insights: ${JSON.stringify(data)}`;
    return this.generateResponse(prompt);
  }

  async generateLearningPath(goals: string[], preferences: Record<string, any>): Promise<string> {
    const prompt = `Create a personalized learning path for these goals: ${goals.join(', ')}\nPreferences: ${JSON.stringify(preferences)}`;
    return this.generateResponse(prompt);
  }

  async getPersonalizedSuggestions(context: Record<string, any>): Promise<string> {
    const prompt = `Based on this context, provide learning suggestions: ${JSON.stringify(context)}`;
    return this.generateResponse(prompt);
  }
  
  // Eğitim asistanı için çözümler üretir
  async generateEducationalSolutions(problem: string, context: Record<string, any>): Promise<string> {
    const prompt = `
    You are an educational AI assistant helping with this problem: ${problem}
    
    Context about the student and their current progress: ${JSON.stringify(context)}
    
    Provide a step-by-step solution that is:
    1. Clear and easy to understand
    2. Educational (explains the concepts)
    3. Personalized to the student's level
    4. Includes appropriate examples
    
    Format your response as markdown with sections for:
    - Problem understanding
    - Conceptual background
    - Step-by-step solution
    - Practice recommendations
    `;
    
    return this.generateResponse(prompt);
  }
  
  // Öğrencinin çalışma davranışlarını analiz eder
  async analyzeStudyBehavior(studyData: Record<string, any>): Promise<string> {
    const prompt = `
    Analyze the following study behavior data and provide insights:
    ${JSON.stringify(studyData)}
    
    Please include:
    1. Patterns in study times and effectiveness
    2. Strength areas and areas for improvement
    3. Personalized recommendations to optimize learning
    4. Suggested schedule adjustments
    
    Focus on actionable insights that could help improve learning outcomes.
    `;
    
    return this.generateResponse(prompt);
  }
  
  // Eğitim içeriğini özetler
  async summarizeEducationalContent(content: string, targetLevel: string): Promise<string> {
    const prompt = `
    Summarize the following educational content in a way that's appropriate for a ${targetLevel} level:
    
    ${content}
    
    Your summary should:
    1. Capture the main concepts and key points
    2. Be concise but thorough
    3. Use language appropriate for the target level
    4. Include a bullet-point list of the most important takeaways
    `;
    
    return this.generateResponse(prompt);
  }
  
  // Öğrencinin sorularına yanıt verir
  async answerStudentQuestion(question: string, studentContext: Record<string, any>): Promise<string> {
    const prompt = `
    Answer the following student question, considering their context:
    
    Question: ${question}
    
    Student context: ${JSON.stringify(studentContext)}
    
    Your answer should:
    1. Be clear and direct
    2. Provide enough context to be educational
    3. Be tailored to the student's level and background
    4. Include examples or analogies if helpful
    5. Invite further exploration of the topic
    `;
    
    return this.generateResponse(prompt);
  }
}