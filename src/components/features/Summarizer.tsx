import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Summarizer = () => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.txt')) {
      toast.error('Please upload a PDF or TXT file');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        setText(content.slice(0, 10000)); // Limit to first 10k characters
        toast.success('File uploaded successfully!');
        setLoading(false);
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Failed to read file');
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error('Please enter or upload text to summarize');
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('summarize', {
        body: { text, fileType: 'pdf' }
      });

      if (response.error) throw response.error;

      setSummary(response.data.summary);
      toast.success('Summary generated!');
    } catch (error) {
      console.error('Summarization error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const speakSummary = () => {
    if (!summary) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-primary" size={32} />
          <div>
            <h3 className="text-2xl font-bold">Document Summarizer</h3>
            <p className="text-muted-foreground">Upload or paste text to get AI summaries</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload Document</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={loading}
              >
                <Upload size={18} className="mr-2" />
                Upload PDF or TXT
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Or Paste Text</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              className="min-h-[200px] bg-background/50"
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
            className="w-full bg-gradient-to-r from-primary to-primary-glow"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />
                Generating Summary...
              </>
            ) : (
              'Generate Summary'
            )}
          </Button>
        </div>
      </Card>

      {summary && (
        <Card className="glass-card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Summary</h3>
            <Button
              variant="outline"
              size="icon"
              onClick={speakSummary}
              className="rounded-full"
            >
              <Volume2 size={18} className={isSpeaking ? "text-primary" : ""} />
            </Button>
          </div>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{summary}</p>
        </Card>
      )}
    </div>
  );
};

export default Summarizer;
