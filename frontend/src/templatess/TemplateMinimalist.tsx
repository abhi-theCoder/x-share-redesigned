import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase, GraduationCap, Code, Star, Heart, User } from 'lucide-react';

// --- Data Types (Must be accurate for both builder and templates) ---
interface PersonalInfo { 
    name: string; 
    title: string; 
    email: string; 
    phone: string; 
    location: string; 
    linkedin: string; 
    github: string; 
    portfolio: string;
    photoUrl: string;
}
interface ExperienceItem { id: string; title: string; company: string; startDate: string; endDate: string; description: string; }
interface EducationItem { id: string; degree: string; institution: string; city: string; startDate: string; endDate: string; description?: string; }
interface SkillItem { id?: string; name: string; level: 'Beginner' | 'Intermediate' | 'Expert'; type: 'Technical' | 'Soft'; }
interface ProjectItem { id: string; name: string; role: string; description: string; url: string; }
interface CertificationItem { id: string; name: string; authority: string; date: string; }

// Full data structure expected by this template
interface ResumeData {
    personal: PersonalInfo;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillItem[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
    achievements: any[]; 
    interests: string;
}

interface TemplateProps {
    data: ResumeData;
    sectionOrder?: string[]; 
}
// --- End Data Types ---

const TemplateMinimalist: React.FC<TemplateProps> = ({ data }) => {
    const { personal, summary, experience, education, skills, projects, certifications, interests } = data;

    const formatDate = (date: string) => {
        if (!date || date.toLowerCase() === 'present') return 'Present';
        const dateParts = date.split('-');
        if (dateParts.length === 2) { // Handles YYYY-MM format
            return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        }
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    const renderContactItem = (Icon: React.FC<any>, content: string | undefined, isLink: boolean = false) => {
        if (!content || content.trim() === '') return null;
        
        let displayContent = content;
        let href = content;

        if (Icon === Linkedin) {
            displayContent = content.split('/').pop() || content;
            href = content.startsWith('http') ? content : `https://linkedin.com/in/${displayContent}`;
        } else if (Icon === Github) {
            displayContent = content.split('/').pop() || content;
            href = content.startsWith('http') ? content : `https://github.com/${displayContent}`;
        } else if (Icon === Globe) {
            displayContent = content.replace(/^(https?:\/\/)?(www\.)?/i, '').split('/')[0];
            href = content.startsWith('http') ? content : `https://${content}`;
        } else if (Icon === Mail) {
            href = `mailto:${content}`;
        } else if (Icon === Phone) {
            href = `tel:${content.replace(/\s/g, '')}`;
        }

        return (
            <div className="flex items-center space-x-2 text-xs text-gray-700">
                <Icon className="w-3 h-3 text-blue-600 flex-shrink-0" />
                {isLink ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className='text-gray-700 hover:text-blue-600 transition-colors truncate'>
                        {displayContent}
                    </a>
                ) : (
                    <span className='truncate'>{displayContent}</span>
                )}
            </div>
        );
    };

    const renderSectionTitle = (title: string, Icon: React.FC<any>) => (
        <div className="flex items-center space-x-2 mb-3 mt-4 border-b border-gray-200 pb-1">
            <Icon className="w-4 h-4 text-blue-600" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">{title}</h2>
        </div>
    );

    const parseAndRenderDescription = (description: string | undefined) => {
        if (!description || description.trim() === '') return null;
        
        // Split by newline or common bullet separators
        const sentences = description.split('\n').map(s => s.trim()).filter(s => s.length > 0);
        
        if (sentences.length > 1 || description.includes('\n')) {
            // Treat as bullet points
            return (
                <ul className="list-disc ml-5 text-sm mt-1 space-y-0.5 text-gray-700">
                    {sentences.map((bullet, idx) => <li key={idx} className='pl-1'>{bullet.trim()}</li>)}
                </ul>
            );
        }
        
        // Otherwise, treat as a paragraph
        return <p className="text-sm mt-1 text-gray-700">{description}</p>;
    };


    // Utility function for skill level visualization
    const renderSkillLevel = (level: SkillItem['level']) => {
        const totalStars = 3;
        const filledStars = level === 'Expert' ? 3 : level === 'Intermediate' ? 2 : 1;
        
        return (
            <div className="flex space-x-0.5 ml-2">
                {[...Array(totalStars)].map((_, i) => (
                    <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < filledStars ? 'text-blue-600 fill-blue-600' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };


    return (
        <div className="font-sans text-gray-800 text-sm leading-normal shadow-lg print:shadow-none min-h-[900px]">
            
            <div className="grid grid-cols-1 md:grid-cols-3">

                {/* Left Column (Sidebar) - 1/3 Width - Subtle Accent Background */}
                <div className="col-span-1 p-6 bg-blue-50/70 border-r border-blue-100 flex flex-col space-y-6">
                    
                    {/* Photo (If Available) */}
                    {personal.photoUrl && (
                        <div className="flex justify-center mb-4">
                            <img
                                src={personal.photoUrl}
                                alt={`${personal.name}'s profile picture`}
                                className="w-28 h-28 object-cover rounded-full shadow-md border-4 border-white ring-2 ring-blue-500/50"
                                onError={(e) => {
                                    e.currentTarget.onerror = null; 
                                    e.currentTarget.src = 'https://placehold.co/112x112/bddbff/000000?text=Photo';
                                }}
                            />
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2">
                        <h2 className="text-base font-bold uppercase tracking-wider text-blue-700 border-b border-blue-200 pb-1 mb-2">Contact</h2>
                        <div className="space-y-2 pl-1">
                            {renderContactItem(Mail, personal.email, true)}
                            {renderContactItem(Phone, personal.phone)}
                            {renderContactItem(MapPin, personal.location)}
                            {renderContactItem(Linkedin, personal.linkedin, true)}
                            {renderContactItem(Github, personal.github, true)}
                            {personal.portfolio && renderContactItem(Globe, personal.portfolio, true)}
                        </div>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="text-base font-bold uppercase tracking-wider text-blue-700 border-b border-blue-200 pb-1 mb-2">Skills</h2>
                            <ul className="space-y-1">
                                {skills.map((skill, index) => (
                                    <li key={index} className="flex justify-between items-center text-sm font-medium text-gray-700">
                                        <span className="truncate">{skill.name}</span>
                                        {renderSkillLevel(skill.level)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Education */}
                    {education.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="text-base font-bold uppercase tracking-wider text-blue-700 border-b border-blue-200 pb-1 mb-2">Education</h2>
                            <div className="space-y-3">
                                {education.map(item => (
                                    <div key={item.id}>
                                        <p className="font-extrabold text-sm text-gray-900 leading-tight">{item.degree}</p>
                                        <p className="text-xs text-gray-600">{item.institution}, {item.city}</p>
                                        <p className="text-[11px] text-gray-500">{formatDate(item.startDate)} - {item.endDate === 'Present' ? 'Present' : formatDate(item.endDate)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="text-base font-bold uppercase tracking-wider text-blue-700 border-b border-blue-200 pb-1 mb-2">Certifications</h2>
                            <div className="space-y-2">
                                {certifications.map(item => (
                                    <div key={item.id}>
                                        <p className="font-semibold text-sm leading-snug">{item.name}</p>
                                        <p className="text-xs text-gray-600">{item.authority}</p>
                                        <p className="text-[11px] text-gray-500">Issued: {formatDate(item.date)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interests */}
                    {interests && interests.trim() !== '' && (
                        <div className="space-y-2">
                            <h2 className="text-base font-bold uppercase tracking-wider text-blue-700 border-b border-blue-200 pb-1 mb-2">Interests</h2>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {interests.split(',').map((interest, index) => interest.trim() && (
                                    <span
                                        key={index}
                                        className="text-[10px] font-medium bg-white text-blue-600 rounded-lg px-2 py-0.5 inline-block border border-blue-300"
                                    >
                                        {interest.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column (Main Content) - 2/3 Width */}
                <div className="col-span-1 md:col-span-2 p-6 bg-white space-y-6">

                    {/* Header / Name and Title */}
                    <header className="pb-4 border-b-2 border-gray-200">
                        <h1 className="text-5xl font-extrabold tracking-tighter text-gray-900">{personal.name.toUpperCase()}</h1>
                        <p className="text-xl font-medium text-blue-700 mt-1">{personal.title}</p>
                    </header>
                    
                    {/* Summary / Profile */}
                    {summary && summary.trim() !== '' && (
                        <div>
                            {renderSectionTitle('Profile Summary', User)}
                            <p className="text-sm text-justify">{summary}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <div>
                            {renderSectionTitle('Professional Experience', Briefcase)}
                            <div className="space-y-5">
                                {experience.map(item => (
                                    <div key={item.id} className="relative">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h3 className="font-extrabold text-base text-gray-900 leading-snug">{item.title} at {item.company}</h3>
                                            <p className="text-xs text-gray-500 flex-shrink-0 ml-4">
                                                {formatDate(item.startDate)} - {formatDate(item.endDate)}
                                            </p>
                                        </div>
                                        {parseAndRenderDescription(item.description)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Projects */}
                    {projects.length > 0 && (
                        <div>
                            {renderSectionTitle('Key Projects', Code)}
                            <div className="space-y-4">
                                {projects.map(item => (
                                    <div key={item.id} className="relative">
                                        <h3 className="font-extrabold text-base text-gray-900 leading-snug">
                                            {item.name} 
                                            {item.role && <span className="font-normal italic text-gray-500 text-sm ml-2">({item.role})</span>}
                                        </h3>
                                        {item.url && (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block mb-1">
                                                <Globe className="inline w-3 h-3 mr-1 align-sub" /> 
                                                {item.url.replace(/^(https?:\/\/)?(www\.)?/i, '').split('/')[0]}
                                            </a>
                                        )}
                                        {parseAndRenderDescription(item.description)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default TemplateMinimalist;