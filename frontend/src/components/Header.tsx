import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Users, MessageCircle, BookOpen,
  Trophy, User, LogOut, Award, Briefcase, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyToken } from './verifyLogin';
import axios from '../api';
import { useTheme } from '../context/ThemeContext';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [isPointsDropdownOpen, setIsPointsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');

    const checkLogin = async () => {
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      const valid = await verifyToken(token);
      console.log(valid)
      setIsLoggedIn(valid);
    };

    checkLogin();

    const fetchUserPoints = async () => {
      if (!token) {
        setUserPoints(null);
        return;
      }

      try {
        const response = await axios.get('/api/profile', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        setUserPoints(response.data.points);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setUserPoints(null);
      }
    };

    fetchUserPoints();
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPointsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = (): void => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserPoints(null);
    navigate('/login');
  };

  const navigation: NavigationItem[] = [
    { name: 'Experiences', href: '/experiences', icon: Users },
    { name: 'Q&A', href: '/qa', icon: MessageCircle },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 backdrop-blur-sm shadow-lg border-b transition-colors duration-300 ${theme === 'dark'
        ? 'bg-blue-950/80 border-blue-800'
        : 'bg-white/95 border-blue-100'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-xl bg-gradient-to-tr from-brand-cyan via-brand-blue to-brand-purple opacity-20 blur-sm group-hover:opacity-40 transition-opacity"
              />
              <div className="relative w-10 h-10 bg-space-900 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden group-hover:border-brand-cyan/50 transition-colors shadow-2xl">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-2" style={{ stroke: 'url(#logo-grad)' }}>
                  <defs>
                    <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00F0FF" />
                      <stop offset="100%" stopColor="#9D4EDD" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Glint effect */}
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                />
              </div>
            </div>
            <span className={`text-2xl font-black italic tracking-tighter whitespace-nowrap bg-clip-text text-transparent ${theme === 'dark'
              ? 'bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}>
              X SHARE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 relative ${isActive(item.href)
                    ? (theme === 'dark' ? 'text-brand-cyan bg-white/10' : 'text-blue-600 bg-blue-50')
                    : (theme === 'dark' ? 'text-gray-300 hover:text-brand-cyan hover:bg-white/5' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50')
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 rounded-lg -z-10 ${theme === 'dark' ? 'bg-brand-blue/20' : 'bg-blue-100'
                        }`}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 font-medium transition-colors duration-200 whitespace-nowrap ${theme === 'dark'
                    ? 'text-gray-300 hover:text-brand-cyan'
                    : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-6 py-2 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 whitespace-nowrap ${theme === 'dark'
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan hover:to-brand-purple'
                    : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500'
                    }`}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {userPoints !== null && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsPointsDropdownOpen(!isPointsDropdownOpen)}
                      className={`flex items-center space-x-2 px-4 py-2 font-medium transition-colors duration-200 rounded-lg ${theme === 'dark'
                        ? 'text-gray-300 hover:text-brand-cyan hover:bg-white/10'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                    >
                      <Award className="w-5 h-5" />
                      <span>{userPoints}</span>
                    </button>
                    <AnimatePresence>
                      {isPointsDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-2 z-50 border ${theme === 'dark'
                            ? 'bg-space-900 border-space-800'
                            : 'bg-white border-gray-100'
                            }`}
                        >
                          <Link
                            to="/rewards"
                            onClick={() => setIsPointsDropdownOpen(false)}
                            className={`flex items-center space-x-2 w-full text-left px-4 py-2 transition-colors duration-200 ${theme === 'dark'
                              ? 'text-gray-200 hover:bg-white/10'
                              : 'text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            <Trophy className="w-4 h-4" />
                            <span>Rewards</span>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium
                    hover:from-red-600 hover:to-red-700
                    transform hover:scale-105 hover:-translate-y-1
                    transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Theme Toggle (Desktop) */}
          <button
            onClick={toggleTheme}
            className={`hidden md:ml-4 md:flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${theme === 'dark'
              ? 'text-gray-400 hover:bg-white/10'
              : 'text-gray-500 hover:bg-gray-100'
              }`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden border-t ${theme === 'dark' ? 'border-space-800 bg-space-950' : 'border-blue-100 bg-white'
                }`}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 ${isActive(item.href)
                        ? (theme === 'dark' ? 'text-brand-cyan bg-white/10' : 'text-blue-600 bg-blue-50')
                        : (theme === 'dark' ? 'text-gray-300 hover:text-brand-cyan hover:bg-white/5' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50')
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Auth Buttons (Mobile) */}
                <div className="pt-4 space-y-2">
                  {!isLoggedIn ? (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className={`block w-full text-center px-4 py-2 font-medium transition-colors duration-200 ${theme === 'dark'
                          ? 'text-gray-300 hover:text-brand-cyan'
                          : 'text-gray-600 hover:text-blue-600'
                          }`}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className={`block w-full text-center px-4 py-2 text-white rounded-lg font-medium transition-all duration-300 ${theme === 'dark'
                          ? 'bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan hover:to-brand-purple'
                          : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500'
                          }`}
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <>
                      {userPoints !== null && (
                        <div className="relative">
                          <button
                            onClick={() => setIsPointsDropdownOpen(!isPointsDropdownOpen)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 rounded-lg hover:bg-blue-50"
                          >
                            <Award className="w-5 h-5" />
                            <span>{userPoints} Points</span>
                          </button>
                          <AnimatePresence>
                            {isPointsDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-2 w-full bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100"
                              >
                                <Link
                                  to="/rewards"
                                  onClick={() => {
                                    setIsPointsDropdownOpen(false);
                                    setIsMenuOpen(false);
                                  }}
                                  className="flex items-center space-x-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                >
                                  <Trophy className="w-4 h-4" />
                                  <span>Rewards</span>
                                </Link>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Theme Toggle (Mobile) */}
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 mt-2 font-medium rounded-lg ${theme === 'dark'
                    ? 'text-gray-400 hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header;
