import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText, Download, Eye, CheckCircle, User, Briefcase,
  GraduationCap, Award, Code, Plus, X, Lightbulb, Zap, GripVertical, Settings, Star
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { useTheme } from '../context/ThemeContext';

// --- Import Templates ---
import TemplateBasic from '../templates/TemplateBasic';
import TemplateModern from '../templates/TemplateModern';
import TemplateProfessional from '../templates/TemplateProfessional'; // New Template Import
import SherlockHolmesModified from '../templates/SherlockHolmesModified';
// ------------------------

// ---- Types (Must be accurate for both builder and templates) ----
interface PersonalInfo { name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string; portfolio: string; }
interface ExperienceItem { id: string; title: string; company: string; startDate: string; endDate: string; description: string; }
interface EducationItem { id: string; degree: string; institution: string; city: string; startDate: string; endDate: string; description?: string; }
interface SkillItem { id?: string; name: string; level: 'Beginner' | 'Intermediate' | 'Expert'; type: 'Technical' | 'Soft'; }
interface ProjectItem { id: string; name: string; role: string; description: string; url: string; }
interface CertificationItem { id: string; name: string; authority: string; date: string; }
interface AchievementItem { id: string; description: string; }

interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  interests: string;
}

// Interface for template component props (to pass section order/config)
interface TemplateComponentProps {
  data: ResumeData;
  sectionOrder: string[]; // **CRUCIAL: Used to dictate the rendering order**
  allSections: SectionConfig[];
}

// ---- AI Suggestion (still mock) ----
const getAISuggestion = (section: string, _data: any): string => {
  if (section === 'summary') {
    return '⚡ AI Suggestion: Try this ATS-optimized summary: "Results-driven Software Engineer with 5+ years of expertise in high-load distributed systems, achieving 20% latency reduction across core services."';
  }
  if (section === 'rewrite') {
    return '✨ AI Rewrite: "Reduced annual hosting costs by $15,000 by migrating critical infrastructure to AWS Lambda and containerized environments."';
  }
  return '';
};

// ---- Templates (Updated) ----
interface TemplateConfig {
  id: string;
  name: string;
  component: React.FC<TemplateComponentProps>;
}

const templates: TemplateConfig[] = [
  { id: 'basic', name: 'Basic Professional', component: TemplateBasic },
  { id: 'modern', name: 'Modern Professional', component: TemplateModern },
  { id: 'professional', name: 'Executive Professional', component: TemplateProfessional }, // New template
  { id: 'sherlock', name: 'Sherlock Professional', component: SherlockHolmesModified }, // New template
];

// ---- Sections ----
interface SectionConfig {
  id: string;
  name: string;
  icon: React.FC<any>;
  form: string;
}

const initialSections: SectionConfig[] = [
  { id: 'personal', name: 'Personal Info', icon: User, form: 'PersonalInfoForm' },
  { id: 'summary', name: 'Summary / Objective', icon: FileText, form: 'SummaryForm' },
  { id: 'experience', name: 'Experience', icon: Briefcase, form: 'ExperienceForm' },
  { id: 'education', name: 'Education', icon: GraduationCap, form: 'EducationForm' },
  { id: 'skills', name: 'Skills', icon: Code, form: 'SkillsForm' },
  { id: 'projects', name: 'Projects', icon: Award, form: 'ProjectsForm' },
  { id: 'certifications', name: 'Certifications', icon: CheckCircle, form: 'CertificationsForm' }
];

const customSectionsConfig: SectionConfig[] = [
  { id: 'achievements', name: 'Key Achievements', icon: Star, form: 'AchievementsForm' },
  { id: 'interests', name: 'Interests', icon: Lightbulb, form: 'InterestsForm' },
];

// --- Reusable Hook for Debounced State Updates ---
const useDebouncedState = <T,>(initialValue: T, delay = 400, onUpdate: (newValue: T) => void) => {
  const [localValue, setLocalValue] = useState(initialValue);

  // Sync local state when external initialValue changes
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  // Debounced update logic
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only call onUpdate if the local value is truly different from the current prop/initial value
      // This prevents unnecessary updates right after initial mount/sync.
      if (localValue !== initialValue) {
        onUpdate(localValue);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, delay, onUpdate, initialValue]);

  return [localValue, setLocalValue] as const;
};



// ---- Component ----
const ResumeBuilder = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('personal');
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [customSections, setCustomSections] = useState<string[]>(['interests']);
  const allSections = useMemo(() => {
    return [
      ...initialSections,
      ...customSections.map(id => customSectionsConfig.find(c => c.id === id)).filter(Boolean) as SectionConfig[],
    ];
  }, [customSections]);
  const initialSectionIds = useMemo(() => allSections.map(s => s.id), [allSections]);
  const [sectionOrder, setSectionOrder] = useState<string[]>(initialSectionIds);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [atsReportVisible, setAtsReportVisible] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Set initial section order based on allSections
  useEffect(() => {
    setSectionOrder(prev => {
      // update only if structure really changed
      const newOrder = initialSectionIds;
      // This is a simple deep comparison for array of strings
      if (JSON.stringify(prev) === JSON.stringify(newOrder)) {
        return prev;
      }

      // Merge old order with new sections, placing new sections at the end
      const existingSections = prev.filter(id => newOrder.includes(id));
      const newSections = newOrder.filter(id => !prev.includes(id));
      return [...existingSections, ...newSections];
    });
  }, [initialSectionIds]);

  const [resumeData, setResumeData] = useState<ResumeData>({
    personal: { name: 'Jane Doe', title: 'Senior Full Stack Engineer', email: 'jane@example.com', phone: '(555) 555-5555', location: 'Remote', linkedin: 'linkedin.com/in/janedoe', github: 'github.com/janedoe', portfolio: '' },
    summary: 'Highly experienced Senior Full Stack Engineer with 5+ years building and deploying scalable web applications using React, Node.js, and AWS. Strong focus on code quality and CI/CD pipelines.',
    experience: [
      { id: 'exp1', title: 'Senior Developer', company: 'Tech Corp', startDate: '2020-01', endDate: 'Present', description: 'Led team of 4; migrated monolith to microservices, reducing operational latency by 30%. Implemented new testing framework, boosting code coverage to 90%.' },
    ],
    education: [
      { id: 'edu1', degree: 'M.S. Computer Science', institution: 'State University', city: 'Anytown', startDate: '2018-09', endDate: '2019-12' },
    ],
    skills: [
      { id: 's1', name: 'React', level: 'Expert', type: 'Technical' },
      { id: 's2', name: 'Node.js', level: 'Expert', type: 'Technical' },
      { id: 's3', name: 'Leadership', level: 'Intermediate', type: 'Soft' }
    ],
    projects: [
      { id: 'proj1', name: 'E-commerce Platform API', role: 'Lead Developer', description: 'Built and deployed a RESTful API for a high-traffic e-commerce site using Node.js and MongoDB, handling over 10k daily requests.', url: 'github.com/proj/ecom' }
    ],
    certifications: [
      { id: 'cert1', name: 'AWS Certified Developer - Associate', authority: 'Amazon Web Services', date: '2023-05' }
    ],
    achievements: [],
    interests: 'Reading, Hiking, Open Source Contributions',
  });

  // ---- Helpers for controlled updates ----
  // This is for simple object updates, no debouncing needed as it's a fixed set of inputs
  const updatePersonalInfo = (key: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [key]: value } }));
  };

  const addItem = <K extends keyof ResumeData>(section: K, newItem: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [
        ...(prev[section] as any[]),
        {
          ...newItem,
          // Ensure ID is unique and stable. The original used randomUUID/Date.now(), which is good.
          id: crypto.randomUUID?.() || Date.now().toString()
        }
      ]
    }));
  };

  const removeItem = <K extends keyof ResumeData>(section: K, id: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((item: any) => item.id !== id)
    }));
  };

  // This function is still used but now called *after* the debounce period
  const updateArrayItem = useCallback(<K extends keyof ResumeData>(section: K, id: string, updater: (item: any) => any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item: any) => item.id === id ? updater(item) : item)
    }));
  }, []);

  const updateSkillsFromText = (text: string) => {
    const newSkills: SkillItem[] = text.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => ({
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        name: s,
        level: 'Intermediate',
        type: 'Technical'
      }));
    setResumeData(prev => ({ ...prev, skills: newSkills }));
  };

  // ---- ATS scoring ----
  const calculateAtsScore = (data: ResumeData) => {
    let score = 50;
    if (data.personal.title) score += 5;
    if (data.summary.trim().length > 80) score += 10;
    if (data.experience.some(exp => /\d+%/.test(exp.description))) score += 10;
    if (data.skills.length >= 10) score += 5;
    if (data.experience.length > 0 && data.education.length > 0) score += 10;
    if (data.projects.length > 0) score += 5;
    if (data.certifications.length > 0) score += 5;
    return Math.min(100, Math.max(0, score));
  };
  const atsScore = useMemo(() => calculateAtsScore(resumeData), [resumeData]);

  const atsChecks = useMemo(() => [
    { check: 'Professional Title included', status: !!resumeData.personal.title, key: 'title' },
    { check: 'Action-verb starting bullets', status: resumeData.experience.some(exp => /^(Led|Reduced|Built|Implemented|Designed|Owned|Improved)/i.test(exp.description.trim())), key: 'action_verbs' },
    { check: 'Quantified results present', status: resumeData.experience.some(exp => /\d+%/.test(exp.description)), key: 'quantified' },
    { check: 'Dedicated Skills Section', status: resumeData.skills.length > 0, key: 'skills_section' },
    { check: 'Projects or Certifications included', status: resumeData.projects.length > 0 || resumeData.certifications.length > 0, key: 'extra_sections' },
    { check: 'Formatting is clean (No tables/images)', status: true, key: 'clean_format' },
  ], [resumeData]);

  // ---- Individual Array Item Components (Fixes Cursor/Typing Issue) ----

  // --- Experience Item ---
  const ExperienceItemInput: React.FC<{ item: ExperienceItem }> = React.memo(({ item }) => {
    const [localItem, setLocalItem] = useDebouncedState<ExperienceItem>(
      item,
      400,
      (newItem) => updateArrayItem('experience', newItem.id, () => newItem)
    );

    return (
      <div className="border p-3 rounded-lg relative">
        <input
          type="text"
          placeholder="Title"
          value={localItem.title}
          onChange={(e) => setLocalItem(prev => ({ ...prev, title: e.target.value }))}
          className="input-field mb-2 font-semibold"
        />
        <input
          type="text"
          placeholder="Company"
          value={localItem.company}
          onChange={(e) => setLocalItem(prev => ({ ...prev, company: e.target.value }))}
          className="input-field mb-2"
        />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="month"
            placeholder="Start Date"
            value={localItem.startDate}
            onChange={(e) => setLocalItem(prev => ({ ...prev, startDate: e.target.value }))}
            className="input-field"
          />
          <input
            type="text"
            placeholder="End Date"
            value={localItem.endDate}
            onChange={(e) => setLocalItem(prev => ({ ...prev, endDate: e.target.value }))}
            className="input-field"
          />
        </div>
        <textarea
          rows={3}
          placeholder="Key achievements (use bullets and quantify!)"
          value={localItem.description}
          onChange={(e) => setLocalItem(prev => ({ ...prev, description: e.target.value }))}
          className="input-field"
        />
        <button onClick={() => removeItem('experience', item.id)} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
      </div>
    );
  });

  // --- Education Item ---
  const EducationItemInput: React.FC<{ item: EducationItem }> = React.memo(({ item }) => {
    const [localItem, setLocalItem] = useDebouncedState<EducationItem>(
      item,
      400,
      (newItem) => updateArrayItem('education', newItem.id, () => newItem)
    );

    return (
      <div className="border p-3 rounded-lg relative">
        <input
          type="text"
          placeholder="Degree"
          value={localItem.degree}
          onChange={(e) => setLocalItem(prev => ({ ...prev, degree: e.target.value }))}
          className="input-field mb-1 font-semibold"
        />
        <input
          type="text"
          placeholder="Institution"
          value={localItem.institution}
          onChange={(e) => setLocalItem(prev => ({ ...prev, institution: e.target.value }))}
          className="input-field text-sm mb-1"
        />
        <input
          type="text"
          placeholder="City"
          value={localItem.city}
          onChange={(e) => setLocalItem(prev => ({ ...prev, city: e.target.value }))}
          className="input-field text-sm mb-2"
        />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="month"
            placeholder="Start Date"
            value={localItem.startDate}
            onChange={(e) => setLocalItem(prev => ({ ...prev, startDate: e.target.value }))}
            className="input-field"
          />
          <input
            type="month"
            placeholder="End Date"
            value={localItem.endDate}
            onChange={(e) => setLocalItem(prev => ({ ...prev, endDate: e.target.value }))}
            className="input-field"
          />
        </div>
        <textarea
          rows={2}
          placeholder="Description (optional)"
          value={localItem.description || ''}
          onChange={(e) => setLocalItem(prev => ({ ...prev, description: e.target.value }))}
          className="input-field"
        />
        <button onClick={() => removeItem('education', item.id)} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
      </div>
    );
  });

  // --- Project Item ---
  const ProjectItemInput: React.FC<{ item: ProjectItem }> = React.memo(({ item }) => {
    const [localItem, setLocalItem] = useDebouncedState<ProjectItem>(
      item,
      400,
      (newItem) => updateArrayItem('projects', newItem.id, () => newItem)
    );

    return (
      <div className="border p-3 rounded-lg relative">
        <input
          type="text"
          placeholder="Project Name"
          value={localItem.name}
          onChange={(e) => setLocalItem(prev => ({ ...prev, name: e.target.value }))}
          className="input-field mb-2 font-semibold"
        />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="text"
            placeholder="Your Role (e.g., Lead Dev)"
            value={localItem.role}
            onChange={(e) => setLocalItem(prev => ({ ...prev, role: e.target.value }))}
            className="input-field"
          />
          <input
            type="url"
            placeholder="Project URL/Link (Optional)"
            value={localItem.url}
            onChange={(e) => setLocalItem(prev => ({ ...prev, url: e.target.value }))}
            className="input-field"
          />
        </div>
        <textarea
          rows={3}
          placeholder="Key technologies and impact (use bullet points or hyphens)"
          value={localItem.description}
          onChange={(e) => setLocalItem(prev => ({ ...prev, description: e.target.value }))}
          className="input-field"
        />
        <button onClick={() => removeItem('projects', item.id)} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
      </div>
    );
  });

  // --- Certification Item ---
  const CertificationItemInput: React.FC<{ item: CertificationItem }> = React.memo(({ item }) => {
    const [localItem, setLocalItem] = useDebouncedState<CertificationItem>(
      item,
      400,
      (newItem) => updateArrayItem('certifications', newItem.id, () => newItem)
    );

    return (
      <div key={item.id} className="border p-3 rounded-lg relative">
        <input
          type="text"
          placeholder="Certification Name"
          value={localItem.name}
          onChange={(e) => setLocalItem(prev => ({ ...prev, name: e.target.value }))}
          className="input-field mb-2 font-semibold"
        />
        <input
          type="text"
          placeholder="Issuing Authority (e.g., AWS, Coursera)"
          value={localItem.authority}
          onChange={(e) => setLocalItem(prev => ({ ...prev, authority: e.target.value }))}
          className="input-field mb-2"
        />
        <input
          type="month"
          placeholder="Completion Date"
          value={localItem.date}
          onChange={(e) => setLocalItem(prev => ({ ...prev, date: e.target.value }))}
          className="input-field"
        />
        <button onClick={() => removeItem('certifications', item.id)} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
      </div>
    );
  });

  // --- Achievement Item ---
  const AchievementItemInput: React.FC<{ item: AchievementItem }> = React.memo(({ item }) => {
    const [localItem, setLocalItem] = useDebouncedState<AchievementItem>(
      item,
      400,
      (newItem) => updateArrayItem('achievements', newItem.id, () => newItem)
    );

    return (
      <div key={item.id} className="border p-3 rounded-lg relative">
        <textarea
          rows={2}
          placeholder="Describe a key achievement, award, or recognition."
          value={localItem.description}
          onChange={(e) => setLocalItem(prev => ({ ...prev, description: e.target.value }))}
          className="input-field"
        />
        <button onClick={() => removeItem('achievements', item.id)} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
      </div>
    );
  });

  // ---- Forms (Now use the debounced components) ----
  const PersonalInfoForm = () => (
    <div className="grid grid-cols-2 gap-4">
      {(Object.keys(resumeData.personal) as (keyof PersonalInfo)[]).map((k) => {
        const label = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1');
        return (
          <input
            key={k}
            type="text"
            placeholder={label}
            className="input-field"
            value={resumeData.personal[k]}
            // This is simple value mapping, safe to update directly
            onChange={(e) => updatePersonalInfo(k, e.target.value)}
          />
        );
      })}
    </div>
  );

  const SummaryForm = () => {
    // The original implementation for SummaryForm was mostly correct as it used local state/debounce,
    // but the useEffect dependency was missing `resumeData.summary`, causing it not to sync if an external action changed the summary.
    // I'll replace it with the new useDebouncedState pattern for consistency and correctness.
    const [localSummary, setLocalSummary] = useDebouncedState(
      resumeData.summary,
      400,
      (newSummary) => setResumeData(prev => ({ ...prev, summary: newSummary }))
    );

    return (
      <textarea
        rows={5}
        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Write your professional summary here..."
        value={localSummary}
        onChange={(e) => setLocalSummary(e.target.value)}
      />
    );
  };


  const ExperienceForm = () => (
    <div className="space-y-4">
      {resumeData.experience.map(item => (
        <ExperienceItemInput key={item.id} item={item} />
      ))}
      <button
        onClick={() => addItem('experience', { title: 'New Position', company: 'Company', startDate: '', endDate: 'Present', description: '' })}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <Plus size={16} /> <span>Add Position</span>
      </button>
    </div>
  );

  const EducationForm = () => (
    <div className="space-y-4">
      {resumeData.education.map(item => (
        <EducationItemInput key={item.id} item={item} />
      ))}
      <button
        onClick={() => addItem('education', { degree: 'New Degree', institution: 'University', city: '', startDate: '', endDate: '' })}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <Plus size={16} /> <span>Add Education</span>
      </button>
    </div>
  );

  const SkillsForm = () => (
    <div className="space-y-4">
      <textarea
        rows={4}
        className={`w-full py-3 px-4 border rounded-2xl focus:ring-2 focus:ring-brand-cyan outline-none transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
        placeholder="List all skills, separated by commas (e.g., React, Python, AWS, Scrum)"
        value={resumeData.skills.map(s => s.name).join(', ')}
        onChange={(e) => updateSkillsFromText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {resumeData.skills.map((skill) => (
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={skill.id || skill.name}
            className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}
          >
            {skill.name}
          </motion.span>
        ))}
      </div>
    </div>
  );

  // Corrected ProjectsForm
  const ProjectsForm = () => (
    <div className="space-y-4">
      {resumeData.projects.map(item => (
        <ProjectItemInput key={item.id} item={item} />
      ))}
      <button
        onClick={() => addItem('projects', { name: 'New Project', role: '', description: '', url: '' })}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <Plus size={16} /> <span>Add Project</span>
      </button>
    </div>
  );

  // Corrected CertificationsForm
  const CertificationsForm = () => (
    <div className="space-y-4">
      {resumeData.certifications.map(item => (
        <CertificationItemInput key={item.id} item={item} />
      ))}
      <button
        onClick={() => addItem('certifications', { name: 'New Certification', authority: '', date: '' })}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <Plus size={16} /> <span>Add Certification</span>
      </button>
    </div>
  );

  // InterestsForm is simple value mapping, no complex debounce needed
  const InterestsForm = () => {
    const [localInterests, setLocalInterests] = useDebouncedState(
      resumeData.interests,
      400,
      (newInterests) => setResumeData(prev => ({ ...prev, interests: newInterests }))
    );

    return (
      <div>
        <p className='text-sm text-gray-600 mb-2'>List your personal interests or hobbies, separated by commas. (Optional, usually for junior roles)</p>
        <textarea
          rows={2}
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Hiking, Chess, Photography, Open Source"
          value={localInterests}
          onChange={(e) => setLocalInterests(e.target.value)}
        />
      </div>
    );
  }

  // Corrected AchievementsForm
  const AchievementsForm = () => (
    <div className="space-y-4">
      {resumeData.achievements.map(item => (
        <AchievementItemInput key={item.id} item={item} />
      ))}
      <button
        onClick={() => addItem('achievements', { description: '' })}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <Plus size={16} /> <span>Add Achievement</span>
      </button>
    </div>
  );

  const formComponentMap: Record<string, React.FC> = useMemo(() => ({
    PersonalInfoForm,
    SummaryForm,
    ExperienceForm,
    EducationForm,
    SkillsForm,
    ProjectsForm,
    CertificationsForm,
    AchievementsForm,
    InterestsForm,
  }), [
    PersonalInfoForm,
    SummaryForm,
    ExperienceForm,
    EducationForm,
    SkillsForm,
    ProjectsForm,
    CertificationsForm,
    AchievementsForm,
    InterestsForm
  ]);

  const renderSectionContent = (sectionId: string) => {
    const config = allSections.find(s => s.id === sectionId);
    if (!config) return null;
    const Component = formComponentMap[config.form];
    return Component ? <Component /> : null;
  };

  const CurrentTemplate = templates.find(t => t.id === selectedTemplate)?.component || TemplateBasic;

  const handleAddCustomSection = (id: string) => {
    if (!customSections.includes(id)) {
      setCustomSections(prev => [...prev, id]);
      setSectionOrder(prev => [...prev, id]);
      setActiveSection(id);
    }
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById('resume-preview-container');
    if (!input) return;

    const worker = html2pdf().set({
      margin: [0.5, 0.5],
      filename: `${resumeData.personal.name || 'Resume'}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    });
    await worker.from(input).save();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-12 ${theme === 'dark' ? 'bg-[#030014] text-white' : 'bg-slate-50 text-gray-900'
      }`}>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-brand-cyan/20' : 'bg-blue-200'}`} />
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-brand-purple/20' : 'bg-purple-200'}`} />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-blue shadow-lg shadow-brand-cyan/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">Resume Builder</h1>
            </motion.div>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-lg`}>
              Craft your professional story with AI-powered precision.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="text-sm font-medium">Template:</div>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className={`bg-transparent outline-none font-bold text-sm ${theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}`}
              >
                {templates.map(t => <option key={t.id} value={t.id} className="bg-space-900">{t.name}</option>)}
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPreview(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-lg transition-all ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
            >
              <Eye className="w-5 h-5" />
              <span>Preview</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-blue text-white font-bold shadow-lg shadow-brand-cyan/30"
            >
              <Download className="w-5 h-5" />
              <span>Export PDF</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Navigation Rail - Left */}
          <div className="xl:col-span-1 sticky top-32 space-y-4">
            <div className={`flex xl:flex-col gap-3 p-2 rounded-2xl border ${theme === 'dark' ? 'glass border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
              {allSections.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`p-3 rounded-xl transition-all relative group ${isActive
                      ? (theme === 'dark' ? 'bg-brand-cyan text-black shadow-lg shadow-brand-cyan/30' : 'bg-blue-600 text-white shadow-md')
                      : (theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50')
                      }`}
                    title={section.name}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="absolute left-full ml-4 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none hidden xl:block">
                      {section.name}
                    </span>
                  </button>
                );
              })}

              <div className="h-px bg-white/10 mx-2 hidden xl:block" />

              <div className="relative group">
                <button
                  className={`p-3 rounded-xl transition-all mx-auto w-full flex justify-center ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                >
                  <Plus className="w-6 h-6" />
                </button>
                <div className={`absolute left-full top-0 ml-4 p-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none group-hover:pointer-events-auto border ${theme === 'dark' ? 'bg-space-950 border-white/10' : 'bg-white border-gray-200'}`}>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 px-3">Add Section</p>
                  {customSectionsConfig.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleAddCustomSection(s.id)}
                      disabled={customSections.includes(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 transition-colors ${customSections.includes(s.id) ? 'opacity-30 cursor-not-allowed' : (theme === 'dark' ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-blue-50 text-gray-600')}`}
                    >
                      {React.createElement(s.icon, { size: 16 })}
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Area - Center */}
          <div className="xl:col-span-6 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl border shadow-xl p-8 relative overflow-hidden ${theme === 'dark' ? 'glass border-white/10' : 'bg-white border-gray-100 shadow-blue-500/5'}`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    {allSections.find(s => s.id === activeSection) && (
                      <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-blue-50 text-blue-600'}`}>
                        {React.createElement(allSections.find(s => s.id === activeSection)!.icon, { className: "w-6 h-6" })}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold">{allSections.find(s => s.id === activeSection)?.name}</h2>
                      <p className="text-sm text-gray-500">Professional details and achievements</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {activeSection === 'experience' && (
                      <button
                        onClick={() => alert(getAISuggestion('rewrite', null))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${theme === 'dark' ? 'border-brand-purple/30 text-brand-purple hover:bg-brand-purple/10' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        AI REWRITE
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditingOrder(!isEditingOrder)}
                      className={`p-2 rounded-xl transition-all ${isEditingOrder ? 'bg-rose-500 text-white' : (theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600')}`}
                    >
                      <GripVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isEditingOrder ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4 italic">Drag items to change the display order on your resume.</p>
                    <Reorder.Group axis="y" values={sectionOrder} onReorder={setSectionOrder} className="space-y-3">
                      {sectionOrder.map(id => (
                        <Reorder.Item
                          key={id}
                          value={id}
                          className={`p-4 rounded-xl border flex items-center justify-between cursor-grab active:cursor-grabbing ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3 font-semibold">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            {allSections.find(s => s.id === id)?.name}
                          </div>
                          <div className="text-xs text-gray-500">Drag to move</div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    {renderSectionContent(activeSection)}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Quick Helper / Tips */}
            <div className={`p-6 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-center gap-3 mb-2 font-bold text-sm uppercase tracking-wider text-gray-500">
                <Lightbulb className="w-4 h-4" /> Pro Tip
              </div>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {activeSection === 'personal' && "Use a professional email address and make sure your LinkedIn URL is updated."}
                {activeSection === 'summary' && "Summaries are best for senior roles. For entry-level, use an Objective focused on goals."}
                {activeSection === 'experience' && "Focus on measurable results (e.g., 'Increased revenue by 15%') rather than just duties."}
                {activeSection === 'skills' && "Order your skills by expertise. Group similar technologies together for better readability."}
                {!['personal', 'summary', 'experience', 'skills'].includes(activeSection) && "Add only relevant certifications and projects that align with the role you're targeting."}
              </p>
            </div>
          </div>

          {/* Snapshot Preview & Stats - Right */}
          <div className="xl:col-span-5 sticky top-32 space-y-6">
            {/* ATS Score Card */}
            <div className={`p-6 rounded-3xl border shadow-xl overflow-hidden relative ${theme === 'dark' ? 'glass border-white/10' : 'bg-white border-gray-100 shadow-purple-500/5'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Resume Strength</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-black italic tracking-widest ${atsScore > 80 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-brand-cyan/20 text-brand-cyan uppercase'}`}>
                  {atsScore > 80 ? 'EXCELLENT' : 'ATS READY'}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className={`${theme === 'dark' ? 'text-white/5' : 'text-gray-100'}`} />
                    <circle
                      cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * atsScore) / 100}
                      strokeLinecap="round"
                      className="text-brand-cyan transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-2xl font-black italic tracking-tighter">{atsScore}%</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-4 h-4 ${atsScore > 60 ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <span className={atsScore > 60 ? 'text-emerald-500 font-medium' : 'text-gray-500'}>Structure Validated</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-4 h-4 ${atsScore > 80 ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <span className={atsScore > 80 ? 'text-emerald-500 font-medium' : 'text-gray-500'}>ATS Optimized Content</span>
                  </div>
                  <button
                    onClick={() => setAtsReportVisible(!atsReportVisible)}
                    className="text-xs font-bold text-brand-cyan hover:underline tracking-tight"
                  >
                    VIEW FULL ATS REPORT
                  </button>
                </div>
              </div>
            </div>

            {/* Live Minimap Preview */}
            <div className={`rounded-3xl border shadow-xl overflow-hidden ${theme === 'dark' ? 'glass border-white/10' : 'bg-white border-gray-100 shadow-blue-500/5'}`}>
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <span className="font-bold text-sm uppercase tracking-wider text-gray-500">Live Minimap</span>
                <button
                  onClick={() => setShowPreview(true)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-white p-4 origin-top scale-[0.3] h-[500px] mb-[-350px] pointer-events-none rounded-b-3xl">
                <div id="resume-preview-container-mini">
                  <CurrentTemplate
                    data={resumeData}
                    sectionOrder={sectionOrder}
                    allSections={allSections}
                  />
                </div>
              </div>
              <div className={`p-4 text-center border-t ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-sm font-bold text-brand-blue hover:text-brand-purple transition-colors"
                >
                  Expand Full Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className={`rounded-3xl shadow-2xl w-full max-w-5xl h-[95vh] overflow-hidden relative border ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <div>
                  <h3 className="text-xl font-bold italic tracking-tighter">PREVIEW MODE</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-black">{resumeData.personal.name || 'Your Name'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-white font-bold shadow-lg shadow-brand-cyan/20"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-3 rounded-full hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-12 overflow-y-auto h-[calc(95vh-100px)] custom-scrollbar">
                <div id="resume-preview-container" className="mx-auto max-w-4xl bg-white shadow-2xl p-0 min-h-[1100px]">
                  <CurrentTemplate
                    data={resumeData}
                    sectionOrder={sectionOrder}
                    allSections={allSections}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ATS Report Sidebar Modal */}
      <AnimatePresence>
        {atsReportVisible && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAtsReportVisible(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed right-0 top-0 bottom-0 w-full max-w-lg z-[120] border-l p-8 shadow-2xl ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black italic tracking-tighter">ATS DIAGNOSTICS</h3>
                <button onClick={() => setAtsReportVisible(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-brand-cyan/10 border-brand-cyan/20' : 'bg-blue-50 border-blue-100'}`}>
                  <div className="text-5xl font-black italic tracking-tighter text-brand-cyan mb-2">{atsScore}%</div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-60">Composite Score</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-4">Content Checkpoints</h4>
                  {atsChecks.map((item) => (
                    <div key={item.key} className="flex items-center gap-4 group">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${item.status ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 border border-white/10 text-gray-600'}`}>
                        {item.status ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </div>
                      <span className={`text-sm font-medium ${item.status ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-gray-500'}`}>
                        {item.check}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={`p-6 rounded-2xl bg-gradient-to-tr from-brand-purple/20 to-brand-blue/20 border border-brand-purple/20`}>
                  <div className="flex items-center gap-2 font-bold mb-3 text-brand-purple">
                    <Zap className="w-4 h-4 stroke-[3px]" />
                    AI IMPROVEMENT TIPS
                  </div>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex gap-2"><span>•</span> Add more specific industry keywords to your summary.</li>
                    <li className="flex gap-2"><span>•</span> Use metrics to quantify at least 3 bullet points.</li>
                    <li className="flex gap-2"><span>•</span> Ensure consistent dating formats (Jan 2024 vs 01/2024).</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;