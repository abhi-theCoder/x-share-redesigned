import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  MessageSquare,
  Star,
  Flame,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal
} from 'lucide-react';
import axios from '../api';

// Shadcn UI Components
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";


const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'This Week' | 'This Month' | 'All Time'>('This Week');
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/leaderboard', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (res.data && res.data.topUsers) {
          const formatted = res.data.topUsers.map((u: any, i: number) => ({
            rank: i + 1,
            name: u.name,
            title: u.company ? `Engineer at ${u.company}` : u.level.level,
            initials: u.name ? u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U',
            points: u.points.toLocaleString(),
            posts: u.contributions || 0,
            likes: (u.points * 1.5).toLocaleString(), // UI mock for visual density
            streak: Math.max(1, Math.floor((u.contributions || 0) / 2)),
            badges: [u.level.level],
            trend: 'flat',
            trendValue: ''
          }));
          setUsers(formatted);
        }

        if (res.data && res.data.currentUser) {
          const u = res.data.currentUser;
          setCurrentUser({
            rank: u.rank,
            name: u.name,
            title: u.company ? `Engineer at ${u.company}` : u.level.level,
            initials: u.name ? u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U',
            points: u.points.toLocaleString(),
            posts: u.contributions || 0,
            likes: (u.points * 1.5).toLocaleString(),
            streak: Math.max(1, Math.floor((u.contributions || 0) / 2)),
            badges: [u.level.level],
            trend: 'flat',
            trendValue: ''
          });
        }
      } catch (error) {
        console.error("Failed to load leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="text-[15px] font-bold text-slate-400">#{rank}</span>;
  };

  const getRowBackground = (rank: number) => {
    if (rank === 1) return 'bg-[#FFF8EA] dark:bg-amber-500/10 border-l-0';
    if (rank === 2) return 'bg-[#F3F5F7] dark:bg-slate-500/10 border-l-0';
    if (rank === 3) return 'bg-[#FFF5E8] dark:bg-orange-500/10 border-l-0';
    return 'bg-white dark:bg-[#111827]/40 hover:bg-slate-50 dark:hover:bg-[#111827]/80';
  };

  const getAvatarColor = (rank: number) => {
    if (rank === 1) return 'bg-[#1e40af] text-white';
    if (rank === 2) return 'bg-[#3b82f6] text-white';
    if (rank === 3) return 'bg-[#3b82f6] text-white';
    if (rank === 4) return 'bg-[#3b82f6] text-white';
    return 'bg-[#3b82f6] text-white';
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-200">
      <div className="container max-w-6xl mx-auto px-4">

        {/* Leaderboard List Container */}
        <Card className="bg-white dark:bg-[#111827] border-slate-100 dark:border-[#1F2937] rounded-3xl overflow-hidden shadow-sm">

          {/* List Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-slate-100 dark:border-[#1F2937] bg-white dark:bg-transparent">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h2 className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">This Week's Top Contributors</h2>
            </div>
            <div className="flex gap-1 bg-transparent p-1">
              {['This Week', 'This Month', 'All Time'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold transition-all border ${activeTab === tab
                    ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List Items */}
          <div className="flex flex-col">
            {loading ? (
              <div className="p-20 text-center text-slate-400 font-medium">Analyzing contributor data...</div>
            ) : users.length > 0 ? (
              <>
                {users.map((user, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={index}
                    className={`flex flex-col lg:flex-row lg:items-center justify-between p-6 transition-colors ${getRowBackground(user.rank)}`}
                  >
                    {/* Left: Rank & User Info */}
                    <div className="flex items-center gap-6 lg:w-[40%] mb-4 lg:mb-0 pl-2">
                      <div className="w-8 flex justify-center items-center">
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar className={`w-12 h-12 rounded-full ${getAvatarColor(user.rank)} shrink-0 border-0`}>
                        <AvatarFallback className="text-[15px] font-bold bg-transparent text-white">{user.initials}</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-[15px] mb-0.5 truncate">{user.name}</h3>
                        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate tracking-tight">{user.title}</p>
                      </div>
                    </div>

                    {/* Right: Stats & Badges */}
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <div className="flex items-center gap-6 lg:gap-10 px-4">
                        <div className="flex flex-col items-center min-w-[60px]">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Star className="w-4 h-4 text-blue-500 fill-transparent" />
                            <span className="text-blue-500 font-extrabold text-[15px] leading-none">{user.points}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Points</span>
                        </div>
                        <div className="flex flex-col items-center min-w-[50px]">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-slate-900 dark:text-slate-200 font-extrabold text-[15px] leading-none">{user.posts}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Posts</span>
                        </div>
                        <div className="flex flex-col items-center min-w-[60px]">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <ThumbsUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-slate-900 dark:text-slate-200 font-extrabold text-[15px] leading-none">{user.likes}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Likes</span>
                        </div>
                        <div className="flex flex-col items-center min-w-[50px]">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Flame className="w-4 h-4 text-red-500 fill-transparent" />
                            <span className="text-red-500 font-extrabold text-[15px] leading-none">{user.streak}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Streak</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 ml-auto mr-2">
                        <div className="hidden xl:flex items-center gap-2">
                          {user.badges.map((badge: string, bIdx: number) => (
                            <Badge key={bIdx} className="bg-slate-50 dark:bg-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#374151] text-slate-700 dark:text-slate-300 border-none font-bold rounded-full px-3 py-1 shadow-sm">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                        <div className="w-12 justify-end flex items-center gap-1 font-bold text-slate-900 dark:text-white text-[13px]">
                          {user.trendValue}
                          {user.trend === 'up' && <TrendingUp className="w-[18px] h-[18px] text-emerald-500" />}
                          {user.trend === 'down' && <TrendingDown className="w-[18px] h-[18px] text-red-500" />}
                          {user.trend === 'flat' && <Minus className="w-[18px] h-[18px] text-slate-400" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* --- Current User Row (Sticky at bottom if not in top list) --- */}
                {currentUser && !users.some(u => u.name === currentUser.name) && (
                  <div className="border-t-4 border-blue-500/20 shadow-2xl">
                    <div className={`flex flex-col lg:flex-row lg:items-center justify-between p-6 bg-blue-500/5 dark:bg-blue-500/10`}>
                      <div className="flex items-center gap-6 lg:w-[40%] mb-4 lg:mb-0 pl-2">
                        <div className="w-8 flex justify-center items-center">
                          <span className="text-[15px] font-black text-[#3b82f6]">#{currentUser.rank}</span>
                        </div>
                        <Avatar className={`w-12 h-12 rounded-full bg-blue-600 shrink-0 border-0`}>
                          <AvatarFallback className="text-[15px] font-bold bg-transparent text-white">{currentUser.initials}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-[15px] mb-0.5 truncate">{currentUser.name} (You)</h3>
                          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate tracking-tight">{currentUser.title}</p>
                        </div>
                      </div>

                      <div className="flex flex-1 items-center justify-between gap-4">
                        <div className="flex items-center gap-6 lg:gap-10 px-4">
                          <div className="flex flex-col items-center min-w-[60px]">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                              <Star className="w-4 h-4 text-blue-500 fill-transparent" />
                              <span className="text-blue-500 font-extrabold text-[15px] leading-none">{currentUser.points}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Points</span>
                          </div>
                          {/* ... other stats omitted for brevity in sticky row or keep them all if they fit ... */}
                          <div className="flex flex-col items-center min-w-[50px]">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                              <MessageSquare className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-900 dark:text-slate-200 font-extrabold text-[15px]">{currentUser.posts}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">Posts</span>
                          </div>
                        </div>
                        <Badge className="bg-blue-600 text-white font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/20">
                          Keep going!
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-20 text-center text-slate-400 font-medium">No contributors found yet.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;