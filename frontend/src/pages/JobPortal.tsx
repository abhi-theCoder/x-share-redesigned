import React, { useState, useMemo, useEffect } from "react";
import axios from "../api";

// --- Icon Components (for clarity) ---
const Icon = ({ path, className = "w-4 h-4" }: { path: React.ReactNode; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {path}
  </svg>
);

const ICONS = {
  // ... (ICONS definition remains the same)
  MapPin: (
    <Icon
      path={
        <>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </>
      }
      className="w-5 h-5 text-zinc-500"
    />
  ),
  Briefcase: (
    <Icon
      path={
        <>
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </>
      }
      className="w-5 h-5 text-zinc-500"
    />
  ),
  DollarSign: (
    <Icon
      path={
        <>
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      }
      className="w-5 h-5 text-zinc-500"
    />
  ),
  Star: (
    <Icon
      path={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />}
      className="w-4 h-4 text-amber-500 fill-current"
    />
  ),
  Search: (
    <Icon
      path={
        <>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </>
      }
      className="w-5 h-5"
    />
  ),
  Filter: ( 
    <Icon
      path={
        <>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </>
      }
      className="w-5 h-5"
    />
  ),
  FilterX: (
    <Icon
      path={
        <>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          <line x1="12" x2="12" y1="12" y2="21" />
        </>
      }
      className="w-4 h-4 mr-1"
    />
  ),
  ChevronLeft: (
    <Icon
      path={
        <>
          <polyline points="15 18 9 12 15 6" />
        </>
      }
      className="w-4 h-4"
    />
  ),
  ChevronRight: (
    <Icon
      path={
        <>
          <polyline points="9 18 15 12 9 6" />
        </>
      }
      className="w-4 h-4"
    />
  ),
  X: ( 
    <Icon
      path={
        <>
          <line x1="18" x2="6" y1="6" y2="18" />
          <line x1="6" x2="18" y1="6" y2="18" />
        </>
      }
      className="w-5 h-5"
    />
  ),
};

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
    className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${
      isActive
        ? "bg-[#32a5d4] text-white shadow-md"
        : "bg-black/5 text-zinc-700 hover:bg-black/10"
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
  const handleClearFilters = () =>
    setFilters({ type: "All", modes: [], experience: 0, minSalary: 0 });

  return (
    <aside className="w-full p-5 bg-[#fcfcfc] rounded-2xl border border-white/50 shadow-lg h-fit">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-zinc-900">Filters</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-[#32a5d4] hover:text-black flex items-center"
          >
            {ICONS.FilterX} Clear
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-full text-zinc-600 hover:bg-zinc-100">
              {ICONS.X}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-zinc-800 mb-2 text-sm">Role Type</h4>
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
          <h4 className="font-semibold text-zinc-800 mb-2 text-sm">Work Mode</h4>
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
            className="block font-semibold text-zinc-800 mb-1 text-sm"
          >
            Min Experience
          </label>
          <select
            id="experience"
            value={filters.experience}
            onChange={(e) =>
              setFilters((p) => ({ ...p, experience: parseInt(e.target.value) }))
            }
            className="w-full p-2 text-sm bg-[#fcfcfc]/80 border border-zinc-300 rounded-lg text-zinc-800 focus:ring-2 focus:ring-[#32a5d4] focus:border-[#32a5d4] outline-none transition"
          >
            <option value="0">Any</option>
            <option value="1">1+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
            <option value="7">7+ years</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="salary"
            className="block font-semibold text-zinc-800 mb-1 text-sm"
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
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-right text-xs font-medium text-zinc-700 mt-1">
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
const JobCard = ({ job }: { job: JobListing }) => (
  <div className="bg-[#fcfcfc]/50 backdrop-blur-xl p-4 rounded-2xl border border-white/60 flex flex-col transition-all duration-300 hover:border-black/10 hover:shadow-xl hover:shadow-[#32a5d4]/20 transform hover:-translate-y-1">
    <h2 className="text-base font-bold text-zinc-900">{job.title}</h2>
    <div className="flex items-center gap-1.5 text-zinc-600 mb-3 text-sm">
      <p>{job.company}</p>
      <span className="flex items-center gap-1">
        {ICONS.Star}
        {job.rating}
      </span>
    </div>

    <div className="flex flex-col gap-1.5 text-xs text-zinc-700 mb-4 pb-4 border-b border-black/10">
      <span className="flex items-center gap-2">
        {ICONS.MapPin} {job.location} ({job.mode})
      </span>
      <span className="flex items-center gap-2">
        {ICONS.Briefcase}{" "}
        {job.experienceYears === 0 ? "Fresher" : `${job.experienceYears}+ years`}
      </span>
      <span className="flex items-center gap-2">
        {ICONS.DollarSign} {job.salaryLPA} LPA
      </span>
    </div>

    <p className="flex-grow text-xs text-zinc-700/90 line-clamp-3 mb-3">
      {job.description}
    </p>

    <div className="mt-auto flex justify-between items-center">
      <a
        href="#"
        className="text-xs font-semibold text-[#32a5d4] hover:text-black transition"
      >
        View →
      </a>
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#32a5d4] text-white font-semibold py-1.5 px-4 rounded-md hover:bg-black transition-all duration-300 text-xs text-center"
      >
        Apply
      </a>

    </div>
  </div>
);


// --- Updated Minimalist Pagination Component ---
const PaginationControls = ({ page, totalPages, setPage, filteredJobCount }: {
    page: number;
    totalPages: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    filteredJobCount: number;
}) => {
    // Only show pagination if there are actual pages to navigate
    if (totalPages <= 1) return null;

    return (
        // Wrapper for fixed, smaller width and centered content
        <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded-lg text-zinc-700 bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/10 transition flex items-center justify-center text-sm font-semibold"
                aria-label="Previous Page"
            >
                {ICONS.ChevronLeft}
            </button>
            
            {/* Page Indicator */}
            <span className="text-sm font-semibold px-3 py-1 text-zinc-800 bg-white rounded-lg shadow-inner border border-zinc-200">
                Page {page} of {totalPages}
            </span>

            {/* Next Button */}
            <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded-lg text-zinc-700 bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/10 transition flex items-center justify-center text-sm font-semibold"
                aria-label="Next Page"
            >
                {ICONS.ChevronRight}
            </button>
        </div>
    );
};


// --- Main Job Portal ---
const JobPortal = () => {
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
    <div className="relative p-4 md:p-8 bg-[#d1e1e9] min-h-screen font-sans text-zinc-900 overflow-hidden">
      <div className="absolute top-0 -left-10 w-80 h-80 bg-[#32a5d4]/20 rounded-full blur-3xl opacity-70"></div>
      <div className="absolute top-10 -right-10 w-80 h-80 bg-[#32a5d4]/10 rounded-full blur-3xl opacity-70"></div>
      <div className="absolute -bottom-16 left-20 w-80 h-80 bg-[#32a5d4]/15 rounded-full blur-3xl opacity-70"></div>

      <div className="relative max-w-screen-xl mx-auto z-10">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900">
            Find Your <span className="text-[#32a5d4]">Dream Job</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
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
                        className="w-full py-3 px-6 pr-12 text-sm bg-[#fcfcfc]/50 backdrop-blur-xl rounded-full border border-white/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#32a5d4] transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center text-zinc-500 pointer-events-none">
                        {ICONS.Search}
                    </div>
                </div>
            
                {/* 2. Minimal Pagination to the right of the search bar */}
                <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                    filteredJobCount={filteredJobs.length}
                />
            </div>
            {/* ⭐️ END: Updated Search/Pagination Layout ⭐️ */}
            
            {/* Minimal Result Count (Moved below the search/pagination row for clarity) */}
            <p className="text-xs text-zinc-600 font-medium border-b border-black/10 pb-2 mb-6">
                Showing {filteredJobs.length} results
            </p>

            {/* 3. Mobile Filter Button */}
            <div className="md:hidden mt-4 mb-6">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="w-full py-2 flex items-center justify-center gap-2 bg-[#32a5d4] text-white font-semibold rounded-full shadow-lg hover:bg-black transition-all"
              >
                {ICONS.Filter} Show Filters
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
              <div className="text-center py-16 text-zinc-600 text-sm">
                Loading jobs...
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 mt-6 bg-[#fcfcfc]/40 backdrop-blur-xl rounded-2xl border border-white/50">
                <h3 className="text-lg font-semibold text-zinc-800">
                  No Jobs Found
                </h3>
                <p className="text-zinc-600 mt-1 text-sm">
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