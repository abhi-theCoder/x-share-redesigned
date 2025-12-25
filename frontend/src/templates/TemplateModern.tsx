import React from 'react';
// Assuming same type definitions as TemplateBasic for brevity
// import { ResumeData } from '../ResumeBuilder'; 
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';

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


const TemplateModern: React.FC<TemplateProps> = ({ data, sectionOrder, allSections }) => {
    const { personal, summary, experience, education, skills, projects, certifications, achievements, interests } = data;

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present';

    const renderContactItem = (Icon: React.FC<any>, content: string | undefined) => (
        content ? (
            <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Icon className="w-3 h-3 text-blue-500" />
                <span>{content}</span>
            </div>
        ) : null
    );

    const renderSectionTitle = (title: string) => (
        <div className="flex items-center space-x-2 mb-3">
            <div className="w-2 h-4 bg-blue-500"></div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800">{title}</h2>
        </div>
    );
    
    // --- Section Render Maps ---
    
    // Sections that appear in the main (4/5) column
    const mainSectionMap: { [key: string]: React.ReactNode | null } = {
        summary: summary ? (
            <div>
                {renderSectionTitle('Profile')}
                <p className="text-justify">{summary}</p>
            </div>
        ) : null,

        experience: experience.length > 0 ? (
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
                                {item.description.split('. ').map((bullet, idx) => bullet.trim() && <li key={idx}>{bullet.trim()}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        projects: projects.length > 0 ? (
            <div>
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
            <div>
                {renderSectionTitle('Achievements')}
                <ul className="list-disc ml-5 text-sm space-y-1">
                    {achievements.map(item => (
                        <li key={item.id}>{item.description}</li>
                    ))}
                </ul>
            </div>
        ) : null,
    };

    // Sections that appear in the sidebar (1/5) column
    const sidebarSectionMap: { [key: string]: React.ReactNode | null } = {
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
                            {skill.level && (
                                <span className="text-gray-500 text-[10px] ml-1">
                                    ({skill.level})
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        ) : null,

        education: education.length > 0 ? (
            <div>
                {renderSectionTitle('Education')}
                <div className="space-y-3">
                    {education.map(item => (
                        <div key={item.id}>
                            <p className="font-semibold text-xs">{item.degree}</p>
                            <p className="text-xs text-gray-600">{item.institution}</p>
                            <p className="text-xs text-gray-500 mb-1">{formatDate(item.startDate)} - {item.endDate === 'Present' ? 'Present' : formatDate(item.endDate)}</p>
                            {item.description && <p className="text-[10px] italic text-gray-500">{item.description}</p>}
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        certifications: certifications.length > 0 ? (
            <div>
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
            <div>
                {renderSectionTitle('Interests')}
                <p className="text-xs">{interests}</p>
            </div>
        ) : null,
    };
    // --- End Section Render Maps ---


    // Separate sections into main and sidebar order based on where they should render
    const mainColumnSections = sectionOrder.filter(id => id in mainSectionMap);
    const sidebarSections = sectionOrder.filter(id => id in sidebarSectionMap);


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
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-5 gap-6">

                {/* Left Column (Main) - 4/5 width */}
                <div className="col-span-4 space-y-6">
                    {mainColumnSections.map(sectionId => (
                        <React.Fragment key={sectionId}>
                            {mainSectionMap[sectionId]}
                        </React.Fragment>
                    ))}
                </div>

                {/* Right Column (Sidebar) - 1/5 width */}
                <div className="col-span-1 space-y-6">
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

export default TemplateModern;