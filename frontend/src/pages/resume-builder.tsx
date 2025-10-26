import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText, Download, Eye, CheckCircle, AlertCircle, User, Briefcase,
  GraduationCap, Award, Code, Plus, X, Lightbulb, Zap, GripVertical, Settings, Star
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// --- Import Templates ---
import TemplateBasic from '../templatess/TemplateBasic';
import TemplateModern from '../templatess/TemplateModern';
import TemplateProfessional from '../templatess/TemplateProfessional';
import TemplatePhylisFlex from '../templatess/TemplatePhylisFlex'; // New Template Import
import TemplateCreative from '../templatess/TemplateCreative';
import TemplateMinimalist from '../templatess/TemplateMinimalist';
import TemplateElegant from '../templatess/TemplateElegant';
// ------------------------

// ---- Types (Must be accurate for both builder and templates) ----
interface PersonalInfo { name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string; portfolio: string; }
interface ExperienceItem { id: string; title: string; company: string; startDate: string; endDate: string; description: string; }
interface EducationItem { id: string; degree: string; institution: string; city: string; startDate: string; endDate: string; description?: string; }
interface SkillItem { id?: string; name: string; level: 'Beginner' | 'Intermediate' | 'Expert'; type: 'Technical' | 'Soft'; }
interface ProjectItem { id: string; name: string; role: string; description: string; url: string; }
interface CertificationItem { id: string; name: string; authority: string; date: string; id?: string; }
interface AchievementItem { id: string; description: string; id?: string; }

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
  sectionOrder: string[];
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
  description?: string;
}

const templates: TemplateConfig[] = [
  { id: 'basic', name: 'Basic Professional', component: TemplateBasic, description: 'Clean, minimal & ATS-friendly' },
  { id: 'modern', name: 'Modern Professional', component: TemplateModern, description: 'Modern layout with visual hierarchy' },
  { id: 'professional', name: 'Executive Professional', component: TemplateProfessional, description: 'Executive style, for senior roles' },
  { id: 'phlisflex', name: 'PhylisFlex Professional', component: TemplatePhylisFlex, description: 'Flexible multi-column layout' },
  // { id: 'templatecreative', name: 'Creative', component: TemplateCreative, description: 'Flexible multi-column layout' },
  { id: 'templateminimalist', name: 'Minimalist', component: TemplateMinimalist, description: 'Flexible multi-column layout' },
  // { id: 'templateelegant', name: 'Elegant', component: TemplateElegant, description: 'Flexible multi-column layout' },
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
  { id: 'certifications', name: 'Certifications', icon: CheckCircle, form: 'CertificationsForm' },
];

const customSectionsConfig: SectionConfig[] = [
  { id: 'achievements', name: 'Key Achievements', icon: Star, form: 'AchievementsForm' },
  { id: 'interests', name: 'Interests', icon: Lightbulb, form: 'InterestsForm' },
];

// ---- PDF Styles (simple demo) ----
const pdfStyles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, fontFamily: 'Helvetica' },
  h1: { fontSize: 18, marginBottom: 8 },
  h2: { fontSize: 14, marginTop: 12, marginBottom: 6 },
  row: { marginBottom: 4 },
  bullet: { marginLeft: 8 },
});

// A very simple PDF mirroring key sections
const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.h1}>{data.personal.name} — {data.personal.title}</Text>
      <Text style={pdfStyles.row}>{data.personal.email} • {data.personal.phone} • {data.personal.location}</Text>
      <Text style={pdfStyles.row}>{data.personal.linkedin} • {data.personal.github} • {data.personal.portfolio}</Text>

      <Text style={pdfStyles.h2}>Summary</Text>
      <Text style={pdfStyles.row}>{data.summary}</Text>

      <Text style={pdfStyles.h2}>Experience</Text>
      {data.experience.map(exp => (
        <View key={exp.id} style={{ marginBottom: 6 }}>
          <Text>{exp.title} — {exp.company} ({exp.startDate} - {exp.endDate})</Text>
          <Text style={pdfStyles.bullet}>{exp.description}</Text>
        </View>
      ))}

      <Text style={pdfStyles.h2}>Education</Text>
      {data.education.map(edu => (
        <View key={edu.id} style={{ marginBottom: 6 }}>
          <Text>{edu.degree} — {edu.institution}, {edu.city} ({edu.startDate} - {edu.endDate})</Text>
          {edu.description ? <Text style={pdfStyles.bullet}>{edu.description}</Text> : null}
        </View>
      ))}

      <Text style={pdfStyles.h2}>Skills</Text>
      <Text style={pdfStyles.row}>{data.skills.map(s => s.name).join(', ')}</Text>

      {data.projects.length > 0 && <Text style={pdfStyles.h2}>Projects</Text>}
      {data.projects.map(proj => (
        <View key={proj.id} style={{ marginBottom: 6 }}>
          <Text>{proj.name} ({proj.url})</Text>
          <Text style={pdfStyles.bullet}>{proj.description}</Text>
        </View>
      ))}

      {data.certifications.length > 0 && <Text style={pdfStyles.h2}>Certifications</Text>}
      {data.certifications.map(cert => (
        <Text key={cert.id || cert.name} style={pdfStyles.row}>{cert.name}, {cert.authority} ({cert.date})</Text>
      ))}

      {data.achievements.length > 0 && <Text style={pdfStyles.h2}>Achievements</Text>}
      {data.achievements.map((ach, i) => (
        <Text key={ach.id || i} style={pdfStyles.bullet}>{ach.description}</Text>
      ))}

      {data.interests.trim() && <Text style={pdfStyles.h2}>Interests</Text>}
      {data.interests.trim() && <Text style={pdfStyles.row}>{data.interests}</Text>}
    </Page>
  </Document>
);

// ---- Component ----
const ResumeBuilder: React.FC = () => {
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
      const newOrder = initialSectionIds;
      return JSON.stringify(prev) === JSON.stringify(newOrder) ? prev : newOrder;
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
  const updatePersonalInfo = (key: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [key]: value } }));
  };

  const addItem = <K extends keyof ResumeData>(section: K, newItem: any) => {
    setResumeData(prev => ({ ...prev, [section]: [ ...(prev[section] as any[]), { ...newItem, id: crypto.randomUUID?.() || Date.now().toString() } ] }));
  };

  const removeItem = <K extends keyof ResumeData>(section: K, id: string) => {
    setResumeData(prev => ({ ...prev, [section]: (prev[section] as any[]).filter((item: any) => item.id !== id) }));
  };

  const updateArrayItem = <K extends keyof ResumeData>(section: K, id: string, updater: (item: any) => any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item: any) => item.id === id ? updater(item) : item)
    }));
  };

  const updateSkillsFromText = (text: string) => {
    const newSkills: SkillItem[] = text.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => ({ id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), name: s, level: 'Intermediate', type: 'Technical' }));
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

  // ---- Forms ----
  const PersonalInfoForm = () => {
    const [localPersonal, setLocalPersonal] = useState(resumeData.personal);

    const debouncedUpdate = useCallback(() => {
      setResumeData(prev => ({ ...prev, personal: localPersonal }));
    }, [localPersonal]);

    useEffect(() => {
      const timeout = setTimeout(debouncedUpdate, 400);
      return () => clearTimeout(timeout);
    }, [debouncedUpdate]);

    useEffect(() => {
      setLocalPersonal(resumeData.personal);
    }, [resumeData.personal]);

    return (
      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(localPersonal) as (keyof PersonalInfo)[]).map((k) => {
          const label = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1');
          return (
            <input
              key={k}
              type="text"
              placeholder={label}
              className="input-field"
              value={localPersonal[k]}
              onChange={(e) => setLocalPersonal(prev => ({ ...prev, [k]: e.target.value }))}
            />
          );
        })}
      </div>
    );
  };

  const SummaryForm = () => {
    const [localSummary, setLocalSummary] = useState(resumeData.summary);

    useEffect(() => {
      setLocalSummary(resumeData.summary);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalSummary(e.target.value);
    };

    const debouncedUpdate = useCallback(() => {
      setResumeData(prev => ({ ...prev, summary: localSummary }));
    }, [localSummary]);

    useEffect(() => {
      const timeout = setTimeout(debouncedUpdate, 400);
      return () => clearTimeout(timeout);
    }, [debouncedUpdate]);

    return (
      <textarea
        rows={5}
        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Write your professional summary here..."
        value={localSummary}
        onChange={handleChange}
      />
    );
  };

  const ExperienceForm = () => {
    const [localExperience, setLocalExperience] = useState(resumeData.experience);

    const updateLocalItem = (id: string, key: keyof ExperienceItem, value: string) => {
      setLocalExperience(prev => prev.map(item =>
        item.id === id ? { ...item, [key]: value } : item
      ));
    };

    const debouncedUpdate = useCallback(() => {
      setResumeData(prev => ({ ...prev, experience: localExperience }));
    }, [localExperience]);

    useEffect(() => {
      const timeout = setTimeout(debouncedUpdate, 400);
      return () => clearTimeout(timeout);
    }, [debouncedUpdate]);

    useEffect(() => {
      if (localExperience.length !== resumeData.experience.length ||
        localExperience.some((item, index) => item.id !== resumeData.experience[index]?.id)) {
        setLocalExperience(resumeData.experience);
      }
    }, [resumeData.experience]);

    return (
      <div className="space-y-4">
        {localExperience.map(item => (
          <div key={item.id} className="border p-3 rounded-lg relative">
            <input
              type="text"
              placeholder="Title"
              value={item.title}
              onChange={(e) => updateLocalItem(item.id, 'title', e.target.value)}
              className="input-field mb-2 font-semibold"
            />
            <input
              type="text"
              placeholder="Company"
              value={item.company}
              onChange={(e) => updateLocalItem(item.id, 'company', e.target.value)}
              className="input-field mb-2"
            />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="month"
                placeholder="Start Date"
                value={item.startDate}
                onChange={(e) => updateLocalItem(item.id, 'startDate', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="End Date"
                value={item.endDate}
                onChange={(e) => updateLocalItem(item.id, 'endDate', e.target.value)}
                className="input-field"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Key achievements (use bullets and quantify!)"
              value={item.description}
              onChange={(e) => updateLocalItem(item.id, 'description', e.target.value)}
              className="input-field"
            />
            <button onClick={() => removeItem('experience', item.id)} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
          </div>
        ))}
        <button
          onClick={() => addItem('experience', { title: 'New Position', company: 'Company', startDate: '', endDate: 'Present', description: '' })}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Plus size={16} /> <span>Add Position</span>
        </button>
      </div>
    );
  };

  const EducationForm = () => {
    const [localEducation, setLocalEducation] = useState(resumeData.education);

    const updateLocalItem = (id: string, key: keyof EducationItem, value: string) => {
      setLocalEducation(prev => prev.map(item =>
        item.id === id ? { ...item, [key]: value } : item
      ));
    };

    const debouncedUpdate = useCallback(() => {
      setResumeData(prev => ({ ...prev, education: localEducation }));
    }, [localEducation]);

    useEffect(() => {
      const timeout = setTimeout(debouncedUpdate, 400);
      return () => clearTimeout(timeout);
    }, [debouncedUpdate]);

    useEffect(() => {
      if (localEducation.length !== resumeData.education.length ||
        localEducation.some((item, index) => item.id !== resumeData.education[index]?.id)) {
        setLocalEducation(resumeData.education);
      }
    }, [resumeData.education]);

    return (
      <div className="space-y-4">
        {localEducation.map(item => (
          <div key={item.id} className="border p-3 rounded-lg relative">
            <input
              type="text"
              placeholder="Degree"
              value={item.degree}
              onChange={(e) => updateLocalItem(item.id, 'degree', e.target.value)}
              className="input-field mb-1 font-semibold"
            />
            <input
              type="text"
              placeholder="Institution"
              value={item.institution}
              onChange={(e) => updateLocalItem(item.id, 'institution', e.target.value)}
              className="input-field text-sm mb-1"
            />
            <input
              type="text"
              placeholder="City"
              value={item.city}
              onChange={(e) => updateLocalItem(item.id, 'city', e.target.value)}
              className="input-field text-sm mb-2"
            />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="month"
                placeholder="Start Date"
                value={item.startDate}
                onChange={(e) => updateLocalItem(item.id, 'startDate', e.target.value)}
                className="input-field"
              />
              <input
                type="month"
                placeholder="End Date"
                value={item.endDate}
                onChange={(e) => updateLocalItem(item.id, 'endDate', e.target.value)}
                className="input-field"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Description (optional)"
              value={item.description || ''}
              onChange={(e) => updateLocalItem(item.id, 'description', e.target.value)}
              className="input-field"
            />
            <button onClick={() => removeItem('education', item.id)} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
          </div>
        ))}
        <button
          onClick={() => addItem('education', { degree: 'New Degree', institution: 'University', city: '', startDate: '', endDate: '' })}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Plus size={16} /> <span>Add Education</span>
        </button>
      </div>
    );
  };

  const SkillsForm = () => {
    const initialText = useMemo(() => resumeData.skills.map(s => s.name).join(', '), []);
    const [localSkillsText, setLocalSkillsText] = useState(initialText);

    const debouncedUpdate = useCallback(() => {
      updateSkillsFromText(localSkillsText);
    }, [localSkillsText]);

    useEffect(() => {
      const timeout = setTimeout(debouncedUpdate, 400);
      return () => clearTimeout(timeout);
    }, [debouncedUpdate]);

    return (
      <div>
        <textarea
          rows={4}
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="List all skills, separated by commas (e.g., React, Python, AWS, Scrum)"
          value={localSkillsText}
          onChange={(e) => setLocalSkillsText(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {resumeData.skills.map((skill) => (
            <span key={skill.id} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const ProjectsForm = () => {
    const [localProjects, setLocalProjects] = useState(resumeData.projects);

    const updateLocalItem = useCallback((id: string, key: keyof ProjectItem, value: string) => {
      setLocalProjects(prev => prev.map(item =>
        item.id === id ? { ...item, [key]: value } : item
      ));
    }, []);

    const debouncedUpdate = useCallback(() => {
      setResumeData(prev => ({ ...prev, projects: localProjects }));
    }, [localProjects]);

    useEffect(() => {
      const timeout = setTimeout(debouncedUpdate, 400);
      return () => clearTimeout(timeout);
    }, [debouncedUpdate]);

    useEffect(() => {
      if (localProjects.length !== resumeData.projects.length ||
        localProjects.some((item, index) => item.id !== resumeData.projects[index]?.id)) {
        setLocalProjects(resumeData.projects);
      }
    }, [resumeData.projects]);

    return (
      <div className="space-y-4">
        {localProjects.map(item => (
          <div key={item.id} className="border p-3 rounded-lg relative">
            <input
              type="text"
              placeholder="Project Name"
              value={item.name}
              onChange={(e) => updateLocalItem(item.id, 'name', e.target.value)}
              className="input-field mb-2 font-semibold"
            />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                placeholder="Your Role (e.g., Lead Dev)"
                value={item.role}
                onChange={(e) => updateLocalItem(item.id, 'role', e.target.value)}
                className="input-field"
              />
              <input
                type="url"
                placeholder="Project URL/Link (Optional)"
                value={item.url}
                onChange={(e) => updateLocalItem(item.id, 'url', e.target.value)}
                className="input-field"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Key technologies and impact (use bullet points or hyphens)"
              value={item.description}
              onChange={(e) => updateLocalItem(item.id, 'description', e.target.value)}
              className="input-field"
            />
            <button onClick={() => removeItem('projects', item.id)} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
          </div>
        ))}
        <button
          onClick={() => addItem('projects', { name: 'New Project', role: '', description: '', url: '' })}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Plus size={16} /> <span>Add Project</span>
        </button>
      </div>
    );
  };

  const CertificationsForm = () => {
    const [localCertifications, setLocalCertifications] = useState(resumeData.certifications);

    const updateLocalItem = useCallback((id: string, key: keyof CertificationItem, value: string) => {
      setLocalCertifications(prev => prev.map(item =>
        item.id === id ? { ...item, [key]: value } : item
      ));
    }, []);

    const debouncedUpdate = useCallback(() => {
      setResumeData(prev => ({ ...prev, certifications: localCertifications }));
    }, [localCertifications]);

    useEffect(() => {
      const timeout = setTimeout(debouncedUpdate, 400);
      return () => clearTimeout(timeout);
    }, [debouncedUpdate]);

    useEffect(() => {
      if (localCertifications.length !== resumeData.certifications.length ||
        localCertifications.some((item, index) => item.id !== resumeData.certifications[index]?.id)) {
        setLocalCertifications(resumeData.certifications);
      }
    }, [resumeData.certifications]);

    return (
      <div className="space-y-4">
        {localCertifications.map(item => (
          <div key={item.id} className="border p-3 rounded-lg relative">
            <input
              type="text"
              placeholder="Certification Name"
              value={item.name}
              onChange={(e) => updateLocalItem(item.id!, 'name', e.target.value)}
              className="input-field mb-2 font-semibold"
            />
            <input
              type="text"
              placeholder="Issuing Authority (e.g., AWS, Coursera)"
              value={item.authority}
              onChange={(e) => updateLocalItem(item.id!, 'authority', e.target.value)}
              className="input-field mb-2"
            />
            <input
              type="month"
              placeholder="Completion Date"
              value={item.date}
              onChange={(e) => updateLocalItem(item.id!, 'date', e.target.value)}
              className="input-field"
            />
            <button onClick={() => removeItem('certifications', item.id!)} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
          </div>
        ))}
        <button
          onClick={() => addItem('certifications', { name: 'New Certification', authority: '', date: '' })}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Plus size={16} /> <span>Add Certification</span>
        </button>
      </div>
    );
  };

  const InterestsForm = () => {
    const [localInterests, setLocalInterests] = useState(resumeData.interests || '');

    const debouncedUpdate = useCallback(() => {
      setResumeData(prev => ({ ...prev, interests: localInterests }));
    }, [localInterests]);

    useEffect(() => {
      const timeout = setTimeout(debouncedUpdate, 400);
      return () => clearTimeout(timeout);
    }, [debouncedUpdate]);

    useEffect(() => {
      setLocalInterests(resumeData.interests || '');
    }, [resumeData.interests]);

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
  };

  const AchievementsForm = () => {
    const [localAchievements, setLocalAchievements] = useState(resumeData.achievements);

    const updateLocalItem = useCallback((id: string, key: keyof AchievementItem, value: string) => {
      setLocalAchievements(prev => prev.map(item =>
        item.id === id ? { ...item, [key]: value } : item
      ));
    }, []);

    const debouncedUpdate = useCallback(() => {
      setResumeData(prev => ({ ...prev, achievements: localAchievements }));
    }, [localAchievements]);

    useEffect(() => {
      const timeout = setTimeout(debouncedUpdate, 400);
      return () => clearTimeout(timeout);
    }, [debouncedUpdate]);

    useEffect(() => {
      if (localAchievements.length !== resumeData.achievements.length ||
        localAchievements.some((item, index) => item.id !== resumeData.achievements[index]?.id)) {
        setLocalAchievements(resumeData.achievements);
      }
    }, [resumeData.achievements]);

    return (
      <div className="space-y-4">
        {localAchievements.map(item => (
          <div key={item.id} className="border p-3 rounded-lg relative">
            <textarea
              rows={2}
              placeholder="Describe a key achievement, award, or recognition."
              value={item.description}
              onChange={(e) => updateLocalItem(item.id!, 'description', e.target.value)}
              className="input-field"
            />
            <button onClick={() => removeItem('achievements', item.id!)} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
          </div>
        ))}
        <button
          onClick={() => addItem('achievements', { description: '' })}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Plus size={16} /> <span>Add Achievement</span>
        </button>
      </div>
    );
  };

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
  }), [/* forms don't change */]);

  const renderSectionContent = (sectionId: string) => {
    const config = allSections.find(s => s.id === sectionId);
    if (!config) return null;
    const Component = (formComponentMap as any)[config.form];
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
    const blob = await pdf(<ResumePDF data={resumeData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Template Gallery (Option C) ----
  const TemplateGallery: React.FC = () => {
    // we will allow drag-to-scroll using framer-motion (drag="x") and also pointer events for scrollbar
    return (
      <div className="w-full mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🎨 Pick a Template — swipe horizontally</h3>

        <motion.div
          className="flex gap-4 overflow-x-auto py-2 px-2"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          whileTap={{ cursor: 'grabbing' }}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {templates.map((t, idx) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTemplate(t.id)}
              className={`min-w-[220px] max-w-[280px] flex-shrink-0 rounded-2xl border p-3 cursor-pointer transition-shadow
                ${selectedTemplate === t.id ? 'border-blue-600 ring-2 ring-blue-200 shadow-2xl scale-105' : 'border-gray-200 hover:shadow-lg'}`}
            >
              {/* mini preview area — simple, clean placeholder. Replace with real snapshot later if you want */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 border rounded-lg overflow-hidden h-36 flex items-center justify-center">
                {/* small visual accents mimicking template styles */}
                <div className="w-full h-full p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-full w-9 h-9 ${selectedTemplate === t.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    <div className="text-xs px-2 py-1 rounded-full bg-white/60">{t.id.toUpperCase()}</div>
                  </div>

                  <div className="mb-1">
                    <div className="h-3 rounded bg-gray-200 w-3/4 mb-2" />
                    <div className="h-2 rounded bg-gray-200 w-1/2" />
                  </div>
                </div>

                {/* selected checkmark */}
                {selectedTemplate === t.id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                    <CheckCircle size={14} />
                  </motion.div>
                )}
              </div>

              <div className="mt-3 flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.description}</p>
                </div>
                <div className="text-xs text-gray-400 ml-2">•</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-xs text-gray-500 mt-2">Tip: drag the gallery left/right or click a card to select a template. The preview below updates instantly.</p>
      </div>
    );
  };

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-blue-600" />
              Professional Resume Builder
            </h1>
            <p className="text-lg text-gray-600">Drag, Drop, AI Optimize, and Download.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAtsReportVisible(!atsReportVisible)} className="flex items-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
              <Settings className="w-4 h-4" />
              <span>{atsReportVisible ? 'Hide' : 'Show'} ATS Analyzer</span>
            </button>
            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
              <div className="text-xs text-gray-600">Selected Template</div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">{templates.find(t => t.id === selectedTemplate)?.name}</div>
                <button onClick={() => setShowPreview(true)} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition">Preview</button>
              </div>
            </div>
          </div>
        </div>

        {/* Template Gallery (Full width, horizontal scroll - Option C) */}
        <TemplateGallery />

        <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Builder/Input */}
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

            {/* Custom Section Dropdown */}
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

          {/* ATS/Settings/Preview */}
          <div className={`lg:col-span-1 xl:col-span-2 space-y-8 ${atsReportVisible ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
            {/* ATS Analyzer Tool (Mock UI) */}
            {atsReportVisible && (
              <div className="lg:sticky lg:top-8">
                <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">🎯 ATS Analyzer Tool</h3>
                  <p className='text-xs text-gray-600 mb-3'>Upload your target Job Description (JD) to get a precise match score.</p>
                  <textarea rows={5} placeholder="Paste the Job Description here..." className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3" />
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <h4 className="text-sm font-semibold text-red-800 flex items-center mb-2">
                      <AlertCircle className="w-4 h-4 mr-1" /> AI Match Report (Mock)
                    </h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li><span className="font-bold">Match Score: 55%</span> (Low)</li>
                      <li><span className="font-bold">Missing Keywords:</span> "SQL Server," "Azure," "Scrum Master"</li>
                      <li><span className="font-bold">Suggestion:</span> Increase mention of "Azure" in experience section.</li>
                    </ul>
                  </div>
                  <button className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200">
                    <Zap className="w-4 h-4" />
                    <span>Analyze & Optimize Resume</span>
                  </button>
                </div>
              </div>
            )}

            {/* ATS Score and Checks */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:sticky lg:top-8">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">ATS Score</h2>
                <div className="relative">
                  <div className="w-24 h-24 mx-auto">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-gray-300" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className={`transition-all duration-500 ${atsScore >= 80 ? 'text-green-600' : atsScore >= 60 ? 'text-orange-500' : 'text-red-500'}`}
                        stroke="currentColor" strokeWidth="3" strokeDasharray={`${atsScore}, 100`} strokeLinecap="round" fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{atsScore}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">ATS Compatibility</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">ATS Checks</h3>
                {atsChecks.map((check, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    {check.status ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${check.status ? 'text-gray-700' : 'text-orange-700 font-medium'}`}>
                      {check.check}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Template & Export (compact) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:sticky lg:top-[300px]">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Template & Export</h2>

              {/* Compact selected template preview */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs">{selectedTemplate.toUpperCase()}</div>
                  <div>
                    <div className="text-sm font-medium">{templates.find(t => t.id === selectedTemplate)?.name}</div>
                    <div className="text-xs text-gray-500">{templates.find(t => t.id === selectedTemplate)?.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
                  >
                    Preview
                  </button>
                  <button onClick={handleDownloadPDF} className="px-3 py-1 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition">
                    <Download className="w-4 h-4 inline-block mr-1" /> Export
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">Want a different template? Use the gallery above or swipe to explore more designs.</div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="mt-12 w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Resume Preview: <span className='text-blue-600'>{templates.find(t => t.id === selectedTemplate)?.name}</span></h2>
          <div className="bg-white p-6 shadow-2xl border border-gray-300 mx-auto max-w-4xl min-h-[1000px] overflow-hidden">
            {/* Dynamic Template Component Rendering */}
            <CurrentTemplate
              data={resumeData}
              sectionOrder={sectionOrder}
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
              <div className="p-6">
                <CurrentTemplate
                  data={resumeData}
                  sectionOrder={sectionOrder}
                  allSections={allSections}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;
