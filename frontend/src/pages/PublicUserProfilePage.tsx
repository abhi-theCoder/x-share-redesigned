import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  User, Mail, MapPin, Building, Calendar, Edit3, Star, Trophy, Clock,
  BookOpen, MessageCircle, Heart, Upload, Save, X, LogOut, HeartHandshake, Users, ThumbsUp, Bookmark, FileText,
  Award, TrendingUp, Zap, Crown, Sparkles, Share2, ChevronDown, ChevronUp
} from 'lucide-react';
import PublicActivityHeatmap from '../components/PublicActivityHeatmap';
import axios from '../api';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';

// ✅ Icon map
const iconMap: { [key: string]: React.ComponentType<any> } = {
  User,
  Mail,
  MapPin,
  Building,
  Calendar,
  Edit3,
  Star,
  Trophy,
  BookOpen,
  MessageCircle,
  Heart,
  Upload,
  Save,
  X,
  LogOut,
  HeartHandshake,
  Users,
  ThumbsUp,
  Bookmark,
  FileText,
  Clock,
  Zap,
  Crown,
  Sparkles,
  Award,
  TrendingUp
};

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

// Helper function to format date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Date not available';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Helper function for Level Calculation
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

  const progressText = nextLevel
    ? `Need ${nextLevel.minPoints - points} more points to reach ${nextLevel.name}!`
    : "This user has reached the highest level! 🏆";

  return {
    name: currentLevel.name,
    icon: currentLevel.icon,
    percentage: Math.min(100, Math.max(0, Math.floor(progress))),
    progressText: progressText,
    remaining: nextLevel ? `${points} / ${nextLevel.minPoints}` : `${points} / ∞`
  };
};

// --- Custom Components ---

const EngagementChart = ({ contributions, likesReceived }: { contributions: number; likesReceived: number }) => {
  const { theme } = useTheme();
  const maxValue = Math.max(contributions, likesReceived, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Contributions</span>
        <span className={`font-bold px-2 py-1 rounded-lg text-xs ${theme === 'dark' ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-blue-50'}`}>
          {contributions}
        </span>
      </div>
      <div className={`w-full rounded-full h-2.5 border ${theme === 'dark' ? 'bg-white/10 border-white/5' : 'bg-white/60 border-white/30 backdrop-blur-sm'}`}>
        <div
          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-700 shadow-lg shadow-blue-500/25"
          style={{ width: `${(contributions / maxValue) * 100}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Likes Received</span>
        <span className={`font-bold px-2 py-1 rounded-lg text-xs ${theme === 'dark' ? 'text-green-400 bg-green-500/10' : 'text-green-600 bg-green-50'}`}>
          {likesReceived}
        </span>
      </div>
      <div className={`w-full rounded-full h-2.5 border ${theme === 'dark' ? 'bg-white/10 border-white/5' : 'bg-white/60 border-white/30 backdrop-blur-sm'}`}>
        <div
          className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-700 shadow-lg shadow-green-500/25"
          style={{ width: `${(likesReceived / maxValue) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

const AchievementBadges = () => {
  const { theme } = useTheme();
  const badges = [
    { icon: Star, color: 'from-blue-400 to-indigo-500', label: 'First Post', earned: true },
    { icon: Trophy, color: 'from-cyan-500 to-blue-500', label: 'Top Contributor', earned: true },
    { icon: Heart, color: 'from-purple-400 to-indigo-500', label: 'Community Helper', earned: true },
    { icon: Zap, color: 'from-blue-300 to-cyan-400', label: 'Fast Riser', earned: false },
    { icon: Crown, color: 'from-indigo-400 to-purple-500', label: 'Expert', earned: false },
    { icon: Sparkles, color: 'from-cyan-400 to-blue-400', label: 'Innovator', earned: false },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group ${badge.earned ? 'opacity-100' : 'opacity-40 grayscale'
                }`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${badge.color} rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border ${theme === 'dark' ? 'border-white/10' : 'border-white/30'}`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg border ${theme === 'dark' ? 'bg-space-900/90 border-white/20 text-white' : 'bg-white/90 border-white/20 text-gray-800'}`}>
                {badge.label}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="text-center">
        <p className={`text-xs p-2 rounded-lg backdrop-blur-sm ${theme === 'dark' ? 'text-gray-400 bg-white/5' : 'text-gray-500 bg-white/30'}`}>
          This user has unlocked {badges.filter(b => b.earned).length} achievements.
        </p>
      </div>
    </div>
  );
};

const ExpandedRecentActivity = ({ activities, onClose }: { activities: ProfileData['recentActivity'], onClose: () => void }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl shadow-xl p-6 border lg:col-span-2 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Zap className="w-6 h-6 mr-2 text-yellow-500" />
          Recent Activity
        </h3>
        <button
          onClick={onClose}
          className={`p-2 rounded-full transition-colors backdrop-blur-sm ${theme === 'dark' ? 'text-gray-400 hover:bg-white/10' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity) => {
          const IconComponent = iconMap[activity.icon] || User;
          return (
            <motion.div
              key={activity.id}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 border ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70'}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{activity.title}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{activity.timeAgo}</p>
                </div>
              </div>
              <div className={`text-lg font-bold whitespace-nowrap px-3 py-2 rounded-lg ${theme === 'dark' ? 'text-brand-cyan bg-brand-cyan/10' : 'text-blue-600 bg-blue-50'}`}>
                +{activity.points}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const ExpandedAchievements = ({ onClose }: { onClose: () => void }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl shadow-xl p-6 border lg:col-span-2 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
          Achievements
        </h3>
        <button
          onClick={onClose}
          className={`p-2 rounded-full transition-colors backdrop-blur-sm ${theme === 'dark' ? 'text-gray-400 hover:bg-white/10' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
      <AchievementBadges />
    </motion.div>
  );
};

const ExpandedLevelProgress = ({ levelData, onClose }: { levelData: ProfileData['level'], onClose: () => void }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl shadow-xl p-6 border lg:col-span-2 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Level Progress</h3>
            <p className={`text-lg font-medium bg-gradient-to-r ${theme === 'dark' ? 'from-brand-cyan to-brand-blue' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
              {levelData.name}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-full transition-colors backdrop-blur-sm ${theme === 'dark' ? 'text-gray-400 hover:bg-white/10' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Progress</span>
          <span className={`text-2xl font-bold bg-gradient-to-r ${theme === 'dark' ? 'from-brand-cyan to-brand-blue' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
            {levelData.percentage}%
          </span>
        </div>
        <div className={`w-full rounded-full h-4 border ${theme === 'dark' ? 'bg-white/10 border-white/5' : 'bg-white/60 border-white/30 backdrop-blur-sm'}`}>
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-700 shadow-lg shadow-blue-500/25"
            style={{ width: `${levelData.percentage}%` }}
          ></div>
        </div>
        <div className={`text-center p-4 rounded-xl backdrop-blur-sm ${theme === 'dark' ? 'bg-white/5 text-gray-300' : 'bg-white/30 text-gray-600'}`}>
          <p className="text-lg font-medium">{levelData.progressText}</p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Current Progress: {levelData.remaining}</p>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---

const PublicUserProfilePage = () => {
  const { theme } = useTheme();
  const { userId } = useParams<{ userId: string }>();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const engagementData = {
    contributions: 47,
    likesReceived: 128
  };

  const handleShare = () => {
    if (!userId) return;
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      alert('Profile URL copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy profile URL:', err);
    });
  }

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!userId) {
        setError('User ID not provided in the URL.');
        setLoading(false);
        return;
      }

      try {
        const profileRes = await axios.get(`/api/profile/public/${userId}`);
        const totalPoints = profileRes.data.stats?.find((stat: any) => stat.label === 'Total Points')?.value || 0;
        const levelData = calculateLevelAndProgress(totalPoints);

        setProfileData({
          ...profileRes.data,
          email: '',
          level: levelData
        });
      } catch (err) {
        console.error(`Failed to fetch public profile for ${userId}:`, err);
        setError('Failed to load this user\'s profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  const handleExpandSection = (section: string) => {
    setExpandedSection(section);
  };

  const handleCloseExpanded = () => {
    setExpandedSection(null);
  };

  if (loading) return <Loader />;

  if (error || !profileData) {
    return (
      <div className={`min-h-screen pt-20 flex items-center justify-center ${theme === 'dark' ? 'bg-transparent text-red-400' : 'bg-gradient-to-br from-blue-50 to-cyan-50 text-red-600'}`}>
        <div className={`p-6 rounded-2xl shadow-lg border backdrop-blur-lg ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/80 border-white/20'}`}>
          <p>{error || 'No profile data available for this user.'}</p>
        </div>
      </div>
    );
  }

  const totalPointsStat = profileData.stats.find(s => s.label === 'Total Points');
  const contributionsStat = profileData.stats.find(s => s.label === 'Contributions');
  const questionsAskedStat = profileData.stats.find(s => s.label === 'Questions Asked');
  const likesReceivedStat = profileData.stats.find(s => s.label === 'Likes Received');

  return (
    <div className={`min-h-screen pt-20 pb-16 relative overflow-hidden transition-colors duration-300 ${theme === 'dark'
      ? 'bg-transparent'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50'
      }`}>

      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className={`relative border-b shadow-sm ${theme === 'dark' ? 'bg-space-900/40 backdrop-blur-xl border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl blur-md opacity-50"></div>
                <img
                  src={profileData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}&backgroundColor=000000,ffffff&fontFamily=Arial&radius=50`}
                  alt={profileData.name}
                  className="relative w-24 h-24 rounded-2xl object-cover border-4 border-white/80 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">
                  {profileData.level.percentage}%
                </div>
              </div>
              <div className="min-w-0">
                <h1 className={`text-4xl font-extrabold truncate bg-gradient-to-r ${theme === 'dark' ? 'from-white to-gray-400' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
                  {profileData.name}
                </h1>
                <p className={`text-xl font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} truncate`}>{profileData.role} • {profileData.company}</p>
              </div>
            </div>

            <button className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-green-500/25 shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <Share2 className="w-5 h-5" />
              <span onClick={handleShare}>Share Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { stat: totalPointsStat, icon: Star, color: 'blue' },
            { stat: contributionsStat, icon: BookOpen, color: 'yellow' },
            { stat: questionsAskedStat, icon: MessageCircle, color: 'red' },
            { stat: likesReceivedStat, icon: Heart, color: 'green' }
          ].map((item, idx) => (
            <div key={idx} className={`rounded-3xl p-6 shadow-xl border text-center backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 border-white/30'}`}>
              <div className={`p-4 rounded-2xl mx-auto mb-4 w-fit bg-gradient-to-br from-${item.color}-100 to-${item.color}-50 ${theme === 'dark' ? 'opacity-20' : ''}`}>
                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
              </div>
              <p className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.stat?.value.toLocaleString() || 0}</p>
              <p className={`text-sm font-bold uppercase tracking-wider mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.stat?.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1 space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`rounded-3xl shadow-xl p-8 border ${theme === 'dark' ? 'glass border-white/10 shadow-brand-blue/5' : 'bg-white/60 border-white/30 backdrop-blur-xl'}`}>
              <h3 className={`text-xl font-black mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <User className="w-6 h-6 mr-3 text-blue-500" />
                Information
              </h3>

              <div className="space-y-4">
                {[
                  { label: 'Location', val: profileData.location, icon: MapPin, color: 'blue' },
                  { label: 'Company', val: profileData.company, icon: Building, color: 'indigo' },
                  { label: 'Joined', val: formatDate(profileData.joined_date), icon: Calendar, color: 'cyan' }
                ].map((info, i) => (
                  <div key={i} className={`flex items-start space-x-4 p-4 rounded-2xl border transition-all duration-300 ${theme === 'dark' ? 'bg-space-800/10 border-white/5 hover:border-white/20' : 'bg-white/40 border-white/20 hover:border-white/50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-space-800/30' : 'bg-gray-100'}`}>
                      <info.icon className={`w-5 h-5 ${theme === 'dark' ? 'text-brand-cyan' : 'text-gray-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{info.label}</p>
                      <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{info.val || 'Not specified'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <h4 className={`text-sm font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>About</h4>
                <div className={`rounded-2xl p-5 border ${theme === 'dark' ? 'bg-space-800/20 border-white/10' : 'bg-white/40 border-white/20'}`}>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {profileData.bio || 'This user has not provided a public bio.'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className={`rounded-3xl shadow-xl p-8 border ${theme === 'dark' ? 'glass border-white/10 shadow-green-500/5' : 'bg-white/60 border-white/30 backdrop-blur-xl'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Metrics</h3>
              </div>
              <EngagementChart contributions={engagementData.contributions} likesReceived={engagementData.likesReceived} />
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {expandedSection === 'RecentActivity' && profileData.recentActivity ? (
                <ExpandedRecentActivity key="ExpandedActivity" activities={profileData.recentActivity} onClose={handleCloseExpanded} />
              ) : expandedSection === 'Achievements' ? (
                <ExpandedAchievements key="ExpandedAchievements" onClose={handleCloseExpanded} />
              ) : expandedSection === 'LevelProgress' ? (
                <ExpandedLevelProgress key="ExpandedLevelProgress" levelData={profileData.level} onClose={handleCloseExpanded} />
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                  <div onClick={() => handleExpandSection('LevelProgress')} className={`rounded-3xl shadow-xl p-8 border cursor-pointer group transition-all duration-500 ${theme === 'dark' ? 'glass border-white/10 hover:border-brand-cyan/30' : 'bg-white/60 border-white/30 backdrop-blur-xl hover:shadow-2xl'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform">
                          <Crown className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Level Progress</h3>
                          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}`}>{profileData.level.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span className={`text-4xl font-black bg-gradient-to-r ${theme === 'dark' ? 'from-brand-cyan to-brand-blue' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
                          {profileData.level.percentage}%
                        </span>
                        <ChevronDown className="w-6 h-6 text-gray-400 group-hover:translate-y-1 transition-transform" />
                      </div>
                    </div>
                    <div className={`w-full rounded-full h-3.5 mt-8 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/20'}`}>
                      <div
                        className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 h-3.5 rounded-full shadow-lg shadow-blue-500/20"
                        style={{ width: `${profileData.level.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div onClick={() => handleExpandSection('RecentActivity')} className={`rounded-3xl shadow-xl p-8 border cursor-pointer group transition-all duration-500 ${theme === 'dark' ? 'glass border-white/10 hover:border-yellow-500/30' : 'bg-white/60 border-white/30 backdrop-blur-xl hover:shadow-2xl'}`}>
                      <div className="flex items-center justify-between mb-8">
                        <h3 className={`text-xl font-black flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <Zap className="w-6 h-6 mr-3 text-yellow-500 group-hover:animate-pulse" />
                          Recent Activity
                        </h3>
                        <ChevronDown className="w-6 h-6 text-gray-400 group-hover:translate-y-1 transition-transform" />
                      </div>
                      <div className="space-y-4">
                        {profileData.recentActivity.slice(0, 3).map((activity, index) => {
                          const IconComponent = iconMap[activity.icon] || User;
                          return (
                            <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white/40 border-white/20'}`}>
                              <div className="flex items-center space-x-4">
                                <IconComponent className={`w-5 h-5 ${theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}`} />
                                <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{activity.title}</p>
                              </div>
                              <span className={`text-sm font-black ${theme === 'dark' ? 'text-brand-cyan' : 'text-green-600'}`}>
                                +{activity.points}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className={`text-xs font-black uppercase tracking-widest mt-6 text-right ${theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}`}>View All</p>
                    </div>

                    <div onClick={() => handleExpandSection('Achievements')} className={`rounded-3xl shadow-xl p-8 border cursor-pointer group transition-all duration-500 ${theme === 'dark' ? 'glass border-white/10 hover:border-brand-purple/30' : 'bg-white/60 border-white/30 backdrop-blur-xl hover:shadow-2xl'} flex flex-col justify-between`}>
                      <div className="flex items-center justify-between mb-8">
                        <h3 className={`text-xl font-black flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <Trophy className="w-6 h-6 mr-3 text-brand-purple group-hover:scale-110 transition-transform" />
                          Achievements
                        </h3>
                        <ChevronDown className="w-6 h-6 text-gray-400 group-hover:translate-y-1 transition-transform" />
                      </div>
                      <div className="flex space-x-6 justify-center py-6">
                        <Star className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
                        <Trophy className="w-12 h-12 text-blue-400 drop-shadow-lg" />
                        <Heart className="w-12 h-12 text-rose-400 drop-shadow-lg" />
                      </div>
                      <p className={`text-xs font-black uppercase tracking-widest mt-6 text-center ${theme === 'dark' ? 'text-brand-purple' : 'text-indigo-600'}`}>Reveal All</p>
                    </div>
                  </div>

                  <div className={`rounded-3xl shadow-xl p-8 border ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 border-white/30 backdrop-blur-xl'}`}>
                    <h3 className={`text-xl font-black mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Sparkles className="w-6 h-6 mr-3 text-brand-cyan" />
                      Activity Heatmap
                    </h3>
                    {userId && <PublicActivityHeatmap userId={userId} />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicUserProfilePage;