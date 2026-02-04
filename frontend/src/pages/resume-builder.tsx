import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText, Download, Eye, CheckCircle, User, Briefcase,
  GraduationCap, Award, Code, Plus, X, Lightbulb, Zap, GripVertical, Settings, Star, Upload,
  Sparkles, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { useTheme } from '../context/ThemeContext';
// import { parseResumeWithAI, rewriteContentWithAI, analyzeATSWithAI } from '../services/aiService';

// --- Import Templates ---
import TemplateBasic from '../templates/TemplateBasic';
import TemplateModern from '../templates/TemplateModern';
import TemplateProfessional from '../templates/TemplateProfessional';
import SherlockHolmesModified from '../templates/SherlockHolmesModified';
// ------------------------

// ---- Types ----
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
  languages: string;
  references: string;
  custom: { [id: string]: string };
}

interface SectionConfig {
  id: string;
  name: string;
  icon: React.FC<any>;
  form: string;
}

interface TemplateComponentProps {
  data: ResumeData;
  sectionOrder: string[];
  allSections: SectionConfig[];
}

interface TemplateConfig {
  id: string;
  name: string;
  component: React.FC<TemplateComponentProps>;
}

const templates: TemplateConfig[] = [
  { id: 'basic', name: 'Basic Professional', component: TemplateBasic },
  { id: 'modern', name: 'Modern Professional', component: TemplateModern },
  { id: 'professional', name: 'Executive Professional', component: TemplateProfessional },
  { id: 'sherlock', name: 'Sherlock Professional', component: SherlockHolmesModified },
];

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
  { id: 'languages', name: 'Languages', icon: Star, form: 'LanguagesForm' },
  { id: 'references', name: 'References', icon: User, form: 'ReferencesForm' },
];

// --- Reusable Hook for Debounced State Updates ---
const useDebouncedState = <T,>(initialValue: T, delay = 400, onUpdate: (newValue: T) => void) => {
  const [localValue, setLocalValue] = useState(initialValue);

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
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

// ---- AI Suggestion ----
const parseResumeText = (text: string): Partial<ResumeData> => {
  const data: Partial<ResumeData> = {
    personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    interests: '',
    languages: '',
    references: '',
    custom: {}
  };

  // 1. Clean up and normalize text
  const cleanText = text.replace(/\s+/g, ' ');

  // 2. Extract Contact Info early (high reliability)
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch && data.personal) data.personal.email = emailMatch[0];

  const phoneMatch = text.match(/(?:PHONE|TEL|CONTACT|MOBILE)?[:\s]*(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/i);
  if (phoneMatch && data.personal) data.personal.phone = phoneMatch[0].replace(/PHONE|TEL|CONTACT|MOBILE/i, '').replace(/[:\s]+/g, ' ').trim();

  const linkedinMatch = text.match(/(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
  if (linkedinMatch && data.personal) data.personal.linkedin = linkedinMatch[0];

  const githubMatch = text.match(/(github\.com\/[a-zA-Z0-9_-]+)/i);
  if (githubMatch && data.personal) data.personal.github = githubMatch[0];

  const portfolioMatch = text.match(/(https?:\/\/[a-z0-9.-]+\.portfolio\.[a-z]+|https?:\/\/([a-z0-9-]+\.)?portfolio\.[a-z]+)/i) ||
    text.match(/(?:PORTFOLIO|WEBSITE)[:\s]*(https?:\/\/[^\s]+)/i);
  if (portfolioMatch && data.personal) data.personal.portfolio = (portfolioMatch[1] || portfolioMatch[0]).replace(/PORTFOLIO|WEBSITE/i, '').replace(/[:\s]+/g, '').trim();

  const locationMatch = text.match(/(?:ADDRESS|LOCATION|LIVES IN)[:\s]*([A-Z\s,]{5,50})(?=\sPHONE|EMAIL|LINKEDIN|GITHUB|SUMMARY|$)/i);
  if (locationMatch && data.personal) data.personal.location = locationMatch[1].trim();

  // 3. Define Section Headers
  const sectionsConfig = [
    { key: 'summary', regex: /\b(SUMMARY|PROFILE|OBJECTIVE|ABOUT ME)\b/i },
    { key: 'experience', regex: /\b(EXPERIENCE|WORK HISTORY|PROFESSIONAL BACKGROUND|EMPLOYMENT)\b/i },
    { key: 'education', regex: /\b(EDUCATION|ACADEMIC BACKGROUND|ACADEMICS)\b/i },
    { key: 'skills', regex: /\b(SKILLS|TECHNICAL SKILLS|TECHNOLOGIES|STRENGTHS)\b/i },
    { key: 'projects', regex: /\b(PROJECTS|KEY PROJECTS|ACADEMIC PROJECTS)\b/i },
    { key: 'certifications', regex: /\b(CERTIFICATIONS|CERTIFICATES|COURSES|AWARDS)\b/i },
    { key: 'achievements', regex: /\b(ACHIEVEMENTS|HONORS)\b/i },
    { key: 'interests', regex: /\b(INTERESTS|HOBBIES)\b/i },
    { key: 'languages', regex: /\b(LANGUAGES)\b/i },
  ];

  // Find all section boundary positions
  const sectionPositions = sectionsConfig.map(conf => {
    const match = text.match(conf.regex);
    return {
      key: conf.key,
      index: match ? match.index! : -1,
      header: match ? match[0] : ''
    };
  }).filter(pos => pos.index !== -1).sort((a, b) => a.index - b.index);

  // Extract content between headers
  const sectionContent: { [key: string]: string } = {};
  for (let i = 0; i < sectionPositions.length; i++) {
    const start = sectionPositions[i].index + sectionPositions[i].header.length;
    const end = (i + 1 < sectionPositions.length) ? sectionPositions[i + 1].index : text.length;
    sectionContent[sectionPositions[i].key] = text.substring(start, end).trim();
  }

  // 4. Map Content to Resume Schema
  if (sectionContent.summary) data.summary = sectionContent.summary.replace(/\s+/g, ' ');

  if (sectionContent.skills) {
    const skillList = sectionContent.skills.split(/[,|•\n\/]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 40);
    data.skills = skillList.map(name => ({
      id: Math.random().toString(36).slice(2),
      name,
      level: 'Intermediate',
      type: 'Technical'
    }));
  }

  if (sectionContent.experience) {
    // Attempt to split into items by bullet points or common separators
    const expItems = sectionContent.experience.split(/•|\n(?=[A-Z])/).filter(s => s.trim().length > 10);
    data.experience = expItems.slice(0, 5).map((item, idx) => ({
      id: `ext-exp-${idx}`,
      title: item.split('\n')[0].trim().substring(0, 50) || 'Experience Item',
      company: 'Extracted Company',
      startDate: '',
      endDate: '',
      description: item.trim()
    }));
  }

  if (sectionContent.education) {
    data.education = [{
      id: 'ext-edu-1',
      degree: sectionContent.education.split(/[,|\n]/)[0].trim().substring(0, 50),
      institution: 'Extracted Institution',
      city: '',
      startDate: '',
      endDate: '',
      description: sectionContent.education.trim()
    }];
  }

  if (sectionContent.projects) {
    const projItems = sectionContent.projects.split(/•|\n(?=[A-Z])/).filter(s => s.trim().length > 10);
    data.projects = projItems.slice(0, 4).map((item, idx) => ({
      id: `ext-proj-${idx}`,
      name: item.split('\n')[0].trim().substring(0, 50) || 'Project Name',
      role: 'Contributor',
      description: item.trim(),
      url: ''
    }));
  }

  if (sectionContent.interests) data.interests = sectionContent.interests.replace(/\s+/g, ' ');
  if (sectionContent.languages) data.languages = sectionContent.languages.replace(/\s+/g, ' ');

  if (sectionContent.certifications) {
    const certItems = sectionContent.certifications.split(/•|\n(?=[A-Z])/).filter(s => s.trim().length > 5);
    data.certifications = certItems.slice(0, 4).map((item, idx) => ({
      id: `ext-cert-${idx}`,
      name: item.split('\n')[0].trim().substring(0, 50),
      authority: 'Extracted Authority',
      date: ''
    }));
  }

  if (sectionContent.achievements) {
    const achItems = sectionContent.achievements.split(/•|\n(?=[A-Z])/).filter(s => s.trim().length > 5);
    data.achievements = achItems.slice(0, 5).map((item, idx) => ({
      id: `ext-ach-${idx}`,
      description: item.trim()
    }));
  }

  // 5. Smart Name Extraction
  // If common patterns fail, we use the fact that the name is often the largest text or at the top.
  // In the user's specific text, the name appears near CONTACT ADDRESS
  const namePatternMatch = cleanText.match(/([A-Z]{3,}\s[A-Z]{3,}(?:\s[A-Z]{3,})?)/);
  const contactNameMatch = cleanText.match(/([A-Z\s]{5,})(?=\sCONTACT ADDRESS|ADDRESS|PHONE|EMAIL)/i);

  if (contactNameMatch) {
    data.personal!.name = contactNameMatch[1].trim();
  } else if (namePatternMatch) {
    data.personal!.name = namePatternMatch[1].trim();
  } else {
    // Fallback to first line
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length > 2) data.personal!.name = firstLine;
  }

  // Final cleanup of name if it caught a header
  if (data.personal?.name && /SUMMARY|EXPERIENCE|EDUCATION|SKILLS/i.test(data.personal.name)) {
    const filteredLines = text.split('\n').filter(l => !/SUMMARY|EXPERIENCE|EDUCATION|SKILLS/i.test(l) && l.trim().length > 3);
    if (filteredLines[0]) data.personal.name = filteredLines[0].trim();
  }

  // Final fallback using cleanText
  if (!data.personal?.name && cleanText.length > 0) {
    const words = cleanText.split(' ');
    if (words.length >= 2) data.personal!.name = words.slice(0, 3).join(' ');
  }

  return data;
};

const getAISuggestion = (section: string, _data: any): string => {
  if (section === 'summary') {
    return '⚡ AI Suggestion: Try this ATS-optimized summary: "Results-driven Software Engineer with 5+ years of expertise in high-load distributed systems, achieving 20% latency reduction across core services."';
  }
  if (section === 'rewrite') {
    return '✨ AI Rewrite: "Reduced annual hosting costs by $15,000 by migrating critical infrastructure to AWS Lambda and containerized environments."';
  }
  return '';
};

// ---- Sub-components (outside main component to fix cursor focus) ----

const ExperienceItemInput = React.memo(({ item, updateArrayItem, removeItem, handleRewrite }: { item: ExperienceItem, updateArrayItem: any, removeItem: any, handleRewrite: any }) => {
  const [localItem, setLocalItem] = useDebouncedState<ExperienceItem>(
    item,
    400,
    (newItem) => updateArrayItem('experience', newItem.id, () => newItem)
  );

  return (
    <div className="border border-white/5 bg-white/5 p-4 rounded-xl relative group hover:border-brand-cyan/20 transition-all">
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
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">Start Date</p>
          <input
            type="month"
            value={localItem.startDate}
            onChange={(e) => setLocalItem(prev => ({ ...prev, startDate: e.target.value }))}
            className="input-field"
          />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">End Date</p>
          <input
            type="text"
            placeholder="e.g. Present"
            value={localItem.endDate}
            onChange={(e) => setLocalItem(prev => ({ ...prev, endDate: e.target.value }))}
            className="input-field"
          />
        </div>
      </div>
      <div className="relative group/textarea">
        <textarea
          rows={3}
          placeholder="Key achievements (use bullets and quantify!)"
          value={localItem.description}
          onChange={(e) => setLocalItem(prev => ({ ...prev, description: e.target.value }))}
          className="input-field pr-10"
        />
        /* <button
          onClick={() => handleRewrite(localItem.description, `experience.${localItem.id}.description`, 'work experience achievements')}
          className="absolute right-3 top-3 p-1 rounded-lg bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-black transition-all opacity-0 group-hover/textarea:opacity-100"
          title="AI Rewrite"
        >
          <Sparkles size={14} />
        </button> */
      </div>
      <button onClick={() => removeItem('experience', item.id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
    </div>
  );
});

const EducationItemInput = React.memo(({ item, updateArrayItem, removeItem }: { item: EducationItem, updateArrayItem: any, removeItem: any }) => {
  const [localItem, setLocalItem] = useDebouncedState<EducationItem>(
    item,
    400,
    (newItem) => updateArrayItem('education', newItem.id, () => newItem)
  );

  return (
    <div className="border border-white/5 bg-white/5 p-4 rounded-xl relative group hover:border-brand-cyan/20 transition-all">
      <input
        type="text"
        placeholder="Degree"
        value={localItem.degree}
        onChange={(e) => setLocalItem(prev => ({ ...prev, degree: e.target.value }))}
        className="input-field mb-2 font-semibold"
      />
      <input
        type="text"
        placeholder="Institution"
        value={localItem.institution}
        onChange={(e) => setLocalItem(prev => ({ ...prev, institution: e.target.value }))}
        className="input-field text-sm mb-2"
      />
      <input
        type="text"
        placeholder="City"
        value={localItem.city}
        onChange={(e) => setLocalItem(prev => ({ ...prev, city: e.target.value }))}
        className="input-field text-sm mb-2"
      />
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">Start Date</p>
          <input
            type="month"
            value={localItem.startDate}
            onChange={(e) => setLocalItem(prev => ({ ...prev, startDate: e.target.value }))}
            className="input-field"
          />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">End Date</p>
          <input
            type="month"
            value={localItem.endDate}
            onChange={(e) => setLocalItem(prev => ({ ...prev, endDate: e.target.value }))}
            className="input-field"
          />
        </div>
      </div>
      <textarea
        rows={2}
        placeholder="Description (optional)"
        value={localItem.description || ''}
        onChange={(e) => setLocalItem(prev => ({ ...prev, description: e.target.value }))}
        className="input-field"
      />
      <button onClick={() => removeItem('education', item.id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
    </div>
  );
});

const ProjectItemInput = React.memo(({ item, updateArrayItem, removeItem, handleRewrite }: { item: ProjectItem, updateArrayItem: any, removeItem: any, handleRewrite: any }) => {
  const [localItem, setLocalItem] = useDebouncedState<ProjectItem>(
    item,
    400,
    (newItem) => updateArrayItem('projects', newItem.id, () => newItem)
  );

  return (
    <div className="border border-white/5 bg-white/5 p-4 rounded-xl relative group hover:border-brand-cyan/20 transition-all">
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
          placeholder="Your Role"
          value={localItem.role}
          onChange={(e) => setLocalItem(prev => ({ ...prev, role: e.target.value }))}
          className="input-field"
        />
        <input
          type="url"
          placeholder="Project URL"
          value={localItem.url}
          onChange={(e) => setLocalItem(prev => ({ ...prev, url: e.target.value }))}
          className="input-field"
        />
      </div>
      <div className="relative group/textarea">
        <textarea
          rows={3}
          placeholder="Description"
          value={localItem.description}
          onChange={(e) => setLocalItem(prev => ({ ...prev, description: e.target.value }))}
          className="input-field pr-10"
        />
        /* <button
          onClick={() => handleRewrite(localItem.description, `projects.${localItem.id}.description`, 'project description')}
          className="absolute right-3 top-3 p-1 rounded-lg bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-black transition-all opacity-0 group-hover/textarea:opacity-100"
          title="AI Rewrite"
        >
          <Sparkles size={14} />
        </button> */
      </div>
      <button onClick={() => removeItem('projects', item.id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
    </div>
  );
});

const CertificationItemInput = React.memo(({ item, updateArrayItem, removeItem }: { item: CertificationItem, updateArrayItem: any, removeItem: any }) => {
  const [localItem, setLocalItem] = useDebouncedState<CertificationItem>(
    item,
    400,
    (newItem) => updateArrayItem('certifications', newItem.id, () => newItem)
  );

  return (
    <div className="border border-white/5 bg-white/5 p-4 rounded-xl relative group hover:border-brand-cyan/20 transition-all">
      <input
        type="text"
        placeholder="Certification Name"
        value={localItem.name}
        onChange={(e) => setLocalItem(prev => ({ ...prev, name: e.target.value }))}
        className="input-field mb-2 font-semibold"
      />
      <input
        type="text"
        placeholder="Issuing Authority"
        value={localItem.authority}
        onChange={(e) => setLocalItem(prev => ({ ...prev, authority: e.target.value }))}
        className="input-field mb-2"
      />
      <input
        type="month"
        value={localItem.date}
        onChange={(e) => setLocalItem(prev => ({ ...prev, date: e.target.value }))}
        className="input-field"
      />
      <button onClick={() => removeItem('certifications', item.id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
    </div>
  );
});

const AchievementItemInput = React.memo(({ item, updateArrayItem, removeItem, handleRewrite }: { item: AchievementItem, updateArrayItem: any, removeItem: any, handleRewrite: any }) => {
  const [localItem, setLocalItem] = useDebouncedState<AchievementItem>(
    item,
    400,
    (newItem) => updateArrayItem('achievements', newItem.id, () => newItem)
  );

  return (
    <div className="border border-white/5 bg-white/5 p-4 rounded-xl relative group hover:border-brand-cyan/20 transition-all">
      <div className="relative group/textarea">
        <textarea
          rows={2}
          placeholder="Achievement description"
          value={localItem.description}
          onChange={(e) => setLocalItem(prev => ({ ...prev, description: e.target.value }))}
          className="input-field pr-10"
        />
        /* <button
          onClick={() => handleRewrite(localItem.description, `achievements.${localItem.id}.description`, 'professional achievement')}
          className="absolute right-3 top-3 p-1 rounded-lg bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-black transition-all opacity-0 group-hover/textarea:opacity-100"
          title="AI Rewrite"
        >
          <Sparkles size={14} />
        </button> */
      </div>
      <button onClick={() => removeItem('achievements', item.id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
    </div>
  );
});

const PersonalInfoForm = ({ data, updatePersonalInfo }: { data: PersonalInfo, updatePersonalInfo: any }) => (
  <div className="grid grid-cols-2 gap-4">
    {(Object.keys(data) as (keyof PersonalInfo)[]).map((k) => {
      const label = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1');
      return (
        <div key={k} className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">{label}</p>
          <input
            type="text"
            placeholder={label}
            className="input-field"
            value={data[k]}
            onChange={(e) => updatePersonalInfo(k, e.target.value)}
          />
        </div>
      );
    })}
  </div>
);

const StringSectionForm = ({ value, label, placeholder, setResumeData, field, handleRewrite }: { value: string, label: string, placeholder: string, setResumeData: any, field: keyof ResumeData, handleRewrite: any }) => {
  const [localValue, setLocalValue] = useDebouncedState(
    value,
    400,
    (newValue) => setResumeData((prev: any) => ({ ...prev, [field]: newValue }))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{label}</p>
        {/* <button
          onClick={() => handleRewrite(localValue, field, label)}
          className="flex items-center gap-2 text-[10px] font-bold text-brand-cyan hover:text-white transition-colors"
        >
          <Sparkles size={12} />
          AI REWRITE
        </button> */}
      </div>
      <textarea
        rows={4}
        className="input-field"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  );
};

const SummaryForm = ({ summary, setResumeData, handleRewrite }: { summary: string, setResumeData: any, handleRewrite: any }) => (
  <StringSectionForm value={summary} label="Professional Summary" placeholder="Write your professional summary here..." setResumeData={setResumeData} field="summary" handleRewrite={handleRewrite} />
);

const ExperienceForm = ({ experience, addItem, updateArrayItem, removeItem, handleRewrite }: { experience: ExperienceItem[], addItem: any, updateArrayItem: any, removeItem: any, handleRewrite: any }) => (
  <div className="space-y-4">
    {experience.map(item => (
      <ExperienceItemInput key={item.id} item={item} updateArrayItem={updateArrayItem} removeItem={removeItem} handleRewrite={handleRewrite} />
    ))}
    <button
      onClick={() => addItem('experience', { title: '', company: '', startDate: '', endDate: 'Present', description: '' })}
      className="flex items-center space-x-2 text-brand-cyan hover:text-white transition-colors text-sm font-bold tracking-tight"
    >
      <Plus size={16} /> <span>ADD EXPERIENCE</span>
    </button>
  </div>
);

const EducationForm = ({ education, addItem, updateArrayItem, removeItem }: { education: EducationItem[], addItem: any, updateArrayItem: any, removeItem: any }) => (
  <div className="space-y-4">
    {education.map(item => (
      <EducationItemInput key={item.id} item={item} updateArrayItem={updateArrayItem} removeItem={removeItem} />
    ))}
    <button
      onClick={() => addItem('education', { degree: '', institution: '', city: '', startDate: '', endDate: '' })}
      className="flex items-center space-x-2 text-brand-cyan hover:text-white transition-colors text-sm font-bold tracking-tight"
    >
      <Plus size={16} /> <span>ADD EDUCATION</span>
    </button>
  </div>
);

const SkillsForm = ({ skills, updateSkillsFromText, theme }: { skills: SkillItem[], updateSkillsFromText: any, theme: string }) => (
  <div className="space-y-4">
    <textarea
      rows={4}
      className="input-field"
      placeholder="List skills, separated by commas (e.g., React, Python, AWS)"
      value={skills.map(s => s.name).join(', ')}
      onChange={(e) => updateSkillsFromText(e.target.value)}
    />
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill.id || skill.name}
          className={`px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}
        >
          {skill.name}
        </span>
      ))}
    </div>
  </div>
);

const ProjectsForm = ({ projects, addItem, updateArrayItem, removeItem, handleRewrite }: { projects: ProjectItem[], addItem: any, updateArrayItem: any, removeItem: any, handleRewrite: any }) => (
  <div className="space-y-4">
    {projects.map(item => (
      <ProjectItemInput key={item.id} item={item} updateArrayItem={updateArrayItem} removeItem={removeItem} handleRewrite={handleRewrite} />
    ))}
    <button
      onClick={() => addItem('projects', { name: '', role: '', description: '', url: '' })}
      className="flex items-center space-x-2 text-brand-cyan hover:text-white transition-colors text-sm font-bold tracking-tight"
    >
      <Plus size={16} /> <span>ADD PROJECT</span>
    </button>
  </div>
);

const CertificationsForm = ({ certifications, addItem, updateArrayItem, removeItem }: { certifications: CertificationItem[], addItem: any, updateArrayItem: any, removeItem: any }) => (
  <div className="space-y-4">
    {certifications.map(item => (
      <CertificationItemInput key={item.id} item={item} updateArrayItem={updateArrayItem} removeItem={removeItem} />
    ))}
    <button
      onClick={() => addItem('certifications', { name: '', authority: '', date: '' })}
      className="flex items-center space-x-2 text-brand-cyan hover:text-white transition-colors text-sm font-bold tracking-tight"
    >
      <Plus size={16} /> <span>ADD CERTIFICATION</span>
    </button>
  </div>
);

const InterestsForm = ({ interests, setResumeData, handleRewrite }: { interests: string, setResumeData: any, handleRewrite: any }) => (
  <StringSectionForm value={interests} label="Interests & Hobbies" placeholder="e.g. Photography, Marathon Running..." setResumeData={setResumeData} field="interests" handleRewrite={handleRewrite} />
);

const LanguagesForm = ({ languages, setResumeData, handleRewrite }: { languages: string, setResumeData: any, handleRewrite: any }) => (
  <StringSectionForm value={languages} label="Languages" placeholder="e.g. English (Fluent), French (B2)..." setResumeData={setResumeData} field="languages" handleRewrite={handleRewrite} />
);

const ReferencesForm = ({ references, setResumeData, handleRewrite }: { references: string, setResumeData: any, handleRewrite: any }) => (
  <StringSectionForm value={references} label="References" placeholder="Available upon request" setResumeData={setResumeData} field="references" handleRewrite={handleRewrite} />
);

const CustomSectionForm = ({ id, name, content, setResumeData }: { id: string, name: string, content: string, setResumeData: any }) => {
  const [localValue, setLocalValue] = useDebouncedState(
    content,
    400,
    (newValue) => setResumeData((prev: any) => ({
      ...prev,
      custom: { ...prev.custom, [id]: newValue }
    }))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">{name}</p>
      </div>
      <textarea
        rows={5}
        className="input-field"
        placeholder={`Enter content for ${name}...`}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  );
};

const AchievementsForm = ({ achievements, addItem, updateArrayItem, removeItem, handleRewrite }: { achievements: AchievementItem[], addItem: any, updateArrayItem: any, removeItem: any, handleRewrite: any }) => (
  <div className="space-y-4">
    {achievements.map(item => (
      <AchievementItemInput key={item.id} item={item} updateArrayItem={updateArrayItem} removeItem={removeItem} handleRewrite={handleRewrite} />
    ))}
    <button
      onClick={() => addItem('achievements', { description: '' })}
      className="flex items-center space-x-2 text-brand-cyan hover:text-white transition-colors text-sm font-bold tracking-tight"
    >
      <Plus size={16} /> <span>ADD ACHIEVEMENT</span>
    </button>
  </div>
);

const ResumeBuilder = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('personal');
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [customSections, setCustomSections] = useState<string[]>([]);
  const [userCreatedConfigs, setUserCreatedConfigs] = useState<SectionConfig[]>([]);
  const [newSectionName, setNewSectionName] = useState('');

  const allSections = useMemo(() => {
    return [
      ...initialSections,
      ...customSections.map(id => {
        const standard = customSectionsConfig.find(c => c.id === id);
        if (standard) return standard;
        return userCreatedConfigs.find(c => c.id === id);
      }).filter(Boolean) as SectionConfig[],
    ];
  }, [customSections, userCreatedConfigs]);

  const initialSectionIds = useMemo(() => allSections.map(s => s.id), [allSections]);
  const [sectionOrder, setSectionOrder] = useState<string[]>(initialSectionIds);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [atsReportVisible, setAtsReportVisible] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiAtsReport, setAiAtsReport] = useState<any>(null);
  const [pendingRewrite, setPendingRewrite] = useState<{ path: string, original: string, rewritten: string } | null>(null);

  useEffect(() => {
    if (dragCounter > 0) console.log('Current Drag Counter:', dragCounter);
  }, [dragCounter]);

  /* const handleRewrite = async (text: string, path: string, context?: string) => {
    if (!text || text.trim().length < 5) {
      alert('Please enter at least a few words to rewrite.');
      return;
    }

    setIsAIProcessing(true);
    try {
      const rewritten = await rewriteContentWithAI(text, context || 'resume content');

      // Store the rewrite for user approval instead of immediately applying
      setPendingRewrite({
        path,
        original: text,
        rewritten
      });
    } catch (error) {
      alert('Failed to rewrite content with AI.');
    } finally {
      setIsAIProcessing(false);
    }
  }; */

  const handleRewrite = () => { };

  const acceptRewrite = () => {
    if (!pendingRewrite) return;

    const { path, rewritten } = pendingRewrite;
    const pathParts = path.split('.');

    setResumeData(prev => {
      const newData = { ...prev };
      let current: any = newData;

      // Navigate through the path, handling arrays specially
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];

        // If current is an array, find the item by ID
        if (Array.isArray(current)) {
          current = current.find((item: any) => item.id === part);
          if (!current) {
            console.error(`Could not find item with id ${part}`);
            return prev;
          }
        } else {
          current = current[part];
          if (!current) {
            console.error(`Could not navigate to ${part}`);
            return prev;
          }
        }
      }

      // Set the final property
      const finalKey = pathParts[pathParts.length - 1];
      if (current && typeof current === 'object') {
        current[finalKey] = rewritten;
      } else {
        console.error('Invalid path for rewrite');
        return prev;
      }

      return newData;
    });

    setPendingRewrite(null);
  };

  const rejectRewrite = () => {
    setPendingRewrite(null);
  };

  const handleATSAnalysis = async () => {
    /* setIsAIProcessing(true);
    try {
      const report = await analyzeATSWithAI(resumeData);
      setAiAtsReport(report);
    } catch (error) {
      alert('Failed to analyze ATS score with AI.');
    } finally {
      setIsAIProcessing(false);
    } */
  };

  useEffect(() => {
    setSectionOrder(prev => {
      const newOrder = initialSectionIds;
      if (JSON.stringify(prev) === JSON.stringify(newOrder)) return prev;
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
    languages: 'English (Native), Spanish (Basic)',
    references: 'Available upon request',
    custom: {},
  });

  const updatePersonalInfo = useCallback((key: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [key]: value } }));
  }, []);

  const addItem = useCallback(<K extends keyof ResumeData>(section: K, newItem: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [
        ...(prev[section] as any[]),
        {
          ...newItem,
          id: crypto.randomUUID?.() || Date.now().toString()
        }
      ]
    }));
  }, []);

  const removeItem = useCallback((section: keyof ResumeData, id: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((item: any) => item.id !== id)
    }));
  }, []);

  const updateArrayItem = useCallback(<K extends keyof ResumeData>(section: K, id: string, updater: (item: any) => any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item: any) => item.id === id ? updater(item) : item)
    }));
  }, []);

  const updateSkillsFromText = useCallback((text: string) => {
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
  }, []);

  const atsScore = useMemo(() => {
    let score = 50;
    if (resumeData.personal.title) score += 5;
    if (resumeData.summary.trim().length > 80) score += 10;
    if (resumeData.experience.some(exp => /\d+%/.test(exp.description))) score += 10;
    if (resumeData.skills.length >= 10) score += 5;
    if (resumeData.experience.length > 0 && resumeData.education.length > 0) score += 10;
    if (resumeData.projects.length > 0) score += 5;
    if (resumeData.certifications.length > 0) score += 5;
    return Math.min(100, Math.max(0, score));
  }, [resumeData]);

  const atsChecks = useMemo(() => [
    { check: 'Professional Title included', status: !!resumeData.personal.title, key: 'title' },
    { check: 'Action-verb starting bullets', status: resumeData.experience.some(exp => exp.description && /^(Led|Reduced|Built|Implemented|Designed|Owned|Improved)/i.test(exp.description.trim())), key: 'action_verbs' },
    { check: 'Quantified results present', status: resumeData.experience.some(exp => exp.description && /\d+%/.test(exp.description)), key: 'quantified' },
    { check: 'Dedicated Skills Section', status: resumeData.skills.length > 0, key: 'skills_section' },
    { check: 'Projects or Certifications included', status: resumeData.projects.length > 0 || resumeData.certifications.length > 0, key: 'extra_sections' },
    { check: 'Formatting is clean (No tables/images)', status: true, key: 'clean_format' },
  ], [resumeData]);

  const renderSectionContent = (sectionId: string) => {
    const config = allSections.find(s => s.id === sectionId);
    if (!config) return null;

    switch (config.form) {
      case 'PersonalInfoForm': return <PersonalInfoForm data={resumeData.personal} updatePersonalInfo={updatePersonalInfo} />;
      case 'SummaryForm': return <SummaryForm summary={resumeData.summary} setResumeData={setResumeData} handleRewrite={handleRewrite} />;
      case 'ExperienceForm': return <ExperienceForm experience={resumeData.experience} addItem={addItem} updateArrayItem={updateArrayItem} removeItem={removeItem} handleRewrite={handleRewrite} />;
      case 'EducationForm': return <EducationForm education={resumeData.education} addItem={addItem} updateArrayItem={updateArrayItem} removeItem={removeItem} />;
      case 'SkillsForm': return <SkillsForm skills={resumeData.skills} updateSkillsFromText={updateSkillsFromText} theme={theme} />;
      case 'ProjectsForm': return <ProjectsForm projects={resumeData.projects} addItem={addItem} updateArrayItem={updateArrayItem} removeItem={removeItem} handleRewrite={handleRewrite} />;
      case 'CertificationsForm': return <CertificationsForm certifications={resumeData.certifications} addItem={addItem} updateArrayItem={updateArrayItem} removeItem={removeItem} />;
      case 'AchievementsForm': return <AchievementsForm achievements={resumeData.achievements} addItem={addItem} updateArrayItem={updateArrayItem} removeItem={removeItem} handleRewrite={handleRewrite} />;
      case 'InterestsForm': return <InterestsForm interests={resumeData.interests} setResumeData={setResumeData} handleRewrite={handleRewrite} />;
      case 'LanguagesForm': return <LanguagesForm languages={resumeData.languages} setResumeData={setResumeData} handleRewrite={handleRewrite} />;
      case 'ReferencesForm': return <ReferencesForm references={resumeData.references} setResumeData={setResumeData} handleRewrite={handleRewrite} />;
      case 'CustomSectionForm': return <CustomSectionForm id={config.id} name={config.name} content={resumeData.custom[config.id] || ''} setResumeData={setResumeData} />;
      default: return null;
    }
  };

  const CurrentTemplate = templates.find(t => t.id === selectedTemplate)?.component || TemplateBasic;

  const handleAddCustomSection = (id: string) => {
    if (!customSections.includes(id)) {
      setCustomSections(prev => [...prev, id]);
      setSectionOrder(prev => [...prev, id]);
      setActiveSection(id);
    }
  };

  const handleCreateNewSection = () => {
    if (!newSectionName.trim()) return;
    const id = `custom_${Date.now()}`;
    const newConfig: SectionConfig = {
      id,
      name: newSectionName,
      icon: Star,
      form: 'CustomSectionForm'
    };
    setUserCreatedConfigs(prev => [...prev, newConfig]);
    setCustomSections(prev => [...prev, id]);
    setSectionOrder(prev => [...prev, id]);
    setActiveSection(id);
    setNewSectionName('');
  };

  const processResumeFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF resume.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
      try {
        // @ts-ignore - pdfjs is loaded via CDN in index.html
        const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }

        const extractedText = fullText;
        setIsAIProcessing(true);
        /* try {
          const extractedData = await parseResumeWithAI(extractedText);
          setResumeData(prev => ({
            ...prev,
            ...extractedData,
            personal: { ...prev.personal, ...extractedData.personal }
          }));
          alert('AI has successfully parsed your resume! Please review the details.');
        } catch (error) { */
        console.error('AI Parse Disabled, falling back to regex:');
        const extracted = parseResumeText(extractedText);
        setResumeData(prev => ({
          ...prev,
          ...extracted,
          personal: { ...prev.personal, ...extracted.personal }
        }));
        alert('Resume parsed. Please review the details.');
        // } finally {
        setIsAIProcessing(false);
        // }
      } catch (err) {
        console.error('Error parsing PDF:', err);
        alert('Failed to parse PDF. Please try another file or manual entry.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processResumeFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => {
      const newVal = prev - 1;
      if (newVal <= 0) setIsDragging(false);
      return newVal;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Ensure we stay in dragging state
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);
    const file = e.dataTransfer.files?.[0];
    if (file) processResumeFile(file);
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
    <div
      className={`min-h-screen transition-colors duration-300 pb-12 ${theme === 'dark' ? 'bg-[#030014] text-white' : 'bg-slate-50 text-gray-900'}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {(isDragging || isAIProcessing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-cyan/10 backdrop-blur-md flex items-center justify-center p-8 border-4 border-dashed border-brand-cyan pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`p-10 rounded-3xl text-center shadow-2xl border pointer-events-auto ${theme === 'dark' ? 'bg-space-950 border-white/10' : 'bg-white border-blue-100'}`}
            >
              <div className="w-20 h-20 bg-brand-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                {isAIProcessing ? (
                  <Lightbulb className="w-10 h-10 text-brand-cyan animate-pulse" />
                ) : (
                  <Upload className="w-10 h-10 text-brand-cyan animate-bounce" />
                )}
              </div>
              <h2 className="text-3xl font-black mb-2 tracking-tighter">
                {isAIProcessing ? 'Analyzing your resume...' : 'Drop your resume here'}
              </h2>
              <p className="text-gray-500 font-medium">
                {isAIProcessing ? 'This will only take a moment' : "We'll automatically parse your professional history"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-brand-cyan/20' : 'bg-blue-200'}`} />
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-brand-purple/20' : 'bg-purple-200'}`} />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-blue shadow-lg shadow-brand-cyan/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">Resume Builder</h1>
            </motion.div>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-lg`}>
              Craft your professional story with precision.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="text-sm font-medium">Template:</div>
              <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} className={`bg-transparent outline-none font-bold text-sm ${theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}`}>
                {templates.map(t => <option key={t.id} value={t.id} className="bg-space-900">{t.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="file" id="resume-upload" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('resume-upload')?.click()}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all ${theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
              >
                <Zap className="w-4 h-4 text-brand-cyan" />
                <span>Quick Upload</span>
              </motion.button>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowPreview(true)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-lg transition-all ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
              <Eye className="w-5 h-5" />
              <span>Preview</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDownloadPDF} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-blue text-white font-bold shadow-lg shadow-brand-cyan/30">
              <Download className="w-5 h-5" />
              <span>Export PDF</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-1 sticky top-32 space-y-4">
            <div className={`flex xl:flex-col gap-3 p-2 rounded-2xl border ${theme === 'dark' ? 'glass border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
              {allSections.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button key={section.id} onClick={() => setActiveSection(section.id)} className={`p-3 rounded-xl transition-all relative group ${isActive ? (theme === 'dark' ? 'bg-brand-cyan text-black shadow-lg shadow-brand-cyan/30' : 'bg-blue-600 text-white shadow-md') : (theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50')}`} title={section.name}>
                    <Icon className="w-6 h-6" />
                    <span className="absolute left-full ml-4 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none hidden xl:block">{section.name}</span>
                  </button>
                );
              })}
              <div className="h-px bg-white/10 mx-2 hidden xl:block" />
              <div className="relative group">
                <button className={`p-3 rounded-xl transition-all mx-auto w-full flex justify-center ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}>
                  <Plus className="w-6 h-6" />
                </button>
                <div className={`absolute left-full top-0 ml-4 p-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none group-hover:pointer-events-auto border ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 px-3">Add Section</p>
                  {customSectionsConfig.map(s => (
                    <button key={s.id} onClick={() => handleAddCustomSection(s.id)} disabled={customSections.includes(s.id)} className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 transition-colors ${customSections.includes(s.id) ? 'opacity-30 cursor-not-allowed' : (theme === 'dark' ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-blue-50 text-gray-600')}`}>
                      {React.createElement(s.icon, { size: 16 })}
                      {s.name}
                    </button>
                  ))}
                  <div className="h-px bg-white/10 my-2" />
                  <div className="px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">User Choice</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Section Name..."
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateNewSection()}
                        className={`rounded-lg px-2 py-1 text-xs outline-none border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-brand-cyan' : 'bg-gray-50 border-gray-200 focus:border-blue-500'}`}
                      />
                      <button
                        onClick={handleCreateNewSection}
                        className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'bg-brand-cyan text-black hover:bg-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-6 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className={`rounded-3xl border shadow-xl p-8 relative overflow-hidden ${theme === 'dark' ? 'glass border-white/10' : 'bg-white border-gray-100 shadow-blue-500/5'}`}>
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
                    {/* {activeSection === 'experience' && (
                        <button onClick={() => alert(getAISuggestion('rewrite', null))} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${theme === 'dark' ? 'border-brand-purple/30 text-brand-purple hover:bg-brand-purple/10' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}>
                          <Zap className="w-4 h-4 fill-current" />
                          AI REWRITE
                        </button>
                      )} */}
                    <button onClick={() => setIsEditingOrder(!isEditingOrder)} className={`p-2 rounded-xl transition-all ${isEditingOrder ? 'bg-rose-500 text-white' : (theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600')}`}>
                      <GripVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isEditingOrder ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4 italic">Drag items to change the display order on your resume.</p>
                    <Reorder.Group axis="y" values={sectionOrder} onReorder={setSectionOrder} className="space-y-3">
                      {sectionOrder.map(id => (
                        <Reorder.Item key={id} value={id} className={`p-4 rounded-xl border flex items-center justify-between cursor-grab active:cursor-grabbing ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
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

            {/* AI Rewrite Comparison Modal */}
            <AnimatePresence>
              {pendingRewrite && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={rejectRewrite}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`max-w-4xl w-full rounded-3xl border shadow-2xl p-8 max-h-[80vh] overflow-y-auto ${theme === 'dark' ? 'glass border-white/10' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-brand-cyan/20 text-brand-cyan">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">AI Rewrite Suggestion</h3>
                          <p className="text-sm text-gray-500">Review and accept or reject the AI-generated content</p>
                        </div>
                      </div>
                      <button
                        onClick={rejectRewrite}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Original</h4>
                        </div>
                        <div className={`p-4 rounded-xl border min-h-[120px] ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{pendingRewrite.original}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-brand-cyan"></div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-cyan">AI Rewritten</h4>
                        </div>
                        <div className={`p-4 rounded-xl border min-h-[120px] ${theme === 'dark' ? 'bg-brand-cyan/10 border-brand-cyan/30' : 'bg-blue-50 border-blue-200'}`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{pendingRewrite.rewritten}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={rejectRewrite}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        <div className="flex items-center gap-2">
                          <X className="w-5 h-5" />
                          Reject
                        </div>
                      </button>
                      <button
                        onClick={acceptRewrite}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-white font-bold shadow-lg shadow-brand-cyan/30 hover:shadow-brand-cyan/50 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Accept & Apply
                        </div>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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

          <div className="xl:col-span-5 sticky top-32 space-y-6">
            <div className={`p-6 rounded-3xl border shadow-xl overflow-hidden relative ${theme === 'dark' ? 'glass border-white/10' : 'bg-white border-gray-100 shadow-purple-500/5'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Resume Strength</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-black italic tracking-widest ${atsScore > 80 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-brand-cyan/20 text-brand-cyan uppercase'}`}>
                  {atsScore > 80 ? 'EXCELLENT' : 'OPTIMIZED'}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className={`${theme === 'dark' ? 'text-white/5' : 'text-gray-100'}`} />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * atsScore) / 100} strokeLinecap="round" className="text-brand-cyan transition-all duration-1000 ease-out" />
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
                    <span className={atsScore > 80 ? 'text-emerald-500 font-medium' : 'text-gray-500'}>High Impact Content</span>
                  </div>
                  {/* <button onClick={() => setAtsReportVisible(!atsReportVisible)} className="text-xs font-bold text-brand-cyan hover:underline tracking-tight">VIEW FULL ATS REPORT</button> */}
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border shadow-xl overflow-hidden ${theme === 'dark' ? 'glass border-white/10' : 'bg-white border-gray-100 shadow-blue-500/5'}`}>
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <span className="font-bold text-sm uppercase tracking-wider text-gray-500">Live Minimap</span>
                <button onClick={() => setShowPreview(true)} className="p-1 rounded hover:bg-white/10 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-white p-4 origin-top scale-[0.3] h-[500px] mb-[-350px] pointer-events-none rounded-b-3xl">
                <div id="resume-preview-container-mini">
                  <CurrentTemplate data={resumeData} sectionOrder={sectionOrder} allSections={allSections} />
                </div>
              </div>
              <div className={`p-4 text-center border-t ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <button onClick={() => setShowPreview(true)} className="text-sm font-bold text-brand-blue hover:text-brand-purple transition-colors">Expand Full Preview</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={`rounded-3xl shadow-2xl w-full max-w-5xl h-[95vh] overflow-hidden relative border ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`} initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}>
              <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <div>
                  <h3 className="text-xl font-bold italic tracking-tighter">PREVIEW MODE</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-black">{resumeData.personal.name || 'Your Name'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-white font-bold shadow-lg shadow-brand-cyan/20">
                    <Download className="w-4 h-4" /> DOWNLOAD
                  </button>
                  <button onClick={() => setShowPreview(false)} className="p-3 rounded-full hover:bg-white/10 transition-colors border border-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-12 overflow-y-auto h-[calc(95vh-100px)] custom-scrollbar">
                <div id="resume-preview-container" className="mx-auto max-w-4xl bg-white shadow-2xl p-0 min-h-[1100px]">
                  <CurrentTemplate data={resumeData} sectionOrder={sectionOrder} allSections={allSections} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {atsReportVisible && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAtsReportVisible(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`fixed right-0 top-0 bottom-0 w-full max-w-lg z-[120] border-l p-8 shadow-2xl ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black italic tracking-tighter">ATS DIAGNOSTICS</h3>
                <button
                  onClick={handleATSAnalysis}
                  disabled={isAIProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan rounded-xl transition-all border border-brand-cyan/20 group"
                >
                  <Sparkles className={`w-4 h-4 group-hover:rotate-12 transition-transform ${isAIProcessing ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-bold font-mono uppercase">Scan with AI</span>
                </button>
              </div>

              {aiAtsReport ? (
                <div className="space-y-8 h-[calc(100vh-180px)] overflow-y-auto pr-2 custom-scrollbar">
                  <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-brand-cyan/10 border-brand-cyan/20' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="text-6xl font-black italic tracking-tighter text-brand-cyan mb-1">{aiAtsReport.score}%</div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">AI COMPOSITE SCORE</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-black text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-4">Key Strengths</h4>
                      <div className="space-y-3">
                        {aiAtsReport.strengths.map((s: string, i: number) => (
                          <div key={i} className="flex gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/10 group">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-sm font-medium text-gray-400 group-hover:text-green-500/80 transition-colors">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-black text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-4">Optimization Required</h4>
                      <div className="space-y-3">
                        {aiAtsReport.improvements.map((s: string, i: number) => (
                          <div key={i} className="flex gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 group">
                            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                            <span className="text-sm font-medium text-gray-400 group-hover:text-orange-500/80 transition-colors">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-tr from-brand-purple/20 via-brand-cyan/5 to-white/5 border border-brand-purple/20">
                      <div className="flex items-center gap-2 font-black text-xs text-brand-purple mb-3 uppercase tracking-widest">
                        <Zap className="w-4 h-4 fill-current" /> Executive Summary
                      </div>
                      <p className="text-sm leading-relaxed text-gray-400 italic">"{aiAtsReport.summary}"</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-brand-cyan/10 border-brand-cyan/20' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="text-5xl font-black italic tracking-tighter text-brand-cyan mb-2">{atsScore}%</div>
                    <p className="text-sm font-bold uppercase tracking-widest opacity-60">Base Check Score</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-4">Content Checkpoints</h4>
                    {atsChecks.map((item) => (
                      <div key={item.key} className="flex items-center gap-4 group">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${item.status ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 border border-white/10 text-gray-600'}`}>
                          {item.status ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                        <span className={`text-sm font-medium ${item.status ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-gray-500'}`}>{item.check}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-center py-8 px-4 border-2 border-dashed border-white/5 rounded-3xl">
                    <Sparkles className="w-10 h-10 text-brand-cyan/30 mx-auto mb-4" />
                    <h5 className="font-bold mb-2">Enhance with AI</h5>
                    <p className="text-xs text-gray-500 mb-6">Run our deep-learning analyzer to find hidden improvements and industry keywords.</p>
                    <button
                      onClick={handleATSAnalysis}
                      disabled={isAIProcessing}
                      className="w-full bg-brand-cyan text-space-950 font-black py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 overflow-hidden group"
                    >
                      {isAIProcessing ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          <span>ANALYZE RESUME</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;