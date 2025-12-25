import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle, Award, Package, Sparkles } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';
import headphone from '../images/headphone.png';
import backpack from '../images/backpack.png';
import coffeeMug from '../images/coffee-mug.png';
import notebookPen from '../images/notebook-pen.png';
import tshirt from '../images/tshirt.png';
import { verifyToken } from '../components/verifyLogin';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { useTheme } from '../context/ThemeContext';


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

// Static points history
const mockPointsHistory = [
    { action: 'Experience shared', points: 50, date: '2024-01-15', type: 'earned' },
    { action: 'Question answered', points: 5, date: '2024-01-14', type: 'earned' },
    { action: 'Redeemed coffee mug', points: -2500, date: '2024-01-10', type: 'spent' },
    { action: 'Daily check-in bonus', points: 10, date: '2024-01-13', type: 'earned' },
    { action: 'Profile completion bonus', points: 30, date: '2024-01-05', type: 'earned' }
];

// Static achievements
const mockAchievements = [
    { name: 'First Share', description: 'Shared your first experience', completed: true, points: 50 },
    { name: 'Helpful Member', description: 'Answered 5 questions', completed: true, points: 25 },
    { name: 'Rising Star', description: 'Earned 100 points', completed: true, points: 20 },
    { name: 'Community Builder', description: 'Get 10 upvotes on contributions', completed: false, points: 100 },
    { name: 'Expert Contributor', description: 'Share 10 experiences', completed: false, points: 200 }
];

// New animation component
const StarPop = () => {
    const starSpring = useSpring({
        from: { scale: 0, opacity: 0, rotate: -90 },
        to: { scale: 1, opacity: 1, rotate: 0 },
        config: {
            tension: 400,
            friction: 20,
        },
        loop: { reverse: true },
    });

    return (
        <animated.div style={starSpring}>
            <Sparkles className="w-16 h-16 text-yellow-400" />
        </animated.div>
    );
};

const Rewards: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [user, setUser] = useState<User | null>(null);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [redeemedRewardName, setRedeemedRewardName] = useState('');
    const [pointsContribution, setPointsContribution] = useState(0);
    const [isAnimatingStar, setIsAnimatingStar] = useState(false); // ✅ New state for animation
    const pointsToInrRate = 10;

    useEffect(() => {
        const verifyAndFetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No token found.');
                navigate('/login');
                return;
            }

            try {
                const valid = await verifyToken(token);

                if (!valid) {
                    console.warn('Invalid or expired token.');
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
                    balance: res.data.balance ?? 0, // ✅ backend-driven balance
                });

            } catch (error: any) {
                console.error('Error verifying/fetching profile:', error);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        verifyAndFetchProfile();
    }, [navigate]);


    const modalSpring = useSpring({
        opacity: modalOpen ? 1 : 0,
        transform: modalOpen ? 'translateY(0%)' : 'translateY(100%)',
        config: { tension: 250, friction: 20 },
    });

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
            setUser(prev => ({
                ...prev!,
                points: prev!.points - pointsContribution,
                balance: prev!.balance - inrCost,
            }));
            setRedeemedRewardName(selectedReward.name);
            setShowConfirmation(true);
            setIsAnimatingStar(true);

            setTimeout(() => {
                setModalOpen(false);
                setShowConfirmation(false);
                setSelectedReward(null);
                setIsAnimatingStar(false);
            }, 3000);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedReward(null);
        setShowConfirmation(false);
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">Loading...</div>;
    }

    const inrValue = selectedReward ? (selectedReward.points / pointsToInrRate).toFixed(2) : '0.00';
    const remainingCostInr = selectedReward ? ((selectedReward.points - pointsContribution) / pointsToInrRate).toFixed(2) : '0.00';

    return (
        <div className={`min-h-screen p-4 sm:p-8 font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-transparent' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto py-8">
                {/* User points balance */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-8">
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Your Points Balance</h2>
                            <p className="opacity-90">Keep earning points to unlock more rewards!</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center space-x-2">
                                <Star className="w-12 h-12 text-yellow-400" />
                                <span className="text-6xl font-bold">{user.points}</span>
                            </div>
                            <p className="text-blue-200 mt-2">Total Points</p>
                        </div>
                    </div>
                </div>

                {/* Rewards list */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Rewards</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {rewardsData.map((reward) => (
                                <div
                                    key={reward.id}
                                    className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-transform"
                                    onClick={() => handleRedeemClick(reward)}
                                >
                                    <img src={reward.image} alt={reward.name} className="w-40 h-40 mx-auto mb-4 object-cover rounded-xl border" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{reward.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 text-center">{reward.description}</p>
                                    <div className="flex items-center justify-center space-x-1 mb-4">
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        <span className="text-2xl font-bold">{reward.points}</span>
                                        <span className="text-sm text-gray-600">points</span>
                                    </div>
                                    <button
                                        className={`w-full py-3 rounded-lg font-medium transition-colors ${user.points >= reward.points
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Redeem Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: history & achievements */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Points Activity</h3>
                            {mockPointsHistory.map((entry, i) => (
                                <div key={i} className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium">{entry.action}</p>
                                        <p className="text-xs text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className={entry.type === 'earned' ? 'text-green-600' : 'text-red-600'}>
                                        {entry.type === 'earned' ? '+' : ''}{entry.points}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                            {mockAchievements.map((a, i) => (
                                <div key={i} className="flex items-center space-x-3 py-2">
                                    {a.completed ? <CheckCircle className="text-green-600" /> : <Award className="text-gray-400" />}
                                    <div>
                                        <p className={`text-sm ${a.completed ? 'text-gray-900' : 'text-gray-600'}`}>{a.name}</p>
                                        <p className="text-xs text-gray-500">{a.points} points</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal with points slider */}
            <AnimatePresence>
                {modalOpen && selectedReward && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                        <animated.div style={modalSpring} className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative">
                            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                            {showConfirmation ? (
                                <div className="text-center py-10">
                                    <div className="mb-8">
                                        <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                                            {isAnimatingStar ? <StarPop /> : <Package className="w-16 h-16 text-white" />}
                                        </div>
                                    </div>
                                    <h2 className="text-4xl font-bold mb-4">Reward Redeemed! 🎉</h2>
                                    <p className="text-xl">You've redeemed: {redeemedRewardName}</p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-extrabold mb-2 text-center">Redeem {selectedReward.name}</h2>
                                    <div className="text-center mb-6">
                                        <span className="font-bold text-xl">{selectedReward.points}</span>
                                        <span className="text-gray-500 ml-1">OR</span>
                                        <span className="font-bold text-xl text-blue-600 ml-1">₹{inrValue}</span>
                                    </div>

                                    {/* Points Slider */}
                                    <div className="mb-6 px-4">
                                        <p className="text-center text-sm text-gray-500 mb-2">Adjust your points contribution</p>
                                        <div className="flex items-center relative">
                                            <input
                                                type="range"
                                                min="0"
                                                max={Math.min(selectedReward.points, user.points)}
                                                value={pointsContribution}
                                                onChange={(e) => setPointsContribution(Number(e.target.value))}
                                                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                                                style={{
                                                    background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${(pointsContribution / Math.min(selectedReward.points, user.points)) * 100
                                                        }%, #E5E7EB ${(pointsContribution / Math.min(selectedReward.points, user.points)) * 100
                                                        }%, #E5E7EB 100%)`,
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                                            <span>0 Points</span>
                                            <span>{selectedReward.points} Points</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800 text-white rounded-xl p-6 mb-6 text-center">
                                        <p className="text-lg font-medium mb-2">Your Total Cost:</p>
                                        <div className="flex items-center justify-center space-x-2">
                                            <Star className="w-8 h-8 text-yellow-400" />
                                            <span className="text-4xl font-extrabold">{pointsContribution}</span>
                                            <span className="text-lg font-medium">Points</span>
                                            <span className="text-gray-400 text-3xl font-light">+</span>
                                            <span className="text-4xl font-extrabold">₹{remainingCostInr}</span>
                                            <span className="text-lg font-medium">INR</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleConfirmRedemption}
                                        disabled={user.balance < Number(remainingCostInr) || user.points < pointsContribution}
                                        className={`w-full py-4 rounded-full font-medium transition-colors text-white text-lg ${user.balance >= Number(remainingCostInr) && user.points >= pointsContribution
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Confirm Redemption
                                    </button>
                                </>
                            )}
                        </animated.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Rewards;