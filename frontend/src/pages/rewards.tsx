import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, Award, Package, History, ArrowRight, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { verifyToken } from '../components/verifyLogin';
import { toast } from "sonner";

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Images
import headphone from '../images/headphone.png';
import backpack from '../images/backpack.png';
import coffeeMug from '../images/coffee-mug.png';
import notebookPen from '../images/notebook-pen.png';
import tshirt from '../images/tshirt.png';

// Types
interface Reward {
    id: string;
    name: string;
    description: string;
    points: number;
    image: string;
}

interface User {
    name: string;
    points: number;
    balance: number;
}

// Static rewards
const rewardsData: Reward[] = [
    { id: '1', name: 'Wireless Headphones', description: 'High-quality bluetooth headphones perfect for coding sessions.', points: 20000, image: headphone },
    { id: '2', name: 'Premium Backpack', description: 'Durable and stylish backpack with multiple compartments.', points: 15000, image: backpack },
    { id: '3', name: 'XShare Coffee Mug', description: 'Your new favorite mug for a perfect coffee break.', points: 500, image: coffeeMug },
    { id: '4', name: 'Notebook & Pen Set', description: 'Premium notebook for all your ideas, with a matching pen.', points: 300, image: notebookPen },
    { id: '5', name: 'XShare T-shirt', description: 'Comfortable cotton t-shirt with our logo.', points: 4000, image: tshirt },
];

const mockPointsHistory = [
    { action: 'Experience shared', points: 50, date: '2024-01-15', type: 'earned' },
    { action: 'Question answered', points: 5, date: '2024-01-14', type: 'earned' },
    { action: 'Redeemed coffee mug', points: -2500, date: '2024-01-10', type: 'spent' },
    { action: 'Daily check-in bonus', points: 10, date: '2024-01-13', type: 'earned' },
    { action: 'Profile completion bonus', points: 30, date: '2024-01-05', type: 'earned' }
];

const mockAchievements = [
    { name: 'First Share', description: 'Shared your first experience', completed: true, points: 50 },
    { name: 'Helpful Member', description: 'Answered 5 questions', completed: true, points: 25 },
    { name: 'Rising Star', description: 'Earned 100 points', completed: true, points: 20 },
    { name: 'Community Builder', description: 'Get 10 upvotes on contributions', completed: false, points: 100 },
    { name: 'Expert Contributor', description: 'Share 10 experiences', completed: false, points: 200 }
];

const Rewards: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pointsContribution, setPointsContribution] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const pointsToInrRate = 10;

    useEffect(() => {
        const verifyAndFetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }

            try {
                if (!(await verifyToken(token))) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                const res = await axios.get('/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser({
                    name: res.data.name || 'User',
                    points: res.data.points ?? 0,
                    balance: res.data.balance ?? 0,
                });
            } catch (error) {
                console.error(error);
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAndFetchProfile();
    }, [navigate]);

    const handleRedeemClick = (reward: Reward) => {
        if (!user) return;
        setSelectedReward(reward);
        setPointsContribution(Math.min(reward.points, user.points));
        setModalOpen(true);
    };

    const handleConfirmRedemption = () => {
        if (!user || !selectedReward) return;
        const remainingPoints = selectedReward.points - pointsContribution;
        const inrCost = remainingPoints / pointsToInrRate;

        if (user.points >= pointsContribution && user.balance >= inrCost) {
            setUser(prev => prev ? {
                ...prev,
                points: prev.points - pointsContribution,
                balance: prev.balance - inrCost,
            } : null);
            setShowConfirmation(true);
            toast.success("Redemption Successful", { description: `You have successfully redeemed ${selectedReward.name}!` });

            setTimeout(() => {
                setModalOpen(false);
                setShowConfirmation(false);
                setSelectedReward(null);
            }, 3000);
        }
    };

    if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center text-primary font-black animate-pulse uppercase tracking-[0.5em]">Initializing Assets...</div>;

    const inrValue = selectedReward ? (selectedReward.points / pointsToInrRate).toFixed(2) : '0.00';
    const remainingCostInr = selectedReward ? ((selectedReward.points - pointsContribution) / pointsToInrRate).toFixed(2) : '0.00';

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="container max-w-7xl mx-auto px-4">
                {/* Hero Stats Section */}
                <div className="relative mb-16">
                    <Card className="rounded-[40px] border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5 overflow-hidden border-none p-1">
                        <div className="absolute top-0 right-0 h-full w-96 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                        <CardContent className="p-8 md:p-12 relative z-10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="space-y-4 text-center md:text-left">
                                    <Badge className="bg-primary/20 text-primary border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-2">
                                        Asset Registry: Tier 1
                                    </Badge>
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tight">Redeem <span className="text-primary">Excellence</span></h1>
                                    <p className="text-muted-foreground font-medium max-w-md">Transform your community contributions into tangible professional assets.</p>
                                </div>
                                <div className="flex items-center gap-12">
                                    <div className="text-center md:text-right">
                                        <div className="flex items-center justify-center md:justify-end gap-3 mb-2">
                                            <Star className="w-10 h-10 text-primary fill-primary/10" />
                                            <span className="text-6xl font-black tracking-tighter">{user.points}</span>
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Accumulated Energy</p>
                                    </div>
                                    <Separator orientation="vertical" className="h-20 hidden md:block" />
                                    <div className="text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                            <span className="text-4xl font-black tracking-tighter text-emerald-500">₹{user.balance.toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Account Balance</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Rewards Grid */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between ml-2">
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Inventory Manifest
                            </h2>
                            <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                5 Assets Available
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {rewardsData.map((reward) => (
                                <motion.div
                                    key={reward.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="rounded-[40px] border-border/60 bg-card/40 backdrop-blur-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group border-none shadow-xl">
                                        <div className="h-56 bg-muted/30 relative overflow-hidden flex items-center justify-center p-8">
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                                            <img src={reward.image} alt={reward.name} className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                                            <Badge className="absolute top-6 right-6 bg-background/80 backdrop-blur-md text-foreground font-black border-none px-3 py-1.5 rounded-xl shadow-lg">
                                                <Star className="w-3.5 h-3.5 mr-1.5 text-primary" />
                                                {reward.points}
                                            </Badge>
                                        </div>
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="text-xl font-black">{reward.name}</CardTitle>
                                            <CardDescription className="text-sm font-medium leading-relaxed opacity-70">"{reward.description}"</CardDescription>
                                        </CardHeader>
                                        <CardFooter className="p-8 pt-0">
                                            <Button
                                                onClick={() => handleRedeemClick(reward)}
                                                className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all ${user.points >= reward.points
                                                    ? 'shadow-primary/20 bg-primary'
                                                    : 'bg-muted text-muted-foreground grayscale hover:grayscale-0'
                                                    }`}
                                            >
                                                Initialize Redemption <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Activity & Achievements */}
                    <div className="lg:col-span-4 space-y-10">
                        <section className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground ml-2 flex items-center gap-2">
                                <History className="w-4 h-4" /> Transaction Registry
                            </h3>
                            <Card className="rounded-[40px] border-border/60 bg-card/40 backdrop-blur-xl p-8 shadow-xl">
                                <ScrollArea className="h-[280px] pr-4">
                                    <div className="space-y-6">
                                        {mockPointsHistory.map((entry, i) => (
                                            <div key={i} className="flex items-center justify-between group">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{entry.action}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-70">{new Date(entry.date).toLocaleDateString()}</p>
                                                </div>
                                                <div className={`text-sm font-black ${entry.type === 'earned' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {entry.type === 'earned' ? '+' : ''}{entry.points}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </Card>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground ml-2 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Identity Benchmarks
                            </h3>
                            <div className="space-y-4">
                                {mockAchievements.map((a, i) => (
                                    <Card key={i} className={`rounded-[28px] border-border/60 transition-all duration-300 p-5 group flex items-center gap-4 ${a.completed ? 'bg-primary/5 border-primary/20 shadow-lg' : 'bg-card/40 backdrop-blur-xl grayscale opacity-50'}`}>
                                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${a.completed ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            {a.completed ? <CheckCircle className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black truncate">{a.name}</p>
                                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Reward: {a.points} Energy</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Redemption Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[40px] border-border/60 bg-card/90 backdrop-blur-2xl">
                    <DialogHeader className="p-4">
                        <DialogTitle className="text-2xl font-black text-center mb-2">Redemption Matrix</DialogTitle>
                        <DialogDescription className="text-center font-medium opacity-70">
                            Configure your asset acquisition via community energy.
                        </DialogDescription>
                    </DialogHeader>

                    {showConfirmation ? (
                        <div className="p-12 text-center space-y-8">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-primary/5"
                            >
                                <Zap className="w-16 h-16 text-primary fill-primary/20" />
                            </motion.div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black">Success!</h2>
                                <p className="text-sm font-medium text-muted-foreground">Asset {selectedReward?.name} has been authorized for your identity.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 space-y-8">
                            <div className="text-center bg-muted/20 p-6 rounded-[32px] border border-border/50">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Asset Valuation</p>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-primary" />
                                        <span className="text-2xl font-black">{selectedReward?.points}</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-6" />
                                    <span className="text-2xl font-black text-emerald-500">₹{inrValue}</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        <span>Contribution Balance</span>
                                        <span className="text-primary">{pointsContribution} XP</span>
                                    </div>
                                    <Slider
                                        defaultValue={[pointsContribution]}
                                        max={Math.min(selectedReward?.points || 0, user.points)}
                                        step={10}
                                        onValueChange={(vals: any[]) => setPointsContribution(vals[0])}
                                        className="py-4 cursor-pointer"
                                    />
                                    <p className="text-[10px] font-medium text-center text-muted-foreground">Slide to optimize energy-to-fiat conversion.</p>
                                </div>

                                <Card className="p-6 rounded-[32px] bg-zinc-950 text-white border-zinc-800 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                                    <div className="relative z-10 text-center space-y-4">
                                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Final Commitment</p>
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-primary">{pointsContribution}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Energy</p>
                                            </div>
                                            <span className="text-xl font-light opacity-30">+</span>
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-emerald-400">₹{remainingCostInr}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Fiat</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <DialogFooter>
                                <Button
                                    onClick={handleConfirmRedemption}
                                    disabled={user.balance < Number(remainingCostInr)}
                                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
                                >
                                    Commit Redemption Matrix
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Rewards;