import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Star,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import axios from "../api";

// --- Type Definitions ---
type JobType = "Full-time" | "Part-time" | "Internship" | "Contract";
type JobMode = "On-site" | "Remote" | "Hybrid";

interface JobListing {
  id: number;
  title: string;
  company: string;
  location: string;
  type: JobType;
  mode: JobMode;
  experienceYears: number | string;
  salaryLPA: number | string;
  rating: number;
  description: string;
  url: string;
  postedAt?: string;
  applicants?: number;
  skills?: string[];
  isFeatured?: boolean;
}

const DUMMY_JOBS: JobListing[] = [
  {
    id: 101,
    title: "Senior Software Engineer",
    company: "Google",
    location: "Bangalore, Karnataka",
    type: "Full-time",
    mode: "Hybrid",
    experienceYears: "3-5 years",
    salaryLPA: "25-35 LPA",
    rating: 4.5,
    description: "Lead the development of next-gen cloud infrastructure.",
    url: "#",
    postedAt: "2 days ago",
    applicants: 234,
    skills: ["React", "TypeScript", "Node.js", "GCP"],
    isFeatured: true
  },
  {
    id: 102,
    title: "Product Manager",
    company: "Microsoft",
    location: "Hyderabad, Telangana",
    type: "Full-time",
    mode: "On-site",
    experienceYears: "5-8 years",
    salaryLPA: "30-45 LPA",
    rating: 4.8,
    description: "Drive product strategy for Azure cloud services.",
    url: "#",
    postedAt: "1 day ago",
    applicants: 156,
    skills: ["Strategy", "Azure", "SQL", "Agile"],
    isFeatured: true
  },
  {
    id: 103,
    title: "Frontend Developer",
    company: "Amazon",
    location: "Gurgaon, Haryana",
    type: "Full-time",
    mode: "Remote",
    experienceYears: "2-4 years",
    salaryLPA: "18-28 LPA",
    rating: 4.3,
    description: "Build high-performance web applications for AWS.",
    url: "#",
    postedAt: "4 days ago",
    applicants: 412,
    skills: ["React", "Next.js", "Tailwind", "AWS"],
    isFeatured: false
  }
];

interface Filters {
  types: JobType[];
  modes: JobMode[];
  experiences: string[];
  minSalary: number;
}

const FilterSidebar = ({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) => {
  const handleClearFilters = () =>
    setFilters({ types: [], modes: [], experiences: [], minSalary: 0 });

  const experienceOptions = ["Fresher", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
  const typeOptions = ["Full-time", "Part-time", "Internship", "Contract"];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-lg font-bold text-foreground tracking-tight">Filters</h3>
        <button
          onClick={handleClearFilters}
          className="text-blue-600 text-xs font-bold hover:underline transition-all"
        >
          Clear all
        </button>
      </div>

      <Accordion type="multiple" defaultValue={["experience", "type"]} className="w-full">
        {/* Experience Filter */}
        <AccordionItem value="experience" className="border-none">
          <AccordionTrigger className="hover:no-underline py-4 text-[11px] font-black text-foreground uppercase tracking-[0.2em] opacity-80">
            Experience
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3.5 pt-2 px-1">
              {experienceOptions.map((exp) => (
                <div key={exp} className="flex items-center gap-3 group">
                  <Checkbox
                    id={`exp-${exp}`}
                    checked={filters.experiences.includes(exp)}
                    onCheckedChange={(checked) => {
                      if (checked) setFilters({ ...filters, experiences: [...filters.experiences, exp] });
                      else setFilters({ ...filters, experiences: filters.experiences.filter(e => e !== exp) });
                    }}
                    className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-colors"
                  />
                  <label htmlFor={`exp-${exp}`} className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-600 cursor-pointer select-none transition-colors">
                    {exp}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <Separator className="bg-border/40 my-2" />

        {/* Job Type Filter */}
        <AccordionItem value="type" className="border-none">
          <AccordionTrigger className="hover:no-underline py-4 text-[11px] font-black text-foreground uppercase tracking-[0.2em] opacity-80">
            Job Type
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3.5 pt-2 px-1">
              {typeOptions.map((type) => (
                <div key={type} className="flex items-center gap-3 group">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.types.includes(type as JobType)}
                    onCheckedChange={(checked) => {
                      if (checked) setFilters({ ...filters, types: [...filters.types, type as JobType] });
                      else setFilters({ ...filters, types: filters.types.filter(t => t !== type) });
                    }}
                    className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-colors"
                  />
                  <label htmlFor={`type-${type}`} className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-600 cursor-pointer select-none transition-colors">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const JobCard = ({ job }: { job: JobListing }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="relative overflow-hidden border border-border/50 bg-card hover:bg-card/80 dark:bg-card/40 dark:backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 rounded-[32px] p-8 shadow-xl dark:shadow-2xl dark:shadow-black/20">
        <div className="flex flex-col gap-5">
          {/* Featured Badge */}
          {job.isFeatured && (
            <div className="flex">
              <Badge className="bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 border-none rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-3 h-3" />
                Featured
              </Badge>
            </div>
          )}

          {/* Header Row: Company & Title */}
          <div className="flex items-start gap-5">
            <div className="h-10 w-10 min-w-[40px] rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {job.company.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 -mt-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                    <Bookmark className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  {job.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Info Row: Icons & Tags */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-slate-400" />
              {job.location}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Briefcase className="w-4 h-4 text-slate-400" />
              {typeof job.experienceYears === 'string' ? job.experienceYears : (job.experienceYears === 0 ? "Fresher" : `${job.experienceYears} years`)}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <DollarSign className="w-4 h-4 text-slate-400" />
              {typeof job.salaryLPA === 'string' ? `₹${job.salaryLPA}` : `₹${job.salaryLPA} LPA`}
            </div>
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none px-2.5 py-0.5 text-[10px] font-bold">
              {job.mode}
            </Badge>
          </div>

          {/* Skills Row */}
          <div className="flex flex-wrap gap-2">
            {(job.skills || ["React", "TypeScript", "Node.js", "GCP"]).map(skill => (
              <Badge key={skill} variant="outline" className="px-3 py-1 rounded-full border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {skill}
              </Badge>
            ))}
          </div>

          <Separator className="bg-slate-100 dark:bg-slate-800" />

          {/* Bottom Row: Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-500 font-semibold whitespace-nowrap">
                <Clock className="w-4 h-4" />
                {job.postedAt || "2 days ago"}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-500 font-semibold whitespace-nowrap">
                <Users className="w-4 h-4" />
                {job.applicants || 234} applicants
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="ghost" className="flex-1 sm:flex-none h-10 px-6 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600">
                View Details
              </Button>
              <Button className="flex-1 sm:flex-none h-10 px-8 rounded-lg text-xs font-bold bg-[#3b82f6] hover:bg-[#2563eb] text-white border-none transition-all duration-200 shadow-sm">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const JobPortal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    types: [],
    modes: [],
    experiences: [],
    minSalary: 0,
  });
  const [jobs, setJobs] = useState<JobListing[]>(DUMMY_JOBS);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/jobs", {
          params: { page, limit: 10, search: searchTerm, location: locationTerm },
        });
        setJobs([...DUMMY_JOBS, ...res.data.jobs]);
        setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [page, searchTerm, locationTerm]);

  useEffect(() => {
    setPage(1);
  }, [filters, searchTerm, locationTerm]);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const matchesType = filters.types.length === 0 || filters.types.includes(job.type);
        const matchesMode = filters.modes.length === 0 || filters.modes.includes(job.mode);

        // Handle potential string values for numeric filters
        const salary = typeof job.salaryLPA === 'string' ? parseFloat(job.salaryLPA) : job.salaryLPA;
        const experience = typeof job.experienceYears === 'string' ? parseFloat(job.experienceYears) : job.experienceYears;

        const matchesSalary = isNaN(salary) || salary >= filters.minSalary;

        const matchesExp = filters.experiences.length === 0 || filters.experiences.some(e => {
          if (isNaN(experience)) return true; // Dummy string ranges always show if no more specific logic
          if (e === "Fresher") return experience === 0;
          if (e === "1-3 years") return experience >= 1 && experience <= 3;
          if (e === "3-5 years") return experience >= 3 && experience <= 5;
          if (e === "5-10 years") return experience >= 5 && experience <= 10;
          if (e === "10+ years") return experience >= 10;
          return true;
        });
        return matchesType && matchesMode && matchesSalary && matchesExp;
      }),
    [jobs, filters]
  );

  return (
    <div className="min-h-screen pb-32">
      {/* --- Page Header / Hero --- */}
      <div className="pt-24 pb-16 relative overflow-hidden">
        <div className="container relative z-10 px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-7xl mx-auto">
            <div className="flex-1 text-left min-w-[320px]">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 text-slate-900 dark:text-white leading-tight">
                Find Your <span className="text-[#2563eb]">Dream Job</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                Discover 5000+ opportunities at top companies
              </p>
            </div>

            {/* Search Bar Protocol */}
            <div className="flex-1 w-full max-w-3xl">
              <div className="relative group">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-blue-500/5 blur-[80px] opacity-20 pointer-events-none" />
                <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-white dark:bg-slate-900/50 dark:backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 gap-1 shadow-sm">
                  <div className="flex-[1.5] flex items-center px-4 min-w-[240px]">
                    <Search className="w-5 h-5 text-slate-400 mr-3" />
                    <Input
                      placeholder="Job title, skills, or company"
                      className="border-none bg-transparent h-12 focus-visible:ring-0 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Separator orientation="vertical" className="hidden md:block h-6 bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 flex items-center px-4 min-w-[180px]">
                    <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                    <Input
                      placeholder="Location"
                      className="border-none bg-transparent h-12 focus-visible:ring-0 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 text-sm"
                      value={locationTerm}
                      onChange={(e) => setLocationTerm(e.target.value)}
                    />
                  </div>
                  <Button className="h-12 px-6 rounded-lg font-bold text-sm bg-[#3b82f6] hover:bg-[#2563eb] text-white flex items-center gap-2 shadow-sm shadow-blue-500/20">
                    <Search className="w-4 h-4" />
                    Search Jobs
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-72 h-fit sticky top-32">
            <div className="p-4">
              <FilterSidebar filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  <span className="text-blue-600">5000+</span> jobs found
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Select defaultValue="relevant">
                  <SelectTrigger className="w-[180px] h-10 rounded-xl border-border/40 bg-card/40 backdrop-blur-md text-xs font-black uppercase tracking-widest">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="relevant">Most Relevant</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="salary">Highest Salary</SelectItem>
                  </SelectContent>
                </Select>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden h-10 rounded-xl px-4 font-black uppercase tracking-widest text-[10px]">
                      <Filter className="w-3.5 h-3.5 mr-2" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] border-none bg-card/95 backdrop-blur-3xl">
                    <SheetHeader className="mb-8">
                      <SheetTitle className="text-xl font-black italic">Job Filters</SheetTitle>
                    </SheetHeader>
                    <FilterSidebar filters={filters} setFilters={setFilters} />
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {loading && jobs.length === 0 ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 rounded-[40px] bg-muted/20 animate-pulse border border-border/40" />
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="flex flex-col gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-32 text-center bg-card/20 rounded-[48px] border-2 border-dashed border-border/40">
                <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-black italic mb-2">No matching intercept</h3>
                <p className="text-muted-foreground font-medium italic mb-8">Try adjusting your filters or expansion terms.</p>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setLocationTerm(''); }} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
                  Reset Registry
                </Button>
              </div>
            )}

            {/* Pagination Protocol */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-xl h-12 w-12 border-border/60"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md px-6 h-12 rounded-xl border border-border/40 font-black italic text-sm">
                  {page} <span className="opacity-30">/</span> {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-xl h-12 w-12 border-border/60"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPortal;
