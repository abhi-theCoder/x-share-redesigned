import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  FileText, Download, Eye, CheckCircle, AlertCircle, User, Briefcase,
  GraduationCap, Award, Code, Plus, X, Lightbulb, Zap, GripVertical, Settings, Star
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// --- Import Templates ---
import TemplateBasic from '../templatess/TemplateBasic';
import TemplateModern from '../templatess/TemplateModern';
import TemplateProfessional from '../templatess/TemplateProfessional'; // New Template Import
import SherlockHolmesModified from '../templatess/SherlockHolmesModified';
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
const getAISuggestion = (section: string, data: any): string => {
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

// ---- PDF Styles (simple demo) ----
// (The PDF logic is kept simple to reflect the original component structure)
const pdfStyles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, fontFamily: 'Helvetica' },
  h1: { fontSize: 18, marginBottom: 8 },
  h2: { fontSize: 14, marginTop: 12, marginBottom: 6 },
  row: { marginBottom: 4 },
  bullet: { marginLeft: 8 },
});

// A very simple PDF mirroring key sections
const ResumePDF: React.FC<{ data: ResumeData, sectionOrder: string[] }> = ({ data, sectionOrder }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {sectionOrder.map(sectionId => {
        switch (sectionId) {
          case 'personal':
            return (
              <View key="personal">
                <Text style={pdfStyles.h1}>{data.personal.name} — {data.personal.title}</Text>
                <Text style={pdfStyles.row}>{data.personal.email} • {data.personal.phone} • {data.personal.location}</Text>
                <Text style={pdfStyles.row}>{data.personal.linkedin} • {data.personal.github} • {data.personal.portfolio}</Text>
              </View>
            );
          case 'summary':
            return data.summary.trim() ? (
              <View key="summary">
                <Text style={pdfStyles.h2}>Summary</Text>
                <Text style={pdfStyles.row}>{data.summary}</Text>
              </View>
            ) : null;
          case 'experience':
            return data.experience.length > 0 ? (
              <View key="experience">
                <Text style={pdfStyles.h2}>Experience</Text>
                {data.experience.map(exp => (
                  <View key={exp.id} style={{ marginBottom: 6 }}>
                    <Text>{exp.title} — {exp.company} ({exp.startDate} - {exp.endDate})</Text>
                    <Text style={pdfStyles.bullet}>{exp.description}</Text>
                  </View>
                ))}
              </View>
            ) : null;
          case 'education':
            return data.education.length > 0 ? (
              <View key="education">
                <Text style={pdfStyles.h2}>Education</Text>
                {data.education.map(edu => (
                  <View key={edu.id} style={{ marginBottom: 6 }}>
                    <Text>{edu.degree} — {edu.institution}, {edu.city} ({edu.startDate} - {edu.endDate})</Text>
                    {edu.description ? <Text style={pdfStyles.bullet}>{edu.description}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null;
          case 'skills':
            return data.skills.length > 0 ? (
              <View key="skills">
                <Text style={pdfStyles.h2}>Skills</Text>
                <Text style={pdfStyles.row}>{data.skills.map(s => s.name).join(', ')}</Text>
              </View>
            ) : null;
          case 'projects':
            return data.projects.length > 0 ? (
              <View key="projects">
                <Text style={pdfStyles.h2}>Projects</Text>
                {data.projects.map(proj => (
                  <View key={proj.id} style={{ marginBottom: 6 }}>
                    <Text>{proj.name} ({proj.url})</Text>
                    <Text style={pdfStyles.bullet}>{proj.description}</Text>
                  </View>
                ))}
              </View>
            ) : null;
          case 'certifications':
            return data.certifications.length > 0 ? (
              <View key="certifications">
                <Text style={pdfStyles.h2}>Certifications</Text>
                {data.certifications.map(cert => (
                  <Text key={cert.id} style={pdfStyles.row}>{cert.name}, {cert.authority} ({cert.date})</Text>
                ))}
              </View>
            ) : null;
          case 'achievements':
            return data.achievements.length > 0 ? (
              <View key="achievements">
                <Text style={pdfStyles.h2}>Achievements</Text>
                {data.achievements.map(ach => (
                  <Text key={ach.id} style={pdfStyles.bullet}>{ach.description}</Text>
                ))}
              </View>
            ) : null;
          case 'interests':
            return data.interests.trim() ? (
              <View key="interests">
                <Text style={pdfStyles.h2}>Interests</Text>
                <Text style={pdfStyles.row}>{data.interests}</Text>
              </View>
            ) : null;
          default:
            return null;
        }
      })}
    </Page>
  </Document>
);

// ---- Component ----
const ResumeBuilder = () => {
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
    <div>
      <textarea
        rows={4}
        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="List all skills, separated by commas (e.g., React, Python, AWS, Scrum)"
        value={resumeData.skills.map(s => s.name).join(', ')}
        onChange={(e) => updateSkillsFromText(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {resumeData.skills.map((skill) => (
          // Using skill.name as key is slightly risky, but skill.id is safer here
          <span key={skill.id || skill.name} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
            {skill.name}
          </span>
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
  
  const formComponentMap = useMemo(() => ({
    PersonalInfoForm,
    SummaryForm,
    ExperienceForm,
    EducationForm,
    SkillsForm,
    ProjectsForm,
    CertificationsForm,
    AchievementsForm,
    InterestsForm,
  }), [resumeData.summary, resumeData.interests, updateArrayItem]); // Add dependencies for simple forms

  const renderSectionContent = (sectionId: string) => {
    const config = allSections.find(s => s.id === sectionId);
    if (!config) return null;
    const Component = formComponentMap[config.form];
    return Component ? <Component /> : null;
  };

  // Dynamic Template Selection
  const CurrentTemplate = templates.find(t => t.id === selectedTemplate)?.component || TemplateBasic;

  // ---- Custom Section Logic ----
  const handleAddCustomSection = (id: string) => {
    if (!customSections.includes(id)) {
      setCustomSections(prev => [...prev, id]);
      setSectionOrder(prev => [...prev, id]);
      setActiveSection(id);
    }
  };

  // ---- PDF Download ----


const handleDownloadPDF = async () => {
    // 1. Get the DOM element containing the resume content
    const input = document.getElementById('resume-preview-container'); 
    
    if (!input) {
        console.error("Resume preview container not found.");
        return;
    }

    // 2. Use html2pdf to generate and download the file
    const worker = html2pdf().set({
        margin: 0.5,
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    });

    await worker.from(input).save();
};

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-blue-600" />
              Professional Resume Builder
            </h1>
            <p className="text-lg text-gray-600">Drag, Drop, AI Optimize, and Download.</p>
          </div>
          {/* Action Buttons */}
          <div className="flex space-x-4">
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="select-field bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 appearance-none focus:ring-blue-500 focus:border-blue-500"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <Settings className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              <Eye className="w-5 h-5" />
              <span>Full Preview</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors shadow-md"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => setAtsReportVisible(!atsReportVisible)}
              className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors shadow-md ${atsReportVisible ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
            >
              <AlertCircle className="w-5 h-5" />
              <span>ATS Score: {atsScore}%</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 xl:grid-cols-3 gap-8">
          
          {/* Builder/Input - Spanning 2/3 or 3/4 columns */}
          <div className={`lg:col-span-2 xl:col-span-2 space-y-4 ${atsReportVisible ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className='flex justify-between items-center bg-white p-4 rounded-xl shadow-lg border-b border-gray-200'>
              <h2 className='text-2xl font-bold'>Current Section: {allSections.find(s => s.id === activeSection)?.name}</h2>
              <button
                onClick={() => setIsEditingOrder(!isEditingOrder)}
                className={`flex items-center space-x-2 py-1 px-3 rounded-lg transition-colors text-sm ${isEditingOrder ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <GripVertical className="w-4 h-4" />
                {isEditingOrder ? 'Finish Reordering' : 'Reorder Sections'}
              </button>
            </div>

            {/* Reorderable list via Motion Reorder */}
            <Reorder.Group axis="y" values={sectionOrder} onReorder={setSectionOrder}>
              {sectionOrder.map(sectionId => {
                const sectionConfig = allSections.find(s => s.id === sectionId);
                if (!sectionConfig) return null;

                const isFixed = sectionId === 'personal' || sectionId === 'summary';

                return (
                  <Reorder.Item
                    key={sectionId}
                    value={sectionId}
                    as="div"
                    className="mb-4"
                    // Drag only allowed when editing order and section is not fixed
                    dragListener={isEditingOrder && !isFixed} 
                    style={{ cursor: isEditingOrder && !isFixed ? 'grab' : 'pointer' }}
                  >
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setActiveSection(sectionId)}
                        className={`transition-shadow duration-300 ${activeSection === sectionId ? 'ring-4 ring-blue-200 shadow-xl' : 'hover:shadow-md'}`}
                      >
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 relative">
                          {isEditingOrder && !isFixed && (
                            <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-l-lg border border-gray-300 flex flex-col space-y-1">
                              <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" title="Drag to reorder" />
                            </div>
                          )}
                          <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex justify-between items-center">
                              <div className='flex items-center'>
                                <sectionConfig.icon className="w-5 h-5 mr-2 text-blue-500" />
                                {sectionConfig.name}
                              </div>
                              {sectionId === 'experience' && (
                                <button onClick={() => alert(getAISuggestion('rewrite', null))} className="text-xs text-purple-600 hover:underline flex items-center">
                                  <Zap className="w-3 h-3 mr-1" /> AI Rewrite Assistant
                                </button>
                              )}
                              {customSections.includes(sectionId) && (
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  setCustomSections(prev => prev.filter(id => id !== sectionId));
                                  setSectionOrder(prev => prev.filter(id => id !== sectionId));
                                  setActiveSection('personal');
                                }} className="text-red-500 hover:text-red-700 transition-colors text-sm">
                                  <X size={16} />
                                </button>
                              )}
                            </h2>
                            <div className={`${activeSection !== sectionId && !isEditingOrder ? 'h-16 overflow-hidden blur-sm' : ''} transition-all duration-300`}>
                              {renderSectionContent(sectionId)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            {/* Custom Section Dropdown (Rest of your code) */}
            <div className="relative group">
              <button className="w-full flex items-center justify-center space-x-2 border border-dashed border-gray-400 text-gray-600 py-3 rounded-xl hover:bg-gray-100 transition-colors mt-4">
                <Plus className="w-5 h-5" />
                <span>Add Custom Section (Interests, Achievements, etc.)</span>
              </button>
              <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-10">
                {customSectionsConfig.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleAddCustomSection(s.id)}
                    disabled={customSections.includes(s.id)}
                    className={`w-full text-left flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      customSections.includes(s.id)
                        ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <s.icon className="w-4 h-4" />
                    <span>{s.name}</span>
                    {customSections.includes(s.id) && <span className="ml-auto text-xs text-gray-400">(Added)</span>}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Live Preview */}
        <div className="mt-12 w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Resume Preview: <span className='text-blue-600'>{templates.find(t => t.id === selectedTemplate)?.name}</span></h2>
          <div id="resume-preview-container" className="bg-white p-6 shadow-2xl border border-gray-300 mx-auto max-w-4xl min-h-[1000px] overflow-hidden">
            {/* Dynamic Template Component Rendering */}
            <CurrentTemplate 
                data={resumeData}
                sectionOrder={sectionOrder} // **FIX: Ensures template uses this for order**
                allSections={allSections}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-auto relative"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            >
              <button onClick={() => setShowPreview(false)} className="absolute top-3 right-3 text-gray-600 hover:text-gray-900">
                <X />
              </button>
              <div className="p-6" >
                <div id="resume-preview-container" className="mx-auto max-w-4xl min-h-[1000px]">
                  <CurrentTemplate
                      data={resumeData} 
                      sectionOrder={sectionOrder} // **FIX: Ensures modal preview uses this for order**
                      allSections={allSections}
                  />
                </div>
                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;