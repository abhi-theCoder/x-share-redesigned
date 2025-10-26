import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

// --- Re-define Data Types (Copied from user's second code block for completeness) ---
interface PersonalInfo { name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string; portfolio: string; }
interface ExperienceItem { id: string; title: string; company: string; startDate: string; endDate: string; description: string; }
interface EducationItem { id: string; degree: string; institution: string; city: string; startDate: string; endDate: string; description?: string; }
interface SkillItem { name: string; level: 'Beginner' | 'Intermediate' | 'Expert'; type: 'Technical' | 'Soft'; }
interface ProjectItem { id: string; name: string; role: string; description: string; url: string; }
interface CertificationItem { id: string; name: string; authority: string; date: string; }

interface ResumeData {
    personal: PersonalInfo;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillItem[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
    achievements: any[]; // Retaining original type structure
    interests: string;
}

interface TemplateProps {
    data: ResumeData;
    // Keeping sectionOrder for potential future use, though not used in this fixed template
    sectionOrder?: string[]; 
}
// --- End Data Types ---

const TemplateModern: React.FC<TemplateProps> = ({ data }) => {
    // UPDATED: Destructuring to include new sections
    const { personal, summary, experience, education, skills, projects, certifications, interests } = data;

    const formatDate = (date: string) => {
        if (!date) return 'Present';
        // Handle YYYY-MM format from date inputs
        const dateParts = date.split('-');
        if (dateParts.length === 2 && dateParts[1].length === 2) {
            return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        }
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    const renderContactItem = (Icon: React.FC<any>, content: string | undefined, isLink: boolean = false) => (
        content ? (
            <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Icon className="w-3 h-3 text-blue-500" />
                <span className={isLink ? 'text-blue-600 hover:underline cursor-pointer' : ''}>{content}</span>
            </div>
        ) : null
    );

    const renderSectionTitle = (title: string) => (
        <div className="flex items-center space-x-2 mb-3">
            <div className="w-2 h-4 bg-blue-500"></div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800">{title}</h2>
        </div>
    );

    return (
        <div className="font-sans text-gray-700 text-sm p-6 leading-relaxed">
            
            {/* Header / Name */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b-4 border-blue-500">
                <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900">{personal.name.toUpperCase()}</h1>
                <div className="flex flex-col space-y-1 items-end">
                    {renderContactItem(Mail, personal.email)}
                    {renderContactItem(Phone, personal.phone)}
                    {renderContactItem(MapPin, personal.location)}
                    {personal.linkedin && renderContactItem(Linkedin, personal.linkedin.split('/').pop())}
                    {personal.github && renderContactItem(Github, personal.github.split('/').pop())}
                    {personal.portfolio && renderContactItem(Globe, personal.portfolio.replace(/^(https?:\/\/)?(www\.)?/i, '').split('/')[0], true)}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-5 gap-6">

                {/* Left Column (Main) - 4/5 width */}
                <div className="col-span-4 space-y-6">
                    
                    {/* Summary */}
                    {summary && summary.trim() !== '' && (
                        <div>
                            {renderSectionTitle('Profile')}
                            <p className="text-justify">{summary}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <div>
                            {renderSectionTitle('Experience')}
                            <div className="space-y-4 ml-2 border-l border-gray-300 pl-4">
                                {experience.map(item => (
                                    <div key={item.id} className="relative">
                                        <div className="absolute -left-[22px] top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <h3 className="font-extrabold text-base">{item.title}</h3>
                                        <p className="text-sm italic text-gray-600">{item.company}</p>
                                        <p className="text-xs text-gray-500 mb-1">{formatDate(item.startDate)} - {item.endDate === 'Present' ? 'Present' : formatDate(item.endDate)}</p>
                                        <ul className="list-disc ml-5 text-sm">
                                            {item.description.split(/[.!?]/).map((bullet, idx) => bullet.trim() && <li key={idx}>{bullet.trim()}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* NEW: Projects */}
                    {projects.length > 0 && (
                        <div>
                            {renderSectionTitle('Projects')}
                            <div className="space-y-4 ml-2 border-l border-gray-300 pl-4">
                                {projects.map(item => (
                                    <div key={item.id} className="relative">
                                        <div className="absolute -left-[22px] top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <h3 className="font-extrabold text-base mb-0.5">
                                            {item.name} 
                                            {item.role && <span className="font-normal italic text-gray-500 text-sm ml-2">({item.role})</span>}
                                        </h3>
                                        {item.url && (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline block mb-1">
                                                <Globe className="inline w-3 h-3 mr-1 align-sub" /> 
                                                {item.url.replace(/^(https?:\/\/)?(www\.)?/i, '').split('/')[0]}
                                            </a>
                                        )}
                                        <ul className="list-disc ml-5 text-sm">
                                            {item.description.split(/[.!?]/).map((bullet, idx) => bullet.trim() && <li key={idx}>{bullet.trim()}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column (Sidebar) - 1/5 width */}
                <div className="col-span-1 space-y-6">

                    {/* Skills */}
                    {skills.length > 0 && (
                    <div className="mb-4">
                        {renderSectionTitle('Skills')}
                        <ul className="flex flex-wrap">
                        {skills.map((skill, index) => (
                            <li
                            key={index}
                            className="text-xs font-medium bg-gray-100 rounded-full px-2 py-0.5 inline-block mr-1 mb-1"
                            >
                            {skill.name}
                            {skill.level && (
                                <span className="text-gray-500 text-[10px] ml-1">
                                ({skill.level.charAt(0)})
                                </span>
                            )}
                            </li>
                        ))}
                        </ul>
                    </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <div>
                            {renderSectionTitle('Education')}
                            <div className="space-y-3">
                                {education.map(item => (
                                    <div key={item.id}>
                                        <p className="font-semibold text-xs">{item.degree}</p>
                                        <p className="text-xs text-gray-600">{item.institution}</p>
                                        <p className="text-xs text-gray-500">{formatDate(item.startDate)} - {item.endDate === 'Present' ? 'Present' : formatDate(item.endDate)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* NEW: Certifications */}
                    {certifications.length > 0 && (
                        <div>
                            {renderSectionTitle('Certifications')}
                            <div className="space-y-3">
                                {certifications.map(item => (
                                    <div key={item.id}>
                                        <p className="font-semibold text-xs">{item.name}</p>
                                        <p className="text-xs text-gray-600">{item.authority}</p>
                                        <p className="text-xs text-gray-500">Issued: {formatDate(item.date)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* NEW: Interests */}
                    {interests && interests.trim() !== '' && (
                        <div>
                            {renderSectionTitle('Interests')}
                            <div className="flex flex-wrap gap-1 mt-1">
                                {interests.split(',').map((interest, index) => interest.trim() && (
                                    <span
                                        key={index}
                                        className="text-[10px] font-medium bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 inline-block border border-blue-200"
                                    >
                                        {interest.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default TemplateModern;
