import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Users,
  Share2,
  BookOpen,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Award,
  Target,
  Zap,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Briefcase,
  Star,
  ShieldCheck,
  Package,
} from 'lucide-react';



// --- Styling Constants ---
const TEXT_GRADIENT = 'bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple';
const BTN_PRIMARY = 'px-8 py-3 bg-brand-blue/90 hover:bg-brand-blue text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-all duration-300 flex items-center justify-center whitespace-nowrap';
const SECTION_SPACING = 'py-24 px-4 sm:px-6 lg:px-8';

// --- Content Data ---

const howItWorksSteps = [
  {
    icon: Users,
    title: 'Connect',
    description: 'Join the community of peers, mentors, and alumni.',
  },
  {
    icon: Share2,
    title: 'Share',
    description: 'Post your interview experience with structured prompts.',
  },
  {
    icon: BookOpen,
    title: 'Learn',
    description: 'Explore real stories, questions, and preparation paths.',
  },
  {
    icon: ClipboardList,
    title: 'Apply',
    description: 'Use insights to tailor resumes and interview plans.',
  },
  {
    icon: TrendingUp,
    title: 'Grow',
    description: 'Earn rewards and build your professional profile.',
  },
];

const problems = [
  'Lack of clear guidance on interview expectations',
  'Limited access to alumni and successful candidates',
  'Scattered resources, making targeted prep difficult',
  'No reliable feedback loop to improve faster',
  'Uncertainty about what actually works during interviews',
];

const solutions = [
  { icon: ShieldCheck, text: 'Verified interview stories that show what to expect' },
  { icon: ClipboardList, text: 'Actionable checklists and step-by-step guidance' },
  { icon: Target, text: 'Targeted preparation by company, role, and skill area' },
  { icon: Award, text: 'Rewards for sharing authentic experiences' },
  { icon: Users, text: 'Active peer community and alumni connections' },
];

const studentBenefits = [
  { icon: Briefcase, title: 'Learn from real experiences', description: 'Honest interview breakdowns from peers and alumni.' },
  { icon: Target, title: 'Targeted preparation', description: 'Filter by company, role, round, and topics to focus your study.' },
  { icon: Zap, title: 'Skill development', description: 'Track progress and reflect using community checklists.' },
];

const professionalBenefits = [
  { icon: Users, title: 'Give back with impact', description: 'Share experiences, mentor at scale, and earn recognition.' },
  { icon: Award, title: 'Build credibility', description: 'Badges and verified posts highlight your contributions.' },
  { icon: MessageSquare, title: 'Community feedback', description: 'Helpful votes and comments surface the most useful advice.' },
];

const transition = { type: 'spring', stiffness: 100, damping: 20 } as const;



/**
 * Renders a single problem point.
 */


/**
 * The main application component.
 */
const Home: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden selection:bg-brand-cyan/30 transition-colors duration-300 ${theme === 'dark'
      ? 'bg-transparent text-white'
      : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
      }`}>

      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decorative Elements */}
        {theme === 'dark' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-brand-purple/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-cyan/20 rounded-full blur-[100px]" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transition}
            className="z-10"
          >
            <div className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium mb-6 backdrop-blur-md ${theme === 'dark'
              ? 'bg-white/5 border-white/10 text-brand-cyan'
              : 'bg-blue-100 border-blue-200 text-blue-700'
              }`}>
              <span className="flex h-2 w-2 relative mr-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme === 'dark' ? 'bg-brand-cyan' : 'bg-blue-600'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${theme === 'dark' ? 'bg-brand-cyan' : 'bg-blue-600'}`}></span>
              </span>
              The Future of Interview Prep
            </div>

            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Unlock your <br />
              <span className={theme === 'dark' ? TEXT_GRADIENT : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600'}>Career Potential</span>
            </h1>

            <p className={`text-lg md:text-xl mb-10 max-w-lg leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Join the elite community sharing verified interview intelligence.
              Master your preparation with real-world insights, powered by collective experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className={BTN_PRIMARY}>
                Start Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/rewards" className={`px-8 py-3 rounded-xl font-bold text-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center ${theme === 'dark'
                ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm'
                }`}>
                <span className="mr-2">Explore Rewards</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats strip */}
            <div className={`mt-12 flex items-center gap-8 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="flex items-center gap-2">
                <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-brand-blue' : 'text-blue-600'}`} />
                <span>2,000+ Pilots</span>
              </div>
              <div className={`h-4 w-px ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-300'}`} />
              <div className="flex items-center gap-2">
                <BookOpen className={`w-5 h-5 ${theme === 'dark' ? 'text-brand-purple' : 'text-purple-600'}`} />
                <span>5k+ Stories</span>
              </div>
            </div>
          </motion.div>

          {/* Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...transition, delay: 0.2 }}
            className="relative w-full h-[500px] flex items-center justify-center"
          >
            {/* Holographic Platform Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 to-brand-purple/20 rounded-full blur-[60px] animate-pulse-glow" />

            <motion.div
              className="relative z-10 w-full h-full animate-float"
            >
              <div className="relative z-10 w-full h-full animate-float flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Outer Orbiting Ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute w-96 h-96 border-2 border-dashed border-brand-cyan/20 rounded-full"
                  />

                  {/* Middle Orbiting Ring */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute w-80 h-80 border-2 border-brand-purple/30 rounded-full"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-purple rounded-full shadow-[0_0_15px_rgba(157,78,221,0.8)]" />
                  </motion.div>

                  {/* Inner Spinning Geometry */}
                  <motion.div
                    animate={{
                      rotateY: [0, 360],
                      rotateX: [0, 180, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="relative w-64 h-64 flex items-center justify-center"
                    style={{ perspective: "1000px" }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                      <defs>
                        <linearGradient id="core-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                      {/* Central Hexagon Core */}
                      <motion.path
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                        fill="none"
                        stroke="url(#core-grad)"
                        strokeWidth="1.5"
                      />
                      {/* Connection Lines */}
                      <path d="M50 5 L50 95 M10 27.5 L90 72.5 M90 27.5 L10 72.5" stroke="url(#core-grad)" strokeWidth="0.5" opacity="0.3" />
                    </svg>
                  </motion.div>

                  {/* Pulsing Core Glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute w-48 h-48 bg-brand-cyan rounded-full blur-[80px]"
                  />

                  {/* Data Particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        x: [0, Math.cos(i * 60 * Math.PI / 180) * 150],
                        y: [0, Math.sin(i * 60 * Math.PI / 180) * 150],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                      className="absolute w-2 h-2 bg-brand-cyan rounded-full shadow-[0_0_10px_#00F0FF]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. How X-share Works Section */}
      <section id="how-it-works" className={`relative ${SECTION_SPACING}`}>
        {/* Background Gradient Mesh */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={transition}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Protocol: <span className={theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}>Synchronize</span>
            </h2>
            <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              A systematic approach to decoding the interview process. Join the network to access and contribute intelligence.
            </p>
          </motion.div>

          {/* Steps Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {howItWorksSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...transition, delay: index * 0.1 }}
                  className={`group relative p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 ${theme === 'dark'
                    ? 'glass hover:bg-white/10'
                    : 'bg-white shadow-lg hover:shadow-xl border border-gray-100'
                    }`}
                >
                  {theme === 'dark' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  )}

                  <div className={`relative p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 ${theme === 'dark' ? 'bg-brand-blue/10 text-brand-cyan' : 'bg-blue-50 text-blue-600'
                    }`}>
                    <IconComponent className="w-8 h-8" />
                  </div>

                  <h3 className={`relative text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                  <p className={`relative text-xs sm:text-sm leading-relaxed transition-colors ${theme === 'dark' ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-sm text-gray-500 mt-12 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 mr-2 text-brand-blue" />
            <span className="opacity-70">Community intelligence is cryptographically verified (simulated).</span>
          </p>
        </div>
      </section>

      {/* 3. Why Choose  */}
      <section className={`${SECTION_SPACING} ${theme === 'dark' ? 'bg-space-900/50' : 'bg-white/60'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Upgrade Your <span className={theme === 'dark' ? 'text-brand-purple' : 'text-purple-600'}>Strategy</span>
            </h2>
            <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Legacy preparation methods are obsolete. Deploy the X-Share framework for optimal results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Problems */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={transition}
              className={`p-8 rounded-2xl border-l-4 border-red-500/50 ${theme === 'dark' ? 'glass' : 'bg-white shadow-lg border border-gray-100'}`}
            >
              <h3 className={`text-2xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <AlertTriangle className="w-6 h-6 mr-3 text-red-500" />
                System Failures
              </h3>
              <ul className="space-y-4">
                {problems.map((p, i) => (
                  <li key={i} className={`flex items-start ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="w-1.5 h-1.5 mt-2 mr-3 bg-red-500 rounded-full flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solutions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={transition}
              className={`p-8 rounded-2xl border-l-4 border-brand-cyan relative overflow-hidden ${theme === 'dark' ? 'glass' : 'bg-white shadow-lg border border-gray-100'
                }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none ${theme === 'dark' ? 'bg-brand-cyan/10' : 'bg-blue-100'
                }`} />

              <h3 className={`text-2xl font-bold mb-6 flex items-center relative z-10 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Package className="w-6 h-6 mr-3 text-brand-cyan" />
                The Solution
              </h3>
              <ul className="space-y-4 relative z-10">
                {solutions.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={i} className={`flex items-start group ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className={`mr-3 mt-1 p-1 rounded transition-colors duration-300 ${theme === 'dark'
                        ? 'bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-black'
                        : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                        }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`font-medium transition-colors ${theme === 'dark' ? 'group-hover:text-white' : 'group-hover:text-gray-900'}`}>{s.text}</span>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Rewards Section */}
      <section id="rewards" className={`relative ${SECTION_SPACING}`}>
        {theme === 'dark' && <div className="absolute inset-0 bg-space-950/50" />}
        <div className="relative max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={transition}
              className={`text-3xl md:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              Gamified <span className="text-yellow-400">Progression</span>
            </motion.h2>
            <Link to="/share-and-earn" className="hidden sm:inline-flex px-6 py-2 bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 rounded-lg font-semibold hover:bg-yellow-500/20 transition duration-200">
              Share and earn
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {[
              { title: 'Earn Credits', content: ['Post Intelligence: +50 pts', 'Verified Insight: +10 pts', 'Peer Validation: +2 pts'] },
              { title: 'Multipliers', content: ['Verified Elite Status: x1.2', 'Complete Data Set: x1.1', 'Weekly Streak: +30 bonus'] },
              { title: 'Redemption', content: ['Tech Perks & Gear', 'Profile Badges (Bronze, Silver, Gold)', 'Mentor Leaderboard Access'] },
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...transition, delay: index * 0.1 }}
                className={`p-6 rounded-xl border relative overflow-hidden group ${theme === 'dark'
                  ? 'glass border-white/10'
                  : 'bg-white shadow-lg border-gray-100'
                  }`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-[30px] group-hover:bg-yellow-500/20 transition-colors" />
                <h3 className={`text-xl font-bold mb-4 relative z-10 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{card.title}</h3>
                <ul className="space-y-3 relative z-10">
                  {card.content.map((item, i) => (
                    <li key={i} className={`flex items-start ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Star className="w-4 h-4 mt-1 mr-2 text-yellow-500 flex-shrink-0" fill="currentColor" />
                      <span className={`text-sm transition-colors ${theme === 'dark' ? 'group-hover:text-gray-200' : 'group-hover:text-gray-900'}`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={transition}
              className={`p-6 rounded-xl border ${theme === 'dark' ? 'glass border-white/10' : 'bg-white shadow-lg border-gray-100'}`}
            >
              <h3 className={`text-xl font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Award className="w-6 h-6 mr-2 text-yellow-500" />
                Rankings
              </h3>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="text-yellow-600 font-bold">Bronze: 300 pts</span> · <span className="text-gray-400 font-bold">Silver: 800 pts</span> · <span className="text-yellow-400 font-bold">Gold: 1500 pts</span> · <span className="text-brand-purple font-bold">Crown Mentor: Invite-only</span>
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={transition}
              className={`p-6 rounded-xl border ${theme === 'dark' ? 'glass border-white/10' : 'bg-white shadow-lg border-gray-100'}`}
            >
              <h3 className={`text-xl font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <MessageSquare className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-brand-blue' : 'text-blue-600'}`} />
                Quality Standards
              </h3>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Contributions are rated on specificity, recency, and actionable value. High-quality data is prioritized.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Benefits for Everyone */}
      <section id="benefits" className={`${SECTION_SPACING} ${theme === 'dark' ? 'bg-mesh-gradient' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={transition}
            className={`text-3xl md:text-5xl font-bold text-center mb-16 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            Network <span className={theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}>Value</span>
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Students Column */}
            <div className="space-y-8">
              <h3 className="text-lg font-bold text-brand-cyan uppercase tracking-widest border-b border-brand-cyan/20 pb-2">Candidates</h3>
              {studentBenefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ ...transition, delay: index * 0.1 }}
                    className={`p-6 rounded-xl flex items-start transition duration-300 ${theme === 'dark'
                      ? 'glass hover:bg-white/10'
                      : 'bg-white shadow-lg border border-gray-100 hover:shadow-xl'
                      }`}
                  >
                    <div className={`p-3 rounded-lg mr-4 ${theme === 'dark' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-blue-50 text-blue-600'}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{benefit.title}</h4>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{benefit.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Professionals Column */}
            <div className="space-y-8">
              <h3 className="text-lg font-bold text-brand-purple uppercase tracking-widest border-b border-brand-purple/20 pb-2">Mentors</h3>
              {professionalBenefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ ...transition, delay: index * 0.1 }}
                    className={`p-6 rounded-xl flex items-start transition duration-300 ${theme === 'dark'
                      ? 'glass hover:bg-white/10'
                      : 'bg-white shadow-lg border border-gray-100 hover:shadow-xl'
                      }`}
                  >
                    <div className={`p-3 rounded-lg mr-4 ${theme === 'dark' ? 'bg-brand-purple/10 text-brand-purple' : 'bg-purple-50 text-purple-600'}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{benefit.title}</h4>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{benefit.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className={`${theme === 'dark' ? 'bg-space-950 border-t border-white/10 text-gray-400' : 'bg-white border-t border-gray-200 text-gray-600'} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} X-Share. All rights reserved.</p>
        </div>
      </footer>
    </div >
  );
};

export default Home;
