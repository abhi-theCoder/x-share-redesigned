import React from 'react';
import { Mail, Phone, Globe, Linkedin, Github, Award, Code } from 'lucide-react';

// --- Re-define Data Types (Complete Structure) ---
interface PersonalInfo { name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string; portfolio: string; }
interface ExperienceItem { id: string; title: string; company: string; startDate: string; endDate: string; description: string; }
interface EducationItem { id: string; degree: string; institution: string; city: string; startDate: string; endDate: string; description?: string; }
// Assuming full SkillItem structure for type checking
interface SkillItem { id?: string; name: string; level: 'Beginner' | 'Intermediate' | 'Expert'; type: 'Technical' | 'Soft'; }
interface ProjectItem { id: string; name: string; role: string; description: string; url: string; }
interface CertificationItem { id: string; name: string; authority: string; date: string; }

// Updated ResumeData to include all required sections
interface ResumeData {
    personal: PersonalInfo;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillItem[];
    projects: ProjectItem[]; // ADDED
    certifications: CertificationItem[]; // ADDED
    achievements: any[];
    interests: string; // ADDED
}
// --- End Data Types ---

// Define a type for the required icons
type ContactIcon = typeof Mail | typeof Phone | typeof Globe | typeof Linkedin | typeof Github;

interface TemplateProps {
    data: ResumeData;
}

const TemplatePhylisFlex: React.FC<TemplateProps> = ({ data }) => {
    // UPDATED: Destructuring to include new sections
    const { personal, summary, experience, education, skills, projects, certifications, interests } = data;

    // A helper function to format dates to the 'YYYY-YYYY' or 'YYYY-Present' style used in the image
    const formatYearRange = (start: string, end: string | undefined): string => {
        const startYear = start ? new Date(start).getFullYear() : '';
        const endYear = end === 'Present' || !end ? 'Present' : new Date(end).getFullYear();

        if (startYear && endYear !== 'Present') {
            return `${startYear}-${endYear}`;
        }
        return `${startYear} - ${endYear}`;
    };

    // A helper function to render a contact item
    const renderContactItem = (Icon: ContactIcon, content: string | undefined, isLink: boolean = false) => (
        content ? (
            <div className="flex items-center space-x-2 text-xs text-gray-700">
                <Icon className="w-3 h-3 text-gray-500" /> 
                {/* Clean up URL display: show only the domain or username */}
                <span className={isLink ? "underline hover:text-gray-900 cursor-pointer" : ""}>
                    {content
                        .replace(/https?:\/\/(www\.)?/, '')
                        .replace(/\/in\//, '') // For LinkedIn
                        .split('/')[0] // Get base path/username
                    }
                </span>
            </div>
        ) : null
    );

    // Renders a section title for the left column sections (CONTACT, EDUCATION, SKILLS)
    const renderLeftSectionTitle = (title: string) => (
        <h2 className="text-xl font-bold uppercase tracking-tight text-gray-700 mb-4">{title}</h2>
    );

    // Renders a bullet point for the timeline structure
    const TimelineBullet = () => (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-500 border-2 border-white"></div>
    );


    return (
        <div className="font-sans text-gray-700 text-sm leading-snug max-w-[8.5in] mx-auto bg-white shadow-lg print:shadow-none">
            
            {/* Top Area: Name, Title, and Photo. */}
            <div className="relative h-40 mb-20"> 
                {/* Left Gray Area with a diagonal cut (mimicked with a slanted div) */}
                {/* Using a larger skew and ensuring the right side is covered by the two divs */}
                <div className="absolute top-0 left-0 w-[50%] h-40 bg-gray-100 transform -skew-x-12 origin-top-left z-0"></div>
                <div className="absolute top-0 left-[48%] w-[52%] h-40 bg-gray-100 z-0"></div>
                
                {/* Name and Title */}
                <div className="absolute top-10 left-10 z-10 text-gray-800">
                    <h1 className="text-4xl font-extrabold tracking-tight">{personal.name.toUpperCase()}</h1>
                    <p className="text-base font-medium uppercase tracking-widest mt-1">{personal.title || 'Professional Title'}</p>
                </div>
                {/* Photo (fixed position) */}
                <div className="absolute top-5 right-10 z-10 w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-xs">
                    </div>
                </div>
            </div>

            {/* Main Content: Two Columns */}
            <div className="grid grid-cols-[35%_65%] gap-x-6 p-10 pt-0">

                {/* Left Column (Contact, Education, Skills, Certifications, Interests) */}
                <div className="space-y-6">

                    {/* CONTACT */}
                    <div className="mb-4">
                        {renderLeftSectionTitle('Contact')}
                        <div className="space-y-3">
                            {renderContactItem(Phone, personal.phone)}
                            {renderContactItem(Mail, personal.email)}
                            {personal.portfolio && renderContactItem(Globe, personal.portfolio, true)}
                            {personal.linkedin && renderContactItem(Linkedin, personal.linkedin, true)}
                            {personal.github && renderContactItem(Github, personal.github, true)}
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 w-full"></div> {/* Separator */}

                    {/* EDUCATION */}
                    {education.length > 0 && (
                        <div>
                            {renderLeftSectionTitle('Education')}
                            <div className="space-y-4 relative ml-0 pl-4 border-l-2 border-gray-300">
                                {education.map(item => (
                                    <div key={item.id} className="relative">
                                        <TimelineBullet />
                                        <p className="font-bold text-sm">{item.degree}</p>
                                        <p className="text-xs text-gray-600 italic">{item.institution}</p>
                                        <p className="text-xs text-gray-500">{formatYearRange(item.startDate, item.endDate)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-gray-200 w-full"></div> {/* Separator */}

                    {/* SKILLS */}
                    {skills.length > 0 && (
                        <div>
                            {renderLeftSectionTitle('Skills')}
                            <div className="mb-2">
                                <h4 className="text-xs font-semibold uppercase text-gray-600 mb-1">Technical & Professional</h4>
                                <ul className="list-disc ml-5 space-y-1">
                                    {skills.map((skill, index) => (
                                        <li key={index} className="text-sm">
                                            {skill.name} 
                                            {skill.level && <span className='text-xs text-gray-500'> ({skill.level.charAt(0)})</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-gray-200 w-full"></div> {/* Separator */}

                    {/* NEW: CERTIFICATIONS */}
                    {certifications.length > 0 && (
                        <div>
                            {renderLeftSectionTitle('Certifications')}
                            <div className="space-y-3">
                                {certifications.map(item => (
                                    <div key={item.id}>
                                        <div className='flex items-center space-x-1'>
                                            <Award className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                            <p className="font-bold text-sm leading-tight">{item.name}</p>
                                        </div>
                                        <p className="text-xs text-gray-600 ml-4">{item.authority}</p>
                                        <p className="text-xs text-gray-500 ml-4">Issued: {formatYearRange(item.date, undefined).replace(' - Present', '')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-gray-200 w-full"></div> {/* Separator */}

                    {/* NEW: INTERESTS */}
                    {interests && interests.trim() !== '' && (
                        <div>
                            {renderLeftSectionTitle('Interests')}
                            <p className="text-sm">{interests}</p>
                        </div>
                    )}
                </div>


                {/* Right Column (Profile/Summary, Experience, Projects) */}
                <div className="space-y-8">

                    {/* PROFILE / SUMMARY */}
                    {summary && summary.trim() !== '' && (
                        <div>
                            {renderLeftSectionTitle('Profile')}
                            <p className="text-sm">{summary}</p>
                        </div>
                    )}

                    {/* EXPERIENCE */}
                    {experience.length > 0 && (
                        <div>
                            {renderLeftSectionTitle('Experience')}
                            <div className="space-y-6 relative ml-0 pl-4 border-l-2 border-gray-300">
                                {experience.map(item => (
                                    <div key={item.id} className="relative">
                                        <TimelineBullet />
                                        {/* Date/Year on top, aligned with the bullet */}
                                        <p className="text-xs font-semibold uppercase text-gray-500 absolute top-0 -left-20">{formatYearRange(item.startDate, item.endDate)}</p> 
                                        
                                        <h3 className="font-bold text-base text-gray-800">{item.title}</h3>
                                        <p className="font-semibold text-sm italic text-gray-600 mb-2">{item.company}</p>
                                        
                                        <ul className="list-disc ml-5 text-sm space-y-1">
                                            {item.description.split(/[.!?]/).map((bullet, idx) => 
                                                bullet.trim() && <li key={idx} className="marker:text-gray-500">{bullet.trim()}</li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* NEW: PROJECTS */}
                    {projects.length > 0 && (
                        <div>
                            {renderLeftSectionTitle('Projects')}
                            <div className="space-y-6 relative ml-0 pl-4 border-l-2 border-gray-300">
                                {projects.map(item => (
                                    <div key={item.id} className="relative">
                                        <TimelineBullet />
                                        
                                        <h3 className="font-bold text-base text-gray-800">{item.name}</h3>
                                        {item.role && <p className="font-semibold text-sm italic text-gray-600 mb-1">{item.role}</p>}
                                        
                                        {item.url && (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-900 flex items-center mb-2">
                                                <Code className="w-3 h-3 mr-1" />
                                                {item.url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}
                                            </a>
                                        )}
                                        
                                        <ul className="list-disc ml-5 text-sm space-y-1">
                                            {item.description.split(/[.!?]/).map((bullet, idx) => 
                                                bullet.trim() && <li key={idx} className="marker:text-gray-500">{bullet.trim()}</li>
                                            )}
                                        </ul>
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

export default TemplatePhylisFlex;
