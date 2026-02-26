import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Users, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Jobs Posted", value: "10K+", icon: Briefcase },
  { label: "Active Users", value: "50K+", icon: Users },
  { label: "Placements", value: "5K+", icon: Award },
  { label: "Companies", value: "500+", icon: TrendingUp },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Your Career Journey Starts Here
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Unlock your{" "}
              <span className="text-blue-400">Career Potential</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Join the elite community sharing verified interview intelligence. Master your preparation with real-world insights, powered by collective experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link to="/jobs">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Explore Jobs
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Build Your Profile
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
                <div className="flex items-center gap-5 mb-8">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl tracking-tight">Software Engineer</h3>
                    <p className="text-muted-foreground/80 font-medium">Google • Bangalore</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5 mb-8">
                  <span className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/10">React</span>
                  <span className="px-4 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/10">Node.js</span>
                  <span className="px-4 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 text-xs font-bold border border-cyan-500/10">TypeScript</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-black tracking-tight text-foreground">₹25-35 <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest ml-1">LPA</span></span>
                  <Button variant="hero" size="lg" className="rounded-xl px-8">Read Story</Button>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-card rounded-xl shadow-lg p-4 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Profile Verified</p>
                    <p className="text-xs text-muted-foreground">Top 5% talent</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg p-4 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">234 Applied</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}