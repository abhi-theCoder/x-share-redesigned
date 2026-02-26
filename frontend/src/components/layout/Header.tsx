
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Briefcase, Users, BookOpen, Trophy, MessageSquare, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";

const navigation = [
  { name: "Experience", href: "/experience", icon: Users },
  { name: "Q&A", href: "/feed", icon: MessageSquare },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Resources", href: "/resources", icon: BookOpen },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
      // Optional: Clear invalid data
      localStorage.removeItem("user");
    }
  }, [location.pathname]); // Re-check on navigation

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? "border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm"
        : "border-b border-transparent bg-background/50 backdrop-blur-sm"
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
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                  Enterprise
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-accent/50 ${isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-full bg-primary/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="h-6 w-px bg-border/60" /> {/* Divider */}
            <ModeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-transform hover:scale-105">
                    {user.name?.charAt(0) || "U"}
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    localStorage.removeItem("user");
                    setUser(null);
                    window.location.href = "/";
                  }}
                  className="font-medium text-muted-foreground hover:text-foreground"
                >
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
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
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
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background border-l border-border shadow-2xl md:hidden flex flex-col"
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
                  <div className="grid gap-3">
                    {user ? (
                      <>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-center h-12 text-base font-medium">
                            My Profile
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            localStorage.removeItem("user");
                            setUser(null);
                            window.location.href = "/";
                          }}
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
}