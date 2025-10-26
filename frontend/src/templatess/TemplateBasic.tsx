import React from 'react';

// --- Re-define Data Types for the Template (Updated to match ResumeBuilder.txt) ---
interface PersonalInfo { name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string; portfolio: string; }
interface ExperienceItem { id: string; title: string; company: string; startDate: string; endDate: string; description: string; }
interface EducationItem { id: string; degree: string; institution: string; city: string; startDate: string; endDate: string; description?: string; }
interface SkillItem { name: string; level: 'Beginner' | 'Intermediate' | 'Expert'; type: 'Technical' | 'Soft'; }
// Using the assumed types from the main builder file:
interface ProjectItem { id: string; name: string; role: string; description: string; url: string; }
interface CertificationItem { id: string; name: string; authority: string; date: string; }

interface ResumeData {
    personal: PersonalInfo;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillItem[];
    // Corrected types:
    projects: ProjectItem[];
    certifications: CertificationItem[];
    achievements: any[]; // Kept as any[]
    interests: string;
}

interface TemplateProps {
    data: ResumeData;
    // Section order is passed from the main component but not strictly used in this basic template
    // as it renders sections in a fixed order, but it's good practice to accept it.
    sectionOrder?: string[]; 
}
// --- End Data Types ---

const TemplateBasic: React.FC<TemplateProps> = ({ data }) => {
    // Destructure only basic items; access new sections via data.projects, data.certifications, etc.
    const { personal, summary, experience, education, skills } = data;

    const formatDate = (date: string) => {
        if (!date) return 'Present';
        // Attempt to parse as month input (YYYY-MM) first, then assume full date if not
        const dateParts = date.split('-');
        if (dateParts.length === 2 && dateParts[1].length === 2) {
            return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        }
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    const renderHeader = () => (
        <div className="text-center pb-4 border-b border-gray-400 mb-4 font-sans">
            <h1 className="text-3xl font-bold uppercase tracking-wider mb-1 text-gray-900">{personal.name}</h1>
            <h2 className='text-lg font-medium text-blue-600 mb-2'>{personal.title}</h2>
            <div className="flex justify-center space-x-4 text-sm text-gray-700">
                {personal.phone && <p>{personal.phone}</p>}
                {personal.email && <p className='border-l border-r px-4 border-gray-300'>{personal.email}</p>}
                {personal.linkedin && <p>{personal.linkedin.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//i, '').split('/')[0]}</p>}
            </div>
        </div>
    );

    const renderSection = (title: string, content: React.ReactNode) => {
        // Only render section if content is meaningful (e.g., not an empty array or a blank string)
        if (Array.isArray(content) && content.length === 0) return null;
        if (typeof content === 'string' && content.trim() === '') return null;
        if (!content) return null;

        return (
            <div className="mb-6">
                <h2 className="text-xl font-bold uppercase border-b-2 border-gray-500 pb-1 mb-3">{title}</h2>
                {content}
            </div>
        );
    }

    return (
        <div className="font-sans text-gray-800 text-sm p-4 leading-normal">
            {renderHeader()}

            {/* 1. Summary */}
            {summary && renderSection('Professional Summary', <p className="text-justify">{summary}</p>)}

            {/* 2. Experience */}
            {experience.length > 0 && renderSection('Experience', (
                <div className="space-y-4">
                    {experience.map(item => (
                        <div key={item.id}>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-base">{item.title} at {item.company}</h3>
                                <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                                    {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : 'Present'}
                                </p>
                            </div>
                            <ul className="list-disc ml-5 text-sm">
                                {/* Simple split by period to mock bullet points */}
                                {item.description.split(/[.!?]/).map((bullet, idx) => bullet.trim() && <li key={idx}>{bullet.trim()}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            ))}

            {/* 3. Education */}
            {education.length > 0 && renderSection('Education', (
                <div className="space-y-3">
                    {education.map(item => (
                        <div key={item.id} className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold">{item.degree}</h3>
                                <p className="text-sm text-gray-700">{item.institution}, {item.city}</p>
                            </div>
                            <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                                {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : ''}
                            </p>
                        </div>
                    ))}
                </div>
            ))}

            {/* 4. Projects (NEW SECTION) */}
            {data.projects.length > 0 && renderSection('Projects', (
                <div className="space-y-3">
                    {data.projects.map(item => (
                        <div key={item.id}>
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-base">{item.name} {item.role && `(${item.role})`}</h3>
                                {item.url && (
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className='text-xs text-blue-600 hover:underline'>
                                        Link
                                    </a>
                                )}
                            </div>
                            <p className="text-sm text-gray-700">{item.description}</p>
                        </div>
                    ))}
                </div>
            ))}

            {/* 5. Certifications (NEW SECTION) */}
            {data.certifications.length > 0 && renderSection('Certifications', (
                <div className="space-y-3">
                    {data.certifications.map(item => (
                        <div key={item.id} className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-sm text-gray-700">{item.authority}</p>
                            </div>
                            <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                                {formatDate(item.date)}
                            </p>
                        </div>
                    ))}
                </div>
            ))}

            {/* 6. Skills */}
            {skills.length > 0 && renderSection('Skills', (
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium border border-gray-300">
                            {skill.name}
                        </span>
                    ))}
                </div>
            ))}
            
            {/* 7. Interests (NEW SECTION) */}
            {data.interests && renderSection('Interests', (
                <p className="text-justify">{data.interests}</p>
            ))}
        </div>
    );
};

export default TemplateBasic;