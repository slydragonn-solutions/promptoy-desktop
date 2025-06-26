import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityIcon, SendHorizonalIcon, SparklesIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');

    // Simulate AI response (replace with actual AI integration)
    const assistantResponse = 'This is a simulated AI response.';
    setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
  };

  return (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="ghost"><SparklesIcon /></Button>
        </SheetTrigger>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>
            <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" /> AI Agent
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-10rem)] p-4 border-y border-y-neutral-200">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 text-neutral-500 text-center">
                <span className="text-2xl">👋</span>
                <span className="text-sm">Hello, I am your AI agent. I can help you with your prompts.</span>
            </div>
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 p-4 rounded-lg ${
                message.role === 'user' ? 'justify-end bg-primary/10' : 'justify-start bg-secondary/10'
              }`}>
                <div className="max-w-[80%]">
                  <p className={`text-sm ${
                    message.role === 'user' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Tooltip>
                <TooltipTrigger>
                    <Button variant="outline"><ActivityIcon /></Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Prompt Review</p>
                </TooltipContent>
            </Tooltip>
            <Button type="submit"><SendHorizonalIcon /></Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}