import React, { useEffect, useState } from "react";
import {
  Search,
  Star,
  FileText,
  Sparkles,
  Code2,
  Layout,
  Database,
  Brain,
  Book,
  ChevronRight
} from "lucide-react";
import Loader from "../components/Loader";

// Shadcn UI Components
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axios from '../api';

interface Resource {
  id: number;
  title: string;
  description: string;
  type?: string;
  file_url: string;
  rating: number;
  downloads: number;
  uploaded_at: string;
}

const Resources: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/resources', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        console.log(res.data);
        if (res.data && res.data.resources) {
          setResources(res.data.resources);
        }
      } catch (err) {
        console.error("Failed to load resources", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  if (loading) return <Loader />;

  const categories = [
    { title: "DSA", count: "150 resources", icon: Code2, color: "bg-blue-50 text-blue-600" },
    { title: "System Design", count: "45 resources", icon: Layout, color: "bg-slate-50 text-slate-400" },
    { title: "Frontend", count: "80 resources", icon: Book, color: "bg-green-50 text-green-600" },
    { title: "Backend", count: "65 resources", icon: Database, color: "bg-amber-50 text-amber-600" },
    { title: "AI/ML", count: "40 resources", icon: Brain, color: "bg-blue-50 text-blue-600" },
    { title: "Resume", count: "25 resources", icon: FileText, color: "bg-slate-50 text-slate-400" },
  ];


  const companies = [
    { name: "Google", initial: "G", color: "bg-blue-600" },
    { name: "Microsoft", initial: "M", color: "bg-blue-600" },
    { name: "Amazon", initial: "A", color: "bg-blue-600" },
    { name: "Meta", initial: "M", color: "bg-blue-600" }
  ];

  return (
    <div className="min-h-screen pt-24 pb-32 bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <div className="container max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Placement Prep Resources
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Everything You Need to <span className="text-[#3b82f6]">Ace Your Interviews</span>
          </h1>

          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            Curated roadmaps, practice problems, and company-specific prep guides
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <Input
              className="h-14 pl-14 pr-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium shadow-sm transition-all focus:ring-0 focus:border-blue-500"
              placeholder="Search resources, topics, or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100 dark:bg-slate-900" />

      {/* Browse by Category */}
      <div className="container max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-10">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <Card key={cat.title} className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className={`h-12 w-12 rounded-2xl ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{cat.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">{cat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dynamic Resources Feed */}
      <div className="container max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Community Shared Resources</h2>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{resources.length} Available</Badge>
        </div>

        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((res) => (
              <Card key={res.id} className="rounded-2xl flex flex-col overflow-hidden border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm group hover:shadow-lg transition-all">
                <CardHeader className="p-6 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-none rounded-md px-2.5 py-1 text-[10px] font-bold">
                      {res.type || 'Document'}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span>{res.rating ? Number(res.rating).toFixed(1) : 'New'}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[56px] group-hover:text-blue-600 transition-colors">
                    {res.title}
                  </h3>
                </CardHeader>
                <CardContent className="p-6 pt-2 flex-grow">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-3">
                    {res.description || 'No description provided.'}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0 border-t border-slate-50 dark:border-slate-800 mt-auto flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Database className="w-4 h-4" />
                    {res.downloads || 0} downloads
                  </div>
                  <Button
                    variant="default"
                    className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold px-4 rounded-xl text-xs transition-all"
                    onClick={() => window.open(res.file_url, '_blank')}
                  >
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50 dark:bg-[#111827] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No community resources yet</h3>
            <p className="text-slate-500 font-medium">Be the first to share a valuable resource!</p>
          </div>
        )}
      </div>

      {/* Company-Specific Prep */}
      <div className="container max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Company-Specific Prep</h2>
          <Button variant="ghost" className="text-blue-600 font-bold text-sm hover:bg-blue-50">
            View All Companies <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {companies.map((co) => (
            <Card key={co.name} className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-5">
                <div className={`h-12 w-12 rounded-xl ${co.color} flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform`}>
                  {co.initial}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{co.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Interview Prep</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;
