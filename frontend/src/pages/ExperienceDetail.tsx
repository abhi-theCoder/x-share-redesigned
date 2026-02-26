import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ChevronRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import axios from '../api';
import { toast } from 'sonner';

// Shadcn UI Components
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <div className="min-h-screen pt-24 pb-20 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        <Link to="/experiences">
          <Button variant="ghost" className="mb-8 h-10 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-primary/5 hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Directory
          </Button>
        </Link>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Experience content */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-[40px] border-border/60 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden border-none shadow-black/5 ring-1 ring-border/20">
              <CardHeader className="p-8 md:p-12 pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 rounded-[28px] border-4 border-background shadow-xl">
                      <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl uppercase italic">
                        {experience.users?.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-black italic">{experience.users?.name || "Verified Peer"}</h1>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="h-5 w-5 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl border-border bg-card/90 backdrop-blur-md">
                              <p className="text-[10px] font-black uppercase tracking-widest">Verified Trajectory</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-primary font-bold italic flex items-center gap-2 text-lg">
                        {experience.role} <span className="text-muted-foreground text-sm font-medium not-italic opacity-40">at</span> {experience.company}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider self-start md:self-auto">
                    {experience.type} Insight
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-[32px] bg-muted/20 border border-border/20">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company</span>
                    <div className="flex items-center gap-2 text-xs font-bold italic"><Building className="w-3.5 h-3.5 text-blue-500" /> {experience.company}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Registry</span>
                    <div className="flex items-center gap-2 text-xs font-bold italic"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {formatDate(experience.created_at)}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Location</span>
                    <div className="flex items-center gap-2 text-xs font-bold italic"><MapPin className="w-3.5 h-3.5 text-pink-500" /> {experience.location}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Engagement</span>
                    <div className="flex items-center gap-2 text-xs font-bold italic"><TrendingUp className="w-3.5 h-3.5 text-primary" /> {experience.upvotes} Energy</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 md:p-12 space-y-12">
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                    <h3 className="text-xl font-black italic">Overall Trajectory</h3>
                  </div>
                  <p className="text-muted-foreground font-medium italic leading-relaxed text-lg">
                    "{experience.overall_experience || "No summary provided."}"
                  </p>
                </section>

                <Separator className="bg-border/40" />

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><Info className="w-4 h-4" /></div>
                    <h3 className="text-xl font-black italic">Preparation Core</h3>
                  </div>
                  <div className="p-8 rounded-[32px] bg-muted/20 border border-border/40 min-h-[100px]">
                    <p className="text-foreground/90 font-medium leading-relaxed whitespace-pre-wrap">
                      {experience.preparation_tips || "No preparation intelligence provided."}
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                    <h3 className="text-xl font-black italic">Work Ecosystem</h3>
                  </div>
                  <p className="text-muted-foreground font-medium italic italic leading-relaxed">
                    {experience.work_culture || "Work culture details not intercepted."}
                  </p>
                </section>
              </CardContent>

              <CardFooter className="p-8 md:p-10 bg-muted/20 border-t border-border/20 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex items-center gap-2 p-1.5 bg-background/50 rounded-2xl border border-border/40 shadow-sm">
                  <Button
                    variant="ghost"
                    className={`h-11 rounded-xl px-5 gap-2 font-black uppercase tracking-widest text-[10px] ${experience.userVote === 'upvote' ? 'bg-primary text-primary-foreground italic' : 'hover:bg-primary/5 hover:text-primary'}`}
                    onClick={() => handleVote('upvote')}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${experience.userVote === 'upvote' ? 'fill-current' : ''}`} /> {experience.upvotes}
                  </Button>
                  <Button
                    variant="ghost"
                    className={`h-11 rounded-xl px-5 gap-2 font-black uppercase tracking-widest text-[10px] ${experience.userVote === 'downvote' ? 'bg-destructive text-destructive-foreground italic' : 'hover:bg-destructive/5 hover:text-destructive'}`}
                    onClick={() => handleVote('downvote')}
                  >
                    <ThumbsDown className={`w-3.5 h-3.5 ${experience.userVote === 'downvote' ? 'fill-current' : ''}`} /> {experience.downvotes}
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-2" />
                  <div className="flex items-center gap-2 px-4 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                    <MessageCircle className="w-3.5 h-3.5" /> {experience.comments_count}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className={`h-12 w-12 p-0 rounded-2xl ${isBookmarked ? 'bg-primary/10 border-primary text-primary' : 'border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary'}`}
                    onClick={handleBookmark}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 w-12 p-0 rounded-2xl border-border/60 hover:bg-muted/40"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link intercepted to clipboard.");
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Comments Protocol */}
            <div className="space-y-6">
              <h3 className="text-xl font-black italic px-4 flex items-center justify-between">
                <span>Community Response Protocol</span>
                <span className="text-sm font-medium not-italic text-muted-foreground opacity-50">{comments.length} Registered</span>
              </h3>

              <Card className="rounded-[32px] border-border/40 bg-card/40 backdrop-blur-xl p-8 space-y-6">
                <div className="relative group">
                  <Textarea
                    placeholder="Contribute your insights or queries..."
                    className="min-h-[100px] rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 p-5 text-sm font-medium italic"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <Button
                    className="absolute right-4 bottom-4 h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                    onClick={handleCommentSubmit}
                    disabled={commentSubmitting || !newComment.trim()}
                  >
                    {commentSubmitting ? <div className="h-3 w-3 border-2 border-t-transparent border-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5 mr-2" />}
                    Inject Response
                  </Button>
                </div>

                <div className="space-y-4">
                  {comments.map((comment, i) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-2xl bg-muted/20 border border-border/10 flex items-start gap-4"
                    >
                      <Avatar className="h-10 w-10 rounded-xl border-2 border-background flex-shrink-0">
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black italic">
                          {comment.users?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-black uppercase tracking-widest">{comment.users?.name || "Anonymous"}</p>
                          <span className="text-[9px] font-medium text-muted-foreground opacity-50">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-sm text-foreground/80 font-medium leading-relaxed italic">
                          "{comment.comment_text}"
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {comments.length === 0 && (
                    <div className="py-12 text-center opacity-30 border border-dashed border-border/40 rounded-3xl">
                      <MessageCircle className="w-8 h-8 mx-auto mb-3" />
                      <p className="font-black uppercase tracking-[0.2em] text-[10px]">No responses interfaced yet</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar - Quick Nav & Meta */}
          <div className="lg:col-span-4 space-y-8 h-full sticky top-24">
            <Card className="rounded-[40px] border-border/60 bg-card/40 backdrop-blur-xl p-8 space-y-8 shadow-xl border-none ring-1 ring-border/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Peer Reputation</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Community Energy</span>
                    <span className="font-black italic text-primary">{experience.upvotes * 10}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Knowledge Reach</span>
                    <span className="font-black italic">Moderate</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/20" />

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Action Core</h4>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="w-full h-12 rounded-2xl bg-background/50 border-border/50 justify-between group font-bold italic" onClick={() => navigate('/experiences')}>
                    Return to Directory <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" className="w-full h-12 rounded-2xl bg-background/50 border-border/50 justify-between group font-bold italic" onClick={() => navigate('/share-experience')}>
                    Post Your Journey <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-[28px] bg-primary/5 border border-primary/20 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Registry Integrity</p>
                <p className="text-[10px] text-muted-foreground font-medium italic">Verified by the community. Any discrepancies can be reported via the Q&A forum.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;