import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  Building,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Send,
  Bookmark,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  TrendingUp,
  Layers
} from 'lucide-react';
import axios from '../api';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface RoundQ {
  question: string;
  answer: string;
}

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
  selection_rounds?: string[];
  rounds_data?: Record<string, RoundQ[]>;
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
  if (!dateString) return 'Registry unknown';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const ExperienceDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const currentUserId = localStorage.getItem('userId');

  const fetchExperienceAndComments = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    try {
      setLoading(true);
      const experienceResponse = await axios.get<Experience>(`/api/experiences/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExperience({ ...experienceResponse.data, userVote: (experienceResponse.data as any).user_voted });

      const commentsResponse = await axios.get<Comment[]>(`/api/experiences/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(commentsResponse.data);

      const bookmarksResponse = await axios.get(`/api/bookmarks/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookmarkedIds = bookmarksResponse.data.map((b: any) => b.experienceId);
      setIsBookmarked(bookmarkedIds.includes(Number(id)));

    } catch (err) {
      console.error('Fetch Error:', err);
      toast.error('Failed to load intelligence core.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExperienceAndComments(); }, [id]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`/api/experiences/${id}/vote`, {
        voteType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setExperience(prev => prev ? {
          ...prev,
          upvotes: response.data.upvotes,
          downvotes: response.data.downvotes,
          userVote: response.data.userVote
        } : null);
        toast.success(`Vote ${voteType === 'upvote' ? 'registered' : 'recorded'}`);
      }
    } catch (err) {
      console.error('Synch failure.');
      toast.error('Synch failure.');
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
        toast.info("Registry cleared.");
      } else {
        await axios.post('/api/bookmarks', { experienceId: Number(id) }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(true);
        toast.success("Intelligence bookmarked.");
      }
    } catch (err) {
      console.error('Sync failure.');
      toast.error('Sync failure.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setCommentSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post<Comment>(`/api/experiences/${id}/comments`, {
        commentText: newComment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments(prev => [...prev, response.data]);
      setNewComment('');
      setExperience(prev => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : null);
      toast.success("Response integrated.");
    } catch (err) {
      console.error('Injection failed:', err);
      toast.error('Injection failed.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!experience) return null;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[var(--exp-bg)] relative overflow-hidden font-sans">
      <div className="exp-container">
        
        {/* Back Button */}
        <Link to="/experiences" className="inline-block mb-8">
            <Button variant="ghost" className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-primary/5 hover:text-primary transition-all group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Return to Directory
            </Button>
        </Link>

        {/* TOP CARD / PROFILE */}
        <section className="exp-card exp-animate">
            <div className="exp-profile-header">
                <div className="exp-avatar">
                   {experience.users?.name?.charAt(0) || "X"}
                </div>
                <div className="exp-profile-info">
                    <h2>
                        {experience.users?.name || "X Share"} 
                        <CheckCircle2 className="exp-verified-icon w-4 h-4" />
                    </h2>
                    <p>{experience.role} @ <span>{experience.company}</span></p>
                </div>
            </div>
            <span className="exp-badge">{experience.type?.toUpperCase()} INSIGHT</span>
            
            <div className="exp-meta-grid">
                <div className="exp-meta-item">
                    <Building className="w-4 h-4" />
                    <div><strong>{experience.company}</strong></div>
                </div>
                <div className="exp-meta-item">
                    <Calendar className="w-4 h-4" />
                    <div>{formatDate(experience.created_at)}</div>
                </div>
                <div className="exp-meta-item">
                    <MapPin className="w-4 h-4" />
                    <div>{experience.location}</div>
                </div>
                <div className="exp-meta-item">
                    <TrendingUp className="w-4 h-4" />
                    <div><strong>{experience.upvotes}</strong> Energy</div>
                </div>
                {experience.selection_rounds && experience.selection_rounds.length > 0 && (
                    <div className="exp-meta-item">
                        <Layers className="w-4 h-4" />
                        <div><strong>{experience.selection_rounds.length}</strong> Rounds</div>
                    </div>
                )}
            </div>
        </section>

        {/* Overall Trajectory */}
        {experience.overall_experience && (
            <>
                <div className="exp-section-label"><Sparkles className="w-4 h-4" /> Overall Trajectory</div>
                <div className="exp-card exp-animate" style={{ animationDelay: '0.1s' }}>
                    <p className="text-muted-foreground font-medium leading-relaxed text-lg">
                        "{experience.overall_experience}"
                    </p>
                </div>
            </>
        )}

        {/* Preparation & Culture (Legacy support or secondary) */}
        {(experience.preparation_tips || experience.work_culture) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {experience.preparation_tips && (
                    <div className="exp-card exp-animate mb-0" style={{ animationDelay: '0.15s' }}>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                           <Info className="w-3.5 h-3.5" /> Preparation
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{experience.preparation_tips}</p>
                    </div>
                )}
                {experience.work_culture && (
                    <div className="exp-card exp-animate mb-0" style={{ animationDelay: '0.15s' }}>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-pink-500 mb-3 flex items-center gap-2">
                           <Sparkles className="w-3.5 h-3.5" /> Culture
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{experience.work_culture}</p>
                    </div>
                )}
            </div>
        )}

        {/* INTERVIEW ROUNDS */}
        {experience.selection_rounds && experience.selection_rounds.length > 0 && (
            <>
                <div className="exp-section-label"><Layers className="w-4 h-4" /> Interview Rounds</div>
                {experience.selection_rounds.map((roundName, idx) => (
                    <div key={idx} className="exp-round-item exp-animate" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                        <div className="exp-round-header">
                            <h3>{roundName}</h3>
                            <span className="exp-round-count">{String(idx + 1).padStart(2, '0')}</span>
                        </div>
                        {experience.rounds_data?.[roundName]?.map((qa, qIdx) => (
                            <div key={qIdx} className="exp-qa-block">
                                <div className="exp-qa-row">
                                    <div className="exp-indicator exp-q-ind">Q</div>
                                    <div className="exp-content"><h4>{qa.question}</h4></div>
                                </div>
                                <div className="exp-qa-row">
                                    <div className="exp-indicator exp-a-ind">A</div>
                                    <div className="exp-content"><p>{qa.answer}</p></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </>
        )}

        {/* Voting Actions */}
        <div className="flex items-center justify-center gap-4 my-12 exp-animate" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 p-1.5 bg-card/60 backdrop-blur-xl rounded-2xl border border-border/40 shadow-sm">
                <Button
                    variant="ghost"
                    className={`h-11 rounded-xl px-6 gap-2 font-black uppercase tracking-widest text-[10px] ${experience.userVote === 'upvote' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/5 hover:text-primary'}`}
                    onClick={() => handleVote('upvote')}
                >
                    <ThumbsUp className={`w-3.5 h-3.5 ${experience.userVote === 'upvote' ? 'fill-current' : ''}`} /> {experience.upvotes}
                </Button>
                <Button
                    variant="ghost"
                    className={`h-11 rounded-xl px-6 gap-2 font-black uppercase tracking-widest text-[10px] ${experience.userVote === 'downvote' ? 'bg-destructive text-destructive-foreground' : 'hover:bg-destructive/5 hover:text-destructive'}`}
                    onClick={() => handleVote('downvote')}
                >
                    <ThumbsDown className={`w-3.5 h-3.5 ${experience.userVote === 'downvote' ? 'fill-current' : ''}`} /> {experience.downvotes}
                </Button>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button
                    variant="ghost"
                    className={`h-11 w-11 p-0 rounded-xl ${isBookmarked ? 'text-primary' : 'hover:text-primary'}`}
                    onClick={handleBookmark}
                >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                    variant="ghost"
                    className="h-11 w-11 p-0 rounded-xl hover:text-primary"
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link intercepted to clipboard.");
                    }}
                >
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>
        </div>

        {/* COMMENT SECTION */}
        <div className="exp-comments-section exp-animate" style={{ animationDelay: '0.6s' }}>
            <div className="exp-section-label" style={{ marginTop: 0 }}>Discussion ({comments.length})</div>
            
            <div className="exp-comment-input-area">
                <div className="exp-user-avatar">
                   {experience.users?.name?.charAt(0) || "U"}
                </div>
                <div className="relative flex-grow">
                    <Textarea 
                        placeholder="Join the discussion..." 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="exp-comment-box min-h-[100px] w-full resize-none focus:ring-0 focus-visible:ring-0"
                    />
                    <Button 
                        className="absolute right-3 bottom-3 h-8 px-4 rounded-lg font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20"
                        onClick={handleCommentSubmit}
                        disabled={commentSubmitting || !newComment.trim()}
                    >
                        {commentSubmitting ? <div className="h-3 w-3 border-2 border-t-transparent border-white rounded-full animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
                        Inject
                    </Button>
                </div>
            </div>

            <ul className="exp-comment-list">
                {comments.map((comment, i) => (
                    <li key={comment.id} className="exp-comment-item">
                        <div className="exp-user-avatar" style={{ background: i % 2 === 0 ? '#cbd5e1' : '#94a3b8' }}>
                            {comment.users?.name?.charAt(0) || "A"}
                        </div>
                        <div className="exp-comment-content">
                            <b>{comment.users?.name || "Anonymous"}</b>
                            {comment.comment_text}
                            <span className="block mt-2 text-[10px] text-muted-foreground opacity-50">{formatDate(comment.created_at)}</span>
                        </div>
                    </li>
                ))}
                {comments.length === 0 && (
                    <div className="py-12 text-center opacity-30 border border-dashed border-border/40 rounded-3xl">
                        <MessageCircle className="w-8 h-8 mx-auto mb-3" />
                        <p className="font-black uppercase tracking-[0.2em] text-[10px]">No responses interfaced yet</p>
                    </div>
                )}
            </ul>
        </div>

      </div>
    </div>
  );
};

export default ExperienceDetail;