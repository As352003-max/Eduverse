import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const quotes = [
  "“Education is the passport to the future...” – Malcolm X",
  "“Tell me and I forget. Teach me and I remember...” – Benjamin Franklin",
  "“Learning is a treasure that will follow its owner everywhere.” – Chinese Proverb",
  "“The beautiful thing about learning is that no one can take it away from you.” – B.B. King",
];

const bgImages = [
  "https://tse4.mm.bing.net/th/id/OIP.bImISDVuXSGLYudJsLuZ5QHaCz?pid=Api&P=0&h=180",
  "https://images.unsplash.com/photo-1535909339361-9b3cfb48d6ee?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80",
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [typedText, setTypedText] = useState("");
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const fullText = `Welcome, ${user?.username || "Learner"}`;

  const navCards = [
    { title: "Start Learning", description: "Explore AI-powered lessons with interactive exercises.", icon: "📚", link: "/modules", bgColor: "from-blue-600 to-indigo-800" },
    { title: "Play & Earn XP", description: "Gamified learning with rewards and badges.", icon: "🎮", link: "/games", bgColor: "from-green-500 to-emerald-800" },
    { title: "Take a Quiz", description: "Challenge yourself with quizzes to test your knowledge.", icon: "📝", link: "/quiz", bgColor: "from-pink-500 to-rose-800" },
    { title: "Ask the AI", description: "Get instant answers and smart explanations from our AI tutor.", icon: "🤖", link: "/ai-chat", bgColor: "from-purple-500 to-violet-800" },
    { title: "Build Projects", description: "Work on real-world projects and enhance your skills.", icon: "💡", link: "/projects", bgColor: "from-yellow-400 to-orange-700" },
    { title: "Leaderboard", description: "Track rankings and compete with other learners.", icon: "🏆", link: "/leaderboard", bgColor: "from-red-500 to-rose-800" },
    { title: "Your Profile", description: "Manage achievements, progress, and settings easily.", icon: "👤", link: "/profile", bgColor: "from-indigo-400 to-blue-800" },
  ];

  // ✅ Typewriter Effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [fullText]);

  // ✅ Quotes + Background Change
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((i) => (i + 1) % quotes.length);
      setCurrentBgIndex((i) => (i + 1) % bgImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Cards Auto Rotate
  useEffect(() => {
    const cardTimer = setInterval(() => setCurrentCardIndex((i) => (i + 1) % navCards.length), 4000);
    return () => clearInterval(cardTimer);
  }, []);

  // ✅ Voiceover Greeting
  useEffect(() => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(
      `Hello ${user?.username || "Learner"}, welcome to Eduverse! Explore interactive modules, play games, take quizzes, and learn smarter.`
    );
    utter.pitch = 1;
    utter.rate = 1;
    synth.speak(utter);
  }, []);

  // ✅ Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setParallax({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* ✅ Background Images with Crossfade + Parallax */}
      {bgImages.map((img, index) => (
        <motion.div
          key={index}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms]"
          style={{
            backgroundImage: `url(${img})`,
            opacity: currentBgIndex === index ? 1 : 0,
            transform: `translate(${parallax.x}px, ${parallax.y}px) scale(1.05)`,
          }}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/70 to-purple-900/70"></div>

      <div className="relative z-10">
        {/* Heading */}
        <div className="text-center py-16">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-300 to-blue-300 bg-clip-text text-transparent">
            {typedText}
          </h1>
          <p className="text-gray-300 text-lg mt-2">Your AI-powered learning platform for kids, parents & teachers</p>
        </div>

        {/* Quotes with Animation */}
        <div className="text-center italic text-xl text-gray-200 max-w-3xl mx-auto mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8 }}
            >
              {quotes[currentQuoteIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Rotating Card with Animation */}
        <div className="flex justify-center mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
              className={`p-8 w-full max-w-md rounded-3xl shadow-2xl backdrop-blur-lg bg-gradient-to-br ${navCards[currentCardIndex].bgColor} border border-white/30`}
            >
              <Link to={navCards[currentCardIndex].link}>
                <div className="text-6xl mb-3">{navCards[currentCardIndex].icon}</div>
                <h2 className="text-3xl font-bold mb-2">{navCards[currentCardIndex].title}</h2>
                <p>{navCards[currentCardIndex].description}</p>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Features Section (unchanged) */}
        <div className="grid md:grid-cols-3 gap-6 px-6 mb-20">
          {/* Children */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/40 to-purple-700/50 backdrop-blur-md border border-white/20 shadow-lg">
            <h3 className="text-2xl font-bold mb-2">👦 For Children</h3>
            <ul className="list-disc ml-5 text-gray-200 space-y-1">
              <li>Interactive AI lessons with XP rewards</li>
              <li>Gamified quizzes and fun challenges</li>
              <li>Progress badges and achievements</li>
            </ul>
          </div>
          {/* Parents */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-400/40 to-emerald-700/50 backdrop-blur-md border border-white/20 shadow-lg">
            <h3 className="text-2xl font-bold mb-2">👩‍👩‍👦 For Parents</h3>
            <ul className="list-disc ml-5 text-gray-200 space-y-1">
              <li>Real-time progress tracking</li>
              <li>Detailed analytics & performance reports</li>
              <li>Motivation tools for better learning</li>
            </ul>
          </div>
          {/* Teachers */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-400/40 to-indigo-700/50 backdrop-blur-md border border-white/20 shadow-lg">
            <h3 className="text-2xl font-bold mb-2">👨‍🏫 For Teachers</h3>
            <ul className="list-disc ml-5 text-gray-200 space-y-1">
              <li>AI-powered content creation tools</li>
              <li>Student analytics dashboard</li>
              <li>Collaborative teaching environment</li>
            </ul>
          </div>
        </div>

        {/* Floating AI Bot */}
        <Link to="/ai-chat" className="fixed bottom-8 left-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-700 shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition">
          🤖
        </Link>

        {/* Quiz Button */}
        <Link to="/quiz" className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-rose-700 text-white px-5 py-3 rounded-full shadow-lg hover:scale-105 transition">
          📝 Take Quiz
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
