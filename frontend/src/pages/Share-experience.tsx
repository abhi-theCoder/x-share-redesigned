import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Rocket,
  CheckCircle,
  Building,
  User,
  MapPin,
  Calendar,
  Info,
  Trash2,
  Plus,
  ArrowLeft,
  Sparkles,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyToken } from '../components/verifyLogin';
import { toast } from 'sonner';

// Shadcn UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

type RoundQ = { question: string; answer: string };
type Section = { key: string; title: string; isDraggable: boolean; icon: React.ReactNode };

interface FormData {
  company: string;
  role: string;
  type: string;
  location: string;
  date: string;
  overall_experience: string;
  preparation_tips: string;
  selection_rounds: string[];
  rounds_data: Record<string, RoundQ[]>;
}

const initialSections: Section[] = [
  { key: 'companyInfo', title: 'Context', isDraggable: false, icon: <Building className="w-4 h-4" /> },
  { key: 'selectionProcess', title: 'Process', isDraggable: true, icon: <Layout className="w-4 h-4" /> },
  { key: 'preparationTips', title: 'Preparation', isDraggable: false, icon: <Sparkles className="w-4 h-4" /> },
  { key: 'finalReview', title: 'Review', isDraggable: false, icon: <CheckCircle className="w-4 h-4" /> },
];

export default function ShareExperiencePage(): React.ReactNode {
  const [formData, setFormData] = useState<FormData>({
    company: '',
    role: '',
    type: 'internship',
    location: '',
    date: '',
    overall_experience: '',
    preparation_tips: '',
    selection_rounds: [],
    rounds_data: {},
  });

  const [sections] = useState<Section[]>(initialSections);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedRounds, setExpandedRounds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const valid = await verifyToken(token);
        if (!valid) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    const currentSection = sections[currentStep];

    switch (currentSection.key) {
      case 'companyInfo':
        if (!formData.company.trim()) newErrors.company = "Company is required";
        if (!formData.role.trim()) newErrors.role = "Role is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        if (!formData.date.trim()) newErrors.date = "Date is required";
        break;
      case 'selectionProcess':
        if (formData.selection_rounds.length === 0) {
          newErrors.selection_rounds = "Select at least one round";
        }
        formData.selection_rounds.forEach(round => {
          if (!formData.rounds_data[round] || formData.rounds_data[round].length === 0) {
            newErrors[`round_${round}`] = "Add at least one question";
          } else {
            formData.rounds_data[round].forEach((qa, i) => {
              if (!qa.question.trim()) {
                newErrors[`${round}_question_${i}`] = "Question is required";
              }
            });
          }
        });
        break;
      case 'preparationTips':
        if (!formData.preparation_tips.trim()) newErrors.preparation_tips = "Preparation details required";
        break;
      case 'finalReview':
        if (!formData.overall_experience.trim()) newErrors.overall_experience = "Overall summary required";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (currentStep === sections.length - 1) {
      handleSubmit();
    } else {
      setCurrentStep(s => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/experiences/share', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowSuccessAnimation(true);
      toast.success("Experience published successfully!");
      setTimeout(() => navigate('/experiences'), 3000);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Submission failed.';
      toast.error(msg);
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
    let updatedRounds = exists
      ? formData.selection_rounds.filter(r => r !== round)
      : [...formData.selection_rounds, round];

    let updatedData = { ...formData.rounds_data };
    if (!exists) {
      updatedData[round] = [{ question: '', answer: '' }];
      if (!expandedRounds.includes(round)) setExpandedRounds(p => [...p, round]);
    } else {
      delete updatedData[round];
    }

    setFormData(f => ({ ...f, selection_rounds: updatedRounds, rounds_data: updatedData }));
  };

  const addQuestion = (round: string) => {
    setFormData(f => ({
      ...f,
      rounds_data: {
        ...f.rounds_data,
        [round]: [...(f.rounds_data[round] || []), { question: '', answer: '' }]
      }
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

  if (loading) return null;

  const progressPercent = ((currentStep + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full bg-primary/5 border-primary/20 text-primary uppercase font-black tracking-widest text-[10px]">
            <Rocket className="w-3.5 h-3.5 mr-2" />
            Contribution Protocol
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Share Your <span className="text-primary italic">Trajectory</span>
          </h1>
          <p className="text-muted-foreground font-medium italic">
            "Your insights bridge the gap between ambition and achievement for thousands."
          </p>
        </motion.div>

        {/* Stepper Header */}
        <div className="mb-12">
          <div className="flex justify-between mb-4 px-2">
            {sections.map((s, i) => (
              <button
                key={s.key}
                disabled={i > currentStep && !validateCurrentStep()}
                onClick={() => setCurrentStep(i)}
                className={`flex flex-col items-center gap-2 group transition-all ${i <= currentStep ? 'text-primary' : 'text-muted-foreground opacity-50'}`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-all 
                  ${i === currentStep ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' :
                    i < currentStep ? 'bg-primary/10 border-primary/30' : 'bg-muted border-border'}`}
                >
                  {i < currentStep ? <CheckCircle className="w-5 h-5" /> : s.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{s.title}</span>
              </button>
            ))}
          </div>
          <Progress value={progressPercent} className="h-1.5 rounded-full bg-muted border border-border/20" />
        </div>

        <Card className="rounded-[40px] border-border/60 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden border-none shadow-black/5 ring-1 ring-border/20">
          <CardContent className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={sections[currentStep].key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {currentStep === 0 && (
                  <div className="grid gap-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Company *</Label>
                        <div className="relative">
                          <Building className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="e.g. Google, Microsoft"
                            className="h-12 pl-12 rounded-2xl bg-background/50 border-border/50 focus:ring-primary/20"
                            value={formData.company}
                            onChange={e => setFormData(f => ({ ...f, company: e.target.value }))}
                          />
                        </div>
                        {errors.company && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.company}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Role *</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="e.g. SDE-1, UX Designer"
                            className="h-12 pl-12 rounded-2xl bg-background/50 border-border/50 focus:ring-primary/20"
                            value={formData.role}
                            onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                          />
                        </div>
                        {errors.role && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.role}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Context Type *</Label>
                        <Select value={formData.type} onValueChange={v => setFormData(f => ({ ...f, type: v }))}>
                          <SelectTrigger className="h-12 rounded-2xl bg-background/50 border-border/50">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="internship">Internship</SelectItem>
                            <SelectItem value="job">Full-time Job</SelectItem>
                            <SelectItem value="hackathon">Hackathon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Location *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="City, State"
                            className="h-12 pl-12 rounded-2xl bg-background/50 border-border/50 focus:ring-primary/20"
                            value={formData.location}
                            onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                          />
                        </div>
                        {errors.location && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.location}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Interview Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="date"
                          className="h-12 pl-12 rounded-2xl bg-background/50 border-border/50 focus:ring-primary/20"
                          value={formData.date}
                          onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                        />
                      </div>
                      {errors.date && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.date}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Select Interfacing Rounds</Label>
                      <div className="flex flex-wrap gap-2">
                        {roundOptions.map(r => (
                          <Badge
                            key={r}
                            variant={formData.selection_rounds.includes(r) ? "default" : "outline"}
                            className={`cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                              ${formData.selection_rounds.includes(r) ? 'shadow-lg shadow-primary/20' : 'hover:bg-primary/5 hover:border-primary/20'}`}
                            onClick={() => handleRoundToggle(r)}
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                      {errors.selection_rounds && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.selection_rounds}</p>}
                    </div>

                    <Separator className="bg-border/40" />

                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Process Sequence (Drag to Reorder)</Label>
                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="selectedRounds-droppable">
                          {(provided: any) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                              {formData.selection_rounds.map((round, idx) => (
                                <Draggable key={round} draggableId={round} index={idx}>
                                  {(prov: any) => (
                                    <div ref={prov.innerRef} {...prov.draggableProps} className="rounded-3xl border border-border/40 bg-background/40 backdrop-blur-md overflow-hidden group">
                                      <div className="p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <div {...prov.dragHandleProps} className="text-muted-foreground hover:text-primary transition-colors">
                                            <GripVertical className="w-5 h-5" />
                                          </div>
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Step 0{idx + 1}</span>
                                            <h4 className="text-lg font-black italic">{round}</h4>
                                          </div>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-10 w-10 p-0 rounded-xl"
                                          onClick={() => setExpandedRounds(p => p.includes(round) ? p.filter(r => r !== round) : [...p, round])}
                                        >
                                          {expandedRounds.includes(round) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </Button>
                                      </div>

                                      <AnimatePresence>
                                        {expandedRounds.includes(round) && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-border/20 px-6 py-8 space-y-6"
                                          >
                                            {formData.rounds_data[round]?.map((qa, i) => (
                                              <div key={i} className="space-y-4 relative p-6 bg-muted/20 rounded-2xl border border-border/20 group/qa">
                                                <div className="flex justify-between items-center mb-2">
                                                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Unit {i + 1}</Label>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover/qa:opacity-100 transition-opacity"
                                                    onClick={() => removeRoundQA(round, i)}
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </Button>
                                                </div>
                                                <div className="space-y-4">
                                                  <Textarea
                                                    placeholder="The Query Interfaced..."
                                                    className="min-h-[80px] rounded-xl bg-background/50 border-border/40"
                                                    value={qa.question}
                                                    onChange={e => updateRoundQA(round, i, 'question', e.target.value)}
                                                  />
                                                  {errors[`${round}_question_${i}`] && <p className="text-[10px] text-destructive font-bold uppercase">{errors[`${round}_question_${i}`]}</p>}
                                                  <Textarea
                                                    placeholder="The Response Strategy (Optional)..."
                                                    className="min-h-[80px] rounded-xl bg-background/50 border-border/40"
                                                    value={qa.answer}
                                                    onChange={e => updateRoundQA(round, i, 'answer', e.target.value)}
                                                  />
                                                </div>
                                              </div>
                                            ))}
                                            <Button
                                              variant="outline"
                                              className="w-full h-12 rounded-xl bg-primary/5 border-dashed border-primary/20 text-primary uppercase font-black tracking-widest text-[10px]"
                                              onClick={() => addQuestion(round)}
                                            >
                                              <Plus className="w-4 h-4 mr-2" /> Add Intel Core
                                            </Button>
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
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 flex flex-col items-center text-center space-y-4 mb-8">
                      <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold">Preparation Strategy</h3>
                      <p className="text-sm text-muted-foreground max-w-md font-medium italic">"Decrypt the methods, resources, and frameworks that empowered your success."</p>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Preparation Intelligence *</Label>
                      <Textarea
                        placeholder="Detailed breakdown of your roadmap, resources used, and key focus areas..."
                        className="min-h-[300px] rounded-[32px] p-8 bg-background/50 border-border/50 text-base leading-relaxed"
                        value={formData.preparation_tips}
                        onChange={e => setFormData(f => ({ ...f, preparation_tips: e.target.value }))}
                      />
                      {errors.preparation_tips && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.preparation_tips}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Intelligence Header</h3>
                          <div className="p-6 rounded-[24px] bg-muted/30 border border-border/20 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-medium">Domain</span>
                              <span className="font-black italic">{formData.company}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-medium">Capacity</span>
                              <span className="font-black italic">{formData.role}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-medium">Execution</span>
                              <span className="font-black italic">{formData.type}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-medium">Registry</span>
                              <span className="font-black italic">{formData.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Process Map</h3>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {formData.selection_rounds.map((r, i) => (
                              <Badge key={r} variant="outline" className="h-8 rounded-lg px-3 bg-background font-bold text-[9px] uppercase tracking-widest border-border/40">
                                0{i + 1} : {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Overall Trajectory Summary *</Label>
                        <Textarea
                          placeholder="Your final reflections and the 'Human Element' of the experience..."
                          className="min-h-[200px] rounded-[32px] p-6 bg-background/50 border-border/50"
                          value={formData.overall_experience}
                          onChange={e => setFormData(f => ({ ...f, overall_experience: e.target.value }))}
                        />
                        {errors.overall_experience && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.overall_experience}</p>}
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex items-start gap-4">
                      <Info className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest mb-1">Final Clearance</p>
                        <p className="text-[11px] text-muted-foreground font-medium italic">By publishing, you confirm that this intelligence is verified and intends to empower the community.</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="p-8 bg-muted/20 border-t border-border/20 flex justify-between gap-4">
            <Button
              variant="ghost"
              className="h-14 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] border border-transparent hover:border-border/60 hover:bg-background/40"
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Abort Phase
            </Button>

            <Button
              className="h-14 rounded-2xl px-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 group"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
              ) : currentStep === sections.length - 1 ? (
                <Rocket className="w-3.5 h-3.5 mr-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 mr-2 group-hover:translate-x-1 transition-transform" />
              )}
              {isSubmitting ? "Interfacing..." : currentStep === sections.length - 1 ? "Initialize Publication" : "Next Phase"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card w-full max-w-sm rounded-[40px] p-12 text-center border border-border shadow-2xl space-y-6"
            >
              <div className="h-20 w-20 bg-primary/10 text-primary rounded-[28px] flex items-center justify-center mx-auto shadow-lg shadow-primary/5">
                <Sparkles className="w-10 h-10 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black italic">Publication <span className="text-primary italic">Live</span></h2>
                <p className="text-sm text-muted-foreground font-medium">Trajectory successfully archived in the repository.</p>
              </div>
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-black">🪙</div>
                <div className="text-left font-black tracking-tight leading-none">
                  <p className="text-2xl italic text-yellow-500">+50</p>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Reputation Credits</p>
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

const LoaderDots = () => (
  <div className="flex justify-center gap-1">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        className="h-1.5 w-1.5 rounded-full bg-primary"
      />
    ))}
  </div>
);