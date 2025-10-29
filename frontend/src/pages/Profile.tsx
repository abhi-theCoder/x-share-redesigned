import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User, Mail, MapPin, Building, Calendar, Edit3, Star, Trophy, Clock,
  BookOpen, MessageCircle, Heart, Upload, Save, X, LogOut, HeartHandshake, Users, ThumbsUp, Bookmark, FileText,
} from 'lucide-react';
import LoginRequired from '../components/LoginRequired';
import verifyToken from '../components/verifyLogin';
import ActivityHeatmap from '../components/ActivityHeatmap';
import axios from '../api';

// ✅ Icon map (unchanged)
const iconMap = {
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

// Helper function to format date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Date not available';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Colors for dynamic avatars
const colors = ['#FF5733', '#33FF57', '#3357FF', '#F0A500', '#25B7D9', '#E63946', '#2A9D8F'];
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const calculateLevelAndProgress = (points) => {
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

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    location: '',
    bio: ''
  });

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

          if(!valid){
            setError('User not authenticated.');
            setLoading(false);
            return;
          }
          console.log(valid);
        };
    
        checkLogin();

        

        // Fetch Profile
        const profileRes = await axios.get('api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // console.log(profileRes)
        const userId = profileRes.data.id;

        const totalPoints = profileRes.data.stats.find((stat) => stat.label === 'Total Points')?.value || 0;
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
      setProfileData((prev) => ({ ...prev, ...formData }));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to save profile changes.');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileData.name,
      role: profileData.role,
      company: profileData.company,
      location: profileData.location,
      bio: profileData.bio
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRemoveBookmark = async (experienceId, event) => {
    event.stopPropagation(); // Prevents the link from navigating
    event.preventDefault(); // Prevents default link behavior

    const userId = profileData.id;
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

      // Update the state to remove the bookmark from the UI
      setBookmarks(prevBookmarks => prevBookmarks.filter(bookmark => bookmark.id !== experienceId));
      console.log(`Bookmark ${experienceId} removed successfully.`);

    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      setError('Failed to remove bookmark.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error === 'User not authenticated.') {
    return <LoginRequired />;
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-gray-500">
        <p>No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Profile Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6"
            >
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={profileData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}&backgroundColor=000000,ffffff&fontFamily=Arial&radius=50`}
                    alt={profileData.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-orange-200"
                  />
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200">
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                    <p className="text-gray-600 mt-1">{profileData.role}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="w-5 h-5" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Building className="w-5 h-5" />
                      <span>{profileData.company}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>{profileData.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <span>Joined {new Date(profileData.joined_date).toUTCString()}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <User className="w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Building className="w-5 h-5" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your Company"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Your Location"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <BookOpen className="w-5 h-5" />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Your Bio"
                      rows={4}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="flex justify-between space-x-2">
                    <button
                      onClick={handleSave}
                      className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-full flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-800 rounded-xl font-medium hover:bg-gray-400 transform hover:scale-105 transition-all duration-200"
                    >
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Resume Builder Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-500" />
                Resume Builder
              </h3>
              <p className="text-gray-600 mb-4">
                Create and manage your professional resume with our easy-to-use builder.
              </p>
              <Link
                to="/resume-builder"
                className="w-full flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                <Edit3 className="w-4 h-4 mr-2" /> Build Your Resume
              </Link>
            </motion.div>

            {/* Resume Builder Section */}
            {/* <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-5"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-500" />
                Job Finder
              </h3>
              <p className="text-gray-600 mb-4">
                Create and manage your professional resume with our easy-to-use builder.
              </p>
              <Link
                to="/jobs"
                className="w-full flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                View Jobs
              </Link>
            </motion.div> */}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {profileData.stats?.map((stat) => {
                const IconComponent = iconMap[stat.icon] || User;
                return (
                  <div
                    key={stat.label}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{stat?.value || 0}</div>
                    <div className="text-sm text-gray-600">{stat?.label || 'Unknown'}</div>
                  </div>
                );
              })}
            </motion.div>

              {/* --- INSERT THE HEATMAP HERE --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mb-8"
            >
              <ActivityHeatmap activityData={activityData} />
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {profileData.recentActivity?.map((activity) => {
                  const IconComponent = iconMap[activity?.icon] || User;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'question'
                              ? 'bg-blue-100 text-blue-600'
                              : activity.type === 'resource'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.timeAgo}</p>
                        </div>
                      </div>
                      <div className="font-bold text-green-600">{activity.points}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Bookmarks Section with Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8 flex flex-col items-start"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Bookmark className="w-6 h-6 mr-2 text-orange-500" />
                Bookmarked Experiences
              </h3>
              <p className="text-gray-600 mb-4">
                You have {bookmarks.length} saved experiences.
              </p>
              {bookmarks.length > 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-green-700 transition-all duration-200"
                >
                  View All Bookmarks
                </button>
              )}
              {bookmarks.length === 0 && (
                <p className="text-gray-500">
                  No bookmarks yet. Start saving experiences you find interesting!
                </p>
              )}
            </motion.div>

            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Level Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        {(() => {
                          const IconComponent = iconMap[profileData.level?.icon] || Star;
                          return <IconComponent className="w-4 h-4 text-white" />;
                        })()}
                      </div>
                      <span className="font-bold text-gray-800">{profileData.level?.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{profileData.level?.progressText}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                      {profileData.level?.percentage}%
                    </div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${profileData.level?.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{profileData.level?.remaining}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bookmarks Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-gray-100"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Bookmark className="w-8 h-8 mr-3 text-orange-500" />
                Your Bookmarks
              </h2>
              {bookmarks.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {bookmarks.map(exp => (
                    <Link key={exp.id} to={`/experiences/${exp.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-center mb-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3"
                            style={{ backgroundColor: stringToColor(exp.users?.name || String(exp.id)) }}
                          >
                            {getInitials(exp.users?.name || `User ${exp.id}`)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{exp.users?.name || `User ${exp.id}`}</h4>
                            <p className="text-sm text-gray-500">{exp.role || "Experience"}</p>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                          {exp.role} at {exp.company}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {exp.overall_experience || 'No experience summary provided.'}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatDate(exp.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{exp.upvotes}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <MessageCircle className="w-4 h-4" />
                              <span>{exp.comments_count}</span>
                            </div>
                            <button
                              onClick={(e) => handleRemoveBookmark(exp.id, e)}
                              className="text-red-500 hover:text-red-700 transition-colors duration-200 text-sm font-medium flex items-center space-x-1"
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
              ) : (
                <p className="text-center text-gray-500 py-4">You have no bookmarked experiences.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
