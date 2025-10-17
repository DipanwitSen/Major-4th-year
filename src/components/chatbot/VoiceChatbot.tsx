import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const VoiceChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice recognition error. Please try again.');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('🎤 Listening... Speak now!');
    }
  };

  const speakText = (text: string) => {
    if (!synthesisRef.current) {
      toast.error('Text-to-speech not supported');
      return;
    }

    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('Failed to speak response');
    };

    synthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isProcessing) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to use the chatbot');
        return;
      }

      // Stream response from AI
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantMessage
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Save messages to database
      await supabase.from('chat_messages').insert([
        { user_id: user.id, role: 'user', content: textToSend },
        { user_id: user.id, role: 'assistant', content: assistantMessage, has_audio: true }
      ]);

      // Automatically speak the response
      speakText(assistantMessage);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to process message');
      setMessages(prev => prev.slice(0, -1)); // Remove empty assistant message
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 mb-4 rounded-2xl glass-card">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <h3 className="text-xl font-semibold mb-2">Start a conversation! 🎤</h3>
            <p>Type or speak to chat with Lovable AI</p>
          </div>
        )}
        {messages.map((message, index) => (
          <Card
            key={index}
            className={`p-4 animate-fade-in ${
              message.role === "user"
                ? "ml-12 bg-primary/10 border-primary/20"
                : "mr-12 bg-secondary/10 border-secondary/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">
                  {message.role === "user" ? "You" : "Lovable AI 🤖"}
                </p>
                <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "assistant" && message.content && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => speakText(message.content)}
                  className="shrink-0"
                >
                  <Volume2 size={18} />
                </Button>
              )}
            </div>
          </Card>
        ))}
        {isProcessing && (
          <Card className="mr-12 p-4 bg-secondary/10 border-secondary/20 animate-pulse">
            <div className="flex items-center gap-2">
              <div>Lovable is thinking...</div>
            </div>
          </Card>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant={isListening ? "destructive" : "outline"}
            onClick={toggleListening}
            disabled={isProcessing}
            className="rounded-full shrink-0"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            placeholder="Type your message or use voice..."
            disabled={isProcessing || isListening}
            className="flex-1 bg-background/50"
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isProcessing}
            className="rounded-full bg-gradient-to-r from-primary to-primary-glow shrink-0"
          >
            <Send size={20} />
          </Button>
          {isSpeaking && (
            <Button
              size="icon"
              variant="outline"
              onClick={stopSpeaking}
              className="rounded-full shrink-0"
            >
              <VolumeX size={20} />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {isListening
            ? "🎤 Listening..."
            : isSpeaking
            ? "🔊 Speaking..."
            : "Click the mic to speak or type your message"}
        </p>
      </div>
    </div>
  );
};

export default VoiceChatbot;
