import React from "react";
import { LayoutDashboard, FileText, UploadCloud } from "lucide-react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    {name: "Experiences", icon: FileText },
    { name: "Manage Jobs", icon: FileText },
    { name: "Job Upload", icon: UploadCloud },
    { name: "Manage Resources", icon: FileText },
    { name: "Resources Upload", icon: FileText },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col shadow-lg">
      <h1 className="text-2xl font-bold p-6 border-b border-slate-700">
        Admin Panel
      </h1>

      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveView(item.name)}
              className={`flex items-center gap-3 px-6 py-3 w-full text-left transition-colors ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;