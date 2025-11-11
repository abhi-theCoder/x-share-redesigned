import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom'; // Using useParams to get the public user's ID
import {
  User, Mail, MapPin, Building, Calendar, Edit3, Star, Trophy, Clock,
  BookOpen, MessageCircle, Heart, Upload, Save, X, LogOut, HeartHandshake, Users, ThumbsUp, Bookmark, FileText,
  Award, TrendingUp, Zap, Crown, Sparkles, Share2, Download, ChevronDown, ChevronUp, Clock2
} from 'lucide-react';
import PublicActivityHeatmap from '../components/PublicActivityHeatmap'; // Assuming this component is shared
import axios from '../api'; // Assuming your custom axios instance
import Loader from '../components/Loader';

// --- Shared Helper Functions & Interfaces (Copied from your code to make this file self-contained for structure) ---

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
  Clock, // Add Clock icon
  Zap, // Add Zap icon
  Crown, // Add Crown icon
  Sparkles, // Add Sparkles icon
  Award, // Add Award icon
  TrendingUp // Add TrendingUp icon
};

// Profile data interface
interface ProfileData {
  id: string;
  name: string;
  email: string; // Kept in interface but NOT displayed
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

// Helper function for Level Calculation (Using your logic)
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

// --- Custom Components for Public View ---

// Enhanced Engagement Chart (Copied from your code)
const EngagementChart = ({ contributions, likesReceived }: { contributions: number; likesReceived: number }) => {
  const maxValue = Math.max(contributions, likesReceived, 10);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Contributions</span>
        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs">
          {contributions}
        </span>
      </div>
      <div className="w-full bg-white/60 backdrop-blur-sm rounded-full h-2.5 border border-white/30">
        <div 
          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-700 shadow-lg shadow-blue-500/25"
          style={{ width: `${(contributions / maxValue) * 100}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Likes Received</span>
        <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs">
          {likesReceived}
        </span>
      </div>
      <div className="w-full bg-white/60 backdrop-blur-sm rounded-full h-2.5 border border-white/30">
        <div 
          className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-700 shadow-lg shadow-green-500/25"
          style={{ width: `${(likesReceived / maxValue) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

// Achievement Badges Component (Copied from your code)
const AchievementBadges = () => {
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
              className={`relative group ${
                badge.earned ? 'opacity-100' : 'opacity-40 grayscale'
              }`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${badge.color} rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg border border-white/20">
                {badge.label}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500 bg-white/30 p-2 rounded-lg backdrop-blur-sm">
          This user has unlocked {badges.filter(b => b.earned).length} achievements.
        </p>
      </div>
    </div>
  );
};


// Expanded Recent Activity (Public version - removed action buttons)
const ExpandedRecentActivity = ({ activities, onClose }: { activities: ProfileData['recentActivity'], onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30 lg:col-span-2"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
        <Zap className="w-6 h-6 mr-2 text-yellow-500" />
        Recent Activity
      </h3>
      <button
        onClick={onClose}
        className="p-2 rounded-full text-gray-500 hover:bg-white/50 transition-colors backdrop-blur-sm"
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
            className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all duration-200 border border-white/30"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium text-gray-800">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.timeAgo}</p>
              </div>
            </div>
            <div className="text-lg font-bold text-blue-600 whitespace-nowrap bg-blue-50 px-3 py-2 rounded-lg">
              +{activity.points}
            </div>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

// Expanded Achievements (Public version)
const ExpandedAchievements = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30 lg:col-span-2"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
        <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
        Achievements
      </h3>
      <button
        onClick={onClose}
        className="p-2 rounded-full text-gray-500 hover:bg-white/50 transition-colors backdrop-blur-sm"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
    <AchievementBadges />
  </motion.div>
);

// Expanded Level Progress (Public version)
const ExpandedLevelProgress = ({ levelData, onClose }: { levelData: ProfileData['level'], onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30 lg:col-span-2"
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Level Progress</h3>
          <p className="text-lg text-gray-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-medium">
            {levelData.name}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-full text-gray-500 hover:bg-white/50 transition-colors backdrop-blur-sm"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
    
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-gray-700">Progress</span>
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {levelData.percentage}%
        </span>
      </div>
      <div className="w-full bg-white/60 backdrop-blur-sm rounded-full h-4 border border-white/30">
        <div
          className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-700 shadow-lg shadow-blue-500/25"
          style={{ width: `${levelData.percentage}%` }}
        ></div>
      </div>
      <div className="text-center p-4 bg-white/30 rounded-xl backdrop-blur-sm">
        <p className="text-lg text-gray-600 font-medium">{levelData.progressText}</p>
        <p className="text-sm text-gray-500 mt-2">Current Progress: {levelData.remaining}</p>
      </div>
    </div>
  </motion.div>
);


// --- Main Public User Profile Component ---

const PublicUserProfilePage = () => {
  // Use a route parameter to get the ID of the profile to view
  const { userId } = useParams<{ userId: string }>(); 

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Mock data for engagement metrics (should ideally come from backend)
  const engagementData = {
    contributions: 47,
    likesReceived: 128
  };
  
  //Handle share
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
        // NOTE: Use a different endpoint for public profile data to ensure privacy
        // The backend should return only public fields (no email, private settings, etc.)
        const profileRes = await axios.get(`/api/profile/public/${userId}`);
        
        const totalPoints = profileRes.data.stats?.find((stat: any) => stat.label === 'Total Points')?.value || 0;
        const levelData = calculateLevelAndProgress(totalPoints);
        
        setProfileData({
          ...profileRes.data,
          // IMPORTANT: Explicitly exclude/override private fields just in case
          email: '', // Never show email on public profile
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

  // --- Render Logic ---

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-red-600 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-gray-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
          <p>No profile data available for this user.</p>
        </div>
      </div>
    );
  }

  // Find the 'Total Points' stat value for the metric cards
  const totalPointsStat = profileData.stats.find(s => s.label === 'Total Points');
  const contributionsStat = profileData.stats.find(s => s.label === 'Contributions');
  const questionsAskedStat = profileData.stats.find(s => s.label === 'Questions Asked');
  const likesReceivedStat = profileData.stats.find(s => s.label === 'Likes Received');


  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 relative overflow-hidden">
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      
      {/* Header (Public View) */}
      <div className="relative bg-white/60 backdrop-blur-xl border-b border-white/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl blur-md opacity-50"></div>
                <img
                  src={profileData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}&backgroundColor=000000,ffffff&fontFamily=Arial&radius=50`}
                  alt={profileData.name}
                  className="relative w-20 h-20 rounded-2xl object-cover border-4 border-white/80 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
                  {profileData.level.percentage}%
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 truncate bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {profileData.name}
                </h1>
                <p className="text-gray-600 truncate text-lg">{profileData.role} • {profileData.company}</p>
                {/* Email REMOVED from public view */}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Share2 className="w-5 h-5" />
                <span onClick={handleShare}>Share Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Points */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/30 text-center">
            <div className={`p-3 rounded-xl mx-auto mb-2 w-fit bg-gradient-to-br from-blue-100 to-indigo-100`}>
                <Star className={`w-5 h-5 text-blue-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalPointsStat?.value.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{totalPointsStat?.label || 'Total Points'}</p>
          </div>
          {/* Contributions */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/30 text-center">
            <div className={`p-3 rounded-xl mx-auto mb-2 w-fit bg-gradient-to-br from-yellow-100 to-orange-100`}>
                <BookOpen className={`w-5 h-5 text-yellow-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{contributionsStat?.value.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{contributionsStat?.label || 'Contributions'}</p>
          </div>
          {/* Questions Asked */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/30 text-center">
            <div className={`p-3 rounded-xl mx-auto mb-2 w-fit bg-gradient-to-br from-red-100 to-pink-100`}>
                <MessageCircle className={`w-5 h-5 text-red-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{questionsAskedStat?.value.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{questionsAskedStat?.label || 'Questions Asked'}</p>
          </div>
          {/* Likes Received */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/30 text-center">
            <div className={`p-3 rounded-xl mx-auto mb-2 w-fit bg-gradient-to-br from-green-100 to-cyan-100`}>
                <Heart className={`w-5 h-5 text-green-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{likesReceivedStat?.value.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{likesReceivedStat?.label || 'Likes Received'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Info Card (Static) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Profile Information
              </h3>
              
              <div className="space-y-3">
                {/* Location */}
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50/50 to-blue-100/30 rounded-xl backdrop-blur-sm border border-blue-200/30">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Location</p>
                    <p className="text-sm text-gray-800 font-medium truncate">
                      {profileData.location || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Company */}
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-indigo-50/50 to-indigo-100/30 rounded-xl backdrop-blur-sm border border-indigo-200/30">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Company</p>
                    <p className="text-sm text-gray-800 font-medium truncate">
                      {profileData.company || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Joined Date */}
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-cyan-50/50 to-cyan-100/30 rounded-xl backdrop-blur-sm border border-cyan-200/30">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-cyan-700 uppercase tracking-wide">Joined</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {formatDate(profileData.joined_date)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Bio Section */}
              <div className="mt-6 pt-4 border-t border-white/30">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    About
                  </span>
                </h4>
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {profileData.bio || 'This user has not provided a public bio.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Engagement Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30"
            >
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">Engagement Metrics</h3>
              </div>
              <EngagementChart 
                contributions={engagementData.contributions}
                likesReceived={engagementData.likesReceived}
              />
            </motion.div>
          </div>

          {/* Main Content (3/4 width) */}
          <div className="lg:col-span-3 space-y-8">
            <AnimatePresence mode="wait">
              {expandedSection === 'RecentActivity' && profileData.recentActivity ? (
                <ExpandedRecentActivity 
                  key="ExpandedActivity"
                  activities={profileData.recentActivity} 
                  onClose={handleCloseExpanded} 
                />
              ) : expandedSection === 'Achievements' ? (
                <ExpandedAchievements 
                  key="ExpandedAchievements"
                  onClose={handleCloseExpanded} 
                />
              ) : expandedSection === 'LevelProgress' ? (
                <ExpandedLevelProgress 
                  key="ExpandedLevelProgress"
                  levelData={profileData.level} 
                  onClose={handleCloseExpanded} 
                />
              ) : (
                <motion.div 
                  key="DefaultView"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Level Progress (Summary Card) */}
                  <div 
                    onClick={() => handleExpandSection('LevelProgress')}
                    className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Level Progress</h3>
                          <p className="text-sm text-gray-600 font-medium">{profileData.level.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {profileData.level.percentage}%
                        </span>
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="w-full bg-white/60 backdrop-blur-sm rounded-full h-2.5 mt-4 border border-white/30">
                        <div
                            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${profileData.level.percentage}%` }}
                        ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Recent Activity Card */}
                    <div 
                      onClick={() => handleExpandSection('RecentActivity')}
                      className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                              Recent Activity
                          </h3>
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="space-y-3">
                          {profileData.recentActivity.slice(0, 3).map((activity, index) => {
                              const IconComponent = iconMap[activity.icon] || User;
                              return (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white/40 rounded-xl border border-white/20">
                                      <div className="flex items-center space-x-2">
                                          <IconComponent className="w-4 h-4 text-blue-600" />
                                          <p className="text-sm text-gray-800 truncate">{activity.title}</p>
                                      </div>
                                      <span className="text-xs font-bold text-green-600">
                                          +{activity.points}
                                      </span>
                                  </div>
                              );
                          })}
                      </div>
                      <p className='text-xs text-blue-600 mt-4 text-right font-medium'>View All</p>
                    </div>

                    {/* Achievements Card */}
                    <div 
                      onClick={() => handleExpandSection('Achievements')}
                      className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30 cursor-pointer hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                              <Trophy className="w-5 h-5 mr-2 text-purple-500" />
                              Achievements
                          </h3>
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex space-x-4 justify-center py-4">
                        <Star className="text-5xl text-yellow-500" />
                        <Trophy className="text-5xl text-blue-500" />
                        <Heart className="text-5xl text-red-500" />
                      </div>
                      <p className='text-xs text-blue-600 mt-4 text-center font-medium'>Click to view all achievements</p>
                    </div>
                  </div>

                  {/* Activity Heatmap */}

                    {userId && <PublicActivityHeatmap userId={userId} />} {/* Pass the user ID */}

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