import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, MessageSquare, Building2, Code2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Experience", path: "/experiences", icon: Briefcase },
    { name: "QA", path: "/qa", icon: MessageSquare },
    { name: "Job", path: "/jobs", icon: Building2 },
    { name: "Hacks", path: "/hacks", icon: Code2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 lg:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center px-3 transition-colors",
              isActive ? "text-blue-600 dark:text-blue-500" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">{item.name}</span>
            {isActive && (
              <div className="absolute bottom-0 w-4 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
