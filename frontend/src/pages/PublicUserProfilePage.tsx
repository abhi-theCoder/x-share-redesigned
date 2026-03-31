import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Calendar, Trophy, Clock,
  MessageCircle, Bookmark,
  Award, TrendingUp, Zap, Share2, Briefcase, Info, Plus, X
} from 'lucide-react';
import PublicActivityHeatmap from '../components/PublicActivityHeatmap';
import axios from '../api';
import Loader from '../components/Loader';
import { toast } from 'sonner';

// Shadcn UI Components
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Profile data interface
interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  location: string;
  bio: string;
  avatar?: string;
  joined_date: string;
  stats: Array<{
    label: string;
    value: number;
    icon: string;
    color: string;
  }>;
  recentActivity: Array<{
    id: number;
    title: string;
    timeAgo: string;
    points: number;
    icon: string;
    type: string;
  }>;
  level: {
    name: string;
    icon: string;
    percentage: number;
    progressText: string;
    remaining: string;
  };
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Registry unknown';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Level Calculation
const calculateLevelAndProgress = (points: number) => {
  const levels = [
    { name: 'Beginner', icon: 'User', minPoints: 0, maxPoints: 199 },
    { name: 'Intermediate', icon: 'Edit3', minPoints: 200, maxPoints: 499 },
    { name: 'Wood', icon: 'BookOpen', minPoints: 500, maxPoints: 799 },
    { name: 'Stone', icon: 'MessageCircle', minPoints: 800, maxPoints: 1499 },
    { name: 'Bronze', icon: 'Trophy', minPoints: 1500, maxPoints: 1999 },
    { name: 'Silver', icon: 'Trophy', minPoints: 2000, maxPoints: 2499 },
    { name: 'Gold', icon: 'Trophy', minPoints: 2500, maxPoints: 3499 },
    { name: 'Platinum', icon: 'Trophy', minPoints: 3500, maxPoints: 4499 },
    { name: 'Diamond', icon: 'Star', minPoints: 4500, maxPoints: 5999 },
    { name: 'Elite', icon: 'ThumbsUp', minPoints: 6000, maxPoints: 7999 },
    { name: 'Legendary', icon: 'HeartHandshake', minPoints: 8000, maxPoints: 9999 },
    { name: 'Mythic', icon: 'Users', minPoints: 10000, maxPoints: 14999 },
    { name: 'Ultimate', icon: 'Star', minPoints: 15000, maxPoints: Infinity }
  ];

  let currentLevel = levels[0];
  let nextLevel = null;
  let progress = 0;

  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].minPoints && points <= levels[i].maxPoints) {
      currentLevel = levels[i];
      if (levels[i].maxPoints !== Infinity) {
        progress = ((points - levels[i].minPoints) / (levels[i].maxPoints - levels[i].minPoints)) * 100;
        nextLevel = levels[i + 1];
      } else {
        progress = 100;
      }
      break;
    }
  }

  return {
    name: currentLevel.name,
    icon: currentLevel.icon,
    percentage: Math.min(100, Math.max(0, Math.floor(progress))),
    progressText: nextLevel ? `Need ${nextLevel.minPoints - points} more to reach ${nextLevel.name}` : "Max Level Reached",
    remaining: nextLevel ? `${points} / ${nextLevel.minPoints}` : `${points} / ∞`
  };
};

const PublicUserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // For component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const profileRes = await axios.get(`/api/profile/public/${userId}`);
        const totalPoints = profileRes.data.stats?.find((stat: any) => stat.label === 'Total Points')?.value || 0;
        setProfileData({ ...profileRes.data, level: calculateLevelAndProgress(totalPoints) });
      } catch (err) {
        toast.error('Failed to intercept profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProfile();
  }, [userId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link archived to clipboard.');
  };

  if (loading) return <Loader />;
  if (!profileData) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center space-y-4">
        <X className="w-12 h-12 text-destructive mx-auto opacity-20" />
        <p className="font-black uppercase tracking-widest text-xs opacity-50">Profile Core Not Found</p>
        <Link to="/"><Button variant="ghost" className="text-xs uppercase font-black">Return to HQ</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar - Profile Header Area */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[40px] border-none bg-card/40 backdrop-blur-xl shadow-2xl shadow-black/5 ring-1 ring-border/20 p-8 space-y-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />

              <div className="flex flex-col items-center text-center space-y-6 pt-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Avatar className="h-40 w-40 rounded-[48px] border-4 border-background shadow-2xl relative z-10">
                    <AvatarFallback className="bg-primary/5 text-primary text-5xl font-black">
                      {profileData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-black shadow-lg shadow-primary/20 border-2 border-background z-20">
                    {Math.floor(profileData.level.percentage / 10)}
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-black tracking-tight">{profileData.name}</h1>
                  <p className="text-primary font-bold uppercase tracking-widest text-xs">{profileData.role} <span className="text-muted-foreground opacity-40 not-italic">•</span> {profileData.company}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={handleShare} className="h-10 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                    <Share2 className="w-3.5 h-3.5 mr-2" /> Share Profile
                  </Button>
                  <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-border/60">
                    <Bookmark className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/40" />

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Registry Context</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/10">
                      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-blue-500"><MapPin className="w-4 h-4" /></div>
                      <div className="space-y-0.5"><p className="text-[9px] font-black uppercase text-muted-foreground">Location</p><p className="text-xs font-bold">{profileData.location || "Undisclosed"}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/10">
                      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-emerald-500"><Calendar className="w-4 h-4" /></div>
                      <div className="space-y-0.5"><p className="text-[9px] font-black uppercase text-muted-foreground">Commenced</p><p className="text-xs font-bold">{formatDate(profileData.joined_date)}</p></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Intellectual Core</h3>
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                      "{profileData.bio || "No summary synchronized with this profile core."}"
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-[40px] border-none bg-primary/5 p-8 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center"><Zap className="w-4 h-4" /></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Reputation Tier</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black">{profileData.level.name}</span>
                  <span className="text-xs font-bold text-primary">{profileData.level.percentage}%</span>
                </div>
                <Progress value={profileData.level.percentage} className="h-2 rounded-full border border-primary/10 bg-background" />
                <p className="text-[10px] font-medium text-muted-foreground opacity-60">{profileData.level.progressText}</p>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {profileData.stats.map((stat, i) => (
                <Card key={i} className="rounded-3xl border-none bg-card/40 backdrop-blur-xl p-5 ring-1 ring-border/20 shadow-xl shadow-black/5 flex flex-col items-center text-center space-y-2">
                  <div className={`h-10 w-10 rounded-xl bg-muted/40 flex items-center justify-center mb-1`}>
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xl font-black">{stat.value}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="activity" className="space-y-8">
              <TabsList className="bg-muted/40 backdrop-blur-xl border border-border/40 p-1 rounded-2xl h-14">
                <TabsTrigger value="activity" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-card data-[state=active]:shadow-lg">Intelligence Feed</TabsTrigger>
                <TabsTrigger value="heatmap" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-card data-[state=active]:shadow-lg">Energy Matrix</TabsTrigger>
              </TabsList>

              <TabsContent value="activity">
                <Card className="rounded-[40px] border-none bg-card/40 backdrop-blur-xl ring-1 ring-border/20 shadow-2xl shadow-black/5 p-8">
                  <h3 className="text-xl font-black mb-8 px-2 flex items-center justify-between">
                    Recent Interfacing
                    <Clock className="w-4 h-4 opacity-30" />
                  </h3>
                  <div className="space-y-4">
                    {profileData.recentActivity.map((activity, i) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-2xl bg-muted/20 border border-border/10 hover:bg-muted/30 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-xl bg-background border border-border/20 flex items-center justify-center text-primary shadow-sm">
                            {activity.type === 'experience' ? <Briefcase className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-sm group-hover:text-primary transition-colors">{activity.title}</p>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground opacity-60">
                              <Clock className="w-3 h-3" /> {activity.timeAgo}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-primary">+{activity.points}</span>
                          <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mt-1">Gained</p>
                        </div>
                      </motion.div>
                    ))}
                    {profileData.recentActivity.length === 0 && (
                      <div className="py-20 text-center opacity-30 border border-dashed border-border/40 rounded-3xl">
                        <Zap className="w-8 h-8 mx-auto mb-4" />
                        <p className="font-black uppercase tracking-[0.2em] text-[10px]">No recent telemetry detected</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="heatmap">
                <Card className="rounded-[40px] border-none bg-card/40 backdrop-blur-xl ring-1 ring-border/20 shadow-2xl shadow-black/5 p-8 pt-10">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black">Contribution Intensity</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Yearly heatmap overlay</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-3xl border border-border/10 overflow-x-auto">
                    <PublicActivityHeatmap userId={profileData.id} />
                  </div>
                  <div className="mt-8 flex items-start gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <Info className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1">Matrix Legend</p>
                      <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Intensity correlates with number of experiences shared, questions resolved, and community feedback received.</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Achievements Snippet */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="rounded-[40px] border-none bg-card/40 backdrop-blur-xl ring-1 ring-border/20 p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Top Accolades</h3>
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div className="flex gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 w-14 rounded-2xl bg-muted/30 border border-border/20 flex items-center justify-center relative group">
                      <Award className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full ring-2 ring-background" />
                    </div>
                  ))}
                  <div className="h-14 w-14 rounded-2xl border-2 border-dashed border-border/40 flex items-center justify-center text-muted-foreground opacity-30">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </Card>

              <Card className="rounded-[40px] border-none bg-gradient-to-br from-primary/10 to-blue-500/10 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Community Status</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">TOP 5%</span>
                  <span className="text-xs font-bold text-primary">Global</span>
                </div>
                <Badge className="bg-background/80 text-primary border-none rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em]">Elite Peer Network</Badge>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicUserProfilePage;