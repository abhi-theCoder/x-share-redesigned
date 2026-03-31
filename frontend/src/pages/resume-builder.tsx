import React, { useState, useMemo } from 'react';
import {
  FileText, Download, CheckCircle, User, Briefcase,
  GraduationCap, Code, Plus, Lightbulb, Star, Upload,
  Sparkles, RefreshCw, Layout, Trash2, Rocket, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { useTheme } from '@/components/theme-provider';
import { toast } from 'sonner';

// Shadcn UI Components
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Import Templates ---
import TemplateBasic from '../templates/TemplateBasic';
import TemplateModern from '../templates/TemplateModern';
import TemplateProfessional from '../templates/TemplateProfessional';
import SherlockHolmesModified from '../templates/SherlockHolmesModified';

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
  icon: any;
  form: string;
}

const templates = [
  { id: 'basic', name: 'Basic Professional', component: TemplateBasic },
  { id: 'modern', name: 'Modern Professional', component: TemplateModern },
  { id: 'professional', name: 'Executive Professional', component: TemplateProfessional },
  { id: 'sherlock', name: 'Sherlock Professional', component: SherlockHolmesModified },
];

const initialSections: SectionConfig[] = [
  { id: 'personal', name: 'Contact', icon: User, form: 'PersonalInfoForm' },
  { id: 'summary', name: 'Summary', icon: FileText, form: 'SummaryForm' },
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

const ResumeBuilder = () => {
  const { theme: _theme } = useTheme();

  const [activeSection, setActiveSection] = useState('personal');
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [resumeData, setResumeData] = useState<ResumeData>({
    personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    interests: '',
    languages: '',
    references: '',
    custom: {}
  });

  const [customSections, setCustomSections] = useState<string[]>([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const allSections = useMemo(() => {
    return [
      ...initialSections,
      ...customSections.map(id => {
        const standard = customSectionsConfig.find(c => c.id === id);
        return standard || { id, name: id.charAt(0).toUpperCase() + id.slice(1), icon: Layout, form: 'CustomSectionForm' };
      })
    ];
  }, [customSections]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('resume-preview-panel');
    const opt = {
      margin: 0,
      filename: `${resumeData.personal.name || 'Resume'}_VishwaGuru.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    try {
      if (!element) throw new Error("Preview element not found");
      await (html2pdf() as any).set(opt).from(element).save();
      toast.success("Resume exported successfully!");
    } catch (err) {
      toast.error("Export failure.");
    } finally {
      setIsExporting(false);
    }
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const addItem = (field: keyof ResumeData, item: any) => {
    const id = Math.random().toString(36).slice(2, 11);
    setResumeData(prev => ({ ...prev, [field]: [...(prev[field] as any[]), { ...item, id }] }));
  };

  const removeItem = (field: keyof ResumeData, id: string) => {
    setResumeData(prev => ({ ...prev, [field]: (prev[field] as any[]).filter(i => i.id !== id) }));
  };

  const updateItem = (field: keyof ResumeData, id: string, updates: any) => {
    setResumeData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map(i => i.id === id ? { ...i, ...updates } : i)
    }));
  };

  const handleFileUpload = (_e: React.ChangeEvent<HTMLInputElement>) => {
    // Placeholder for AI Parsing logic
    toast.info("AI Analysis protocol initialized... (Mock)");
  };

  const SelectedTemplateComponent = templates.find(t => t.id === selectedTemplate)?.component || TemplateBasic;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 relative z-10 h-[calc(100vh-180px)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="space-y-1">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-primary/5 border-primary/20 text-primary uppercase font-black tracking-widest text-[9px]">
              <Rocket className="w-3.5 h-3.5 mr-2" /> Resume Protocol v2.0
            </Badge>
            <h1 className="text-3xl font-black">Resume <span className="text-primary">Engine</span></h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Input type="file" className="hidden" id="resume-upload" onChange={handleFileUpload} />
              <Button variant="outline" asChild className="h-10 rounded-xl px-4 font-black uppercase tracking-widest text-[10px] border-border/60 hover:bg-primary/5 hover:text-primary transition-all">
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="w-3.5 h-3.5 mr-2" /> Import Intel
                </label>
              </Button>
            </div>
            <Button onClick={handleExportPDF} disabled={isExporting} className="h-10 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
              {isExporting ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-2" />}
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-full">
          {/* Editor Sidebar */}
          <div className="lg:col-span-1 hidden lg:flex flex-col gap-3 py-2 scrollbar-none overflow-y-auto">
            {allSections.map(s => (
              <TooltipProvider key={s.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeSection === s.id ? "default" : "ghost"}
                      className={`h-12 w-12 p-0 rounded-2xl transition-all ${activeSection === s.id ? 'shadow-lg shadow-primary/20' : 'hover:bg-primary/5 hover:text-primary opacity-60 hover:opacity-100'}`}
                      onClick={() => setActiveSection(s.id)}
                    >
                      <s.icon className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="rounded-xl font-black uppercase tracking-widest text-[9px] py-1.5 px-3">
                    {s.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            <Separator className="my-2 bg-border/40" />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl opacity-40 hover:opacity-100 hover:bg-primary/5 hover:text-primary">
                  <Plus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[32px] border-none bg-card/90 backdrop-blur-xl p-8">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black">Append Section</DialogTitle>
                  <DialogDescription className="font-medium">Introduce new telemetry modules to your resume profile.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Section identifier..."
                    className="h-12 rounded-xl bg-background/50 border-border/40"
                    value={newSectionName}
                    onChange={e => setNewSectionName(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {customSectionsConfig.filter(c => !customSections.includes(c.id)).map(c => (
                      <Badge
                        key={c.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 hover:border-primary/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                        onClick={() => {
                          setCustomSections(p => [...p, c.id]);
                          setActiveSection(c.id);
                        }}
                      >
                        <Plus className="w-2.5 h-2.5 mr-1.5" /> {c.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => { if (newSectionName) { setCustomSections(p => [...p, newSectionName]); setActiveSection(newSectionName); setNewSectionName(''); } }} className="h-11 rounded-xl px-8 font-black uppercase tracking-widest text-[10px]">Initialize Module</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Editor Content Area */}
          <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
            <Card className="flex-1 rounded-[40px] border-none bg-card/40 backdrop-blur-xl ring-1 ring-border/20 shadow-2xl shadow-black/5 flex flex-col overflow-hidden">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-border/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    {allSections.find(s => s.id === activeSection)?.icon && React.createElement(allSections.find(s => s.id === activeSection)!.icon, { className: 'w-5 h-5' })}
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-wider">{allSections.find(s => s.id === activeSection)?.name}</h2>
                </div>
                <div className="flex lg:hidden items-center gap-2 overflow-x-auto scrollbar-none px-2 py-1 bg-muted/20 rounded-2xl border border-border/10">
                  {allSections.map(s => (
                    <Button key={s.id} variant={activeSection === s.id ? "default" : "ghost"} size="sm" className="h-8 rounded-lg px-4 text-[9px] font-black uppercase" onClick={() => setActiveSection(s.id)}>{s.name.split(' ')[0]}</Button>
                  ))}
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-8">
                <div className="space-y-8 pb-12">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeSection === 'personal' && (
                        <div className="grid md:grid-cols-2 gap-6">
                          {(Object.keys(resumeData.personal) as (keyof PersonalInfo)[]).map(k => (
                            <div key={k} className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{k.replace(/([A-Z])/g, ' $1')}</Label>
                              <Input
                                value={resumeData.personal[k]}
                                onChange={e => updatePersonalInfo(k, e.target.value)}
                                className="h-11 rounded-xl bg-background/50 border-border/40"
                                placeholder={`e.g. ${k === 'name' ? 'Jane Doe' : k === 'title' ? 'SDE II' : '...'}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSection === 'summary' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center ml-1">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Professional Synopsis</Label>
                            <Button variant="ghost" className="h-7 rounded-lg px-3 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                              <Sparkles className="w-3 h-3 mr-1.5" /> AI Suggestion
                            </Button>
                          </div>
                          <Textarea
                            rows={10}
                            value={resumeData.summary}
                            onChange={e => setResumeData(p => ({ ...p, summary: e.target.value }))}
                            className="rounded-[32px] p-6 bg-background/50 border-border/40 focus:ring-primary/20 text-sm font-medium leading-relaxed"
                            placeholder="Architect a compelling narrative of your professional trajectory..."
                          />
                        </div>
                      )}

                      {activeSection === 'experience' && (
                        <div className="space-y-6">
                          {resumeData.experience.map((exp) => (
                            <Card key={exp.id} className="rounded-3xl border border-border/40 bg-background/40 p-6 relative group overflow-hidden">
                              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => removeItem('experience', exp.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Title</Label>
                                  <Input value={exp.title} onChange={e => updateItem('experience', exp.id, { title: e.target.value })} className="h-10 rounded-xl bg-background/50 border-border/40" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Entity</Label>
                                  <Input value={exp.company} onChange={e => updateItem('experience', exp.id, { company: e.target.value })} className="h-10 rounded-xl bg-background/50 border-border/40" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Registry Start</Label>
                                  <Input type="month" value={exp.startDate} onChange={e => updateItem('experience', exp.id, { startDate: e.target.value })} className="h-10 rounded-xl bg-background/50 border-border/40" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Registry End</Label>
                                  <Input value={exp.endDate} onChange={e => updateItem('experience', exp.id, { endDate: e.target.value })} className="h-10 rounded-xl bg-background/50 border-border/40" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Impact Description</Label>
                                <Textarea value={exp.description} onChange={e => updateItem('experience', exp.id, { description: e.target.value })} rows={4} className="rounded-2xl bg-background/50 border-border/40 text-xs font-medium" />
                              </div>
                            </Card>
                          ))}
                          <Button variant="outline" className="w-full h-14 rounded-2xl bg-primary/5 border-dashed border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]" onClick={() => addItem('experience', { title: '', company: '', startDate: '', endDate: 'Present', description: '' })}>
                            <Plus className="w-4 h-4 mr-2" /> Append Experience Core
                          </Button>
                        </div>
                      )}

                      {activeSection === 'education' && (
                        <div className="space-y-6">
                          {resumeData.education.map(edu => (
                            <Card key={edu.id} className="rounded-3xl border border-border/40 bg-background/40 p-6 relative group">
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => removeItem('education', edu.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Degree</Label>
                                  <Input value={edu.degree} onChange={e => updateItem('education', edu.id, { degree: e.target.value })} className="h-10 rounded-xl bg-background/50 border-border/40" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Institution</Label>
                                  <Input value={edu.institution} onChange={e => updateItem('education', edu.id, { institution: e.target.value })} className="h-10 rounded-xl bg-background/50 border-border/40" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Start Date</Label>
                                  <Input type="month" value={edu.startDate} onChange={e => updateItem('education', edu.id, { startDate: e.target.value })} className="h-10 rounded-xl bg-background/50 border-border/40" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">End Date</Label>
                                  <Input type="month" value={edu.endDate} onChange={e => updateItem('education', edu.id, { endDate: e.target.value })} className="h-10 rounded-xl bg-background/50 border-border/40" />
                                </div>
                              </div>
                            </Card>
                          ))}
                          <Button variant="outline" className="w-full h-14 rounded-2xl bg-primary/5 border-dashed border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]" onClick={() => addItem('education', { degree: '', institution: '', city: '', startDate: '', endDate: '' })}>
                            <Plus className="w-4 h-4 mr-2" /> Register Academic Unit
                          </Button>
                        </div>
                      )}

                      {activeSection === 'skills' && (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Intelligence Matrix (Separated by Commas)</Label>
                            <Textarea
                              rows={5}
                              className="rounded-[28px] p-6 bg-background/50 border-border/40 focus:ring-primary/20 text-sm font-bold h-40"
                              placeholder="React, TypeScript, Node.js, System Design, Leadership..."
                              value={resumeData.skills.map(s => s.name).join(', ')}
                              onChange={e => {
                                const names = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                setResumeData(p => ({ ...p, skills: names.map(n => ({ name: n, level: 'Intermediate', type: 'Technical' })) }));
                              }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((s, idx) => (
                              <Badge key={idx} variant="secondary" className="px-4 py-1.5 rounded-xl border border-border/40 bg-background text-[10px] font-black uppercase tracking-widest text-primary">
                                {s.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeSection === 'projects' && (
                        <div className="space-y-6">
                          {resumeData.projects.map(proj => (
                            <Card key={proj.id} className="rounded-3xl border border-border/40 bg-background/40 p-6 relative group">
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => removeItem('projects', proj.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Registry Name</Label>
                                  <Input value={proj.name} onChange={e => updateItem('projects', proj.id, { name: e.target.value })} className="h-10 rounded-xl bg-background/50 border-border/40" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Execution Link</Label>
                                  <Input value={proj.url} onChange={e => updateItem('projects', proj.id, { url: e.target.value })} className="h-10 rounded-xl bg-background/50 border-border/40" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Intellectual Process</Label>
                                <Textarea value={proj.description} onChange={e => updateItem('projects', proj.id, { description: e.target.value })} rows={3} className="rounded-xl bg-background/50 border-border/40 text-xs font-medium" />
                              </div>
                            </Card>
                          ))}
                          <Button variant="outline" className="w-full h-14 rounded-2xl bg-primary/5 border-dashed border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]" onClick={() => addItem('projects', { name: '', role: '', description: '', url: '' })}>
                            <Plus className="w-4 h-4 mr-2" /> Commit New Project
                          </Button>
                        </div>
                      )}

                      {['interests', 'languages', 'references'].includes(activeSection) && (
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{activeSection} Content</Label>
                          <Textarea
                            rows={6}
                            value={(resumeData as any)[activeSection]}
                            onChange={e => setResumeData(p => ({ ...p, [activeSection]: e.target.value }))}
                            className="rounded-[28px] p-6 bg-background/50 border-border/40 focus:ring-primary/20 text-sm font-medium"
                            placeholder={`Synchronize your ${activeSection} data matrix...`}
                          />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-6 h-full flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <Tabs defaultValue="basic" onValueChange={setSelectedTemplate} className="w-full">
                <TabsList className="bg-muted/40 backdrop-blur-xl border border-border/40 p-1 rounded-2xl h-12 w-full justify-start overflow-x-auto scrollbar-none">
                  {templates.map(t => (
                    <TabsTrigger key={t.id} value={t.id} className="rounded-xl px-6 font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-card data-[state=active]:shadow-lg h-10">{t.name}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <Card className="flex-1 rounded-[40px] border-none bg-white p-2 shadow-2xl overflow-hidden group">
              <ScrollArea className="h-full w-full rounded-[38px] bg-white text-black p-0 overflow-y-auto">
                <div id="resume-preview-panel" className="relative origin-top transition-transform duration-500 min-h-[1122.33px] bg-white">
                  <SelectedTemplateComponent
                    data={resumeData}
                    sectionOrder={initialSections.map(s => s.id)}
                    allSections={allSections}
                  />
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;