import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ThumbsUp, ThumbsDown, MessageCircle, Send, 
  Share2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { toast } from 'sonner';
import axios from '../api';

interface Comment {
  id: number;
  comment: string;
  created_at: string;
  users?: { name: string };
}

interface Question {
  id: number;
  question: string;
  tags?: string[];
  upvotes?: number;
  downvotes?: number;
  user_voted?: 'upvote' | 'downvote' | null;
  is_answered?: boolean;
  created_at: string;
  users?: { name: string };
  question_comments?: Comment[];
}

const QAndA = () => {
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [question, setQuestion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await axios.get('/api/qna');
        setQuestions(data);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      }
    };
    fetchQuestions();
  }, []);

  const handlePostQuestion = async () => {
    if (!question.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Auth Required", { description: "Please login to post questions." });
        return;
    }
    try {
      const { data } = await axios.post('/api/qna/question', {
        question,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(prev => [data, ...prev]);
      setQuestion('');
      toast.success("Question posted!");
    } catch (err) {
      console.error("Failed to post question:", err);
      toast.error("Error", { description: "Failed to post question." });
    }
  };

  const handleVote = async (id: number, voteType: 'upvote' | 'downvote') => {
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Auth Required", { description: "Please login to vote." });
        return;
    }
    try {
      const { data } = await axios.post(`/api/qna/${id}/vote`, { voteType }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(prev => prev.map(q => 
        q.id == id ? { 
          ...q, 
          upvotes: data.upvotes, 
          downvotes: data.downvotes, 
          user_voted: data.user_voted 
        } : q
      ));
    } catch (err) {
      console.error("Vote failed:", err);
      toast.error("Error", { description: "Vote synchronization failed." });
    }
  };

  const handleCommentSubmit = async (questionId: number, commentText: string): Promise<boolean> => {
    if (!commentText.trim()) return false;
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Auth Required", { description: "Please login to comment." });
        return false;
    }
    try {
      const { data } = await axios.post('/api/qna/comment', {
        question_id: questionId,
        comment: commentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, question_comments: [...(q.question_comments || []), data] } : q
      ));
      toast.success("Comment added!");
      return true;
    } catch (err) {
      console.error("Comment failed:", err);
      toast.error("Error", { description: "Failed to post comment." });
      return false;
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen pb-24 pt-24 ${theme === 'dark' ? 'bg-[#030014] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      


      <main className="max-w-2xl mx-auto p-4 space-y-6">
        
        <AnimatePresence mode="wait">
            <motion.div 
                key="qa-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
            >
                {/* Post Question Card */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 group transition-all hover:border-blue-500/50">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 shrink-0 flex items-center justify-center font-bold text-lg">
                            {localStorage.getItem('userName')?.charAt(0) || 'U'}
                        </div>
                        <textarea 
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="grow text-slate-700 dark:text-slate-300 bg-transparent outline-none resize-none pt-2 placeholder-slate-400 dark:placeholder-slate-600 text-sm font-medium" 
                            placeholder="Ask a question about your interview journey..." 
                            rows={2}
                        />
                    </div>
                    <footer className="flex justify-end mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <Button 
                            onClick={handlePostQuestion}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Post
                        </Button>
                    </footer>
                </section>

                {/* Search Bar */}
                <section className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search discussions, tips, resources..." 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
                    />
                </section>

                {/* QA Feed */}
                <div className="space-y-4">
                    {filteredQuestions.length > 0 ? (
                        filteredQuestions.map((q) => (
                            <article key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all group">
                                <header className="px-5 py-4 border-b border-slate-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-[14px] bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/10">
                                            {q.users?.name ? q.users.name[0].toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] group-hover:text-blue-600 transition-colors leading-tight">
                                                {q.users?.name || 'Anonymous User'}
                                            </h3>
                                            <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                                                {new Date(q.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </header>
                                <div className="p-5">
                                    <div className="flex gap-4 items-start mb-6">
                                        <span className="text-blue-600 dark:text-blue-500 font-black text-sm pt-1">Q</span>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                            {q.question}
                                        </p>
                                    </div>
                                    <footer className="pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                        <QuestionActionBar 
                                            question={q} 
                                            onVote={(type) => handleVote(q.id, type)}
                                            onCommentSubmit={(text) => handleCommentSubmit(q.id, text)}
                                        />
                                    </footer>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="text-center py-16 opacity-50">
                            <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p className="font-bold text-slate-400">No matching questions found</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
};

const QuestionActionBar = ({ question, onVote, onCommentSubmit }: { question: Question, onVote: (type: 'upvote' | 'downvote') => void, onCommentSubmit: (text: string) => Promise<boolean> }) => {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const success = await onCommentSubmit(commentText);
        if (success) setCommentText('');
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-slate-50/80 dark:bg-slate-950/50 backdrop-blur-sm rounded-[14px] border border-slate-200/50 dark:border-slate-800/50">
                    <button 
                        onClick={() => onVote('upvote')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all ${question.user_voted === 'upvote' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600'}`}
                    >
                        <ThumbsUp className={`w-3.5 h-3.5 ${question.user_voted === 'upvote' ? 'fill-current' : ''}`} />
                        <span className="text-xs font-bold">{question.upvotes || 0}</span>
                    </button>
                    <button 
                        onClick={() => onVote('downvote')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all ${question.user_voted === 'downvote' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-rose-500'}`}
                    >
                        <ThumbsDown className={`w-3.5 h-3.5 ${question.user_voted === 'downvote' ? 'fill-current' : ''}`} />
                        <span className="text-xs font-bold">{question.downvotes || 0}</span>
                    </button>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
                    <button 
                        onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all ${isCommentsOpen ? 'bg-slate-200 dark:bg-slate-800 text-blue-600' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600'}`}
                    >
                        <MessageCircle className={`w-3.5 h-3.5 ${isCommentsOpen ? 'fill-current' : ''}`} />
                        <span className="text-xs font-bold">{(question.question_comments || []).length}</span>
                    </button>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/qna?id=${question.id}`);
                            toast.success("Link copied!");
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isCommentsOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 rounded-xl mt-2"
                    >
                        <div className="p-4 space-y-4">
                            {/* Comment List */}
                            <div className="space-y-3">
                                {(question.question_comments || []).map((c, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                            {c.users?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">{c.users?.name || 'User'}</span>
                                                <span className="text-[9px] text-slate-400 font-medium">{new Date(c.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-snug">{c.comment}</p>
                                        </div>
                                    </div>
                                ))}
                                {(question.question_comments || []).length === 0 && (
                                    <p className="text-[11px] text-slate-400 font-medium text-center py-2">No comments yet. Start the discussion!</p>
                                )}
                            </div>

                            {/* Comment Input */}
                            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                                <input 
                                    type="text" 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..." 
                                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500 transition-all font-medium"
                                />
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !commentText.trim()}
                                    className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QAndA;
