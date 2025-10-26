import React from 'react';

// Define the required data structure locally for the component to be self-contained
interface PersonalInfo { name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string; portfolio: string; }
interface ExperienceItem { id: string; title: string; company: string; startDate: string; endDate: string; description: string; }
interface EducationItem { id: string; degree: string; institution: string; city: string; startDate: string; endDate: string; description?: string; }
interface SkillItem { id?: string; name: string; level: 'Beginner' | 'Intermediate' | 'Expert' | ''; type: 'Technical' | 'Soft' | ''; }
interface ProjectItem { id: string; name: string; role: string; description: string; url: string; }

interface ResumeData {
    personal: PersonalInfo;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillItem[];
    projects: ProjectItem[]; // Added projects
    certifications: { id: string; name: string; issuer: string; date: string; }[]; // Added certifications
    awards: { id: string; name: string; date: string; description: string; }[]; // Added awards
}

interface TemplateProps {
    data: ResumeData;
}

const TemplateProfessional: React.FC<TemplateProps> = ({ data }) => {
    // Destructure all expected fields, including the new ones
    const { personal, summary, experience, education, skills, projects, certifications, awards } = data;

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present';

    const renderHeader = () => (
        <div className="pb-3 border-b-2 border-blue-600 mb-4">
            <h1 className="text-4xl font-light text-gray-900 mb-0">{personal.name.toUpperCase()}</h1>
            {/* Include professional title below the name */}
            {personal.title && <h2 className="text-xl font-medium text-blue-700 mt-0 mb-2">{personal.title}</h2>}
            
            <div className="flex flex-wrap items-center text-sm text-gray-600 space-x-4">
                <p className="flex items-center space-x-1"><span className="text-blue-600">📧</span><span>{personal.email}</span></p>
                {personal.phone && <p className="flex items-center space-x-1"><span className="text-blue-600">📞</span><span>{personal.phone}</span></p>}
                {personal.location && <p className="flex items-center space-x-1"><span className="text-blue-600">📍</span><span>{personal.location}</span></p>}
            </div>
            <div className="flex flex-wrap items-center text-sm text-blue-600 space-x-4 mt-1">
                {personal.linkedin && <a href={`https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className='hover:underline'>{personal.linkedin.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/(in\/)?/, '').replace(/\/$/, '')}</a>}
                {personal.github && <a href={`https://${personal.github}`} target="_blank" rel="noopener noreferrer" className='hover:underline'>{personal.github.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '').replace(/\/$/, '')}</a>}
                {personal.portfolio && <a href={`https://${personal.portfolio}`} target="_blank" rel="noopener noreferrer" className='hover:underline'>Portfolio</a>}
            </div>
        </div>
    );

    const renderSectionTitle = (title: string) => (
        <h2 className="text-lg font-bold text-blue-600 uppercase border-b border-gray-300 pb-1 mb-3 mt-4 tracking-wider">{title}</h2>
    );

    const parseAndRenderDescription = (description: string) => {
        // Simple logic to parse description into bullet points if it contains periods/sentences
        const sentences = description.split(/[\.!\?]\s/).filter(s => s.trim().length > 0);
        
        if (sentences.length > 1 || description.includes('\n')) {
            // It looks like multiple points, treat as list
            return (
                <ul className="list-disc ml-5 text-sm mt-1 space-y-1">
                    {sentences.map((bullet, idx) => <li key={idx}>{bullet.trim()}</li>)}
                </ul>
            );
        }
        
        // Otherwise, treat as a paragraph
        return <p className="text-sm mt-1">{description}</p>;
    };


    return (
        <div className="font-sans text-gray-800 text-sm p-6 leading-normal bg-white shadow-lg print:shadow-none">
            {renderHeader()}

            {/* Summary */}
            {summary && (
                <div className="mb-4">
                    {renderSectionTitle('Professional Summary')}
                    <p className="text-justify">{summary}</p>
                </div>
            )}

            <div className="grid grid-cols-4 gap-6">
                {/* Main Content (3/4 width) */}
                <div className="col-span-4 md:col-span-3">
                    
                    {/* Experience */}
                    {experience.length > 0 && (
                        <div className="mb-6">
                            {renderSectionTitle('Work Experience')}
                            <div className="space-y-4">
                                {experience.map(item => (
                                    <div key={item.id}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-extrabold text-base text-gray-900">{item.title}</h3>
                                                <p className="text-sm italic text-gray-600">{item.company}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium whitespace-nowrap text-right pt-1">
                                                {formatDate(item.startDate)} - {item.endDate === 'Present' ? 'Present' : formatDate(item.endDate)}
                                            </p>
                                        </div>
                                        {parseAndRenderDescription(item.description)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Projects */}
                    {projects?.length > 0 && (
                        <div className="mb-6">
                            {renderSectionTitle('Key Projects')}
                            <div className="space-y-4">
                                {projects.map(item => (
                                    <div key={item.id}>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-extrabold text-base text-gray-900">{item.name}</h3>
                                            {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-medium hover:underline ml-2 pt-1">View Project</a>}
                                        </div>
                                        {item.role && <p className="text-sm italic text-gray-600 mb-1">{item.role}</p>}
                                        {parseAndRenderDescription(item.description)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Awards/Certifications can be added here if needed */}

                </div>

                {/* Sidebar (1/4 width) */}
                <div className="col-span-4 md:col-span-1 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 border-gray-200">
                    
                    {/* Skills */}
                    {skills.length > 0 && (
                        <div className="mb-6">
                            {renderSectionTitle('Skills')}
                            <ul className="flex flex-wrap -mr-1">
                            {skills.map((skill, index) => (
                                <li
                                key={index}
                                className="text-xs font-medium bg-gray-100 text-gray-700 rounded-lg px-2 py-1 inline-block mr-1 mb-1 border border-gray-200"
                                >
                                {skill.name}
                                {skill.level && skill.level !== 'Beginner' && (
                                    <span className={`text-[10px] ml-1 font-semibold ${skill.level === 'Expert' ? 'text-blue-600' : 'text-gray-500'}`}>
                                    ({skill.level})
                                    </span>
                                )}
                                </li>
                            ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Education */}
                    {education.length > 0 && (
                        <div className="mb-6">
                            {renderSectionTitle('Education')}
                            <div className="space-y-3">
                                {education.map(item => (
                                    <div key={item.id}>
                                        <p className="font-bold text-sm text-gray-900">{item.degree}</p>
                                        <p className="text-xs text-gray-700 italic">{item.institution}</p>
                                        <p className="text-xs text-gray-500">{item.city}</p>
                                        <p className="text-xs text-gray-500 font-medium">{formatDate(item.startDate)} - {item.endDate === 'Present' ? 'Present' : formatDate(item.endDate)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {certifications?.length > 0 && (
                        <div className="mb-6">
                            {renderSectionTitle('Certifications')}
                            <div className="space-y-3">
                                {certifications.map(item => (
                                    <div key={item.id}>
                                        <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-700 italic">{item.issuer}</p>
                                        <p className="text-xs text-gray-500 font-medium">{formatDate(item.date)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Awards */}
                    {awards?.length > 0 && (
                        <div className="mb-6">
                            {renderSectionTitle('Awards')}
                            <div className="space-y-3">
                                {awards.map(item => (
                                    <div key={item.id}>
                                        <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-700 italic">{item.description}</p>
                                        <p className="text-xs text-gray-500 font-medium">{formatDate(item.date)}</p>
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

export default TemplateProfessional;
