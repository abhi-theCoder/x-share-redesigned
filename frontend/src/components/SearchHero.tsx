import React, { useState } from 'react';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useNavigate } from 'react-router-dom';

const SearchHero: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [experience, setExperience] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/jobs?search=${keyword}&location=${location}&exp=${experience}`);
    };

    return (
        <div className={`relative w-full pt-16 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-transparent text-white' : 'bg-white text-gray-900'
            }`}>

            {/* Background Ambience */}
            {theme === 'dark' ? (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-purple/20 rounded-full blur-[100px]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                </div>
            ) : (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[80px]" />
                    <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[80px]" />
                </div>
            )}

            <div className="relative z-10 max-w-4xl mx-auto w-full">
                <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                    Find your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-600">dream job</span> now
                </h1>

                <p className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'
                    }`}>
                    5 lakh+ jobs for you to explore
                </p>

                {/* Search Bar Container */}
                <div className={`p-3 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto border transition-all duration-300 ${theme === 'dark'
                    ? 'bg-white/10 backdrop-blur-xl border-white/10 shadow-black/20'
                    : 'bg-white border-white shadow-xl shadow-slate-200/50'
                    }`}>

                    {/* Keyword Input */}
                    <div className="flex-1 w-full relative flex items-center px-4 h-12 md:border-r border-gray-200/20">
                        <Search className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            placeholder="Enter skills / designations / companies"
                            className="w-full bg-transparent outline-none text-base font-medium placeholder-gray-400 truncate"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    {/* Experience Select (Optional - simplified for now) */}
                    <div className="hidden md:flex w-48 relative items-center px-4 h-12 md:border-r border-gray-200/20">
                        <Briefcase className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                        <select
                            className={`w-full bg-transparent outline-none text-base font-medium cursor-pointer ${experience === '' ? 'text-gray-400' : (theme === 'dark' ? 'text-white' : 'text-gray-900')
                                }`}
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                        >
                            <option value="" className="text-gray-500">Experience</option>
                            <option value="0" className="text-black">Fresher (0-1 yrs)</option>
                            <option value="2" className="text-black">2-5 years</option>
                            <option value="5" className="text-black">5-10 years</option>
                            <option value="10" className="text-black">10+ years</option>
                        </select>
                    </div>

                    {/* Location Input */}
                    <div className="flex-1 w-full relative flex items-center px-4 h-12">
                        <MapPin className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            placeholder="Enter location"
                            className="w-full bg-transparent outline-none text-base font-medium placeholder-gray-400 truncate"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="w-full md:w-auto h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors duration-200 shadow-lg shadow-blue-500/30 whitespace-nowrap"
                    >
                        Search
                    </button>
                </div>

                {/* Popular Searches */}
                <div className={`mt-8 flex flex-wrap justify-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                    }`}>
                    <span>Popular searches:</span>
                    {['Frontend', 'Backend', 'Full Stack', 'Data Science', 'Product Manager'].map((term) => (
                        <button
                            key={term}
                            onClick={() => { setKeyword(term); navigate(`/jobs?search=${term}`); }}
                            className={`hover:underline font-medium ${theme === 'dark' ? 'hover:text-white' : 'hover:text-blue-600'}`}
                        >
                            {term},
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default SearchHero;
