import React from 'react';
// Assuming same type definitions as TemplateBasic for brevity
// import { ResumeData } from '../ResumeBuilder'; 

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


const TemplateProfessional: React.FC<TemplateProps> = ({ data, sectionOrder, allSections }) => {
    const { personal, summary, experience, education, skills, projects, certifications, achievements, interests } = data;

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present';

    const renderHeader = () => (
        <div className="pb-3 border-b-2 border-blue-600 mb-4">
            <h1 className="text-4xl font-light text-gray-900 mb-1">{personal.name.toUpperCase()}</h1>
            <h2 className='text-lg font-bold text-gray-700'>{personal.title}</h2>
            <div className="flex flex-wrap items-center text-sm text-gray-600 space-x-4 mt-2">
                <p className="flex items-center space-x-1"><span className="text-blue-600">📧</span><span>{personal.email}</span></p>
                {personal.phone && <p className="flex items-center space-x-1"><span className="text-blue-600">📞</span><span>{personal.phone}</span></p>}
                {personal.location && <p className="flex items-center space-x-1"><span className="text-blue-600">📍</span><span>{personal.location}</span></p>}
            </div>
            <div className="flex flex-wrap items-center text-sm text-blue-600 space-x-4 mt-1">
                {personal.linkedin && <a href={`https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className='hover:underline'>{personal.linkedin.split('/').pop()}</a>}
                {personal.github && <a href={`https://${personal.github}`} target="_blank" rel="noopener noreferrer" className='hover:underline'>{personal.github.split('/').pop()}</a>}
            </div>
        </div>
    );

    const renderSectionTitle = (title: string) => (
        <h2 className="text-lg font-bold text-blue-600 uppercase border-b border-gray-300 pb-1 mb-3 mt-4">{title}</h2>
    );
    
    // --- Section Render Maps ---
    
    // Sections that appear in the main (3/4) column
    const mainSectionMap: { [key: string]: React.ReactNode | null } = {
        summary: summary ? (
            <div className="mb-4">
                {renderSectionTitle('Summary')}
                <p className="text-justify">{summary}</p>
            </div>
        ) : null,

        experience: experience.length > 0 ? (
            <div className="mb-4">
                {renderSectionTitle('Work Experience')}
                <div className="space-y-4">
                    {experience.map(item => (
                        <div key={item.id}>
                            <div className="flex justify-between items-start">
                                <h3 className="font-extrabold text-base">{item.title}</h3>
                                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">{item.company}, {formatDate(item.startDate)} - {item.endDate === 'Present' ? 'Present' : formatDate(item.endDate)}</p>
                            </div>
                            <ul className="list-disc ml-5 text-sm mt-1">
                                {item.description.split('. ').map((bullet, idx) => bullet.trim() && <li key={idx}>{bullet.trim()}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        projects: projects.length > 0 ? (
            <div className="mb-4">
                {renderSectionTitle('Projects')}
                <div className="space-y-3">
                    {projects.map(item => (
                        <div key={item.id}>
                            <h3 className="font-extrabold text-sm">{item.name} ({item.role})</h3>
                            <p className="text-xs text-blue-600 hover:underline">{item.url}</p>
                            <p className="text-sm mt-1">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        achievements: achievements.length > 0 ? (
            <div className="mb-4">
                {renderSectionTitle('Key Achievements')}
                <ul className="list-disc ml-5 text-sm space-y-1">
                    {achievements.map(item => (
                        <li key={item.id}>{item.description}</li>
                    ))}
                </ul>
            </div>
        ) : null,
    };

    // Sections that appear in the sidebar (1/4) column
    const sidebarSectionMap: { [key: string]: React.ReactNode | null } = {
        education: education.length > 0 ? (
            <div className="mb-4">
                {renderSectionTitle('Education')}
                <div className="space-y-3">
                    {education.map(item => (
                        <div key={item.id}>
                            <p className="font-semibold text-xs">{item.degree}</p>
                            <p className="text-xs text-gray-700 italic">{item.institution}</p>
                            <p className="text-xs text-gray-500">{item.city}</p>
                            <p className="text-xs text-gray-500">{formatDate(item.startDate)} - {item.endDate === 'Present' ? 'Present' : formatDate(item.endDate)}</p>
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        skills: skills.length > 0 ? (
            <div className="mb-4">
                {renderSectionTitle('Skills')}
                <ul className="flex flex-wrap">
                    {skills.map((skill, index) => (
                        <li
                            key={index}
                            className="text-xs font-medium bg-gray-100 rounded-full px-2 py-0.5 inline-block mr-1 mb-1"
                        >
                            {skill.name}
                        </li>
                    ))}
                </ul>
            </div>
        ) : null,

        certifications: certifications.length > 0 ? (
            <div className="mb-4">
                {renderSectionTitle('Certifications')}
                <div className="space-y-2">
                    {certifications.map(item => (
                        <div key={item.id}>
                            <p className="font-semibold text-xs">{item.name}</p>
                            <p className="text-xs text-gray-600">{item.authority}</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        interests: interests.trim() ? (
            <div className="mb-4">
                {renderSectionTitle('Interests')}
                <p className="text-xs">{interests}</p>
            </div>
        ) : null,
    };
    // --- End Section Render Maps ---

    // Separate sections into main and sidebar order
    const mainColumnSections = sectionOrder.filter(id => id in mainSectionMap);
    const sidebarSections = sectionOrder.filter(id => id in sidebarSectionMap);


    return (
        <div className="font-serif text-gray-800 text-sm p-4 leading-relaxed">
            {renderHeader()}

            <div className="grid grid-cols-4 gap-6">
                {/* Main Content (3/4 width) */}
                <div className="col-span-3">
                    {mainColumnSections.map(sectionId => (
                        <React.Fragment key={sectionId}>
                            {mainSectionMap[sectionId]}
                        </React.Fragment>
                    ))}
                </div>

                {/* Sidebar (1/4 width) */}
                <div className="col-span-1 border-l pl-4 border-gray-200">
                    {sidebarSections.map(sectionId => (
                        <React.Fragment key={sectionId}>
                            {sidebarSectionMap[sectionId]}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateProfessional;