import React from 'react';

// --- Re-define Data Types for the Template (Must match ResumeBuilder) ---
interface PersonalInfo { name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string; portfolio: string; }
interface ExperienceItem { id: string; title: string; company: string; startDate: string; endDate: string; description: string; }
interface EducationItem { id: string; degree: string; institution: string; city: string; startDate: string; endDate: string; description?: string; }
interface SkillItem { name: string; level: 'Beginner' | 'Intermediate' | 'Expert'; type: 'Technical' | 'Soft'; }
interface ProjectItem { id: string; name: string; role: string; description: string; url: string; }
interface CertificationItem { id: string; name: string; authority: string; date: string; }
interface AchievementItem { id: string; description: string; }
interface SectionConfig { id: string; name: string; icon: React.FC<any>; form: string; }


interface ResumeData {
    personal: PersonalInfo; summary: string; experience: ExperienceItem[]; education: EducationItem[]; skills: SkillItem[]; projects: ProjectItem[]; certifications: CertificationItem[]; achievements: AchievementItem[]; interests: string;
}

interface TemplateProps {
    data: ResumeData;
    sectionOrder: string[]; // <-- ADDED: For reordering
    allSections: SectionConfig[]; // <-- ADDED: For section names
}
// --- End Data Types ---

const TemplateBasic: React.FC<TemplateProps> = ({ data, sectionOrder, allSections }) => {
    const { personal, summary, experience, education, skills, projects, certifications, achievements, interests } = data;

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present';

    const renderHeader = () => (
        <div className="text-center pb-4 border-b border-gray-400 mb-4 font-sans">
            <h1 className="text-3xl font-bold uppercase tracking-wider mb-1 text-gray-900">{personal.name}</h1>
            <h2 className='text-lg font-medium text-blue-600 mb-2'>{personal.title}</h2>
            <div className="flex justify-center space-x-4 text-sm text-gray-700">
                {personal.phone && <p>{personal.phone}</p>}
                {personal.email && <p className='border-l border-r px-4 border-gray-300'>{personal.email}</p>}
                {personal.linkedin && <p>{personal.linkedin.split('/').pop()}</p>}
            </div>
        </div>
    );

    const renderSection = (title: string, content: React.ReactNode) => (
        <div className="mb-6">
            <h2 className="text-xl font-bold uppercase border-b-2 border-gray-500 pb-1 mb-3">{title}</h2>
            {content}
        </div>
    );
    
    // --- Section Render Map ---
    const sectionMap: { [key: string]: React.ReactNode | null } = {
        personal: null, // Rendered in header
        summary: summary ? renderSection('Professional Summary', <p className="text-justify">{summary}</p>) : null,

        experience: experience.length > 0 ? renderSection('Experience', (
            <div className="space-y-4">
                {experience.map(item => (
                    <div key={item.id}>
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-base">{item.title} at {item.company}</h3>
                            <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                                {formatDate(item.startDate)} - {item.endDate}
                            </p>
                        </div>
                        <ul className="list-disc ml-5 text-sm">
                            {item.description.split(/[.!?\n]/).map((bullet, idx) => bullet.trim() && <li key={idx}>{bullet.trim()}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        )) : null,

        education: education.length > 0 ? renderSection('Education', (
            <div className="space-y-3">
                {education.map(item => (
                    <div key={item.id} className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold">{item.degree}</h3>
                            <p className="text-sm text-gray-700">{item.institution}, {item.city}</p>
                            {item.description && <p className="text-xs italic text-gray-600 mt-1">{item.description}</p>}
                        </div>
                        <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                            {formatDate(item.startDate)} - {item.endDate}
                        </p>
                    </div>
                ))}
            </div>
        )) : null,
        
        skills: skills.length > 0 ? renderSection('Skills', (
            <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium border border-gray-300">
                        {skill.name}
                    </span>
                ))}
            </div>
        )) : null,

        projects: projects.length > 0 ? renderSection('Projects', (
            <div className="space-y-3">
                {projects.map(item => (
                    <div key={item.id}>
                        <h3 className="font-bold">{item.name} ({item.role})</h3>
                        <p className="text-xs text-blue-600 hover:underline">{item.url}</p>
                        <p className="text-sm mt-1">{item.description}</p>
                    </div>
                ))}
            </div>
        )) : null,

        certifications: certifications.length > 0 ? renderSection('Certifications', (
            <div className="space-y-3">
                {certifications.map(item => (
                    <div key={item.id}>
                        <p className="font-bold">{item.name} ({item.authority})</p>
                        <p className="text-xs text-gray-600">{item.date}</p>
                    </div>
                ))}
            </div>
        )) : null,

        achievements: achievements.length > 0 ? renderSection('Key Achievements', (
            <ul className="list-disc ml-5 text-sm space-y-1">
                {achievements.map(item => (
                    <li key={item.id}>{item.description}</li>
                ))}
            </ul>
        )) : null,

        interests: interests.trim() ? renderSection('Interests', (
            <p className="text-sm">{interests}</p>
        )) : null,
    };
    // --- End Section Render Map ---


    return (
        <div className="font-sans text-gray-800 text-sm p-4 leading-normal">
            {renderHeader()}

            {/* Iterate over the ordered sections */}
            {sectionOrder.map(sectionId => (
                <React.Fragment key={sectionId}>
                    {sectionId !== 'personal' && sectionMap[sectionId]}
                </React.Fragment>
            ))}
        </div>
    );
};

export default TemplateBasic;