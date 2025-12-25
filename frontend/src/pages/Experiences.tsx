import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, MessageCircle, Share2, Clock, Building, MapPin, ThumbsUp, ThumbsDown, Bookmark, Edit3, X, ArrowLeft, ArrowRight } from 'lucide-react';
import Loader from '../components/Loader';
import axios from '../api';
import { useTheme } from '../context/ThemeContext';

// --- Types and Utility Functions (Omitted for brevity, assume correct) ---

interface Experience {
  id: number;
  upvotes: number;
  downvotes: number;
  comments_count: number;
  users?: { name: string };
  role: string;
  company: string;
  location: string;
  created_at: string;
  type: string;
  overall_experience?: string;
  preparation_tips?: string;
  work_culture?: string;
  userVote?: 'upvote' | 'downvote' | null;
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Date not available';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const colors = ['#00F0FF', '#2D6BFF', '#9D4EDD', '#FF2E93', '#2DD4BF', '#F472B6', '#3B82F6'];

const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (name: string | undefined): string => {
  if (!name) return 'U';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

// --- Floating CTA Button & Modal Components (Omitted for brevity, assume correct) ---

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  if (!isOpen) return null;

  const modalVariants = {
    hidden: { y: "-100vh", opacity: 0, scale: 0.5 },
    visible: {
      y: "0",
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, type: "spring", stiffness: 100 }
    },
    exit: { y: "100vh", opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className={`rounded-3xl p-8 max-w-lg w-11/12 shadow-2xl relative border ${theme === 'dark' ? 'bg-space-950 border-white/10' : 'bg-white border-white/20'}`}
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <Edit3 className="w-12 h-12 text-blue-600 mx-auto mb-4 p-2 bg-blue-50 rounded-full" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Have an Experience to Share?
              </h3>
              <p className="text-gray-600 mb-6">
                Help the next generation by sharing your career journey, challenges, and insights.
              </p>

              <Link to="/share-experience" onClick={onClose}>
                {/* Using original color gradient for the button */}
                <button className="
                                    w-full py-3 text-white font-semibold rounded-xl text-lg
                                    bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg
                                    hover:from-blue-700 hover:to-blue-500
                                    transform hover:scale-[1.01] transition-all duration-300
                                ">
                  Share Your Story
                </button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface FloatingShareButtonProps {
  onClick: () => void;
}

const FloatingShareButton: React.FC<FloatingShareButtonProps> = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    // Using original blue/purple color scheme elements
    className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-blue-600 text-white shadow-2xl
                   flex items-center space-x-2 transition-all duration-300
                   hover:bg-blue-700 hover:scale-[1.05] focus:outline-none focus:ring-4 focus:ring-blue-300
                   md:bottom-8 md:right-8"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
    aria-label="Share Your Experience"
  >
    <Edit3 className="w-6 h-6" />
    <span className="hidden sm:inline font-semibold">Share Story</span>
  </motion.button>
);


// --- Loader Component ---
// A clean component to show while loading new data
const GridLoader: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className={`lg:col-span-3 col-span-1 flex justify-center items-center py-16 rounded-xl shadow-lg border ${theme === 'dark' ? 'bg-space-900/40 border-white/10' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center space-x-3 text-blue-600">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium">Loading Experiences...</p>
      </div>
    </div>
  );
};


// --- Main Component ---

const Experiences: React.FC = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const token = localStorage.getItem('token');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const [currentUserId] = useState<string>(() => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('userId', userId);
    }
    return userId;
  });

  const [userVotes, setUserVotes] = useState<Record<number, 'upvote' | 'downvote' | null>>({});
  const [bookmarkedExperiences, setBookmarkedExperiences] = useState<Set<number>>(new Set());

  const categories = ['All', 'internship', 'job', 'hackathon', 'other'];

  // --- Enhanced API Call for Filtering and Pagination ---
  const fetchExperiences = useCallback(async (page = 1, term = searchTerm, category = selectedCategory) => {
    // Set loading *immediately* when fetching starts
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(term && { search: term }),
        ...(category !== 'All' && { type: category }),
      });

      const response = await axios.get(`/api/experiences?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const experiencesData = response.data.data || response.data;
      const meta = response.data.meta || {};
      const totalPagesCalc = meta.totalPages || Math.max(1, Math.ceil((meta.total || experiencesData.length) / limit));

      const initialVotes = experiencesData.reduce((acc, exp: any) => {
        if (exp.user_voted) acc[exp.id] = exp.user_voted;
        return acc;
      }, {} as Record<number, 'upvote' | 'downvote' | null>);

      setUserVotes(initialVotes);
      setExperiences(experiencesData);
      setTotalPages(totalPagesCalc);
      setCurrentPage(meta.page || page);
    } catch (err) {
      console.error('Failed to fetch experiences:', err);
      setError('Failed to load experiences. Please check your network or try again.');
      setExperiences([]);
    } finally {
      // Unset loading when data is received or failed
      setLoading(false);
    }
  }, [token, limit]);

  // Fetch bookmarks logic (omitted for brevity)
  const fetchBookmarks = async () => {
    try {
      const response = await axios.get<{ experienceId: number }[]>(`/api/bookmarks/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      const bookmarkedIds = new Set(response.data.map(b => b.experienceId));
      setBookmarkedExperiences(bookmarkedIds);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    }
  };

  // When search term or category changes — reset to page 1
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchExperiences(1, searchTerm, selectedCategory);
    }, 400); // Debounce to prevent excessive API calls
    return () => clearTimeout(delay);
  }, [searchTerm, selectedCategory, fetchExperiences]);

  // On initial mount — just load first page + bookmarks
  useEffect(() => {
    fetchExperiences(1, '', 'All');
    fetchBookmarks();
  }, []);


  // --- Interaction Handlers ---

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchExperiences(page, searchTerm, selectedCategory);
  };

  const handleVote = async (e: React.MouseEvent<HTMLButtonElement>, experienceId: number, voteType: 'upvote' | 'downvote') => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      alert('Please login to vote');
      return;
    }

    try {
      const response = await axios.post(`/api/experiences/${experienceId}/vote`, {
        userId: currentUserId,
        voteType: voteType
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data) {
        // Update local state with the new counts and user's vote status
        setExperiences(prev => prev.map(exp =>
          exp.id === experienceId
            ? { ...exp, upvotes: response.data.upvotes, downvotes: response.data.downvotes, userVote: response.data.userVote }
            : exp
        ));

        setUserVotes(prev => ({
          ...prev,
          [experienceId]: response.data.userVote
        }));
      }
    } catch (err) {
      console.error('Failed to submit vote:', err);
    }
  };

  const handleBookmark = async (e: React.MouseEvent<HTMLButtonElement>, experienceId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      alert('Please login to bookmark');
      return;
    }

    const isBookmarked = bookmarkedExperiences.has(experienceId);

    try {
      if (isBookmarked) {
        // Remove bookmark
        await axios.delete('/api/bookmarks', {
          data: { experienceId },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setBookmarkedExperiences(prev => {
          const next = new Set(prev);
          next.delete(experienceId);
          return next;
        });
      } else {
        // Add bookmark
        await axios.post('/api/bookmarks', { experienceId }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setBookmarkedExperiences(prev => {
          const next = new Set(prev);
          next.add(experienceId);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to update bookmark:', err);
    }
  };

  // --- Render Logic ---

  // Check for initial load and if there's no data yet (full screen loader)
  if (loading && experiences.length === 0) {
    return <Loader />;
  }

  // Error rendering (omitted for brevity, assume correct)


  return (
    <div className={`min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-transparent' : 'bg-gray-50'
      }`}>
      <div className="max-w-7xl mx-auto">

        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
            Career <span className="bg-gradient-to-r from-brand-cyan to-blue-500 bg-clip-text text-transparent">Experiences</span>
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
            Learn from the journeys of successful professionals who've walked the path before you.
          </p>
        </motion.div>

        {/* --- Search & Filter Bar --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mt-8 mb-8 flex flex-col md:flex-row gap-4 sticky top-16 z-10 py-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#030014]/80 backdrop-blur-md' : 'bg-gray-50/95 backdrop-blur-sm'
            }`}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by role, company, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all duration-200 shadow-xl ${theme === 'dark'
                ? 'bg-space-950/50 border-white/10 text-white placeholder-gray-500 focus:ring-brand-cyan'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'
                }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all duration-200 ${theme === 'dark'
                ? 'bg-[#111] border-white/10 text-white'
                : 'bg-white border-gray-200 text-gray-900 focus:ring-blue-500'
                }`}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </motion.div>


        {/* --- Main Content Grid --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* 🌟 Conditional Rendering for Loader/Error/Content 🌟 */}
          {loading && experiences.length > 0 && <GridLoader />}

          {error ? (
            <div className="lg:col-span-3 text-center py-12 text-red-600 bg-white rounded-xl shadow-lg border">
              <p className="text-lg font-semibold">{error}</p>
              <p className="text-sm mt-2">Please try reloading the page.</p>
            </div>
          ) : (
            <>
              {experiences.length > 0 ? (
                // Map over experiences (hidden if loading and experiences.length > 0)
                experiences.map((experience, index) => (
                  <motion.article key={experience.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border group ${theme === 'dark'
                      ? 'bg-space-900/40 backdrop-blur-md border-white/10 hover:border-brand-cyan/40'
                      : 'bg-white border-gray-100 hover:border-blue-200'
                      } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Link to={`/experiences/${experience.id}`} className="block">
                      <div className="p-6">
                        {/* Card Content (omitted for brevity) */}
                        <div className={`flex items-center mb-4 border-b pb-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'
                          }`}>
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 flex-shrink-0"
                            style={{ backgroundColor: stringToColor(experience.users?.name || String(experience.id)) }}
                          >
                            {getInitials(experience.users?.name || `User ${experience.id}`)}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'
                              }`}>{experience.users?.name || `User ${experience.id}`}</h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{experience.role}</p>
                            <div className={`flex items-center text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Building className="w-4 h-4 mr-1" />
                              <span className="mr-3 truncate">{experience.company}</span>
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="truncate">{experience.location}</span>
                            </div>
                          </div>
                        </div>

                        <h4 className={`text-lg font-bold mb-3 group-hover:text-blue-500 transition-colors duration-200 ${theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                          {experience.role || 'Career Experience'} at {experience.company || 'A Company'}
                        </h4>
                        <p className={`mb-4 line-clamp-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                          {experience.overall_experience || experience.preparation_tips || 'No experience summary provided.'}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{formatDate(experience.created_at)}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-white/10 text-brand-cyan border border-brand-cyan/20' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {experience.type}
                          </span>
                        </div>

                        {/* Action Bar */}
                        <div className={`flex items-center justify-between pt-4 border-t ${theme === 'dark' ? 'border-space-700' : 'border-gray-100'
                          }`}>
                          <div className="flex items-center space-x-2">
                            {/* Upvote */}
                            <button
                              onClick={(e) => handleVote(e, experience.id, 'upvote')}
                              className={`flex items-center space-x-2 transition-all duration-200 p-2 rounded-full text-sm ${userVotes[experience.id] === 'upvote' ? 'bg-brand-cyan text-black shadow-lg shadow-brand-cyan/30' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10'}`}
                            >
                              <ThumbsUp className={`w-5 h-5 ${userVotes[experience.id] === 'upvote' ? 'fill-current' : ''}`} />
                              <span>{experience.upvotes}</span>
                            </button>
                            {/* Downvote */}
                            <button
                              onClick={(e) => handleVote(e, experience.id, 'downvote')}
                              className={`flex items-center space-x-2 transition-all duration-200 p-2 rounded-full text-sm ${userVotes[experience.id] === 'downvote' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10'}`}
                            >
                              <ThumbsDown className={`w-5 h-5 ${userVotes[experience.id] === 'downvote' ? 'fill-current' : ''}`} />
                              <span>{experience.downvotes}</span>
                            </button>
                            {/* Comments */}
                            <div className="flex items-center space-x-2 text-gray-500 p-2">
                              <MessageCircle className="w-5 h-5" />
                              <span>{experience.comments_count}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Bookmark */}
                            <button
                              onClick={(e) => handleBookmark(e, experience.id)}
                              className={`flex items-center transition-all duration-200 p-2 rounded-full ${bookmarkedExperiences.has(experience.id) ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                              <Bookmark className={`w-5 h-5 ${bookmarkedExperiences.has(experience.id) ? 'fill-current' : ''}`} />
                            </button>
                            {/* Share */}
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert(`Sharing ${experience.role} experience.`); }}
                              className={`transition-colors duration-200 p-2 rounded-full ${theme === 'dark' ? 'text-gray-500 hover:bg-space-700 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500 hover:bg-gray-100'
                                }`}
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))
              ) : (
                // Only show "No experiences" message if loading is false and no experiences
                !loading && (
                  <div className={`lg:col-span-3 text-center py-12 rounded-xl shadow-lg border ${theme === 'dark' ? 'bg-space-900/40 border-white/10 text-gray-300' : 'bg-white border-gray-100 text-gray-500'}`}>
                    <p className="text-lg">No experiences found matching your search or filters.</p>
                    <p className="text-sm mt-2">Try different keywords or check the 'All' category.</p>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* --- Pagination Controls (Bottom) --- */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 space-x-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`px-4 py-2 rounded-lg flex items-center disabled:opacity-50 ${theme === 'dark'
                ? 'bg-space-800 text-gray-300 hover:bg-space-700'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                }`}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                disabled={loading} // Disable while loading
                className={`px-4 py-2 rounded-lg font-semibold ${currentPage === pageNumber
                  ? theme === 'dark' ? 'bg-brand-cyan text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-blue-600 text-white shadow-md'
                  : theme === 'dark'
                    ? 'glass text-gray-300 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`px-4 py-2 rounded-lg flex items-center disabled:opacity-50 ${theme === 'dark'
                ? 'bg-space-800 text-gray-300 hover:bg-space-700'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                }`}
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}

      </div>

      {/* --- Floating CTA and Modal --- */}
      <FloatingShareButton onClick={() => setIsShareModalOpen(true)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </div>
  );
};

export default Experiences;