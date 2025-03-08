import React, { useState } from 'react';
import { Brain, RefreshCw, Clock, CheckCircle, Zap, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { AIRecommendation } from './types';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AIAssistantProps {
  recommendations: AIRecommendation[];
  onRefresh?: () => void;
  userId: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ recommendations, onRefresh, userId }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string[]>([]);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  
  const { 
    isLoading,
    answerQuestion
  } = useAIAssistant(userId);
  
  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setIsAskingQuestion(true);
    try {
      const response = await answerQuestion(question, {
        userLevel: 'intermediate',
        previousQuestions: [],
        learningStyle: 'visual',
        preferredLanguage: 'tr'
      });
      
      setAnswer(response);
    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setIsAskingQuestion(false);
    }
  };

  return (
    <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Destekli Öğrenme Asistanı</h3>
            <p className="text-sm text-gray-600">Kişiselleştirilmiş öğrenme önerileri</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Çevrimiçi
        </Badge>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="recommendations">Öneriler</TabsTrigger>
          <TabsTrigger value="questions">Soru & Cevap</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommendations" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Öneriler */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Önerilen Hedefler</h4>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Yenile
                </Button>
              </div>
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900">{recommendation.title}</h5>
                      <p className="text-sm text-gray-600">{recommendation.description}</p>
                    </div>
                    <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'outline'}>
                      {recommendation.priority === 'high' ? 'Öncelikli' : 'Normal'}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>İlerleme</span>
                      <span>{recommendation.progress}%</span>
                    </div>
                    <Progress value={recommendation.progress} className="h-2" />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {recommendation.estimatedHours} saat
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      Detaylar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Öğrenme İstatistikleri */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-4">AI Önerileri</h4>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600">
                  Mevcut yetkinliklerinize göre önerilen hedefler:
                  <ul className="mt-2 space-y-2">
                    {recommendations.slice(0, 3).map((rec) => (
                      <li key={rec.id} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {rec.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Öğrenme Analizi</h5>
                <p className="text-sm text-gray-600 mb-4">
                  Öğrenme verilerinize göre, aşağıdaki alanlarda gelişim gösterebilirsiniz:
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Frontend Geliştirme</span>
                      <span>85%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Backend Geliştirme</span>
                      <span>70%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>DevOps</span>
                      <span>55%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '55%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="questions" className="mt-0">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">AI Eğitim Asistanınıza Sorun</h4>
            </div>
            
            <div className="mb-4">
              <Textarea
                placeholder="Eğitim içeriği, terimler veya konseptler hakkında bir soru sorun..."
                className="min-h-20 resize-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleAskQuestion}
                  disabled={isAskingQuestion || !question.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAskingQuestion ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Yanıtlanıyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Soru Sor
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {answer.length > 0 && (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <h5 className="font-medium">AI Yanıtı</h5>
                </div>
                
                <div className="text-gray-700 space-y-4">
                  {answer.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 