import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Loader2, Volume2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Translator = () => {
  const [loading, setLoading] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("hi");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const languages = [
    { code: "hi", name: "Hindi (हिन्दी)", voice: "hi-IN" },
    { code: "es", name: "Spanish (Español)", voice: "es-ES" },
    { code: "fr", name: "French (Français)", voice: "fr-FR" },
    { code: "de", name: "German (Deutsch)", voice: "de-DE" },
    { code: "zh", name: "Chinese (中文)", voice: "zh-CN" },
    { code: "ja", name: "Japanese (日本語)", voice: "ja-JP" },
    { code: "ar", name: "Arabic (العربية)", voice: "ar-SA" },
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('translate', {
        body: { text: sourceText, targetLanguage }
      });

      if (response.error) throw response.error;

      setTranslatedText(response.data.translation);
      toast.success('Translation complete!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate');
    } finally {
      setLoading(false);
    }
  };

  const speakTranslation = () => {
    if (!translatedText) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translatedText);
    const language = languages.find(l => l.code === targetLanguage);
    utterance.lang = language?.voice || 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Languages className="text-primary" size={32} />
          <div>
            <h3 className="text-2xl font-bold">AI Translator</h3>
            <p className="text-muted-foreground">Translate text to multiple languages including Hindi</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Source Text (English)</label>
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-[250px] bg-background/50"
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Target Language</label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {translatedText && (
              <div className="relative">
                <Textarea
                  value={translatedText}
                  readOnly
                  className="min-h-[200px] bg-secondary/10 border-secondary/20"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={speakTranslation}
                  className="absolute top-2 right-2 rounded-full"
                >
                  <Volume2 size={18} className={isSpeaking ? "text-primary" : ""} />
                </Button>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleTranslate}
          disabled={loading || !sourceText.trim()}
          className="w-full mt-6 bg-gradient-to-r from-primary to-primary-glow"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={18} />
              Translating...
            </>
          ) : (
            <>
              Translate
              <ArrowRight className="ml-2" size={18} />
            </>
          )}
        </Button>
      </Card>
    </div>
  );
};

export default Translator;
