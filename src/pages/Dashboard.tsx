import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/dashboard/DashboardNav";
import VoiceChatbot from "@/components/chatbot/VoiceChatbot";
import Summarizer from "@/components/features/Summarizer";
import Translator from "@/components/features/Translator";
import Calendar from "@/components/features/Calendar";
import GraphGenerator from "@/components/features/GraphGenerator";
import Notifications from "@/components/features/Notifications";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Languages, Calendar as CalendarIcon, BarChart3, Bell, MessageCircle, Upload } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl gradient-text">Loading...</div>
      </div>
    );
  }

  const isManager = profile?.role === 'manager';

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl floating" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl floating" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto">
        <DashboardNav userName={profile?.full_name || user?.email} userRole={isManager ? 'Manager' : 'Customer'} />

        <Tabs defaultValue="chatbot" className="space-y-6">
          <TabsList className="glass-card p-1 grid grid-cols-3 md:grid-cols-7 gap-1">
            <TabsTrigger value="chatbot" className="data-[state=active]:bg-primary/20">
              <MessageCircle size={18} className="md:mr-2" />
              <span className="hidden md:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="summarizer" className="data-[state=active]:bg-primary/20">
              <FileText size={18} className="md:mr-2" />
              <span className="hidden md:inline">Summarize</span>
            </TabsTrigger>
            <TabsTrigger value="translator" className="data-[state=active]:bg-primary/20">
              <Languages size={18} className="md:mr-2" />
              <span className="hidden md:inline">Translate</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-primary/20">
              <CalendarIcon size={18} className="md:mr-2" />
              <span className="hidden md:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="graphs" className="data-[state=active]:bg-primary/20">
              <BarChart3 size={18} className="md:mr-2" />
              <span className="hidden md:inline">Graphs</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/20">
              <Bell size={18} className="md:mr-2" />
              <span className="hidden md:inline">Alerts</span>
            </TabsTrigger>
            {isManager && (
              <TabsTrigger value="manage" className="data-[state=active]:bg-primary/20">
                <Upload size={18} className="md:mr-2" />
                <span className="hidden md:inline">Manage</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="chatbot" className="space-y-6">
            <Card className="glass-card p-6">
              <h2 className="text-3xl font-bold gradient-text mb-2">
                Chat with Lovable AI 🤖
              </h2>
              <p className="text-muted-foreground mb-6">
                Speak or type to interact with your AI assistant
              </p>
              <VoiceChatbot />
            </Card>
          </TabsContent>

          <TabsContent value="summarizer">
            <Summarizer />
          </TabsContent>

          <TabsContent value="translator">
            <Translator />
          </TabsContent>

          <TabsContent value="calendar">
            <Calendar />
          </TabsContent>

          <TabsContent value="graphs">
            <GraphGenerator />
          </TabsContent>

          <TabsContent value="notifications">
            <Notifications />
          </TabsContent>

          {isManager && (
            <TabsContent value="manage" className="space-y-6">
              <Card className="glass-card p-8">
                <h2 className="text-3xl font-bold gradient-text mb-4">
                  Manager Dashboard 👨‍💼
                </h2>
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-3">Upload & Manage Files</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload PDFs, CSVs, and documents. Get summaries, translations, and voice narrations.
                    </p>
                    <Button className="bg-gradient-to-r from-primary to-primary-glow">
                      <Upload size={18} className="mr-2" />
                      Upload File
                    </Button>
                  </div>

                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-3">Customer Management</h3>
                    <p className="text-muted-foreground mb-4">
                      View customer accounts, manage access, and track usage
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Feature coming soon: Full customer dashboard
                    </div>
                  </div>

                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-3">Download Center</h3>
                    <p className="text-muted-foreground mb-4">
                      Access all original files, summaries, graphs, and audio files
                    </p>
                    <div className="text-sm text-muted-foreground">
                      All processed files available for download
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
