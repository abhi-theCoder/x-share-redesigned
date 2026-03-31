import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Edit3, X, Calendar, PenTool, Bookmark, ThumbsUp, ThumbsDown, MessageCircle, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { toast } from 'sonner';
import axios from '../api';

// --- Removed Dummy Data ---


// --- Modal Component ---
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 dark:bg-[#0B1120]/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-3xl p-8 shadow-2xl"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Edit3 className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Share Your Journey</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-balance">
              Your experience could be the missing piece of the puzzle for someone else. Share your story and help build the community.
            </p>

            <Link to="/share-experience" onClick={onClose}>
              <Button size="lg" className="w-full rounded-xl text-lg h-14 font-semibold shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white border-transparent">
                Post Experience
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Experiences: React.FC = () => {
  const navigate = useNavigate();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      try {
        // Fetch experiences
        const res = await axios.get('/api/experiences');
        let fetchedExps = [];
        if (res.data && Array.isArray(res.data.data)) {
          fetchedExps = res.data.data;
        } else if (Array.isArray(res.data)) {
          fetchedExps = res.data;
        }

        // Fetch user bookmarks if logged in
        if (token && userId) {
          try {
            const bookmarksRes = await axios.get(`/api/bookmarks/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const bookmarkedIds = bookmarksRes.data.map((b: any) => b.experienceId);

            // Map bookmarks to experiences
            fetchedExps = fetchedExps.map((exp: any) => ({
              ...exp,
              isBookmarked: bookmarkedIds.includes(exp.id)
            }));
          } catch (bErr) {
            console.error("Failed to fetch bookmarks", bErr);
          }
        }

        setExperiences(fetchedExps);
      } catch (err) {
        console.error("Failed to fetch experiences from API", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  const handleVote = async (e: React.MouseEvent, id: string, type: 'upvote' | 'downvote') => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authentication Required", {
        description: "Please login to vote on experiences."
      });
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post(`/api/experiences/${id}/vote`, { voteType: type }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data) {
        setExperiences(prev => prev.map(exp =>
          exp.id == id ? {
            ...exp,
            upvotes: res.data.upvotes,
            downvotes: res.data.downvotes,
            user_voted: res.data.userVote || res.data.user_voted
          } : exp
        ));
      }
    } catch (err) {
      console.error("Failed to vote", err);
      toast.error("Action Failed", { description: "We couldn't process your vote. Please try again." });
    }
  };

  const handleBookmark = async (e: React.MouseEvent, id: number, currentStatus: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authentication Required", {
        description: "Please login to bookmark experiences."
      });
      navigate('/login');
      return;
    }

    try {
      if (currentStatus) {
        // Remove bookmark
        await axios.delete('/api/bookmarks', {
          data: { experienceId: id },
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.info("Bookmark removed");
      } else {
        // Add bookmark
        await axios.post('/api/bookmarks', { experienceId: id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Experience bookmarked!");
      }

      setExperiences(prev => prev.map(exp =>
        exp.id === id ? { ...exp, isBookmarked: !currentStatus } : exp
      ));
    } catch (err) {
      console.error("Failed to update bookmark", err);
      toast.error("Process Failed", { description: "Could not update bookmark. Try again." });
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    const token = localStorage.getItem('token');
    if (!token) {
      e.preventDefault();
      e.stopPropagation();
      toast.error("Authentication Required", {
        description: "Please login to view and add comments."
      });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-200 pb-20 pt-24">

      {/* Header Section */}
      <div className="container mx-auto px-4 text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-slate-900 dark:text-white">Professional </span>
            <span className="text-blue-500">Experience</span>
          </h1>
          <p className="text-sm md:text-[15px] text-slate-500 dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Share and discover professional journeys from our community members.
          </p>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 max-w-7xl relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="font-bold text-slate-400">Synchronizing journeys...</p>
          </div>
        ) : experiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827]">
                  <Link to={`/experiences/${exp.id}`} className="flex-1">

                    {/* Card Header */}
                    <CardHeader className="p-5 pb-3">
                      <div className="flex bg-slate-100 dark:bg-[#1f2937] items-center gap-3">
                        <Avatar className={`h-11 w-11 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0`}>
                          <AvatarFallback className={`text-blue-600 dark:text-blue-500 bg-transparent font-medium text-sm`}>
                            {exp.users?.name ? exp.users.name.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-snug truncate">
                            {exp.users?.name || 'Anonymous'}
                          </h3>
                          <p className="text-[13px] text-slate-500 dark:text-[#94A3B8] truncate leading-snug">
                            {exp.title}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-[#64748B] truncate mt-0.5 flex items-center gap-1.5 font-medium">
                            <span className="flex items-center gap-1">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                              {exp.company}
                            </span>
                            <span className="inline-block w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-[#475569]"></span>
                            <span className="flex items-center gap-1">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {exp.location}
                            </span>
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Card Content */}
                    <CardContent className="px-5 pb-5 pt-1">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2.5 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {exp.role}
                      </h4>
                      <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed line-clamp-3">
                        {exp.overall_experience || exp.description}
                      </p>
                    </CardContent>
                  </Link>

                  {/* Card Footer */}
                  <CardFooter className="p-4 pt-0 pb-5 pl-5 pr-5 flex flex-col gap-6">

                    {/* Top line of footer: Date & Pill Badge */}
                    <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100 dark:border-[#1F2937]/60">
                      <div className="flex items-center text-[11px] text-slate-500 dark:text-[#64748B] font-medium gap-1.5 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(exp.created_at || exp.date).toLocaleDateString()}
                      </div>
                      <Badge className={`rounded-xl text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-none shadow-none h-5 flex items-center ${exp.type?.toUpperCase() === 'INTERNSHIP' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-100 dark:bg-[#1F2937] hover:bg-slate-200 dark:hover:bg-[#374151] text-slate-600 dark:text-[#94A3B8]'}`}>
                        {exp.type}
                      </Badge>
                    </div>

                    {/* Bottom line of footer: Interactions & Tools */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 p-1 bg-slate-50/80 dark:bg-slate-950/50 backdrop-blur-sm rounded-[14px] border border-slate-200/50 dark:border-slate-800/50">
                        <button
                          onClick={(e) => handleVote(e, exp.id, 'upvote')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all ${exp.user_voted === 'upvote' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600'}`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${exp.user_voted === 'upvote' ? 'fill-current' : ''}`} />
                          <span className="text-xs font-bold">{exp.upvotes}</span>
                        </button>
                        <button
                          onClick={(e) => handleVote(e, exp.id, 'downvote')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all ${exp.user_voted === 'downvote' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-rose-500'}`}
                        >
                          <ThumbsDown className={`w-3.5 h-3.5 ${exp.user_voted === 'downvote' ? 'fill-current' : ''}`} />
                          <span className="text-xs font-bold">{exp.downvotes}</span>
                        </button>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
                        <Link
                          to={`/experiences/${exp.id}`}
                          onClick={(e) => handleCommentClick(e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{exp.comments_count || 0}</span>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleBookmark(e, exp.id, !!exp.isBookmarked)}
                          className={`p-2 rounded-xl transition-all ${exp.isBookmarked ? 'text-yellow-500 bg-yellow-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-white'}`}
                        >
                          <Bookmark className={`w-4 h-4 ${exp.isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.origin}/experiences/${exp.id}`);
                            toast.success("Link copied!");
                          }}
                          className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-white rounded-xl transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white dark:bg-[#111827] rounded-[48px] border-2 border-dashed border-slate-200 dark:border-[#1F2937]">
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <PenTool className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black mb-2">No journeys recorded yet</h3>
            <p className="text-slate-500 font-medium mb-8">Be the first to share your professional story.</p>
            <Button onClick={() => setIsShareModalOpen(true)} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20">
              Post Experience
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsShareModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center transition-transform hover:scale-105 z-40 border border-blue-400/20"
      >
        <PenTool className="w-6 h-6" />
      </button>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </div>
  );
};

export default Experiences;
