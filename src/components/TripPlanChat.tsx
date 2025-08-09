import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
interface TripPlanChatProps {
  tripId: string;
  currentPlan: any;
  onPlanUpdate: (updatedPlan: any) => void;
}
export const TripPlanChat: React.FC<TripPlanChatProps> = ({
  tripId,
  currentPlan,
  onPlanUpdate
}) => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hello! I can help you modify your trip plan. What changes would you like to make?',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('modify-trip-plan', {
        body: {
          tripId,
          currentPlan,
          userMessage: input,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }
      });
      if (error) throw error;
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // If the AI provided an updated plan, update it
      if (data.updatedPlan) {
        onPlanUpdate(data.updatedPlan);

        // Update the trip in the database
        const {
          error: updateError
        } = await supabase.from('trips').update({
          ai_generated_plan: JSON.stringify(data.updatedPlan)
        }).eq('id', tripId);
        if (updateError) {
          console.error('Error updating plan:', updateError);
        } else {
          toast.success('Trip plan updated!');
        }
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Chat with AI to Modify Plan</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 mb-4 border rounded-lg p-4">
          <div className="space-y-4">
            {messages.map((message, index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <div className="flex items-start space-x-2">
                    {message.role === 'user' ? <User className="h-4 w-4 mt-1 flex-shrink-0" /> : <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                    <div>
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </ScrollArea>
        
        <div className="flex space-x-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask me to modify your trip plan..." onKeyPress={e => e.key === 'Enter' && sendMessage()} disabled={loading} />
          <Button onClick={sendMessage} disabled={loading || !input.trim()} className="text-fuchsia-50 bg-purple-800 hover:bg-purple-700">
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>;
};