import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User, Mail, MapPin, Building, Calendar, Edit3, Star, Trophy, Clock,
  BookOpen, MessageCircle, Heart, Upload, Save, X, LogOut, HeartHandshake, Users, ThumbsUp, Bookmark, FileText,
  Award, TrendingUp, Zap, Crown, Sparkles, Share2, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import LoginRequired from '../components/LoginRequired';
import verifyToken from '../components/verifyLogin';
import ActivityHeatmap from '../components/ActivityHeatmap';
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
  FileText
};

// Interface for a full Experience object
interface Experience {
  id: number;
  role: string;
  company: string;
  location: string;
  upvotes: number;
  comments_count: number;
  overall_experience: string;
  created_at: string;
  users: { name: string };
  type: string;
}

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

// Colors for dynamic avatars
const colors = ['#FF5733', '#33FF57', '#3357FF', '#F0A500', '#25B7D9', '#E63946', '#2A9D8F'];
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

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
    ? `You need ${nextLevel.minPoints - points} more points to reach ${nextLevel.name}!`
    : "You've reached the highest level! 🏆";

  return {
    name: currentLevel.name,
    icon: currentLevel.icon,
    percentage: Math.min(100, Math.max(0, Math.floor(progress))),
    progressText: progressText,
    remaining: nextLevel ? `${points} / ${nextLevel.minPoints}` : `${points} / ∞`
  };
};

// Enhanced Engagement Chart with glass effect
const EngagementChart = ({ contributions, likesReceived }: { contributions: number; likesReceived: number }) => {
  const { theme } = useTheme();
  const maxValue = Math.max(contributions, likesReceived, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Contributions</span>
        <span className={`font-bold px-2 py-1 rounded-lg text-xs ${theme === 'dark' ? 'text-brand-cyan bg-brand-cyan/10' : 'text-blue-600 bg-blue-50'}`}>
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

// Updated Achievement Badges Component with theme colors
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
          Complete challenges to unlock more achievements!
        </p>
      </div>
    </div>
  );
};

// Expanded View Components
const ExpandedRecentActivity = ({ activities, onClose }: { activities: any[], onClose: () => void }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl shadow-xl p-6 border col-span-2 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
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
        {activities?.map((activity: any) => {
          const IconComponent = iconMap[activity?.icon] || User;
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
      className={`rounded-3xl shadow-xl p-6 border col-span-2 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
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

const ExpandedLevelProgress = ({ levelData, onClose }: { levelData: any, onClose: () => void }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl shadow-xl p-6 border col-span-2 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Level Progress</h3>
            <p className={`text-lg font-medium bg-gradient-to-r ${theme === 'dark' ? 'from-brand-cyan to-brand-blue' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
              {levelData?.name}
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
            {levelData?.percentage}%
          </span>
        </div>
        <div className={`w-full rounded-full h-4 border ${theme === 'dark' ? 'bg-white/10 border-white/5' : 'bg-white/60 border-white/30 backdrop-blur-sm'}`}>
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-700 shadow-lg shadow-blue-500/25"
            style={{ width: `${levelData?.percentage}%` }}
          ></div>
        </div>
        <div className={`text-center p-4 rounded-xl backdrop-blur-sm ${theme === 'dark' ? 'bg-white/5 text-gray-300' : 'bg-white/30 text-gray-600'}`}>
          <p className="text-lg font-medium">{levelData?.progressText}</p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Current Progress: {levelData?.remaining}</p>
        </div>
      </div>
    </motion.div>
  );
};

const ExpandedBookmarks = ({ bookmarks, onClose, onRemoveBookmark }: {
  bookmarks: any[],
  onClose: () => void,
  onRemoveBookmark: (id: number, e: React.MouseEvent) => void
}) => {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl shadow-xl p-6 border col-span-2 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Bookmark className="w-6 h-6 mr-2 text-indigo-500" />
          Bookmarks ({bookmarks.length})
        </h3>
        <button
          onClick={onClose}
          className={`p-2 rounded-full transition-colors backdrop-blur-sm ${theme === 'dark' ? 'text-gray-400 hover:bg-white/10' : 'text-gray-500 hover:bg-white/50'}`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
        {bookmarks.map((exp: any) => (
          <Link key={exp.id} to={`/experiences/${exp.id}`}>
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className={`p-5 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/80 backdrop-blur-sm border-white/30'}`}
            >
              <div className="flex items-center mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg"
                  style={{ backgroundColor: stringToColor(exp.users?.name || String(exp.id)) }}
                >
                  {getInitials(exp.users?.name || `User ${exp.id}`)}
                </div>
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{exp.users?.name || `User ${exp.id}`}</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{exp.role || "Experience"}</p>
                </div>
              </div>
              <h3 className={`text-lg font-bold mb-3 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {exp.role} at {exp.company}
              </h3>
              <p className={`text-sm line-clamp-3 p-4 rounded-xl backdrop-blur-sm mb-4 ${theme === 'dark' ? 'bg-white/5 text-gray-300' : 'bg-blue-50/30 text-gray-600'}`}>
                {exp.overall_experience || 'No experience summary provided.'}
              </p>
              <div className="flex items-center justify-between">
                <div className={`flex items-center text-xs px-3 py-1 rounded-lg backdrop-blur-sm ${theme === 'dark' ? 'bg-white/10 text-gray-400' : 'bg-white/50 text-gray-500'}`}>
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatDate(exp.created_at)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-1 text-sm px-2 py-1 rounded-lg backdrop-blur-sm ${theme === 'dark' ? 'bg-white/10 text-gray-400' : 'bg-white/50 text-gray-500'}`}>
                    <ThumbsUp className="w-4 h-4" />
                    <span>{exp.upvotes}</span>
                  </div>
                  <div className={`flex items-center space-x-1 text-sm px-2 py-1 rounded-lg backdrop-blur-sm ${theme === 'dark' ? 'bg-white/10 text-gray-400' : 'bg-white/50 text-gray-500'}`}>
                    <MessageCircle className="w-4 h-4" />
                    <span>{exp.comments_count}</span>
                  </div>
                  <button
                    onClick={(e) => onRemoveBookmark(exp.id, e)}
                    className={`transition-colors duration-200 text-sm font-medium flex items-center space-x-1 px-2 py-1 rounded-lg backdrop-blur-sm ${theme === 'dark' ? 'bg-white/10 text-red-400 hover:text-red-300' : 'bg-white/50 text-red-500 hover:text-red-700'}`}
                  >
                    <X className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

const Profile = () => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Experience[]>([]);
  const [id, setId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    location: '',
    bio: ''
  });

  // Mock data for engagement metrics
  const engagementData = {
    contributions: 47,
    likesReceived: 128
  };

  //handle share
  const handleShare = () => {
    if (!id) return;
    const userId = id;
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      alert('Profile URL copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy profile URL: ', err);
    });
  };

  useEffect(() => {
    const fetchProfileAndBookmarks = async () => {
      try {
        const token = localStorage.getItem('token');

        const checkLogin = async () => {
          if (!token) {
            setError('User not authenticated.');
            setLoading(false);
            return;
          }

          const valid = await verifyToken(token);

          if (!valid) {
            setError('User not authenticated.');
            setLoading(false);
            return;
          }
        };

        checkLogin();

        // Fetch Profile
        const profileRes = await axios.get('api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setId(profileRes.data.id);
        const userId = profileRes.data.id;

        const totalPoints = profileRes.data.stats.find((stat: any) => stat.label === 'Total Points')?.value || 0;
        const levelData = calculateLevelAndProgress(totalPoints);

        setProfileData({
          ...profileRes.data,
          level: levelData
        });

        setFormData({
          name: profileRes.data.name,
          role: profileRes.data.role,
          company: profileRes.data.company,
          location: profileRes.data.location,
          bio: profileRes.data.bio
        });

        // Fetch Bookmarks (full experience objects)
        const bookmarksRes = await axios.get(`/api/bookmarks/${userId}/experiences`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(bookmarksRes.data);

      } catch (err) {
        console.error('Failed to fetch profile/bookmarks:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndBookmarks();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData((prev) => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to save profile changes.');
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.name,
        role: profileData.role,
        company: profileData.company,
        location: profileData.location,
        bio: profileData.bio
      });
    }
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRemoveBookmark = async (experienceId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const userId = profileData?.id;
    if (!userId) {
      setError('User not authenticated.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/bookmarks', {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId, experienceId }
      });

      setBookmarks(prevBookmarks => prevBookmarks.filter(bookmark => bookmark.id !== experienceId));
      console.log(`Bookmark ${experienceId} removed successfully.`);

    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      setError('Failed to remove bookmark.');
    }
  };

  const handleExpandSection = (section: string) => {
    setExpandedSection(section);
  };

  const handleCloseExpanded = () => {
    setExpandedSection(null);
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  if (error === 'User not authenticated.') {
    return <LoginRequired />;
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
      <div className={`min-h-screen pt-20 flex items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'text-gray-300 bg-transparent' : 'text-gray-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50'}`}>
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
          <p>No profile data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 pb-16 relative overflow-hidden transition-colors duration-300 ${theme === 'dark'
      ? 'bg-transparent'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50'
      }`}>
      {/* Background decorative elements */}
      {theme === 'dark' ? (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-purple/10 rounded-full translate-x-1/3 translate-y-1/3 blur-[100px] pointer-events-none"></div>
        </>
      ) : (
        <>
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </>
      )}

      {/* Header */}
      <div className={`relative border-b shadow-sm transition-colors duration-300 ${theme === 'dark'
        ? 'glass border-white/10'
        : 'bg-white/60 backdrop-blur-xl border-white/30'
        }`}>
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
                  {profileData.level?.percentage}%
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`text-3xl font-bold truncate bg-clip-text text-transparent ${theme === 'dark'
                  ? 'bg-gradient-to-r from-brand-cyan to-brand-blue'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  }`}>
                  {profileData.name}
                </h1>
                <p className={`truncate text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{profileData.role} • {profileData.company}</p>
                <p className={`text-sm truncate flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Mail className="w-4 h-4 mr-1" /> {profileData.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl font-medium hover:bg-white transition-all duration-200 shadow-lg border border-white/30">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Info Card - Improved Styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl shadow-xl p-6 border ${theme === 'dark'
                ? 'glass border-white/10'
                : 'bg-white/60 backdrop-blur-xl border-white/30'
                }`}
            >
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <User className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-brand-cyan' : 'text-blue-500'}`} />
                Profile Information
              </h3>

              <div className="space-y-3">
                {/* Location */}
                <div className={`flex items-start space-x-3 p-3 rounded-xl backdrop-blur-sm border transition-all duration-200 ${theme === 'dark'
                  ? 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40'
                  : 'bg-gradient-to-r from-blue-50/50 to-blue-100/30 border-blue-200/30 hover:border-blue-300/50'
                  }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                    <MapPin className={`w-4 h-4 ${theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium uppercase tracking-wide ${theme === 'dark' ? 'text-brand-cyan/70' : 'text-blue-700'}`}>Location</p>
                    <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                      {profileData.location || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Company */}
                <div className={`flex items-start space-x-3 p-3 rounded-xl backdrop-blur-sm border transition-all duration-200 ${theme === 'dark'
                  ? 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40'
                  : 'bg-gradient-to-r from-indigo-50/50 to-indigo-100/30 border-indigo-200/30 hover:border-indigo-300/50'
                  }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-500/10'}`}>
                    <Building className={`w-4 h-4 ${theme === 'dark' ? 'text-brand-purple' : 'text-indigo-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium uppercase tracking-wide ${theme === 'dark' ? 'text-brand-purple/70' : 'text-indigo-700'}`}>Company</p>
                    <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                      {profileData.company || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Joined Date */}
                <div className={`flex items-start space-x-3 p-3 rounded-xl backdrop-blur-sm border transition-all duration-200 ${theme === 'dark'
                  ? 'bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40'
                  : 'bg-gradient-to-r from-cyan-50/50 to-cyan-100/30 border-cyan-200/30 hover:border-cyan-300/50'
                  }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-500/10'}`}>
                    <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-brand-cyan' : 'text-cyan-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium uppercase tracking-wide ${theme === 'dark' ? 'text-brand-cyan/70' : 'text-cyan-700'}`}>Joined</p>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                      {formatDate(profileData.joined_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-white/30'}`}>
                <h4 className={`text-sm font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className={`bg-gradient-to-r ${theme === 'dark' ? 'from-brand-cyan to-brand-blue' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
                    About
                  </span>
                </h4>
                <div className={`rounded-xl p-4 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/40 backdrop-blur-sm border-white/30'}`}>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {profileData.bio || 'No bio provided yet. Share something about yourself!'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Engagement Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-3xl shadow-xl p-6 border ${theme === 'dark'
                ? 'glass border-white/10'
                : 'bg-white/60 backdrop-blur-xl border-white/30'
                }`}
            >
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Engagement Metrics</h3>
              </div>
              <EngagementChart
                contributions={engagementData.contributions}
                likesReceived={engagementData.likesReceived}
              />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-3xl shadow-xl p-6 border ${theme === 'dark'
                ? 'glass border-white/10'
                : 'bg-white/60 backdrop-blur-xl border-white/30'
                }`}
            >
              <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/resume-builder"
                  className={`flex items-center space-x-3 p-4 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm ${theme === 'dark'
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan hover:to-brand-purple'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                    }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Resume Builder</span>
                </Link>
                <button className={`flex items-center space-x-3 p-4 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm w-full ${theme === 'dark'
                  ? 'bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple hover:to-brand-cyan'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
                  }`}>
                  <Award className="w-5 h-5" />
                  <span className="font-medium">Achievements</span>
                </button>
                <button className={`flex items-center space-x-3 p-4 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm w-full ${theme === 'dark'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  }`}>
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Export Data</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {profileData.stats?.map((stat: any, index: number) => {
                const IconComponent = iconMap[stat.icon] || User;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-3xl shadow-xl p-6 border transition-all duration-300 group hover:scale-105 ${theme === 'dark' ? 'glass border-white/10 hover:shadow-2xl' : 'bg-white/60 backdrop-blur-xl border-white/30 hover:shadow-2xl'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat?.value || 0}</div>
                        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat?.label || 'Unknown'}</div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 backdrop-blur-sm">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Main Content Grid with Expandable Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Recent Activity - Expandable */}
              {expandedSection === 'recentActivity' ? (
                <ExpandedRecentActivity
                  activities={profileData.recentActivity}
                  onClose={handleCloseExpanded}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-3xl shadow-xl p-6 border cursor-pointer hover:shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
                  onClick={() => handleExpandSection('recentActivity')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {profileData.recentActivity?.slice(0, 3).map((activity: any) => {
                      const IconComponent = iconMap[activity?.icon] || User;
                      return (
                        <div
                          key={activity.id}
                          className={`flex items-center justify-between p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${theme === 'dark' ? 'bg-space-800/20 border-white/10 hover:bg-space-800/40' : 'bg-white/50 border-white/30 hover:bg-white/70'}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{activity.title}</p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{activity.timeAgo}</p>
                            </div>
                          </div>
                          <div className={`text-sm font-bold whitespace-nowrap px-2 py-1 rounded-lg ${theme === 'dark' ? 'text-brand-cyan bg-brand-cyan/10' : 'text-blue-600 bg-blue-50'}`}>
                            +{activity.points}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Achievements - Expandable */}
              {expandedSection === 'achievements' ? (
                <ExpandedAchievements onClose={handleCloseExpanded} />
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`rounded-3xl shadow-xl p-6 border cursor-pointer hover:shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
                  onClick={() => handleExpandSection('achievements')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Achievements</h3>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((index) => {
                      const badges = [
                        { icon: Star, color: 'from-blue-400 to-indigo-500' },
                        { icon: Trophy, color: 'from-cyan-500 to-blue-500' },
                        { icon: Heart, color: 'from-purple-400 to-indigo-500' },
                      ];
                      const badge = badges[index - 1];
                      const IconComponent = badge.icon;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className={`w-12 h-12 bg-gradient-to-br ${badge.color} rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border ${theme === 'dark' ? 'border-white/20' : 'border-white/30'}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className={`text-xs text-center mt-3 p-2 rounded-lg backdrop-blur-sm ${theme === 'dark' ? 'text-gray-400 bg-space-800/20' : 'text-gray-500 bg-white/30'}`}>
                    Click to view all achievements
                  </p>
                </motion.div>
              )}

              {/* Level Progress - Expandable */}
              {expandedSection === 'levelProgress' ? (
                <ExpandedLevelProgress levelData={profileData.level} onClose={handleCloseExpanded} />
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`rounded-3xl shadow-xl p-6 border cursor-pointer hover:shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
                  onClick={() => handleExpandSection('levelProgress')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Level Progress</h3>
                        <p className={`text-sm font-medium bg-gradient-to-r ${theme === 'dark' ? 'from-brand-cyan to-brand-blue' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
                          {profileData.level?.name}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {profileData.level?.percentage}%
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2 border backdrop-blur-sm ${theme === 'dark' ? 'bg-space-800/20 border-white/10' : 'bg-white/60 border-white/30'}`}>
                      <div
                        className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-700 shadow-lg shadow-blue-500/25"
                        style={{ width: `${profileData.level?.percentage}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs text-center p-2 rounded-lg backdrop-blur-sm ${theme === 'dark' ? 'text-gray-300 bg-space-800/20' : 'text-gray-500 bg-white/30'}`}>
                      {profileData.level?.progressText}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Bookmarks - Expandable */}
              {expandedSection === 'bookmarks' ? (
                <ExpandedBookmarks
                  bookmarks={bookmarks}
                  onClose={handleCloseExpanded}
                  onRemoveBookmark={handleRemoveBookmark}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`rounded-3xl shadow-xl p-6 border cursor-pointer hover:shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}
                  onClick={() => handleExpandSection('bookmarks')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Bookmarks</h3>
                    <div className="flex items-center space-x-2">
                      <Bookmark className="w-5 h-5 text-indigo-500" />
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {bookmarks.slice(0, 2).map((exp: any) => (
                      <div
                        key={exp.id}
                        className={`p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${theme === 'dark' ? 'bg-space-800/20 border-white/10 hover:bg-space-800/40' : 'bg-white/50 border-white/30 hover:bg-white/70'}`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg"
                            style={{ backgroundColor: stringToColor(exp.users?.name || String(exp.id)) }}
                          >
                            {getInitials(exp.users?.name || `User ${exp.id}`)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                              {exp.role} at {exp.company}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(exp.created_at)}</p>
                          </div>
                        </div>
                        <p className={`text-xs line-clamp-1 p-2 rounded-lg backdrop-blur-sm ${theme === 'dark' ? 'bg-space-900/40 text-gray-300' : 'bg-white/30 text-gray-600'}`}>
                          {exp.overall_experience || 'No experience summary provided.'}
                        </p>
                      </div>
                    ))}
                    {bookmarks.length > 2 && (
                      <div className={`text-center py-2 text-sm font-medium rounded-xl backdrop-blur-sm border transition-all duration-200 ${theme === 'dark' ? 'bg-space-800/30 text-brand-cyan border-white/10 hover:bg-space-800/50' : 'bg-white/50 text-indigo-600 border-white/30'}`}>
                        View all {bookmarks.length} bookmarks
                      </div>
                    )}
                    {bookmarks.length === 0 && (
                      <div className={`text-center py-4 rounded-xl backdrop-blur-sm ${theme === 'dark' ? 'text-gray-400 bg-white/5' : 'text-gray-500 bg-white/30'}`}>
                        <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No bookmarks yet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <ActivityHeatmap />

            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className={`rounded-3xl shadow-2xl p-6 w-full max-w-md border ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/90 backdrop-blur-xl border-white/30'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h2>
                <button
                  onClick={handleCancel}
                  className={`p-2 rounded-full transition-colors backdrop-blur-sm ${theme === 'dark' ? 'text-gray-400 hover:bg-white/10' : 'text-gray-500 hover:bg-white/50'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl outline-none transition backdrop-blur-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-brand-cyan' : 'bg-white/80 border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl outline-none transition backdrop-blur-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-brand-cyan' : 'bg-white/80 border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl outline-none transition backdrop-blur-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-brand-cyan' : 'bg-white/80 border-gray-300 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl outline-none transition backdrop-blur-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-brand-cyan' : 'bg-white/80 border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full p-3 border rounded-xl outline-none transition backdrop-blur-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-brand-cyan' : 'bg-white/80 border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400'}`}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className={`flex-1 flex items-center justify-center px-4 py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-lg ${theme === 'dark' ? 'bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan hover:to-brand-purple' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'}`}
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-xl font-medium transition-all duration-200 backdrop-blur-sm ${theme === 'dark' ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;