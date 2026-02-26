 import { motion } from "framer-motion";
 import { 
   Briefcase, 
   UserCircle, 
   BookOpen, 
   MessageSquare, 
   Trophy, 
   Shield,
   Zap,
   Target
 } from "lucide-react";
 
 const features = [
   {
     icon: Briefcase,
     title: "Smart Job Matching",
     description: "AI-powered job recommendations based on your skills, experience, and preferences.",
     color: "primary",
   },
   {
     icon: UserCircle,
     title: "Professional Profiles",
     description: "Build a comprehensive profile that showcases your skills, projects, and achievements.",
     color: "accent",
   },
   {
     icon: BookOpen,
     title: "Placement Resources",
     description: "Access interview prep, coding challenges, and company-specific guides.",
     color: "success",
   },
   {
     icon: MessageSquare,
     title: "Experience Sharing",
     description: "Learn from real interview experiences and placement stories from the community.",
     color: "warning",
   },
   {
     icon: Trophy,
     title: "Gamified Leaderboard",
     description: "Get recognized for your contributions and climb the ranks to stand out.",
     color: "primary",
   },
   {
     icon: Shield,
     title: "Verified Profiles",
     description: "Build trust with verified skills, certifications, and work history.",
     color: "accent",
   },
 ];
 
 const colorClasses = {
   primary: "bg-primary/10 text-primary",
   accent: "bg-accent/10 text-accent",
   success: "bg-success/10 text-success",
   warning: "bg-warning/10 text-warning",
 };
 
 export function FeaturesSection() {
   return (
     <section className="py-20 bg-background">
       <div className="container">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center mb-16"
         >
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
             <Zap className="h-4 w-4" />
             Why Xshare?
           </div>
           <h2 className="text-3xl md:text-4xl font-bold mb-4">
             Everything You Need to{" "}
             <span className="text-gradient">Land Your Dream Job</span>
           </h2>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             From building your profile to acing interviews, we've got you covered with tools designed for modern job seekers.
           </p>
         </motion.div>
 
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {features.map((feature, index) => (
             <motion.div
               key={feature.title}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, delay: index * 0.1 }}
               className="group p-6 rounded-2xl bg-card border border-border hover:shadow-hover transition-all duration-300"
             >
               <div className={`inline-flex p-3 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} mb-4`}>
                 <feature.icon className="h-6 w-6" />
               </div>
               <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                 {feature.title}
               </h3>
               <p className="text-muted-foreground">
                 {feature.description}
               </p>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 }