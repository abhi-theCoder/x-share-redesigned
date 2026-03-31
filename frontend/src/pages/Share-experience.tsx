import React, { useState, useEffect } from 'react';
import axios from '../api';
import './glass.css';
import { useNavigate } from 'react-router-dom';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  GripVertical,
  ChevronDown,
  Rocket,
  CheckCircle,
  Building,
  User,
  MapPin,
  Calendar,
  Trash2,
  Plus,
  ArrowLeft,
  FileText,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyToken } from '../components/verifyLogin';
import { toast } from 'sonner';

const roundOptions = [
  'Online Assessment',
  'Aptitude Test',
  'Technical Round 1',
  'Technical Round 2',
  'Technical Round 3',
  'System Design Round',
  'Behavioral Round',
  'HR Round',
  'Final Panel',
];

const experienceTypes = [
  { value: 'internship', label: 'Internship' },
  { value: 'job', label: 'Full-Time' },
  { value: 'hackathon', label: 'Hackathon' },
];

type RoundQ = { question: string; answer: string };

interface FormData {
  company: string;
  role: string;
  type: string;
  location: string;
  date: string;
  overall_experience: string;
  selection_rounds: string[];
  rounds_data: Record<string, RoundQ[]>;
}

export default function ShareExperiencePage(): React.ReactNode {
  const [formData, setFormData] = useState<FormData>({
    company: '',
    role: '',
    type: 'internship',
    location: '',
    date: '',
    overall_experience: '',
    selection_rounds: [],
    rounds_data: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedRounds, setExpandedRounds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const valid = await verifyToken(token);
        if (!valid) { localStorage.removeItem('token'); navigate('/login'); return; }
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.company.trim()) e.company = 'Company is required';
    if (!formData.role.trim()) e.role = 'Role is required';
    if (!formData.location.trim()) e.location = 'Location is required';
    if (!formData.date.trim()) e.date = 'Date is required';
    if (formData.selection_rounds.length === 0) e.selection_rounds = 'Select at least one round';
    formData.selection_rounds.forEach(round => {
      if (!formData.rounds_data[round] || formData.rounds_data[round].length === 0) {
        e[`round_${round}`] = 'Add at least one question';
      } else {
        formData.rounds_data[round].forEach((qa, i) => {
          if (!qa.question.trim()) e[`${round}_q_${i}`] = 'Question is required';
        });
      }
    });
    if (!formData.overall_experience.trim()) e.overall_experience = 'Overall summary required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in all required fields.');
      // Scroll to first error
      const firstErrorEl = document.querySelector('[data-error="true"]');
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/experiences/share', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowSuccess(true);
      toast.success('Experience published successfully!');
      setTimeout(() => navigate('/experiences'), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(formData.selection_rounds);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setFormData(f => ({ ...f, selection_rounds: reordered }));
  };

  const handleRoundToggle = (round: string) => {
    const exists = formData.selection_rounds.includes(round);
    const updatedRounds = exists
      ? formData.selection_rounds.filter(r => r !== round)
      : [...formData.selection_rounds, round];
    const updatedData = { ...formData.rounds_data };
    if (!exists) {
      updatedData[round] = [{ question: '', answer: '' }];
      setExpandedRounds(p => [...p, round]);
    } else {
      delete updatedData[round];
      setExpandedRounds(p => p.filter(r => r !== round));
    }
    setFormData(f => ({ ...f, selection_rounds: updatedRounds, rounds_data: updatedData }));
  };

  const addQuestion = (round: string) => {
    setFormData(f => ({
      ...f,
      rounds_data: {
        ...f.rounds_data,
        [round]: [...(f.rounds_data[round] || []), { question: '', answer: '' }],
      },
    }));
  };

  const updateRoundQA = (round: string, i: number, field: keyof RoundQ, value: string) => {
    setFormData(f => {
      const updated = [...f.rounds_data[round]];
      updated[i] = { ...updated[i], [field]: value };
      return { ...f, rounds_data: { ...f.rounds_data, [round]: updated } };
    });
  };

  const removeRoundQA = (round: string, i: number) => {
    setFormData(f => {
      const updated = [...f.rounds_data[round]];
      updated.splice(i, 1);
      return { ...f, rounds_data: { ...f.rounds_data, [round]: updated } };
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-20 sm:pb-16 bg-slate-50 dark:bg-[#0B1120]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[5%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-float" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">

        {/* Page Header */}
        <div className="mb-8 mt-6">
          <button
            onClick={() => navigate('/experiences')}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Experiences
          </button>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Trajectory</span>
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
            "Your insights bridge the gap between ambition and achievement for thousands."
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* ─── SECTION 1: Context ─────────────────────────────── */}
          <FormSection icon={<Building className="w-5 h-5" />} title="Context" subtitle="Basic information about the opportunity">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldGroup label="Company" required error={errors.company}>
                <InputField
                  icon={<Building className="w-4 h-4" />}
                  placeholder="e.g. Google, Microsoft"
                  value={formData.company}
                  onChange={v => setFormData(f => ({ ...f, company: v }))}
                  hasError={!!errors.company}
                  className="input-premium h-12"
                />
              </FieldGroup>
              <FieldGroup label="Role" required error={errors.role}>
                <InputField
                  icon={<User className="w-4 h-4" />}
                  placeholder="e.g. SDE-1, UX Designer"
                  value={formData.role}
                  onChange={v => setFormData(f => ({ ...f, role: v }))}
                  hasError={!!errors.role}
                  className="input-premium h-12"
                />
              </FieldGroup>
              <FieldGroup label="Location" required error={errors.location}>
                <InputField
                  icon={<MapPin className="w-4 h-4" />}
                  placeholder="City, State"
                  value={formData.location}
                  onChange={v => setFormData(f => ({ ...f, location: v }))}
                  hasError={!!errors.location}
                  className="input-premium h-12"
                />
              </FieldGroup>
              <FieldGroup label="Interview Date" required error={errors.date}>
                <InputField
                  icon={<Calendar className="w-4 h-4" />}
                  placeholder=""
                  type="date"
                  value={formData.date}
                  onChange={v => setFormData(f => ({ ...f, date: v }))}
                  hasError={!!errors.date}
                  className="input-premium h-12"
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Context Type" required>
              <div className="flex flex-wrap gap-2 pt-1">
                {experienceTypes.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, type: t.value }))}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 chip-premium ${
                      formData.type === t.value ? 'selected' : ''
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </FieldGroup>
          </FormSection>

          <FormSection icon={<Layers className="w-5 h-5" />} title="Selection Process" subtitle="Document your interview stages">
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Rounds</span>
                <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md leading-none">{formData.selection_rounds.length} Selected</span>
              </div>
              <div className="flex flex-wrap gap-2" data-error={!!errors.selection_rounds ? 'true' : undefined}>
                {roundOptions.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoundToggle(r)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold border transition-all duration-300 chip-premium ${
                      formData.selection_rounds.includes(r) ? 'selected !bg-blue-600' : 'bg-slate-100 dark:bg-white/5 border-transparent'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {errors.selection_rounds && <p className="text-[11px] text-red-500 font-medium pt-0.5">{errors.selection_rounds}</p>}
            </div>

            {/* Draggable Rounds with Q&A */}
            {formData.selection_rounds.length > 0 && (
              <div className="mt-12 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Workflow Sequence
                  </h3>
                  <div className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                    <GripVertical className="w-3.5 h-3.5" /> Reorder
                  </div>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="rounds-droppable">
                    {provided => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                        {formData.selection_rounds.map((round, idx) => (
                          <Draggable key={round} draggableId={round} index={idx}>
                            {prov => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                className="glass-card-premium overflow-hidden border-glow-blue rounded-2xl shadow-xl relative"
                              >
                                {/* Round header */}
                                <div className="px-4 py-6 pb-4">
                                  <div className="mb-2">
                                    <span className="bg-[#1E56FF] text-white text-[9px] font-black px-3.5 py-1.5 rounded-md uppercase tracking-tighter shadow-lg shadow-blue-500/20">Step {String(idx + 1).padStart(2, '0')}</span>
                                  </div>
                                  <div className="flex items-center justify-between group/header">
                                    <h4 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">{round}</h4>
                                    <div {...prov.dragHandleProps} className="p-2 text-slate-300 hover:text-[#1E56FF] transition-colors cursor-grab active:cursor-grabbing">
                                      <div className="grid grid-cols-2 gap-1 p-0.5 opacity-50 group-hover/header:opacity-100 transition-opacity">
                                        {[...Array(6)].map((_, k) => (
                                          <div key={k} className="w-1.5 h-1.5 rounded-full bg-current" />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2 flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                     <span className="text-[11px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest">Question Bank & Logic</span>
                                     <button
                                        type="button"
                                        onClick={() => setExpandedRounds(p => p.includes(round) ? p.filter(r => r !== round) : [...p, round])}
                                        className="p-1 rounded-lg text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all transform active:scale-95"
                                      >
                                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedRounds.includes(round) ? 'rotate-180' : ''}`} />
                                      </button>
                                  </div>
                                </div>

                                {errors[`round_${round}`] && (
                                  <p className="px-8 pb-4 text-[11px] text-red-500 font-medium">{errors[`round_${round}`]}</p>
                                )}

                                {/* Expanded Q&A */}
                                <AnimatePresence>
                                  {expandedRounds.includes(round) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.22 }}
                                      className="overflow-hidden"
                                      data-round={round}
                                    >
                                      <div className="px-3 sm:px-4 pb-6 pt-2 space-y-6">
                                        <div className="space-y-0">
                                          {formData.rounds_data[round]?.map((qa, i) => (
                                            <React.Fragment key={i}>
                                              {i > 0 && <div className="border-t border-slate-200 dark:border-white/10 my-6 mx-1" />}
                                              <div className="relative group pl-0 py-2">
                                              <div className="flex items-start gap-4">
                                                <div className="flex-1 space-y-2">
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider pl-1">Target Question</label>
                                                      <textarea
                                                        placeholder="Interview Approach / Primary Goal..."
                                                        rows={1}
                                                        value={qa.question}
                                                        onChange={e => updateRoundQA(round, i, 'question', e.target.value)}
                                                        className={`w-full px-4 py-3 text-[16px] font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none overflow-hidden min-h-[64px] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 leading-snug ${
                                                          errors[`${round}_q_${i}`] ? 'border-red-500 text-red-500' : 'text-black dark:text-white'
                                                        }`}
                                                      onInput={(e) => {
                                                        const target = e.target as HTMLTextAreaElement;
                                                        target.style.height = 'auto';
                                                        target.style.height = target.scrollHeight + 'px';
                                                      }}
                                                    />
                                                    {errors[`${round}_q_${i}`] && (
                                                      <p className="text-[10px] text-red-500 font-medium pl-1">{errors[`${round}_q_${i}`]}</p>
                                                    )}
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-400 uppercase tracking-wider pl-1">Insights / Tips</label>
                                                    <textarea
                                                      placeholder="Share your thoughts"
                                                      rows={3}
                                                      value={qa.answer}
                                                      onChange={e => updateRoundQA(round, i, 'answer', e.target.value)}
                                                      className="w-full px-4 py-3 text-[15px] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none overflow-hidden min-h-[140px] transition-all text-black dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 leading-relaxed font-semibold animate-none"
                                                      onInput={(e) => {
                                                        const target = e.target as HTMLTextAreaElement;
                                                        target.style.height = 'auto';
                                                        target.style.height = target.scrollHeight + 'px';
                                                      }}
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        if (i === (formData.rounds_data[round]?.length || 0) - 1) {
                                                          addQuestion(round);
                                                          setTimeout(() => {
                                                            const containers = document.querySelectorAll(`[data-round="${round}"] textarea[placeholder="Interview Approach / Primary Goal..."]`);
                                                            (containers[containers.length - 1] as HTMLElement)?.focus();
                                                          }, 50);
                                                        }
                                                      }
                                                    }}
                                                  />
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => removeRoundQA(round, i)}
                                                  className="mt-1 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                  <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                              </div>
                                            </div>
                                          </React.Fragment>
                                          ))}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => addQuestion(round)}
                                          className="w-full py-3 rounded-2xl text-slate-500 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.1em] hover:text-[#1E56FF] transition-all flex items-center justify-center gap-2 group"
                                        >
                                          <div className="w-6 h-6 rounded-full bg-slate-400 dark:bg-white/10 text-white flex items-center justify-center group-hover:bg-[#1E56FF] group-hover:scale-110 transition-all">
                                            <Plus className="w-4 h-4 font-black" />
                                          </div>
                                          ADD Q&A MODULE
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
          </FormSection>

          {/* ─── SECTION 3: Overall Summary ─────────────────────── */}
          <FormSection icon={<FileText className="w-5 h-5" />} title="Overall Summary" subtitle="Your final reflection and key takeaways">
            <FieldGroup label="Overall Trajectory Summary" required error={errors.overall_experience}>
              <textarea
                data-error={!!errors.overall_experience ? 'true' : undefined}
                rows={5}
                placeholder="Share your overall experience, how you felt, what you learned, and any advice for future candidates..."
                value={formData.overall_experience}
                onChange={e => setFormData(f => ({ ...f, overall_experience: e.target.value }))}
                className={`w-full px-4 py-3 text-base rounded-xl outline-none transition-all duration-300 ${
                  errors.overall_experience
                    ? 'border-red-400 focus:border-red-500 border'
                    : 'input-premium focus:border-blue-400'
                }`}
              />
            </FieldGroup>
          </FormSection>

          {/* ─── SUBMIT ──────────────────────────────────────────── */}
          <div className="pt-2 pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 group ring-1 ring-white/10"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  Publish Experience
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
              By publishing, you confirm this experience is genuine and intended to help the community.
            </p>
          </div>
        </form>
      </div>

      {/* ─── SUCCESS OVERLAY ─────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="glass-card-premium w-full max-w-sm p-10 text-center border-glow-blue space-y-6"
            >
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Published <span className="text-blue-500">Live</span>
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Your experience has been shared with the community.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl py-3 px-5">
                <span className="text-xl">🪙</span>
                <div className="text-left">
                  <p className="text-lg font-bold text-yellow-500 leading-tight">+50</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Reputation Credits</p>
                </div>
              </div>
              <LoaderDots />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card-premium overflow-hidden rounded-2xl">
      {/* Section header */}
      <div className="px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20 shadow-lg shadow-blue-500/5">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="py-5 px-1 sm:px-4 space-y-5">{children}</div>
    </div>
  );
}

function FieldGroup({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium pt-0.5">{error}</p>}
    </div>
  );
}

function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  hasError,
  className = '',
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hasError?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full h-full pl-11 pr-4 text-sm outline-none transition-all duration-300 ${
          hasError
            ? 'border-red-400 focus:border-red-500 border rounded-xl'
            : 'input-premium'
        }`}
      />
    </div>
  );
}

const LoaderDots = () => (
  <div className="flex justify-center gap-1.5">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        className="h-1.5 w-1.5 rounded-full bg-blue-500"
      />
    ))}
  </div>
);