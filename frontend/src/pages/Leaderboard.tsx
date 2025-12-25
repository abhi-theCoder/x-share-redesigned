import React, { useEffect, useState, useMemo } from 'react';
import axios from '../api';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Crown, Medal, Star, TrendingUp,
  Shield, Flame, Users
} from 'lucide-react';
import Loader from '../components/Loader';

// --- Type Definitions (Unchanged) ---
interface LevelInfo {
  level: string;
  nextLevel: string | null;
  pointsToNextLevel: number;
  progressPercent: number;
}

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  contributions: number;
  level: LevelInfo;
  avatar: string;
  company?: string;
  youAreHere?: boolean;
  rank?: number; // Assumed to be present in API response for currentUser
}


interface APIResponse {
  topUsers: LeaderboardUser[];
  currentUser: LeaderboardUser;
}

// --- Utility Functions (Refined Avatar Colors) ---
const colors = [
  'bg-blue-100 text-blue-800', 'bg-indigo-100 text-indigo-800',
  'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800',
  'bg-pink-100 text-pink-800', 'bg-teal-100 text-teal-800'
];

function getAvatarStyle(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// --- Spacer Row Type for "..." ---
const SPACER_ROW_ID = 'spacer-row';
interface SpacerRow {
  id: typeof SPACER_ROW_ID;
  isSpacer: true;
}

const Leaderboard: React.FC = () => {
  const { theme } = useTheme();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Define the number of top users to always show
  const TOP_N = 5;

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<APIResponse>('/api/leaderboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // 1. Mark the current user data explicitly
      const current = { ...data.currentUser, youAreHere: true };

      // 2. Process topUsers list: check if currentUser is already in it
      const updatedTopUsers = data.topUsers.map(user =>
        user.id === current.id ? current : user
      );

      setTopUsers(updatedTopUsers);
      setCurrentUser(current);
    } catch (err) {
      console.error("Leaderboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Updated rank icon logic (Unchanged)
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-500 w-5 h-5 fill-yellow-200" />;
    if (rank === 2) return <Medal className="text-gray-400 w-5 h-5 fill-gray-200" />;
    if (rank === 3) return <Medal className="text-amber-600 w-5 h-5 fill-amber-200" />;
    return (
      <span className="text-sm font-bold text-gray-600 p-1 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
        {rank}
      </span>
    );
  };

  // --- Core Logic: Prepare the final list for display ---
  const displayList = useMemo<Array<LeaderboardUser | SpacerRow>>(() => {
    if (!currentUser) return topUsers;

    const currentUserRank = currentUser.rank ?? Infinity;
    const isCurrentUserInTopN = currentUserRank <= TOP_N;

    // Filter out the current user from the main topUsers list if they will be added separately later.
    const filteredTopUsers = topUsers.filter(user => user.id !== currentUser.id);

    // If the current user is in the top N, we just use the first N items from the list,
    // assuming the API returned the list in correct rank order.
    if (isCurrentUserInTopN) {
      return topUsers.slice(0, TOP_N);
    }

    // Case: Current user is outside the top N (rank > 5)

    // 1. Get the top N users
    const finalDisplayList: Array<LeaderboardUser | SpacerRow> = filteredTopUsers.slice(0, TOP_N);

    // 2. Add the spacer
    finalDisplayList.push({ id: SPACER_ROW_ID, isSpacer: true });

    // 3. Add the current user at the end
    finalDisplayList.push(currentUser);

    return finalDisplayList;

  }, [topUsers, currentUser, TOP_N]);


  // Helper function to render a user row OR a spacer
  const renderRow = (item: LeaderboardUser | SpacerRow, index: number) => {
    if ((item as SpacerRow).isSpacer) {
      return (
        <motion.div
          key={SPACER_ROW_ID}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-4 text-lg font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
        >
          ...
        </motion.div>
      );
    }

    const user = item as LeaderboardUser;
    // Use the rank provided by the API (which is essential for the current user's entry) 
    // or fallback to index+1 for users in the topUsers array.
    const rank = user.rank ?? index + 1;
    const isTop3 = rank <= 3;
    const avatarStyle = getAvatarStyle(user.id);
    const isCurrentUser = user.youAreHere; // This flag is set in fetchLeaderboard

    // Determine card classes based on rank and if it's the current user
    let cardClasses = `flex items-center justify-between rounded-xl p-4 transition-all duration-300 shadow-md hover:shadow-lg`;

    if (isCurrentUser) {
      // Highlighted style for current user. Use slightly larger padding for visual weight.
      cardClasses = `${theme === 'dark' ? 'bg-blue-900/20 border-blue-500/50 ring-blue-500/20' : 'bg-blue-50 border-blue-500 ring-blue-100'} border-2 ring-4 p-6 ${cardClasses}`;
    } else if (isTop3) {
      // Top 3 distinct style
      cardClasses = `${theme === 'dark' ? 'bg-space-900/60 backdrop-blur-md border-white/20' : 'bg-white border-gray-200'} border-2 p-6 ${rank === 1 ? 'border-yellow-400 shadow-xl shadow-yellow-500/10' : 'shadow-lg'} ${cardClasses}`;
    } else {
      // Standard row style
      cardClasses = `${theme === 'dark' ? 'bg-space-900/40 backdrop-blur-sm border-white/5 hover:bg-space-800/60' : 'bg-white border-gray-100'} border ${cardClasses}`;
    }

    // Adjusted rank element
    const rankElement = isTop3 ? (
      <div className="w-10 h-10 flex items-center justify-center">
        {getRankBadge(rank)}
      </div>
    ) : (
      <span className={`w-10 text-lg text-center font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{rank}</span>
    );

    // Use the first letter of the name for the avatar if no avatar URL is present
    const avatarLetter = user.name.charAt(0).toUpperCase();

    return (
      <motion.div
        key={user.id}
        initial={{ opacity: 0, x: -25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className={cardClasses}
      >
        <div className="flex items-center gap-4">

          {/* Rank */}
          {rankElement}

          {/* Avatar */}
          <div className="relative">
            {user.avatar ? (
              <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt={user.name} />
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${avatarStyle}`}>
                {avatarLetter}
              </div>
            )}
            {/* Star badge for current user, matching your sidebar UI */}
            {isCurrentUser && (
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-blue-300 shadow-lg">
                <Star className="w-4 h-4 text-blue-500 fill-blue-100" />
              </div>
            )}
          </div>

          {/* Name & Details */}
          <div>
            <h3 className={`text-lg font-bold ${isCurrentUser ? 'text-blue-500' : theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              {user.name} {isCurrentUser && <span className="text-sm text-blue-500 font-medium">(You)</span>}
            </h3>
            <p className="text-sm text-gray-500">
              {user.company || ""}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl font-extrabold text-blue-600 flex items-center justify-end gap-1">
            {user.points} <Star className="w-5 h-5 text-blue-500 fill-blue-100" />
          </p>
        </div>
      </motion.div>
    );
  };
  // --- End of renderRow

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={`min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-16 transition-colors duration-300 ${theme === 'dark' ? 'bg-transparent text-white' : 'bg-gray-50 text-gray-900'
      }`}>

      {/* --- Header Section --- */}
      <header className="text-center mb-12">
        <motion.h1
          className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 drop-shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Community Champions 🏆
        </motion.h1>
        <p className={`mt-2 text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          See who's leading the charge in contributions and expertise this month.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">

        {/* --- Leaderboard List Section --- */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className={`text-2xl font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <Users className="w-6 h-6 text-blue-500 mr-2" /> Top Contributors
          </h2>
          {/* Renders the calculated list, including the current user and "..." */}
          {displayList.map(renderRow)}
        </div>

        {/* --- Current User Card / Stats Sidebar --- */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Current User Card */}
            <div className={`p-7 rounded-2xl shadow-xl border-t-4 border-blue-500 transition-all duration-300 ${theme === 'dark' ? 'bg-space-900/40 backdrop-blur-md border-white/10' : 'bg-white'
              }`}>
              <h2 className={`flex items-center gap-2 text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <TrendingUp className="text-blue-500 w-5 h-5" /> Your Progress
              </h2>

              <div className={`flex items-center gap-4 border-b pb-4 mb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md ${getAvatarStyle(currentUser.id)}`}>
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} className="w-full h-full object-cover rounded-full border-2 border-white" alt={currentUser.name} />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-blue-300 shadow-lg">
                    <Star className="w-4 h-4 text-blue-500 fill-blue-100" />
                  </div>
                </div>

                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{currentUser.name}</h3>
                  <p className="text-sm text-gray-500">{currentUser.company || "Level Up!"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <StatBox
                  icon={<Shield className="text-green-500" />}
                  label="Rank"
                  value={`#${currentUser.rank}`}
                  color="text-green-600"
                  theme={theme}
                />
                <StatBox
                  icon={<Star className="text-yellow-500" />}
                  label="Points"
                  value={currentUser.points.toString()}
                  color="text-yellow-600"
                  theme={theme}
                />
                <StatBox
                  icon={<Flame className="text-red-500" />}
                  label="Contr."
                  value={currentUser.contributions.toString()}
                  color="text-red-600"
                  theme={theme}
                />
              </div>
            </div>

            {/* Level & Rewards Placeholder */}
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200 shadow-sm">
              <h3 className="text-lg font-bold text-blue-700 mb-3">
                Your Current Level: <span className="font-extrabold">{currentUser.level.level}</span>
              </h3>

              {/* XP Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-2.5 transition-all duration-500"
                  style={{ width: `${currentUser.level.progressPercent}%` }}
                ></div>
              </div>

              <p className="text-xs text-gray-600 mt-2">
                {currentUser.level.progressPercent}% to next level
                {currentUser.level.nextLevel && (
                  <> (<span className="font-semibold">{currentUser.level.pointsToNextLevel}</span> points left for {currentUser.level.nextLevel})</>
                )}
              </p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

// --- New Reusable StatBox Component ---
const StatBox: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string, theme: string }> = ({ icon, label, value, color, theme }) => (
  <div className={`p-3 rounded-lg border transition-all duration-300 ${theme === 'dark' ? 'bg-space-950/50 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
    <div className="flex justify-center items-center mb-1">
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 mr-1" })}
      <p className={`text-lg font-extrabold ${color}`}>{value}</p>
    </div>
    <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
  </div>
);

export default Leaderboard;