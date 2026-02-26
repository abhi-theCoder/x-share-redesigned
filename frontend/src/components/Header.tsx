import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Briefcase, Users, BookOpen, Trophy, MessageSquare, ChevronRight, Award, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { verifyToken } from './verifyLogin';
import axios from '../api';

const navigation = [
  { name: "Experiences", href: "/experiences", icon: Users },
  { name: "Q&A", href: "/qa", icon: MessageSquare },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Resources", href: "/resources", icon: BookOpen },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
];

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const checkLogin = async () => {
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      const valid = await verifyToken(token);
      setIsLoggedIn(valid);
    };

    checkLogin();

    const fetchUserProfile = async () => {
      if (!token) {
        setUserPoints(null);
        setUserName("");
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
        setUserName(response.data.name || "");
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setUserPoints(null);
      }
    };

    fetchUserProfile();
  }, [location.pathname]);

  const handleLogout = (): void => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserPoints(null);
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? "border-b border-white/10 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-lg"
        : "border-b border-transparent bg-transparent backdrop-blur-none"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg transition-transform group-hover:scale-105">
                <span className="text-xl font-bold text-white">X</span>
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground leading-none">
                  Xshare
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none mt-1">
                  Enterprise
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all rounded-full ${isActive
                    ? (item.name === "Jobs" || item.name === "Q&A")
                      ? "bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-5 shadow-sm"
                      : "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${isActive && (item.name === "Jobs" || item.name === "Q&A") ? "text-blue-600 dark:text-blue-400" : ""}`} />
                    {item.name}
                  </span>
                  {isActive && item.name !== "Jobs" && item.name !== "Q&A" && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-x-0 bottom-[-4px] h-[2px] bg-primary mx-4"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="h-6 w-px bg-border/60" /> {/* Divider */}
            {isLoggedIn && userPoints !== null && (
              <Link to="/rewards" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors">
                <Award className="h-4 w-4" />
                <span className="text-sm font-bold">{userPoints}</span>
              </Link>
            )}
            <ModeToggle />
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link to="/profile">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-transform hover:scale-105">
                    {userName?.charAt(0) || "U"}
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="font-medium text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" className="rounded-full px-6 shadow-primary/25 hover:shadow-primary/40">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background border-l border-border shadow-2xl lg:hidden flex flex-col"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    X
                  </div>
                  <span className="text-lg font-bold">Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-accent transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="flex-1 overflow-y-auto py-6 px-6">
                <div className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group flex items-center justify-between p-4 rounded-xl transition-all ${isActive
                          ? "bg-primary/5 border border-primary/10"
                          : "hover:bg-accent hover:pl-5"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "bg-accent/50 text-muted-foreground group-hover:text-foreground"}`}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <span className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                            {item.name}
                          </span>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-8 pt-8 border-t border-border/50">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                    <ModeToggle />
                  </div>
                  {isLoggedIn && userPoints !== null && (
                    <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="font-bold text-foreground">Tokens</span>
                      </div>
                      <span className="text-lg font-black text-primary">{userPoints}</span>
                    </div>
                  )}
                  <div className="grid gap-3">
                    {isLoggedIn ? (
                      <>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-center h-12 text-base font-medium">
                            My Profile
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full justify-center h-12 text-base font-medium text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Log Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-center h-12 text-base font-medium">
                            Sign In
                          </Button>
                        </Link>
                        <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="hero" className="w-full justify-center h-12 text-base font-medium shadow-lg">
                            Get Started Now
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
