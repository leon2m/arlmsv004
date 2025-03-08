import { logService } from './LogService';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { GeminiService } from './GeminiService';

interface AIResponse {
  suggestions: string[];
  confidence: number;
  context?: Record<string, any>;
}

interface AIRequestOptions {
  maxRetries?: number;
  timeout?: number;
  priority?: 'high' | 'medium' | 'low';
}

class AIService {
  private static instance: AIService;
  private readonly API_ENDPOINT = import.meta.env.VITE_AI_API_ENDPOINT;
  private readonly API_KEY = import.meta.env.VITE_AI_API_KEY;
  private geminiService = new GeminiService();

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async getPersonalizedSuggestions(
    userId: string,
    context: Record<string, any>,
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    performanceMonitor.startMeasure('ai_suggestions', { userId, context });

    try {
      // Gemini API kullanarak öneri alımı
      const geminiResponse = await this.geminiService.getPersonalizedSuggestions(context);
      const suggestions = geminiResponse.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.trim().replace(/^-\s*/, ''));

      performanceMonitor.endMeasure('ai_suggestions');
      
      return {
        suggestions,
        confidence: 0.9,
        context
      };
    } catch (error) {
      // Gemini API ile bağlantı sağlanamadığında fallback olarak REST API'yi kullan
      try {
        const response = await this.makeRequest('/suggestions', {
          userId,
          context,
          ...options
        });

        performanceMonitor.endMeasure('ai_suggestions');
        return response;
      } catch (fallbackError) {
        logService.logError('AI Suggestion Error', {
          error: fallbackError as Error,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userId,
          additionalContext: context
        });
        throw fallbackError;
      }
    }
  }

  async analyzeLearningPattern(
    userId: string,
    learningData: Record<string, any>,
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    performanceMonitor.startMeasure('learning_pattern_analysis', { userId });

    try {
      // Gemini API kullanarak öğrenme analizi
      const geminiResponse = await this.geminiService.analyzeLearningPattern(learningData);
      const suggestions = geminiResponse.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.trim().replace(/^-\s*/, ''));

      performanceMonitor.endMeasure('learning_pattern_analysis');
      
      return {
        suggestions,
        confidence: 0.92,
        context: learningData
      };
    } catch (error) {
      // Fallback olarak REST API kullan
      try {
        const response = await this.makeRequest('/analyze-pattern', {
          userId,
          learningData,
          ...options
        });

        performanceMonitor.endMeasure('learning_pattern_analysis');
        return response;
      } catch (fallbackError) {
        logService.logError('Learning Pattern Analysis Error', {
          error: fallbackError as Error,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userId,
          additionalContext: learningData
        });
        throw fallbackError;
      }
    }
  }

  async generateLearningPath(
    userId: string,
    goals: string[],
    preferences: Record<string, any>,
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    performanceMonitor.startMeasure('generate_learning_path', { userId, goals });

    try {
      // Gemini API kullanarak öğrenme yolu oluşturma
      const geminiResponse = await this.geminiService.generateLearningPath(goals, preferences);
      const suggestions = geminiResponse.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.trim().replace(/^-\s*/, ''));

      performanceMonitor.endMeasure('generate_learning_path');
      
      return {
        suggestions,
        confidence: 0.88,
        context: { goals, preferences }
      };
    } catch (error) {
      // Fallback olarak REST API kullan
      try {
        const response = await this.makeRequest('/learning-path', {
          userId,
          goals,
          preferences,
          ...options
        });

        performanceMonitor.endMeasure('generate_learning_path');
        return response;
      } catch (fallbackError) {
        logService.logError('Learning Path Generation Error', {
          error: fallbackError as Error,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userId,
          additionalContext: { goals, preferences }
        });
        throw fallbackError;
      }
    }
  }

  async generateEducationalSolution(
    userId: string,
    problem: string,
    studentContext: Record<string, any>,
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    performanceMonitor.startMeasure('educational_solution', { userId, problem });

    try {
      const geminiResponse = await this.geminiService.generateEducationalSolutions(problem, studentContext);
      
      // Markdown olarak dönen içeriği bölümlere ayırma
      const sections = geminiResponse.split('##').filter(section => section.trim().length > 0);
      const suggestions = sections.map(section => section.trim());

      performanceMonitor.endMeasure('educational_solution');
      
      return {
        suggestions,
        confidence: 0.95,
        context: { problem, studentContext }
      };
    } catch (error) {
      logService.logError('Educational Solution Generation Error', {
        error: error as Error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userId,
        additionalContext: { problem, studentContext }
      });
      throw error;
    }
  }

  async answerStudentQuestion(
    userId: string, 
    question: string, 
    studentContext: Record<string, any>,
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    performanceMonitor.startMeasure('student_question', { userId, question });

    try {
      const geminiResponse = await this.geminiService.answerStudentQuestion(question, studentContext);
      
      // Yanıtı paragraflar halinde ayırma
      const paragraphs = geminiResponse.split('\n\n').filter(p => p.trim().length > 0);
      const suggestions = paragraphs.map(p => p.trim());

      performanceMonitor.endMeasure('student_question');
      
      return {
        suggestions,
        confidence: 0.94,
        context: { question, studentContext }
      };
    } catch (error) {
      logService.logError('Student Question Error', {
        error: error as Error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userId,
        additionalContext: { question, studentContext }
      });
      throw error;
    }
  }

  private async makeRequest(
    endpoint: string,
    data: Record<string, any>,
    options: AIRequestOptions = {}
  ): Promise<any> {
    const {
      maxRetries = 3,
      timeout = 30000,
      priority = 'medium'
    } = options;

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.API_ENDPOINT}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`,
            'X-Priority': priority
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        attempt++;
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}

export const aiService = AIService.getInstance();
