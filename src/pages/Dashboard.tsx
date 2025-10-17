import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/dashboard/DashboardNav";
import VoiceChatbot from "@/components/chatbot/VoiceChatbot";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Languages, Calendar, BarChart3, Bell, MessageCircle, Upload } from "lucide-react";
import { toast } from "sonner";

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

  const features = [
    { icon: FileText, label: "Summarizer", color: "text-primary" },
    { icon: Languages, label: "Translator", color: "text-secondary" },
    { icon: Calendar, label: "Calendar", color: "text-accent" },
    { icon: BarChart3, label: "Graph Generator", color: "text-primary" },
    { icon: Bell, label: "Notifications", color: "text-secondary" },
  ];

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
          <TabsList className="glass-card p-1">
            <TabsTrigger value="chatbot" className="data-[state=active]:bg-primary/20">
              <MessageCircle size={18} className="mr-2" />
              Lovable Chatbot
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-primary/20">
              <FileText size={18} className="mr-2" />
              Features
            </TabsTrigger>
            {isManager && (
              <TabsTrigger value="manage" className="data-[state=active]:bg-primary/20">
                <Upload size={18} className="mr-2" />
                Manage
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

          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="glass-card p-6 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => toast.info(`${feature.label} coming soon!`)}
                >
                  <div className={`${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={40} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.label === "Summarizer" && "Upload PDFs and get AI summaries with voice narration"}
                    {feature.label === "Translator" && "Translate text to Hindi and other languages"}
                    {feature.label === "Calendar" && "Manage your events and reminders"}
                    {feature.label === "Graph Generator" && "Auto-generate charts from CSV data"}
                    {feature.label === "Notifications" && "Stay updated with smart alerts"}
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {isManager && (
            <TabsContent value="manage" className="space-y-6">
              <Card className="glass-card p-8">
                <h2 className="text-3xl font-bold gradient-text mb-4">
                  Manager Dashboard 👨‍💼
                </h2>
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-3">Upload Files</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload PDFs, CSVs, and documents to process and share with customers
                    </p>
                    <Button className="bg-gradient-to-r from-primary to-primary-glow">
                      <Upload size={18} className="mr-2" />
                      Upload File
                    </Button>
                  </div>

                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-3">Customer Management</h3>
                    <p className="text-muted-foreground">
                      View and manage customer accounts and access
                    </p>
                  </div>

                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-3">Download Center</h3>
                    <p className="text-muted-foreground">
                      Access all original files, summaries, graphs, and audio files
                    </p>
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
