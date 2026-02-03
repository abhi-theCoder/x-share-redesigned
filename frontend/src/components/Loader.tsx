import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import a beautiful react loader spinner
import {Oval} from "react-loader-spinner";



const Loader: React.FC = () => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex flex-col items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Oval
            height={48}
            width={48}
            color="#2563eb"          // primary (blue-600)
            secondaryColor="#dbeafe" // soft blue
            strokeWidth={3}
            strokeWidthSecondary={3}
          />

          <p className="text-sm font-medium text-gray-600 animate-pulse">
            Loading, please wait…
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


// const Loader: React.FC = () => {
//   const quotes = [
//     "Did you know? React uses a virtual DOM to optimize rendering performance.",
//     "Did you know? The first website was created in 1991 by Tim Berners-Lee.",
//     "Did you know? JavaScript was created in just 10 days by Brendan Eich.",
//     "Did you know? Over 1.5 billion websites exist on the internet today.",
//     "Did you know? The average loading time users will wait is about 3 seconds.",
//     "Did you know? Framer Motion provides 60fps animations out of the box.",
//     "Did you know? CSS animations are hardware-accelerated for smooth performance.",
//     "Did you know? TypeScript adds static typing to JavaScript for safer code.",
//     "Did you know? The most visited website in the world is Google.",
//     "Did you know? Web development is one of the fastest-growing tech careers.",
//     "Fun fact: Your brain processes visuals 60,000 times faster than text.",
//     "Fun fact: Blue is the most commonly used color in web design.",
//     "Tip: Clear your browser cache regularly for better performance.",
//     "Tip: Use responsive design to ensure your site works on all devices.",
//   ];

//   const [currentQuote, setCurrentQuote] = useState(
//     quotes[Math.floor(Math.random() * quotes.length)]
//   );

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
//     }, 4000); // Change quote every 4 seconds

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
//       <div className="flex flex-col items-center space-y-8 p-12 
//                     bg-white/40 backdrop-blur-2xl border border-white/60 
//                     rounded-3xl shadow-2xl max-w-md">
        
//         {/* Main Spinner Container */}
//         <div className="relative w-24 h-24">
          
//           {/* Outer Rotating Ring with Gradient */}
//           <motion.div
//             className="absolute inset-0 rounded-full"
//             style={{
//               background: "linear-gradient(135deg, #3b82f6, #06b6d4, #6366f1)",
//               padding: "3px",
//             }}
//             animate={{ rotate: 360 }}
//             transition={{
//               repeat: Infinity,
//               duration: 2,
//               ease: "linear",
//             }}
//           >
//             <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50" />
//           </motion.div>

//           {/* Middle Pulsing Ring */}
//           <motion.div
//             className="absolute inset-3 rounded-full border-4 border-transparent"
//             style={{
//               borderTopColor: "#3b82f6",
//               borderRightColor: "#06b6d4",
//             }}
//             animate={{ 
//               rotate: -360,
//               scale: [1, 1.1, 1],
//             }}
//             transition={{
//               rotate: {
//                 repeat: Infinity,
//                 duration: 1.5,
//                 ease: "linear",
//               },
//               scale: {
//                 repeat: Infinity,
//                 duration: 2,
//                 ease: "easeInOut",
//               }
//             }}
//           />

//           {/* Inner Fast Spinner */}
//           <motion.div
//             className="absolute inset-6 rounded-full border-3 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent"
//             animate={{ rotate: 720 }}
//             transition={{
//               repeat: Infinity,
//               duration: 1,
//               ease: "linear",
//             }}
//           />

//           {/* Animated Center Glow */}
//           <motion.div
//             className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
//             style={{ transform: 'translate(-50%, -50%)' }}
//             animate={{
//               scale: [1, 1.5, 1],
//               boxShadow: [
//                 "0 0 10px rgba(59, 130, 246, 0.5)",
//                 "0 0 25px rgba(6, 182, 212, 0.8)",
//                 "0 0 10px rgba(59, 130, 246, 0.5)"
//               ]
//             }}
//             transition={{
//               duration: 1.5,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           />

//           {/* Orbiting Particles */}
//           {[0, 90, 180, 270].map((angle, index) => (
//             <motion.div
//               key={index}
//               className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full"
//               style={{
//                 transformOrigin: "0 0",
//               }}
//               animate={{
//                 rotate: [angle, angle + 360],
//                 x: [0, 40 * Math.cos((angle * Math.PI) / 180)],
//                 y: [0, 40 * Math.sin((angle * Math.PI) / 180)],
//                 opacity: [0.8, 0.3, 0.8],
//               }}
//               transition={{
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "linear",
//                 delay: index * 0.2,
//               }}
//             />
//           ))}
//         </div>

//         {/* Animated Dots Below Spinner */}
//         <div className="flex space-x-2">
//           {[0, 1, 2].map((index) => (
//             <motion.div
//               key={index}
//               className="w-2.5 h-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
//               animate={{
//                 y: [0, -10, 0],
//                 opacity: [0.5, 1, 0.5],
//               }}
//               transition={{
//                 duration: 0.8,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//                 delay: index * 0.15,
//               }}
//             />
//           ))}
//         </div>

//         {/* Loading Text with Wave Effect */}
//         <motion.div className="flex space-x-1">
//           {"Loading...".split("").map((char, index) => (
//             <motion.span
//               key={index}
//               className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 font-bold text-lg tracking-wide"
//               animate={{
//                 y: [0, -5, 0],
//                 opacity: [0.6, 1, 0.6],
//               }}
//               transition={{
//                 duration: 1,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//                 delay: index * 0.08,
//               }}
//             >
//               {char === " " ? "\u00A0" : char}
//             </motion.span>
//           ))}
//         </motion.div>

//         {/* Subtle Progress Bar */}
//         <div className="w-48 h-1 bg-white/40 rounded-full overflow-hidden">
//           <motion.div
//             className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-full"
//             animate={{
//               x: ["-100%", "200%"],
//             }}
//             transition={{
//               duration: 1.8,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           />
//         </div>

//         {/* Random Quote/Tip Section */}
//         <div className="relative h-20 w-full flex items-center justify-center px-4">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={currentQuote}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.5 }}
//               className="text-center"
//             >
//               <p className="text-sm text-blue-800 font-medium leading-relaxed">
//                 {currentQuote}
//               </p>
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );

// };

export default Loader;
