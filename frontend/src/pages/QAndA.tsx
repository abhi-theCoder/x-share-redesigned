import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ThumbsUp, MessageCircle, TrendingUp, Award, MoreHorizontal, Share2, Bookmark } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import axios from '../api';

interface Comment {
  id: number;
  comment: string;
  users?: { name: string };
}

interface Question {
  id: number;
  question: string;
  tags?: string[];
  votes?: number;
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const trendingTopics = ['#GoogleInterview', '#SystemDesign', '#DSA', '#ProductManagement', '#StartupJobs'];

  const [topContributors, setTopContributors] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/leaderboard', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (data && data.topUsers) {
          setTopContributors(data.topUsers.slice(0, 3).map((u: any) => ({
            name: u.name,
            posts: u.contributions || 0,
            initials: u.name ? u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U',
            color: 'bg-blue-600'
          })));
        }
      } catch (err) {
        console.error("Failed to fetch top contributors", err);
      }
    };
    fetchTopContributors();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await axios.get('/api/qna');
        setQuestions(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuestions();
  }, []);

  const handlePostQuestion = async () => {
    if (!question.trim()) return;
    try {
      const { data } = await axios.post('/api/qna/question', {
        question,
        tags: selectedTags,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQuestions(prev => [data, ...prev]);
      setQuestion('');
      setSelectedTags([]);
    } catch (err) {
      console.error(err);
    }
  };

  const parseTags = (tags: any): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [tags];
      } catch (e) {
        // If it looks like a postgres array string "{tag1,tag2}"
        if (tags.startsWith('{') && tags.endsWith('}')) {
          return tags.substring(1, tags.length - 1).split(',').map(t => t.trim());
        }
        return [tags];
      }
    }
    return [];
  };

  const filteredQuestions = questions.filter(q => {
    const questionTags = parseTags(q.tags);
    return q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      questionTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className={`min-h-screen pb-20 pt-28 ${theme === 'dark' ? 'bg-[#030014]' : 'bg-[#f8fafc]'}`}>
      <div className="container max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- Main Content (Post & Feed) --- */}
          <div className="flex-1 space-y-8">
            {/* Post Question Card */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-blue-600 text-white font-bold">
                      RS
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Share your interview experience, career update, or tips..."
                      className="min-h-[120px] w-full bg-slate-50 dark:bg-[#030014]/50 border border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500/50 p-4 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-500 resize-none text-base transition-all"
                    />
                    <Separator className="my-4 bg-transparent" />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {/* Tags or additional actions could go here as per image */}
                      </div>
                      <Button
                        onClick={handlePostQuestion}
                        className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 rounded-lg font-bold flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Feed */}
            <div className="space-y-6">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden group">
                      <CardHeader className="p-6 pb-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-[#2563eb] text-white font-bold">
                                {q.users?.name ? q.users.name[0].toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{q.users?.name || 'Unknown User'}</p>
                              <div className="flex flex-col text-[10px] text-slate-500 font-medium">
                                <span>{q.users && (q.users as any).company ? `Engineer at ${(q.users as any).company}` : 'Community Member'}</span>
                                <span>{new Date(q.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 px-3 py-1 border-none rounded-full text-[10px] font-bold">
                              Offer Letter
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 pt-2">
                        <div className="text-slate-900 dark:text-white font-medium leading-relaxed space-y-4">
                          <p className="whitespace-pre-wrap">{q.question}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-8 mb-4">
                          {parseTags(q.tags).map(tag => (
                            <span key={tag} className="text-sm font-bold text-[#3b82f6] hover:underline cursor-pointer">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* --- Stats Row --- */}
                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="text-red-500">❤️</span>
                            <span>{q.votes || 0} likes</span>
                          </div>
                          <div>
                            <span>{(q.question_comments || []).length} comments</span>
                          </div>
                        </div>
                      </CardContent>

                      {/* --- Action Bar --- */}
                      <CardFooter className="p-2 px-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
                        <Button variant="ghost" className="flex-1 rounded-none md:rounded-lg gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 group h-12">
                          <ThumbsUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                          <span className="font-bold">Like</span>
                        </Button>
                        <Button variant="ghost" className="flex-1 rounded-none md:rounded-lg gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 group h-12">
                          <MessageCircle className="w-5 h-5 group-hover:scale-105 transition-transform" />
                          <span className="font-bold">Comment</span>
                        </Button>
                        <Button variant="ghost" className="flex-1 rounded-none md:rounded-lg gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 group h-12">
                          <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          <span className="font-bold">Share</span>
                        </Button>
                        <Button variant="ghost" className="flex-1 rounded-none md:rounded-lg gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 group h-12">
                          <Bookmark className="w-5 h-5 group-hover:scale-105 transition-transform" />
                          <span className="font-bold">Save</span>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-lg font-bold text-slate-400">No matching posts found</p>
                  <Button variant="link" onClick={() => setSearchTerm('')} className="text-blue-600 font-bold">Clear search</Button>
                </div>
              )}
            </div>
          </div>

          {/* --- Right Sidebar --- */}
          <div className="w-full lg:w-[320px] space-y-6">
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingTopics.map(topic => (
                  <div key={topic} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-[#3b82f6] cursor-pointer transition-colors block">
                    {topic}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Award className="w-5 h-5 text-amber-500" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topContributors.map((user) => (
                  <div key={user.name} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`${user.color} text-white text-xs font-bold`}>
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{user.posts} posts</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAndA;
