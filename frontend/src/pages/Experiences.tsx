import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Edit3, X, Calendar, PenTool } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// --- Dummy Data exactly matching the screenshot ---
const DUMMY_EXPERIENCES = [
  {
    id: 1,
    name: "Anonymous",
    title: "sde",
    company: "Narula Institute of Technology",
    location: "Athpur",
    role: "sde at Narula Institute of Technology",
    description: "I applied for the sde position at Narula Institute of Technology. The process involved 1 rounds. Overall, I would rate the difficulty as Medium.",
    date: "February 10, 2026",
    type: "INTERNSHIP",
    upvotes: 1,
    downvotes: 1,
    comments: 0,
    initials: "AN",
    avatarBg: "bg-blue-100 dark:bg-blue-900",
    avatarColor: "text-blue-600 dark:text-blue-500",
    isBookmarked: false
  },
  {
    id: 2,
    name: "Abhishek Kumar Mahto",
    title: "System Engineer",
    company: "TCS",
    location: "Kolkata, India",
    role: "SE at TCS",
    description: "My journey to becoming a System Engineer at TCS was filled with learning and perseverance. The interview process focused heavily on core Java concepts, SQL,...",
    date: "October 24, 2025",
    type: "JOB",
    upvotes: 66,
    downvotes: 42,
    comments: 0,
    initials: "AM",
    avatarBg: "bg-blue-100 dark:bg-blue-900/40",
    avatarColor: "text-blue-500 dark:text-blue-400",
    isBookmarked: true
  },
  {
    id: 3,
    name: "Pubali Chowdhury",
    title: "Associate Product Manager",
    company: "Fusion Dynamics",
    location: "Austin, TX",
    role: "Associate Product Manager at Fusion Dynamics",
    description: "The interview process was a fantastic experience that truly reflected the role. The job itself is challenging but incredibly rewarding. I've learned so much about produ...",
    date: "September 7, 2025",
    type: "JOB",
    upvotes: 24,
    downvotes: 5,
    comments: 9,
    initials: "PC",
    avatarBg: "bg-blue-50 dark:bg-blue-900/60",
    avatarColor: "text-blue-500 dark:text-blue-300",
    isBookmarked: true
  },
  {
    id: 4,
    name: "Priya",
    title: "Machine Learning Intern",
    company: "Quantum AI",
    location: "Seattle, WA",
    role: "Machine Learning Intern at Quantum AI",
    description: "The interview was intense, spanning three days. I had to solve multiple complex algorithms in real-time while a panel of senior researchers observed...",
    date: "August 15, 2025",
    type: "INTERNSHIP",
    upvotes: 112,
    downvotes: 3,
    comments: 14,
    initials: "P",
    avatarBg: "bg-slate-100 dark:bg-[#111827]/80",
    avatarColor: "text-blue-600 dark:text-blue-400",
    isBookmarked: false
  }
];

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUMMY_EXPERIENCES.map((exp, idx) => (
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
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-11 w-11 rounded-full ${exp.avatarBg} flex items-center justify-center shrink-0`}>
                        <AvatarFallback className={`${exp.avatarColor} bg-transparent font-medium text-sm`}>
                          {exp.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-snug truncate">
                          {exp.name}
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
                      {exp.type === 'INTERNSHIP' || idx === 0 || idx === 1 ? exp.role : <span>Associate Product Manager at <span className="text-slate-900 dark:text-white">Fusion Dynamics</span></span>}
                    </h4>
                    {/* Hardcoding blue role text to match exact screenshot specifically for item 2 */}
                    {idx === 1 && (
                      <h4 className="text-[17px] font-bold text-blue-500 mb-2.5 leading-tight -mt-8 bg-white dark:bg-[#111827] relative z-10 w-full">
                        SE at TCS
                      </h4>
                    )}
                    <p className="text-[13px] text-slate-600 dark:text-[#94A3B8] leading-relaxed line-clamp-3">
                      {exp.description}
                    </p>
                  </CardContent>
                </Link>

                {/* Card Footer */}
                <CardFooter className="p-4 pt-0 pb-5 pl-5 pr-5 flex flex-col gap-6">

                  {/* Top line of footer: Date & Pill Badge */}
                  <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100 dark:border-[#1F2937]/60">
                    <div className="flex items-center text-[11px] text-slate-500 dark:text-[#64748B] font-medium gap-1.5 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.date}
                    </div>
                    <Badge className={`rounded-xl text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-none shadow-none h-5 flex items-center ${exp.type === 'INTERNSHIP' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-100 dark:bg-[#1F2937] hover:bg-slate-200 dark:hover:bg-[#374151] text-slate-600 dark:text-[#94A3B8]'}`}>
                      {exp.type}
                    </Badge>
                  </div>

                  {/* Bottom line of footer: Interactions & Tools */}
                  <div className="flex items-center justify-between w-full">

                    {/* Left side: Thumbs Up, Thumbs Down, Comments */}
                    <div className="flex items-center gap-4 text-slate-500 dark:text-[#64748B]">

                      <div className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>
                        <span className="text-[13px] font-medium">{exp.upvotes}</span>
                      </div>

                      <div className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" /></svg>
                        <span className="text-[13px] font-medium">{exp.downvotes}</span>
                      </div>

                      <div className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:scale-110 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span className="text-[13px] font-medium">{exp.comments}</span>
                      </div>

                    </div>

                    {/* Right side: Bookmark & Share */}
                    <div className="flex items-center gap-3">
                      <button className={`hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer ${exp.isBookmarked ? 'text-yellow-500' : 'text-slate-400 dark:text-[#64748B]'}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 ${exp.isBookmarked ? 'fill-current' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      </button>
                      <button className="text-slate-400 dark:text-[#64748B] hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      </button>
                    </div>

                  </div>

                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center transition-transform hover:scale-105 z-40 border border-blue-400/20"
        >
          <PenTool className="w-6 h-6" />
        </button>

      </div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </div>
  );
};

export default Experiences;
