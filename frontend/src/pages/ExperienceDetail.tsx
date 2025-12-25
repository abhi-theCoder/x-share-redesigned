import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Share2, Clock, Building, MapPin, Briefcase, ThumbsUp, ThumbsDown, Send, Bookmark } from 'lucide-react';
import axios from '../api';
import { useTheme } from '../context/ThemeContext';

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

interface Comment {
  id: number;
  user_id: number;
  comment_text: string;
  created_at: string;
  users?: { name: string };
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Date not available';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Modern gradient colors for avatars
const avatarGradients = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500'
];

const getAvatarGradient = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarGradients.length;
  return avatarGradients[index];
};

const getInitials = (name: string | undefined): string => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const ExperienceDetail: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);

  const currentUserId = localStorage.getItem('userId');

  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchExperienceAndComments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const experienceResponse = await axios.get<Experience>(`/api/experiences/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExperience({
        ...experienceResponse.data,
        // @ts-ignore
        userVote: experienceResponse.data.user_voted
      });

      const commentsResponse = await axios.get<Comment[]>(`/api/experiences/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(commentsResponse.data);

      // Fetch bookmarks status
      const bookmarksResponse = await axios.get(`/api/bookmarks/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookmarkedIds = bookmarksResponse.data.map((b: any) => b.experienceId);
      setIsBookmarked(bookmarkedIds.includes(Number(id)));

      setError(null);
    } catch (err) {
      console.error('Failed to fetch experience details:', err);
      setError('Failed to load experience details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperienceAndComments();
  }, [id]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`/api/experiences/${id}/vote`, {
        userId: currentUserId,
        voteType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setExperience(prev => ({
          ...prev!,
          upvotes: response.data.upvotes,
          downvotes: response.data.downvotes,
          userVote: response.data.userVote
        }));
      }
    } catch (err) {
      console.error('Failed to submit vote:', err);
    }
  };

  const handleBookmark = async () => {
    const token = localStorage.getItem('token');
    try {
      if (isBookmarked) {
        await axios.delete('/api/bookmarks', {
          data: { experienceId: Number(id) },
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(false);
      } else {
        await axios.post('/api/bookmarks', { experienceId: Number(id) }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Failed to update bookmark:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const response = await axios.post<Comment>(`/api/experiences/${id}/comments`, {
        userId: currentUserId,
        commentText: newComment,
      });

      setComments(prev => [...prev, response.data]);
      setNewComment('');

      setExperience(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments_count: (prev.comments_count || 0) + 1
        };
      });

    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 flex items-center justify-center ${theme === 'dark' ? 'bg-space-950' : 'bg-gray-50'}`}>
        <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${theme === 'dark' ? 'border-brand-cyan' : 'border-blue-500'}`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen pt-20 flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-space-950 text-red-400' : 'bg-gray-50 text-red-600'}`}>
        <p className="text-xl mb-4">{error}</p>
        <Link to="/experiences" className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}>
          Go back to experiences
        </Link>
      </div>
    );
  }

  if (!experience) return null;

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden ${theme === 'dark' ? 'bg-transparent text-white' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 text-zinc-900'
      }`}>
      {/* Background Decor */}
      {theme === 'dark' ? (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-[150px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-cyan/5 rounded-full blur-[150px] pointer-events-none"></div>
        </>
      ) : (
        <>
          <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none"></div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <Link to="/experiences" className={`inline-flex items-center transition-colors duration-200 mb-8 font-medium ${theme === 'dark' ? 'text-gray-400 hover:text-brand-cyan' : 'text-zinc-600 hover:text-blue-600'
          }`}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Experiences
        </Link>

        {/* Main Experience Card */}
        <div className={`rounded-3xl shadow-xl p-8 mb-8 border transition-all duration-300 ${theme === 'dark'
          ? 'bg-space-900/40 backdrop-blur-md border-white/10 shadow-brand-blue/5'
          : 'bg-white/80 backdrop-blur-xl border-white/60 shadow-lg'
          }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg bg-gradient-to-br ${getAvatarGradient(experience.users?.name || String(experience.id))}`}
              >
                {getInitials(experience.users?.name || `User ${experience.id}`)}
              </div>
              <div>
                <h1 className={`text-3xl font-extrabold mb-1 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                  {experience.users?.name || `User ${experience.id}`}
                </h1>
                <p className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}`}>
                  {experience.role} <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>at</span> {experience.company}
                </p>
              </div>
            </div>
            <span className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm self-start md:self-auto ${theme === 'dark'
              ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20'
              : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}>
              {experience.type}
            </span>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-6 rounded-2xl ${theme === 'dark' ? 'bg-space-950/50 border border-white/10' : 'bg-gray-50 border border-gray-100'
            }`}>
            <span className={`flex items-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-700'}`}>
              <Briefcase className={`w-4 h-4 mr-2.5 ${theme === 'dark' ? 'text-brand-blue' : 'text-blue-500'}`} />
              {experience.role}
            </span>
            <span className={`flex items-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-700'}`}>
              <Building className={`w-4 h-4 mr-2.5 ${theme === 'dark' ? 'text-brand-purple' : 'text-purple-500'}`} />
              {experience.company}
            </span>
            <span className={`flex items-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-700'}`}>
              <MapPin className={`w-4 h-4 mr-2.5 ${theme === 'dark' ? 'text-brand-pink' : 'text-pink-500'}`} />
              {experience.location}
            </span>
            <span className={`flex items-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-700'}`}>
              <Clock className={`w-4 h-4 mr-2.5 ${theme === 'dark' ? 'text-brand-cyan' : 'text-cyan-500'}`} />
              {formatDate(experience.created_at)}
            </span>
          </div>

          <div className={`flex items-center gap-6 pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
            <button
              onClick={() => handleVote('upvote')}
              className={`flex items-center gap-2 transition-all p-2 rounded-xl ${experience.userVote === 'upvote'
                ? (theme === 'dark' ? 'bg-brand-cyan text-black shadow-lg shadow-brand-cyan/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20')
                : (theme === 'dark' ? 'text-gray-400 hover:text-brand-cyan hover:bg-white/5' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50')
                }`}
            >
              <ThumbsUp className={`w-5 h-5 ${experience.userVote === 'upvote' ? 'fill-current' : ''}`} />
              <span className="font-bold">{experience.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote('downvote')}
              className={`flex items-center gap-2 transition-all p-2 rounded-xl ${experience.userVote === 'downvote'
                ? (theme === 'dark' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-rose-600 text-white shadow-lg shadow-rose-500/20')
                : (theme === 'dark' ? 'text-gray-400 hover:text-rose-400 hover:bg-white/5' : 'text-gray-500 hover:text-rose-600 hover:bg-gray-50')
                }`}
            >
              <ThumbsDown className={`w-5 h-5 ${experience.userVote === 'downvote' ? 'fill-current' : ''}`} />
              <span className="font-bold">{experience.downvotes}</span>
            </button>
            <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <MessageCircle className="w-5 h-5" />
              <span className="font-bold">{experience.comments_count}</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleBookmark}
                className={`p-2.5 rounded-xl transition-all ${isBookmarked
                  ? (theme === 'dark' ? 'bg-brand-purple text-white shadow-lg shadow-purple-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20')
                  : (theme === 'dark' ? 'text-gray-400 hover:text-brand-purple hover:bg-white/5' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50')
                  }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${experience.role} at ${experience.company}`,
                      text: `Check out this interview experience on X-SHARE!`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className={`rounded-3xl shadow-xl p-8 mb-8 border transition-all duration-300 ${theme === 'dark'
          ? 'glass border-white/10'
          : 'bg-white/80 backdrop-blur-xl border-white/60 shadow-lg'
          }`}>
          <h2 className={`text-2xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Experience Breakdown</h2>

          <div className="space-y-8">
            <div className="group">
              <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}`}>
                Overall Experience
              </h3>
              <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-700'}`}>
                {experience.overall_experience || 'No description provided.'}
              </p>
            </div>

            <div className="group">
              <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-brand-purple' : 'text-purple-600'}`}>
                Preparation Tips
              </h3>
              <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-700'}`}>
                {experience.preparation_tips || 'No preparation tips provided.'}
              </p>
            </div>

            <div className="group">
              <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-brand-pink' : 'text-pink-600'}`}>
                Work Culture
              </h3>
              <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-700'}`}>
                {experience.work_culture || 'No work culture details provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className={`rounded-3xl shadow-xl p-8 border transition-all duration-300 ${theme === 'dark'
          ? 'glass border-white/10'
          : 'bg-white/80 backdrop-blur-xl border-white/60 shadow-lg'
          }`}>
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Comments ({comments.length})</h2>

          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className={`w-full pl-5 pr-14 py-4 rounded-2xl resize-none outline-none focus:ring-2 transition-all duration-300 ${theme === 'dark'
                  ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-brand-cyan focus:bg-white/10'
                  : 'bg-gray-50 border border-gray-200 text-zinc-800 placeholder-zinc-400 focus:ring-blue-500 focus:bg-white'
                  }`}
                rows={3}
              />
              <button
                type="submit"
                className={`absolute right-3 bottom-3 p-2.5 rounded-xl transition-all duration-200 shadow-lg ${theme === 'dark'
                  ? 'bg-brand-cyan text-black hover:bg-white hover:scale-105'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                  }`}
                disabled={commentLoading}
              >
                {commentLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          <div className="space-y-5">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${theme === 'dark'
                  ? 'bg-space-800/20 border-white/5 hover:bg-space-800/40'
                  : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-md'
                  }`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm bg-gradient-to-br ${getAvatarGradient(comment.users?.name || 'Anonymous')}`}
                  >
                    {getInitials(comment.users?.name || 'Anonymous')}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm mb-1 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                      {comment.users?.name || 'Anonymous User'}
                      <span className={`text-xs ml-2 font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                        {formatDate(comment.created_at)}
                      </span>
                    </p>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-zinc-600'}`}>
                      {comment.comment_text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to start the conversation!</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExperienceDetail;