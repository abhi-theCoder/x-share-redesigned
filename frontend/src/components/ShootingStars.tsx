import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StarConfig {
    id: number;
    top: string;
    left: string;
    delay: number;
    duration: number;
    size: number;
    opacity: number;
}

const ShootingStars: React.FC = () => {
    const [stars, setStars] = useState<StarConfig[]>([]);

    useEffect(() => {
        const generateStars = () => {
            const starCount = 35;
            const newStars: StarConfig[] = [];

            for (let i = 0; i < starCount; i++) {
                // Some stars are part of a "bunch"
                const isPartOfBunch = Math.random() > 0.7;
                const bunchOffsetTop = isPartOfBunch ? (Math.random() * 10 - 5) : 0;
                const bunchOffsetLeft = isPartOfBunch ? (Math.random() * 10 - 5) : 0;

                newStars.push({
                    id: i,
                    top: `${Math.random() * 100 + bunchOffsetTop}%`,
                    left: `${Math.random() * 100 + bunchOffsetLeft}%`,
                    delay: Math.random() * 30,
                    duration: 1.5 + Math.random() * 3,
                    size: 100 + Math.random() * 150,
                    opacity: 0.3 + Math.random() * 0.7,
                });
            }
            setStars(newStars);
        };
        generateStars();
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-white/80"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        rotate: '45deg', // Pointing downwards and right
                        filter: 'blur(1px)',
                        boxShadow: '0 0 10px rgba(34, 211, 238, 0.3)',
                    }}
                    animate={{
                        x: [-100, 1000],
                        y: [-100, 1000],
                        opacity: [0, 1, 1, 0, 0],
                        scale: [0.3, 1, 1.2, 0.5, 0],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeOut",
                        repeatDelay: 5 + Math.random() * 15,
                    }}
                />
            ))}

            {/* Ambient background glow particles */}
            {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                    key={`ambient-${i}`}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: 0.2,
                    }}
                    animate={{
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                    }}
                />
            ))}
        </div>
    );
};

export default ShootingStars;
