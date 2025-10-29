import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Link, GitBranch } from 'lucide-react';

// --- Re-define Data Types for the Template (Must match ResumeBuilder) ---
// (These are defined in the prompt, repeating for context)
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

// Helper function to format dates
const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present';

// Custom component for the skill bar visualization (adapting the old CV style)
const SkillBar: React.FC<{ name: string; level: string }> = ({ name, level }) => {
  const levelMap = { 'Beginner': 33, 'Intermediate': 66, 'Expert': 95 };
  const width = levelMap[level as keyof typeof levelMap] || 0;

  return (
    <div className="flex justify-between items-center text-[10px] uppercase">
      <span className="font-bold w-1/3">{name}</span>
      <div className="flex-grow h-1 bg-gray-200 mt-1 ml-4">
        <div 
          style={{ width: `${width}%` }} 
          className="h-full bg-black" 
        />
      </div>
    </div>
  );
};

// Main Template Component
const SherlockHolmesModified: React.FC<TemplateProps> = ({ data, sectionOrder }) => {
    const { personal, summary, experience, education, skills, projects, certifications, achievements, interests } = data;

    // --- Utility Components for Visual Fidelity ---
    const MainHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <h2 className="text-sm font-bold uppercase border-b-2 border-black pb-1 mb-3 mt-4">{children}</h2>
    );

    const SidebarHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <h3 className="text-sm font-bold uppercase border-b border-gray-500 pb-1 mb-3 mt-4 text-white">{children}</h3>
    );
    // ---------------------------------------------


    // --- Section Render Map (Adapted for new data and Sherlock style) ---
    const sectionMap: { [key: string]: React.ReactNode | null } = {
        personal: null, // Handled in the main layout header
        
        // SUMMARY (Adapts the 'About Me' section's style for the sidebar)
        summary: summary ? (
            <div className='p-4'>
                <SidebarHeading>About Me</SidebarHeading>
                <p className="text-justify text-xs leading-snug">{summary}</p>
            </div>
        ) : null,

        // EXPERIENCE (Main Content)
        experience: experience.length > 0 ? (
            <MainHeading>Work Experience</MainHeading>,
            <div className="space-y-4">
                {experience.map(item => (
                    <div key={item.id}>
                        <div className="flex justify-between items-center text-[10px] text-gray-800">
                            <h3 className="font-bold uppercase tracking-wider">{item.company}</h3>
                            <p className="font-medium whitespace-nowrap">{formatDate(item.startDate)} - {formatDate(item.endDate)}</p>
                        </div>
                        <p className='text-xs font-semibold italic mb-1'>{item.title}</p>
                        <ul className="list-disc ml-5 text-xs text-gray-700 space-y-0.5">
                            {item.description.split(/[\n]/).map((bullet, idx) => bullet.trim() && <li key={idx} className='pl-1'>{bullet.trim()}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        ) : null,

        // EDUCATION (Main Content)
        education: education.length > 0 ? (
            <MainHeading>Education</MainHeading>,
            <div className="space-y-3">
                {education.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-xs text-gray-800">
                        <div>
                            <h3 className="font-bold">{item.degree}</h3>
                            <p className="text-gray-700">{item.institution}, {item.city}</p>
                            {item.description && <p className="italic text-gray-600 mt-1">{item.description}</p>}
                        </div>
                        <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                            {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </p>
                    </div>
                ))}
            </div>
        ) : null,
        
        // SKILLS (Main Content, modified to use the bar style)
        skills: skills.length > 0 ? (
            <MainHeading>Skills</MainHeading>,
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                {skills.map((skill, index) => (
                    <SkillBar key={index} name={skill.name} level={skill.level} />
                ))}
            </div>
        ) : null,

        // PROJECTS (Main Content)
        projects: projects.length > 0 ? (
            <MainHeading>Projects</MainHeading>,
            <div className="space-y-3">
                {projects.map(item => (
                    <div key={item.id} className='text-xs'>
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold">{item.name} ({item.role})</h3>
                            {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center"><Link size={10} className='mr-1'/>URL</a>}
                        </div>
                        <p className="mt-1 text-gray-700">{item.description}</p>
                    </div>
                ))}
            </div>
        ) : null,

        // CERTIFICATIONS (Main Content)
        certifications: certifications.length > 0 ? (
            <MainHeading>Certifications</MainHeading>,
            <div className="space-y-3 text-xs">
                {certifications.map(item => (
                    <div key={item.id}>
                        <p className="font-bold">{item.name} ({item.authority})</p>
                        <p className="text-gray-600">{item.date}</p>
                    </div>
                ))}
            </div>
        ) : null,

        // ACHIEVEMENTS (Sidebar - Using the bulleted list style)
        achievements: achievements.length > 0 ? (
            <div className='p-4 pt-0'>
                <SidebarHeading>Key Achievements</SidebarHeading>
                <ul className="list-disc ml-5 text-xs space-y-1">
                    {achievements.map(item => (
                        <li key={item.id}>{item.description}</li>
                    ))}
                </ul>
            </div>
        ) : null,

        // INTERESTS (Sidebar - Adapting the 'Hobbies' section)
        interests: interests.trim() ? (
            <div className='p-4 pt-0'>
                <SidebarHeading>Interests</SidebarHeading>
                <ul className="list-disc ml-5 text-xs space-y-1">
                    {interests.split(',').map((interest, index) => (
                        <li key={index}>{interest.trim().toUpperCase()}</li>
                    ))}
                </ul>
            </div>
        ) : null,
        
    };
    // --- End Section Render Map ---

    // Separate sections into sidebar and main content
    const sidebarSections = ['summary', 'achievements', 'interests'];
    const mainSections = sectionOrder.filter(id => id !== 'personal' && !sidebarSections.includes(id));


    return (
        <div className="max-w-4xl mx-auto shadow-lg flex text-gray-800 font-sans leading-tight">
            
            {/* LEFT SIDEBAR (Dark Theme) */}
            <div className="w-1/3 bg-gray-800 text-white text-xs p-0 min-h-full">
                {/* Image Placeholder (Mimicking the image style) */}
                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: "url('https://via.placeholder.com/200x250/555555/FFFFFF?text=PROFILE')" }}>
                    {/* Add an actual image here in a real app */}
                </div>

                {/* Render sidebar sections */}
                {sectionOrder.map(sectionId => (
                    <React.Fragment key={sectionId}>
                        {sidebarSections.includes(sectionId) && sectionMap[sectionId]}
                    </React.Fragment>
                ))}

                {/* LINKS (Hardcoded style based on original template) */}
                {(personal.linkedin || personal.github || personal.portfolio) && (
                    <div className='p-4 pt-0'>
                        <SidebarHeading>Links</SidebarHeading>
                        {personal.linkedin && (
                            <p className='flex items-center mb-1'>
                                <Linkedin size={10} className='mr-1'/> <span className='font-bold mr-1'>LinkedIn:</span> <a href={personal.linkedin} className='text-gray-300 hover:text-white underline truncate'>{personal.linkedin.split('/').pop()}</a>
                            </p>
                        )}
                        {personal.github && (
                            <p className='flex items-center mb-1'>
                                <GitBranch size={10} className='mr-1'/> <span className='font-bold mr-1'>GitHub:</span> <a href={personal.github} className='text-gray-300 hover:text-white underline truncate'>{personal.github.split('/').pop()}</a>
                            </p>
                        )}
                        {personal.portfolio && (
                            <p className='flex items-center'>
                                <Link size={10} className='mr-1'/> <span className='font-bold mr-1'>Portfolio:</span> <a href={personal.portfolio} className='text-gray-300 hover:text-white underline truncate'>{personal.portfolio.replace('https://', '')}</a>
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT MAIN CONTENT (Light Theme) */}
            <div className="w-2/3 p-6">
                
                {/* HEADER (Mimicking the original CV's layout) */}
                <div className="pb-2 mb-4">
                    <h1 className="text-3xl font-bold uppercase tracking-wide text-gray-900">{personal.name}</h1>
                    <p className="text-base font-semibold text-gray-600 mb-2">{personal.title}</p>
                    
                    <div className="float-right text-right text-[10px] text-gray-700">
                        {personal.location && (
                            <div className="flex items-center justify-end mb-[1px]">
                                <MapPin size={10} className="mr-1"/> <span>{personal.location}</span>
                            </div>
                        )}
                        {personal.phone && (
                            <div className="flex items-center justify-end mb-[1px]">
                                <Phone size={10} className="mr-1"/> <span>{personal.phone}</span>
                            </div>
                        )}
                        {personal.email && (
                            <div className="flex items-center justify-end">
                                <Mail size={10} className="mr-1"/> <span>{personal.email}</span>
                            </div>
                        )}
                    </div>
                    <div className="clear-both"></div>
                </div>

                {/* Render main content sections */}
                {mainSections.map(sectionId => (
                    <React.Fragment key={sectionId}>
                        {sectionMap[sectionId]}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default SherlockHolmesModified;