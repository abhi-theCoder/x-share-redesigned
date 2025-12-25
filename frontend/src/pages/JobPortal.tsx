import React, { useState, useMemo, useEffect } from "react";
import axios from "../api";
import { useTheme } from "../context/ThemeContext";

import {
  MapPin,
  Briefcase,
  DollarSign,
  Star,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  FilterX
} from 'lucide-react';

// --- Type Definitions (omitted for brevity) ---
type JobType = "Full-time" | "Internship";
type JobMode = "On-site" | "Remote" | "Hybrid";

interface JobListing {
  id: number;
  title: string;
  company: string;
  location: string;
  type: JobType;
  mode: JobMode;
  experienceYears: number;
  salaryLPA: number;
  rating: number;
  description: string;
  url: string;
}

interface Filters {
  type: JobType | "All";
  modes: JobMode[];
  experience: number;
  minSalary: number;
}


// --- Filter Components (omitted for brevity) ---
const FilterButton = ({
  text,
  onClick,
  isActive,
}: {
  text: string;
  onClick: () => void;
  isActive: boolean;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${isActive
      ? "bg-[#32a5d4] text-white shadow-md"
      : `bg-white/10 text-brand-cyan hover:bg-white/20 shadow-none`
      }`}
  >
    {text}
  </button>
);

const Checkbox = ({
  label,
  checked,
  onChange,
}: {
  label: JobMode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label className="flex items-center space-x-3 cursor-pointer">
    <input
      type="checkbox"
      name={label}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-zinc-300 text-[#32a5d4] focus:ring-[#32a5d4]/50"
    />
    <span className="text-zinc-800 text-sm">{label}</span>
  </label>
);

const FilterSidebar = ({
  filters,
  setFilters,
  onClose,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onClose?: () => void;
}) => {
  const { theme } = useTheme();
  const handleClearFilters = () =>
    setFilters({ type: "All", modes: [], experience: 0, minSalary: 0 });

  return (
    <aside className={`w-full p-5 rounded-3xl border shadow-lg h-fit transition-colors duration-300 ${theme === 'dark'
      ? 'glass border-white/10'
      : 'bg-white/80 backdrop-blur-xl border-white/60'
      }`}>
      <div className="flex justify-between items-center mb-5">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Filters</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearFilters}
            className={`text-xs font-semibold flex items-center transition-colors ${theme === 'dark' ? 'text-brand-cyan hover:text-white' : 'text-blue-600 hover:text-black'}`}
          >
            <FilterX className="w-4 h-4 mr-1" /> Clear
          </button>
          {onClose && (
            <button onClick={onClose} className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className={`font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-800'}`}>Role Type</h4>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              text="All"
              onClick={() => setFilters((p) => ({ ...p, type: "All" }))}
              isActive={filters.type === "All"}
            />
            <FilterButton
              text="Full-time"
              onClick={() => setFilters((p) => ({ ...p, type: "Full-time" }))}
              isActive={filters.type === "Full-time"}
            />
            <FilterButton
              text="Internship"
              onClick={() => setFilters((p) => ({ ...p, type: "Internship" }))}
              isActive={filters.type === "Internship"}
            />
          </div>
        </div>

        <div>
          <h4 className={`font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-800'}`}>Work Mode</h4>
          <div className="space-y-2">
            {(["On-site", "Remote", "Hybrid"] as JobMode[]).map((mode) => (
              <Checkbox
                key={mode}
                label={mode}
                checked={filters.modes.includes(mode)}
                onChange={(e) => {
                  const { name, checked } = e.target;
                  setFilters((p) => ({
                    ...p,
                    modes: checked
                      ? [...p.modes, name as JobMode]
                      : p.modes.filter((m) => m !== name),
                  }));
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="experience"
            className={`block font-semibold mb-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-800'}`}
          >
            Min Experience
          </label>
          <select
            id="experience"
            value={filters.experience}
            onChange={(e) =>
              setFilters((p) => ({ ...p, experience: parseInt(e.target.value) }))
            }
            className={`w-full p-2 text-sm border rounded-lg outline-none transition ${theme === 'dark'
              ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-brand-cyan'
              : 'bg-[#fcfcfc]/80 border-zinc-300 text-zinc-800 focus:ring-2 focus:ring-blue-500'
              }`}
          >
            <option value="0" className={theme === 'dark' ? 'bg-space-900' : ''}>Any</option>
            <option value="1" className={theme === 'dark' ? 'bg-space-900' : ''}>1+ years</option>
            <option value="3" className={theme === 'dark' ? 'bg-space-900' : ''}>3+ years</option>
            <option value="5" className={theme === 'dark' ? 'bg-space-900' : ''}>5+ years</option>
            <option value="7" className={theme === 'dark' ? 'bg-space-900' : ''}>7+ years</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="salary"
            className={`block font-semibold mb-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-zinc-800'}`}
          >
            Minimum Salary (LPA)
          </label>
          <input
            type="range"
            id="salary"
            min="0"
            max="60"
            step="5"
            value={filters.minSalary}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                minSalary: parseInt(e.target.value),
              }))
            }
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-white/10' : 'bg-zinc-200'}`}
          />
          <div className={`text-right text-xs font-medium mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-zinc-700'}`}>
            {filters.minSalary > 0
              ? `₹${filters.minSalary} LPA+`
              : "Any Salary"}
          </div>
        </div>
      </div>
    </aside>
  );
};

// --- Job Card (omitted for brevity) ---
const JobCard = ({ job }: { job: JobListing }) => {
  const { theme } = useTheme();
  return (
    <div className={`p-4 rounded-3xl border flex flex-col transition-all duration-300 transform hover:-translate-y-1 ${theme === 'dark'
      ? 'glass border-white/10 hover:shadow-2xl hover:shadow-brand-cyan/10 hover:border-brand-cyan/30'
      : 'bg-[#fcfcfc]/50 backdrop-blur-xl border-white/60 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/20'
      }`}>
      <h2 className={`text-base font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{job.title}</h2>
      <div className={`flex items-center gap-1.5 mb-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-zinc-600'}`}>
        <p>{job.company}</p>
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-500 fill-current" />
          {job.rating}
        </span>
      </div>

      <div className={`flex flex-col gap-2 text-xs mb-4 pb-4 border-b ${theme === 'dark' ? 'border-white/10 text-gray-300' : 'border-black/5 text-zinc-700'}`}>
        <span className="flex items-center gap-2">
          <MapPin className={`w-4 h-4 ${theme === 'dark' ? 'text-brand-cyan' : 'text-zinc-500'}`} />
          {job.location} ({job.mode})
        </span>
        <span className="flex items-center gap-2">
          <Briefcase className={`w-4 h-4 ${theme === 'dark' ? 'text-brand-purple' : 'text-zinc-500'}`} />{" "}
          {job.experienceYears === 0 ? "Fresher" : `${job.experienceYears}+ years`}
        </span>
        <span className="flex items-center gap-2">
          <DollarSign className={`w-4 h-4 ${theme === 'dark' ? 'text-green-400' : 'text-zinc-500'}`} />
          {job.salaryLPA} LPA
        </span>
      </div>

      <p className={`flex-grow text-xs line-clamp-3 mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-zinc-700/90'}`}>
        {job.description}
      </p>

      <div className="mt-auto flex justify-between items-center">
        <a
          href="#"
          className={`text-xs font-semibold transition flex items-center ${theme === 'dark' ? 'text-brand-cyan hover:text-white' : 'text-blue-600 hover:text-black'}`}
        >
          View details
        </a>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-semibold py-2 px-5 rounded-xl transition-all duration-300 text-xs text-center shadow-lg hover:shadow-xl ${theme === 'dark'
            ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white hover:from-brand-cyan hover:to-brand-purple'
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
            }`}
        >
          Apply Now
        </a>
      </div>
    </div>
  );
};


// --- Updated Minimalist Pagination Component ---
const PaginationControls = ({ page, totalPages, setPage }: {
  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { theme } = useTheme();
  // Only show pagination if there are actual pages to navigate
  if (totalPages <= 1) return null;

  return (
    // Wrapper for fixed, smaller width and centered content
    <div className="flex items-center space-x-2">
      {/* Previous Button */}
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className={`p-1 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center text-sm font-semibold ${theme === 'dark'
          ? 'text-gray-300 bg-white/5 hover:bg-white/10'
          : 'text-zinc-700 bg-black/5 hover:bg-black/10'
          }`}
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Indicator */}
      <span className={`text-sm font-semibold px-3 py-1 rounded-lg border shadow-inner ${theme === 'dark'
        ? 'text-white bg-white/5 border-white/10'
        : 'text-zinc-800 bg-white border-zinc-200'
        }`}>
        Page {page} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className={`p-1 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center text-sm font-semibold ${theme === 'dark'
          ? 'text-gray-300 bg-white/5 hover:bg-white/10'
          : 'text-zinc-700 bg-black/5 hover:bg-black/10'
          }`}
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};


// --- Main Job Portal ---
const JobPortal = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    type: "All",
    modes: [],
    experience: 0,
    minSalary: 0,
  });
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/jobs", {
          params: { page, limit: 9, search: searchTerm },
        });
        setJobs(res.data.jobs);
        setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [page, searchTerm]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);


  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          (filters.type === "All" || job.type === filters.type) &&
          (filters.modes.length === 0 || filters.modes.includes(job.mode)) &&
          job.experienceYears >= filters.experience &&
          job.salaryLPA >= filters.minSalary
      ),
    [jobs, filters]
  );

  return (
    <div className={`relative p-4 md:p-8 min-h-screen font-sans overflow-hidden transition-colors duration-300 ${theme === 'dark'
      ? 'bg-transparent text-white'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 text-zinc-900'
      }`}>
      {/* Background decorative elements */}
      {theme === 'dark' ? (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-purple/10 rounded-full translate-x-1/3 translate-y-1/3 blur-[100px] pointer-events-none"></div>
        </>
      ) : (
        <>
          <div className="absolute top-0 -left-10 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute top-10 -right-10 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute -bottom-16 left-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl opacity-70"></div>
        </>
      )}


      <div className="relative max-w-screen-xl mx-auto z-10">
        <header className="text-center mb-8">
          <h1 className={`text-4xl md:text-5xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            Find Your <span className={`bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-brand-cyan to-brand-blue' : 'from-blue-600 to-indigo-600'}`}>Dream Job</span>
          </h1>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-zinc-600'}`}>
            Explore thousands of opportunities in one place.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          {/* 1. Desktop Filter Sidebar */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5 h-fit sticky top-6">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>

          <main className="flex-1">

            {/* ⭐️ START: Updated Search/Pagination Layout ⭐️ */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex-1 w-full sm:w-auto relative">
                <input
                  type="text"
                  placeholder="Search by title, company, or location..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className={`w-full py-3 px-6 pr-12 text-sm rounded-full border shadow-lg focus:outline-none focus:ring-2 transition-all duration-300 ${theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-brand-cyan glass'
                    : 'bg-[#fcfcfc]/50 backdrop-blur-xl border-white/50 text-zinc-900 focus:ring-blue-500'
                    }`}
                />
                <div className={`absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-zinc-500'}`}>
                  <Search className="w-5 h-5" />
                </div>
              </div>

              {/* 2. Minimal Pagination to the right of the search bar */}
              <PaginationControls
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </div>
            {/* ⭐️ END: Updated Search/Pagination Layout ⭐️ */}

            {/* Minimal Result Count (Moved below the search/pagination row for clarity) */}
            <p className={`text-xs font-medium border-b pb-2 mb-6 ${theme === 'dark' ? 'text-gray-400 border-white/10' : 'text-zinc-600 border-black/10'}`}>
              Showing {filteredJobs.length} results
            </p>

            {/* 3. Mobile Filter Button */}
            <div className="md:hidden mt-4 mb-6">
              <button
                onClick={() => setIsFilterOpen(true)}
                className={`w-full py-2 flex items-center justify-center gap-2 font-semibold rounded-full shadow-lg transition-all ${theme === 'dark'
                  ? 'bg-brand-cyan text-black hover:bg-white'
                  : 'bg-[#32a5d4] text-white hover:bg-black'
                  }`}
              >
                <Filter className="w-4 h-4" /> Show Filters
              </button>
            </div>

            {/* 4. Mobile Filter Modal Overlay (remains the same) */}
            {isFilterOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden">
                <div className="absolute inset-x-0 bottom-0 top-1/4 bg-white rounded-t-2xl p-5 overflow-y-auto">
                  <FilterSidebar
                    filters={filters}
                    setFilters={setFilters}
                    onClose={() => setIsFilterOpen(false)}
                  />
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full max-w-xs py-2 bg-black text-white font-semibold rounded-full hover:bg-zinc-700 transition"
                    >
                      Apply & Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Job Listings */}
            {loading && jobs.length === 0 ? (
              <div className={`text-center py-16 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-zinc-600'}`}>
                Loading jobs...
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className={`text-center py-16 mt-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#fcfcfc]/40 backdrop-blur-xl border-white/50'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-zinc-800'}`}>
                  No Jobs Found
                </h3>
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-zinc-600'}`}>
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobPortal;