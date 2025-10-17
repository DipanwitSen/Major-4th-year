import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, FileText, Users, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 floating">
            <Sparkles className="text-primary" size={20} />
            <span className="text-sm font-medium">AI-Powered Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Lovable AI Platform</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the future of AI with voice-enabled chatbot, smart document processing, 
            and powerful analytics tools. 🌸💙
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="text-lg px-8 py-7 rounded-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-white font-semibold glow"
            >
              Get Started Free
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-7 rounded-full"
            >
              Login
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="glass-card p-8 rounded-3xl hover:shadow-xl transition-all group">
            <div className="mb-4 text-primary group-hover:scale-110 transition-transform">
              <MessageCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Voice Chatbot</h3>
            <p className="text-muted-foreground">
              Speak to Lovable AI and hear responses back. Natural conversations with advanced voice recognition.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl hover:shadow-xl transition-all group">
            <div className="mb-4 text-secondary group-hover:scale-110 transition-transform">
              <FileText size={48} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Smart Processing</h3>
            <p className="text-muted-foreground">
              Upload PDFs and CSVs for instant summaries, translations, and intelligent analysis.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl hover:shadow-xl transition-all group">
            <div className="mb-4 text-accent group-hover:scale-110 transition-transform">
              <Users size={48} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Role-Based Access</h3>
            <p className="text-muted-foreground">
              Managers get full control, customers enjoy streamlined experiences. Perfect for teams.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="glass-card rounded-3xl p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold gradient-text mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users experiencing the power of AI
          </p>
          <Button
            onClick={() => navigate("/signup")}
            size="lg"
            className="text-lg px-12 py-7 rounded-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-white font-semibold"
          >
            Start Your Journey
            <Sparkles className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
