import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, MapPin, Edit3, Star, Trophy, MessageCircle,
  BookOpen,
  Users, Eye, Code, ShieldCheck, Linkedin, Github, Globe
} from 'lucide-react';
import { toast } from "sonner";
import axios from '../api';
import verifyToken from '../components/verifyLogin';
import LoginRequired from '../components/LoginRequired';
import Loader from '../components/Loader';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";



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

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const calculateLevelAndProgress = (points: number) => {
  const levels = [
    { name: 'Beginner', minPoints: 0, maxPoints: 199 },
    { name: 'Intermediate', minPoints: 200, maxPoints: 499 },
    { name: 'Professional', minPoints: 500, maxPoints: 1499 },
    { name: 'Expert', minPoints: 1500, maxPoints: 4999 },
    { name: 'Master', minPoints: 5000, maxPoints: 9999 },
    { name: 'Legendary', minPoints: 10000, maxPoints: Infinity }
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
    percentage: Math.floor(progress),
    progressText: nextLevel ? `Next: ${nextLevel.name} (${nextLevel.minPoints - points} XP left)` : "Max level Reached!",
    remaining: nextLevel ? `${points} / ${nextLevel.minPoints}` : `${points} / ∞`
  };
};

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    location: '',
    bio: ''
  });

  const fetchProfileAndBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !(await verifyToken(token))) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      const profileRes = await axios.get('api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const totalPoints = profileRes.data.stats.find((s: any) => s.label === 'Total Points')?.value || 0;
      const level = calculateLevelAndProgress(totalPoints);

      setProfileData({ ...profileRes.data, level });
      setFormData({
        name: profileRes.data.name,
        role: profileRes.data.role,
        company: profileRes.data.company,
        location: profileRes.data.location,
        bio: profileRes.data.bio
      });


    } catch (err) {
      console.error(err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfileAndBookmarks(); }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      toast.success("Profile Updated", { description: "Your changes have been saved successfully." });
    } catch (err) {
      toast.error("Update Failed", { description: "Could not save profile changes." });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    toast.success("Signed out successfully");
    navigate('/login');
  };

  if (loading) return <Loader />;
  if (error === 'User not authenticated.') return <LoginRequired />;
  if (!profileData) return <div className="p-8 text-center pt-32">Profile not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060B19] text-slate-900 dark:text-white pb-20 pt-24 font-sans selection:bg-blue-500/30">
      <div className="container max-w-6xl mx-auto px-4 lg:px-8">

        {/* Header Cover & Avatar Section */}
        <div className="relative mb-20 lg:mb-24">
          <div className="h-56 md:h-72 w-full rounded-[32px] overflow-hidden relative border border-slate-200 dark:border-slate-800/80 bg-slate-200 dark:bg-[#0B1221] shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=2000&auto=format&fit=crop"
              alt="Cover"
              className="w-full h-full object-cover opacity-90 dark:opacity-60 mix-blend-overlay dark:mix-blend-normal"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent dark:from-[#060B19] dark:via-[#060B19]/20" />
            <div className="absolute top-6 right-6">
              <Button size="sm" variant="outline" className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border-white/20 rounded-xl h-9 px-4 font-semibold">
                Change Cover
              </Button>
            </div>
          </div>

          <div className="absolute -bottom-16 left-6 md:left-12 flex flex-col md:flex-row md:items-end gap-6 w-[calc(100%-48px)]">
            <div className="relative flex-shrink-0 group">
              <div className="absolute -inset-2 rounded-[36px] bg-blue-600 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500" />
              <div className="h-32 w-32 md:h-[150px] md:w-[150px] rounded-[32px] border-4 border-slate-50 dark:border-[#060B19] bg-[#0A101D] flex items-center justify-center relative shadow-2xl overflow-hidden z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl md:text-[64px] font-black text-blue-500 tracking-tighter">{getInitials(profileData.name)}</span>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 z-10 relative">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-[40px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                  {profileData.name || "Rahul Sharma"}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl px-6 bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)] font-bold gap-2 transition-all">
                      <Edit3 className="w-4 h-4" /> Optimize Resume
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] rounded-[32px] border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1221]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black">Edit Profile</DialogTitle>
                      <DialogDescription className="font-medium">Update your professional details to keep your resume optimized.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</Label>
                          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060B19] h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Location</Label>
                          <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060B19] h-11" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Designation</Label>
                          <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060B19] h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Company</Label>
                          <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060B19] h-11" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Professional Overview</Label>
                        <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060B19] min-h-[100px]" placeholder="Brief professional summary..." />
                      </div>
                    </div>
                    <DialogFooter className="sm:justify-start gap-2">
                      <Button onClick={handleSave} className="rounded-xl px-8 bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.2)]">Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl px-6 border-slate-200 dark:border-slate-800 bg-transparent font-bold">Cancel</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={handleLogout} className="rounded-xl px-6 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 pt-4">

          {/* Left Sidebar (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Professional Overview Card */}
            <Card className="rounded-[32px] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1221] shadow-sm overflow-hidden">
              <CardHeader className="p-7 pb-4">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Professional Overview</CardTitle>
              </CardHeader>
              <CardContent className="px-7 pb-7 space-y-6">
                <p className="text-[15px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {profileData.bio || "Passionate about building scalable web applications with 3+ years of experience in React and TypeScript."}
                </p>

                <Separator className="bg-slate-100 dark:bg-slate-800/60" />

                <div className="space-y-5">
                  {/* Gender */}
                  <div className="flex items-center gap-4">
                    <div className="h-[42px] w-[42px] rounded-2xl bg-fuchsia-500/10 flex flex-shrink-0 items-center justify-center text-fuchsia-500 shadow-inner">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-widest mb-0.5">Gender</p>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">Not Specified</p>
                    </div>
                  </div>
                  {/* Auth Method */}
                  <div className="flex items-center gap-4">
                    <div className="h-[42px] w-[42px] rounded-2xl bg-purple-500/10 flex flex-shrink-0 items-center justify-center text-purple-500 shadow-inner">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-widest mb-0.5">Auth Method</p>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">Standard</p>
                    </div>
                  </div>
                  {/* Location */}
                  <div className="flex items-center gap-4">
                    <div className="h-[42px] w-[42px] rounded-2xl bg-blue-500/10 flex flex-shrink-0 items-center justify-center text-blue-500 shadow-inner">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-widest mb-0.5">Location</p>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{profileData.location || "Bangalore, India"}</p>
                    </div>
                  </div>
                  {/* Official Email */}
                  <div className="flex items-center gap-4">
                    <div className="h-[42px] w-[42px] rounded-2xl bg-blue-500/10 flex flex-shrink-0 items-center justify-center text-blue-500 shadow-inner">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-widest mb-0.5">Official Email</p>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{profileData.email}</p>
                    </div>
                  </div>
                  {/* Contact */}
                  <div className="flex items-center gap-4">
                    <div className="h-[42px] w-[42px] rounded-2xl bg-emerald-500/10 flex flex-shrink-0 items-center justify-center text-emerald-500 shadow-inner">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-widest mb-0.5">Contact</p>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">+91 98765 43210</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-100 dark:bg-slate-800/60" />

                {/* Network Connectivity */}
                <div className="pt-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">Network Connectivity</p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-[20px] border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#121B2A] text-slate-600 dark:text-slate-400 hover:text-white hover:bg-blue-600 transition-all">
                      <Linkedin className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-[20px] border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#121B2A] text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-900 dark:hover:bg-slate-700 transition-all">
                      <Github className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-[20px] border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#121B2A] text-slate-600 dark:text-slate-400 hover:text-white hover:bg-blue-500 transition-all">
                      <Globe className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="rounded-[24px] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1221] p-5 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="h-10 w-10 rounded-[14px] bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                  <Eye className="h-5 w-5" />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white">1.2k</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">Views</span>
              </Card>
              <Card className="rounded-[24px] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1221] p-5 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="h-10 w-10 rounded-[14px] bg-orange-500/10 flex items-center justify-center text-orange-500 mb-3">
                  <Star className="h-5 w-5" />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white">{profileData.level.remaining ? profileData.level.remaining.split(' / ')[0] : '48'}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">Points</span>
              </Card>
              <Card className="rounded-[24px] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1221] p-5 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="h-10 w-10 rounded-[14px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white">234</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">Network</span>
              </Card>
            </div>

          </div>

          {/* Right Content Area (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Profile Strength */}
            <Card className="rounded-[32px] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1221] shadow-sm overflow-hidden">
              <CardContent className="p-8 md:p-10 flex items-center justify-between gap-6">
                <div className="space-y-3 max-w-sm">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Profile Strength: Exceptional</h3>
                  <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Your profile ranks in the top 2% for {profileData.role || "Senior Software Engineers"} in your region.</p>
                </div>
                <div className="relative h-24 w-24 md:h-28 md:w-28 flex-shrink-0 group">
                  <svg className="h-24 w-24 md:h-28 md:w-28 -rotate-90">
                    <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="10%" fill="transparent" className="text-slate-100 dark:text-slate-800/40" />
                    <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="10%" fill="transparent" className="text-blue-500 transition-all duration-1000 ease-out" strokeDasharray={264} strokeDashoffset={264 - (264 * 85 / 100)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tighter">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Career Trajectory */}
            <Card className="rounded-[32px] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1221] shadow-sm">
              <CardHeader className="p-8 pb-6 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-[18px] bg-orange-500/10 flex flex-shrink-0 items-center justify-center text-orange-500">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Career Trajectory</CardTitle>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-700/80 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold h-10 px-5">
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800/60 ml-[9px] pl-8 space-y-12">
                  {/* Timeline Item 1 */}
                  <div className="relative">
                    <div className="absolute -left-[42px] top-1.5 h-[18px] w-[18px] rounded-full border-[4px] border-white dark:border-[#0B1221] bg-blue-500 ring-4 ring-blue-500/20" />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
                      <h4 className="text-[17px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Senior Software Engineer</h4>
                      <span className="text-[11px] uppercase font-black tracking-widest px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-lg">Jan 2022 - Present</span>
                    </div>
                    <p className="text-blue-500 font-extrabold text-[15px] mb-3">{profileData.company || "TechCorp Inc."}</p>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                      Leading frontend development for enterprise SaaS products. Improved performance by 40%.
                    </p>
                  </div>

                  {/* Timeline Item 2 */}
                  <div className="relative">
                    <div className="absolute -left-[42px] top-1.5 h-[18px] w-[18px] rounded-full border-[4px] border-white dark:border-[#0B1221] bg-slate-300 dark:bg-slate-600" />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
                      <h4 className="text-[17px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Software Engineer</h4>
                      <span className="text-[11px] uppercase font-black tracking-widest px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-lg">Jun 2020 - Dec 2021</span>
                    </div>
                    <p className="text-blue-500 font-extrabold text-[15px] mb-3">StartupXYZ</p>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                      Built and maintained React applications. Led migration to TypeScript.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Background */}
            <Card className="rounded-[32px] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1221] shadow-sm">
              <CardHeader className="p-8 pb-6 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-[18px] bg-purple-500/10 flex flex-shrink-0 items-center justify-center text-purple-500">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Academic Background</CardTitle>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-700/80 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold h-10 px-5">
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800/60 ml-[9px] pl-8">
                  <div className="relative">
                    <div className="absolute -left-[42px] top-1.5 h-[18px] w-[18px] rounded-full border-[4px] border-white dark:border-[#0B1221] bg-purple-500" />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
                      <h4 className="text-[17px] font-black text-slate-900 dark:text-white tracking-wide">B.Tech in Computer Science</h4>
                      <span className="text-[11px] uppercase font-black tracking-widest text-slate-500 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg">2016 - 2020</span>
                    </div>
                    <p className="text-purple-500 font-extrabold text-[15px] mb-2">IIT Delhi</p>
                    <p className="text-[14px] text-slate-700 dark:text-slate-300 font-bold">CGPA: <span className="text-slate-500">8.5/10</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Architecture & Skills */}
            <Card className="rounded-[32px] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1221] shadow-sm">
              <CardHeader className="p-8 pb-6 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-[18px] bg-blue-500/10 flex flex-shrink-0 items-center justify-center text-blue-500">
                    <Code className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Core Architecture & Skills</CardTitle>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-700/80 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold h-10 px-5">
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-x-14 gap-y-8">
                  {/* Skill 1 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">React</span>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span className="text-[12px] font-black text-blue-500">95%</span>
                    </div>
                    <Progress value={95} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 [&>div]:bg-blue-500" />
                  </div>

                  {/* Skill 2 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">TypeScript</span>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span className="text-[12px] font-black text-blue-500">90%</span>
                    </div>
                    <Progress value={90} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 [&>div]:bg-blue-500" />
                  </div>

                  {/* Skill 3 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Node.js</span>
                      <span className="text-[12px] font-black text-blue-500">85%</span>
                    </div>
                    <Progress value={85} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 [&>div]:bg-blue-500" />
                  </div>

                  {/* Skill 4 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Python</span>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span className="text-[12px] font-black text-blue-500">80%</span>
                    </div>
                    <Progress value={80} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 [&>div]:bg-blue-500" />
                  </div>

                  {/* Skill 5 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">AWS</span>
                      <span className="text-[12px] font-black text-blue-500">75%</span>
                    </div>
                    <Progress value={75} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 [&>div]:bg-blue-500" />
                  </div>

                  {/* Skill 6 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">System Design</span>
                      <span className="text-[12px] font-black text-blue-500">70%</span>
                    </div>
                    <Progress value={70} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 [&>div]:bg-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;