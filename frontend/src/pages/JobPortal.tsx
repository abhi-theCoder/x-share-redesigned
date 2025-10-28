// src/pages/JobPortal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import axios from '../api';
import PostJobForm, { JobListing as PostJobListing } from './PostJobForm';

// --- Icon Components ---
const Icon = ({ path, className = "w-4 h-4" }: { path: any; className?: string; }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {path}
    </svg>
);

const ICONS = {
    MapPin: <Icon path={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>} className="w-5 h-5 text-zinc-500" />,
    Briefcase: <Icon path={<><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>} className="w-5 h-5 text-zinc-500" />,
    DollarSign: <Icon path={<><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>} className="w-5 h-5 text-zinc-500" />,
    Star: <Icon path={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />} className="w-4 h-4 text-amber-500 fill-current" />,
    Search: <Icon path={<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>} className="w-5 h-5" />,
    FilterX: <Icon path={<><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></>} className="w-4 h-4 mr-1" />,
};

// --- Type Definitions ---
type JobType = 'Full-time' | 'Internship';
type JobMode = 'On-site' | 'Remote' | 'Hybrid';

interface JobListing {
    id: string;
    title: string;
    company: string;
    location: string;
    type: JobType;
    mode: JobMode;
    experienceYears: number;
    salaryLPA: number;
    rating: number;
    description: string;
    applicants: number;
    timeline?: string;
    createdAt?: string;
}

// --- Filter State Type ---
interface Filters {
    type: JobType | 'All';
    modes: JobMode[];
    experience: number;
    minSalary: number;
}

// --- Expanded Mock Data ---
const mockJobListings: JobListing[] = [
    { id: 'job-1', title: 'Software Engineer', company: 'Google', location: 'Bangalore', type: 'Full-time', mode: 'Hybrid', experienceYears: 1, salaryLPA: 20, rating: 4.8, description: 'Design, develop, test, deploy, maintain and improve software.', applicants: 12, createdAt: new Date().toISOString() },
    { id: 'job-2', title: 'Product Design Intern', company: 'Microsoft', location: 'Hyderabad', type: 'Internship', mode: 'On-site', experienceYears: 0, salaryLPA: 12, rating: 4.7, description: 'Collaborate with a team of designers to create user experiences.', applicants: 5, createdAt: new Date().toISOString() },
    { id: 'job-3', title: 'Senior Data Scientist', company: 'Amazon', location: 'Remote', type: 'Full-time', mode: 'Remote', experienceYears: 5, salaryLPA: 45, rating: 4.5, description: 'Utilize statistical models and machine learning algorithms.', applicants: 22, createdAt: new Date().toISOString() },
    { id: 'job-4', title: 'DevOps Engineer', company: 'Netflix', location: 'Mumbai', type: 'Full-time', mode: 'On-site', experienceYears: 3, salaryLPA: 30, rating: 4.6, description: 'Build and maintain our cloud infrastructure and pipelines.', applicants: 8, createdAt: new Date().toISOString() },
    { id: 'job-5', title: 'Frontend Developer', company: 'Swiggy', location: 'Bangalore', type: 'Full-time', mode: 'Hybrid', experienceYears: 2, salaryLPA: 22, rating: 4.4, description: 'Create responsive UIs using React and TypeScript.', applicants: 18, createdAt: new Date().toISOString() },
    { id: 'job-6', title: 'Marketing Intern', company: 'Zomato', location: 'Gurgaon', type: 'Internship', mode: 'On-site', experienceYears: 0, salaryLPA: 8, rating: 4.3, description: 'Assist marketing team in campaigns and data analysis.', applicants: 3, createdAt: new Date().toISOString() },
    { id: 'job-7', title: 'Lead Backend Engineer', company: 'Atlassian', location: 'Remote', type: 'Full-time', mode: 'Remote', experienceYears: 8, salaryLPA: 60, rating: 4.9, description: 'Lead a team of engineers to build scalable APIs.', applicants: 9, createdAt: new Date().toISOString() },
    { id: 'job-8', title: 'UX/UI Designer', company: 'Cred', location: 'Bangalore', type: 'Full-time', mode: 'Hybrid', experienceYears: 3, salaryLPA: 25, rating: 4.8, description: 'Craft beautiful and user-friendly fintech interfaces.', applicants: 7, createdAt: new Date().toISOString() },
];

// --- Filter Button & Checkbox ---
const FilterButton = ({ text, onClick, isActive }: { text: string; onClick: () => void; isActive: boolean }) => (
    <button onClick={onClick} className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${isActive ? 'bg-[#32a5d4] text-white shadow-md' : 'bg-black/5 text-zinc-700 hover:bg-black/10'}`}>
        {text}
    </button>
);

const Checkbox = ({ label, checked, onChange }: { label: JobMode; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <label className="flex items-center space-x-3 cursor-pointer">
        <input type="checkbox" name={label} checked={checked} onChange={onChange} className="h-4 w-4 rounded border-zinc-300 text-[#32a5d4] focus:ring-[#32a5d4]/50" />
        <span className="text-zinc-800 text-sm">{label}</span>
    </label>
);

// --- Filter Sidebar ---
const FilterSidebar = ({ filters, setFilters }: { filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>> }) => {
    const handleClearFilters = () => setFilters({ type: 'All', modes: [], experience: 0, minSalary: 0 });

    return (
        <aside className="w-full md:w-1/4 lg:w-1/5 p-5 bg-[#fcfcfc]/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg h-fit sticky top-6">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-zinc-900">Filters</h3>
                <button onClick={handleClearFilters} className="text-xs font-semibold text-[#32a5d4] hover:text-black flex items-center">
                    {ICONS.FilterX} Clear
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-zinc-800 mb-2 text-sm">Role Type</h4>
                    <div className="flex flex-wrap gap-2">
                        <FilterButton text="All" onClick={() => setFilters(p => ({ ...p, type: 'All' }))} isActive={filters.type === 'All'} />
                        <FilterButton text="Full-time" onClick={() => setFilters(p => ({ ...p, type: 'Full-time' }))} isActive={filters.type === 'Full-time'} />
                        <FilterButton text="Internship" onClick={() => setFilters(p => ({ ...p, type: 'Internship' }))} isActive={filters.type === 'Internship'} />
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-zinc-800 mb-2 text-sm">Work Mode</h4>
                    <div className="space-y-2">
                        {(['On-site', 'Remote', 'Hybrid'] as JobMode[]).map(mode => (
                            <Checkbox key={mode} label={mode} checked={filters.modes.includes(mode)} onChange={(e) => {
                                const { name, checked } = e.target;
                                setFilters(p => ({ ...p, modes: checked ? [...p.modes, name as JobMode] : p.modes.filter(m => m !== name) }));
                            }} />
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="experience" className="block font-semibold text-zinc-800 mb-1 text-sm">Min Experience</label>
                    <select id="experience" value={filters.experience} onChange={e => setFilters(p => ({ ...p, experience: parseInt(e.target.value) }))} className="w-full p-2 text-sm bg-[#fcfcfc]/80 border border-zinc-300 rounded-lg text-zinc-800 focus:ring-2 focus:ring-[#32a5d4] focus:border-[#32a5d4] outline-none transition">
                        <option value={0}>Any</option>
                        <option value={1}>1+ years</option>
                        <option value={3}>3+ years</option>
                        <option value={5}>5+ years</option>
                        <option value={7}>7+ years</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="salary" className="block font-semibold text-zinc-800 mb-1 text-sm">Minimum Salary (LPA)</label>
                    <input type="range" id="salary" min="0" max="60" step="5" value={filters.minSalary} onChange={e => setFilters(p => ({ ...p, minSalary: parseInt(e.target.value) }))} className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="text-right text-xs font-medium text-zinc-700 mt-1">{filters.minSalary > 0 ? `₹${filters.minSalary} LPA+` : 'Any Salary'}</div>
                </div>
            </div>
        </aside>
    );
};

// --- Job Card ---
const JobCard = ({ job, onApply }: { job: JobListing; onApply: (id: string) => void }) => (
    <div className="bg-[#fcfcfc]/50 backdrop-blur-xl p-4 rounded-2xl border border-white/60 flex flex-col transition-all duration-300 hover:border-black/10 hover:shadow-xl hover:shadow-[#32a5d4]/20 transform hover:-translate-y-1">
        <h2 className="text-base font-bold text-zinc-900">{job.title}</h2>
        <div className="flex items-center gap-1.5 text-zinc-600 mb-3 text-sm">
            <p>{job.company}</p>
            <span className="flex items-center gap-1">{ICONS.Star}{job.rating}</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-zinc-700 mb-4 pb-4 border-b border-black/10">
            <span className="flex items-center gap-2">{ICONS.MapPin} {job.location} ({job.mode})</span>
            <span className="flex items-center gap-2">{ICONS.Briefcase} {job.experienceYears === 0 ? 'Fresher' : `${job.experienceYears}+ years`}</span>
            <span className="flex items-center gap-2">{ICONS.DollarSign} {job.salaryLPA} LPA</span>
        </div>

        <p className="flex-grow text-xs text-zinc-700/90 line-clamp-3 mb-3">{job.description}</p>

        <div className="mt-auto flex justify-between items-center">
            <div className="text-xs text-zinc-600">Applicants: <span className="font-semibold">{job.applicants}</span></div>
            <div className="flex items-center gap-3">
                <a href="#" className="text-xs font-semibold text-[#32a5d4] hover:text-black transition">View →</a>
                <button onClick={() => onApply(job.id)} className="bg-[#32a5d4] text-white font-semibold py-1.5 px-4 rounded-md hover:bg-black transition-all duration-300 text-xs">
                    Apply
                </button>
            </div>
        </div>
    </div>
);

// --- Main Job Portal ---
const JobPortal = () => {
    // Search + filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<Filters>({ type: 'All', modes: [], experience: 0, minSalary: 0 });

    // Jobs state (mock initial + any posted by admin)
    const [jobs, setJobs] = useState<JobListing[]>(mockJobListings);

    // Modal control
    const [showPostModal, setShowPostModal] = useState(false);

    // Admin state - SIMPLE CHECK
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 9;

    // SIMPLE ADMIN CHECK - Just call the API and check isAdmin
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const token = localStorage.getItem("token");
                
                if (!token) {
                    setIsAdmin(false);
                    return;
                }

                // Simple API call - backend returns { isAdmin: true/false }
                const response = await axios.get("/api/admin/check", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Simple check - if isAdmin is true, show post job button
                setIsAdmin(response.data.isAdmin === true);
                
            } catch (error) {
                console.error("Admin check failed:", error);
                setIsAdmin(false);
            }
        };

        checkAdmin();
    }, []);

    // Filtered & searched list (memoized)
    const filteredJobs = useMemo(() => jobs.filter(job =>
        (filters.type === 'All' || job.type === filters.type) &&
        (filters.modes.length === 0 || filters.modes.includes(job.mode)) &&
        (job.experienceYears >= filters.experience) &&
        (job.salaryLPA >= filters.minSalary) &&
        (searchTerm === '' ||
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [searchTerm, filters, jobs]);

    // Pagination calculation
    const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [totalPages, currentPage]);

    const indexOfLast = currentPage * jobsPerPage;
    const indexOfFirst = indexOfLast - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirst, indexOfLast);

    // Handlers
    const handleApply = (jobId: string) => {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, applicants: (j.applicants ?? 0) + 1 } : j));
    };

    const handleAddJob = (jobFromForm: PostJobListing) => {
        const newJob: JobListing = {
            id: jobFromForm.id,
            title: jobFromForm.title,
            company: jobFromForm.company,
            location: jobFromForm.location,
            type: jobFromForm.type as JobType,
            mode: jobFromForm.mode as JobMode,
            experienceYears: jobFromForm.experienceYears,
            salaryLPA: jobFromForm.salaryLPA,
            rating: jobFromForm.rating,
            description: jobFromForm.description,
            applicants: jobFromForm.applicants,
            timeline: jobFromForm.timeline,
            createdAt: jobFromForm.createdAt,
        };

        setJobs(prev => [newJob, ...prev]); // Add new job at the beginning
        setCurrentPage(1); // Reset to first page to see the new job
    };

    // Render
    return (
        <div className="relative p-4 md:p-8 bg-[#d1e1e9] min-h-screen font-sans text-zinc-900 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 -left-10 w-80 h-80 bg-[#32a5d4]/20 rounded-full blur-3xl opacity-70"></div>
            <div className="absolute top-10 -right-10 w-80 h-80 bg-[#32a5d4]/10 rounded-full blur-3xl opacity-70"></div>
            <div className="absolute -bottom-16 left-20 w-80 h-80 bg-[#32a5d4]/15 rounded-full blur-3xl opacity-70"></div>

            <div className="relative max-w-screen-xl mx-auto z-10">
                <header className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900">
                            Find Your <span className="text-[#32a5d4]">Dream Job</span>
                        </h1>
                        <p className="mt-2 text-sm text-zinc-600">Explore thousands of opportunities in one place.</p>
                    </div>

                    {/* Admin Post Job button - only show if admin */}
                    {isAdmin && (
                        <div className="self-center">
                            <button 
                                onClick={() => setShowPostModal(true)} 
                                className="bg-[#32a5d4] text-white font-semibold py-2 px-4 rounded-lg hover:bg-black transition"
                            >
                                Post Job
                            </button>
                        </div>
                    )}
                </header>

                <div className="flex flex-col md:flex-row gap-6">
                    <FilterSidebar filters={filters} setFilters={setFilters} />

                    <main className="flex-1">
                        {/* Search bar */}
                        <div className="mb-6 relative">
                            <input 
                                type="text" 
                                placeholder="Search by title, company, or location..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-3 px-6 pr-12 text-sm bg-[#fcfcfc]/50 backdrop-blur-xl rounded-full border border-white/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#32a5d4] transition-all duration-300"
                            />
                            <div className="absolute inset-y-0 right-0 pr-5 flex items-center text-zinc-500 pointer-events-none">
                                {ICONS.Search}
                            </div>
                        </div>

                        {/* Jobs grid */}
                        {currentJobs.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {currentJobs.map(job => (
                                    <JobCard key={job.id} job={job} onApply={handleApply} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-[#fcfcfc]/40 backdrop-blur-xl rounded-2xl border border-white/50">
                                <h3 className="text-lg font-semibold text-zinc-800">No Jobs Found</h3>
                                <p className="text-zinc-600 mt-1 text-sm">Try adjusting your search or filters.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-3 mt-6">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-lg border border-zinc-300 text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setCurrentPage(i + 1)} 
                                    className={`px-3 py-1 rounded-lg border ${currentPage === i + 1 ? 'bg-[#32a5d4] text-white border-[#32a5d4]' : 'border-zinc-300 text-zinc-700'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-lg border border-zinc-300 text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </main>
                </div>
            </div>

            {/* Post Job Modal */}
            <PostJobForm 
                open={showPostModal} 
                onClose={() => setShowPostModal(false)} 
                onAddJob={handleAddJob} 
            />
        </div>
    );
};

export default JobPortal;