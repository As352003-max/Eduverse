// HomePage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const quotes = [
  "“Education is the passport to the future...” – Malcolm X",
  "“Tell me and I forget. Teach me and I remember...” – Benjamin Franklin",
  "“Learning is a treasure that will follow its owner everywhere.” – Chinese Proverb",
  "“The beautiful thing about learning is that no one can take it away from you.” – B.B. King",
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const quoteRef = useRef<HTMLDivElement | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const fullText = `Welcome, ${user?.username || "Learner"}`;

  const navCards = [
    { title: "Start Learning", description: "AI-powered modules to boost your knowledge.", icon: "📚", link: "/modules", bgColor: "from-blue-500 to-indigo-700" },
    { title: "Play & Earn XP", description: "Gamified learning with rewards.", icon: "🎮", link: "/games", bgColor: "from-green-500 to-emerald-700" },
    { title: "Take a Quiz", description: "Test yourself & track progress easily.", icon: "📝", link: "/quiz", bgColor: "from-pink-500 to-rose-700" },
    { title: "Ask the AI", description: "Instant answers & explanations.", icon: "🤖", link: "/ai-chat", bgColor: "from-purple-500 to-indigo-800" },
    { title: "Build Projects", description: "Collaborate & create amazing projects.", icon: "💡", link: "/projects", bgColor: "from-yellow-400 to-orange-700" },
    { title: "Leaderboard", description: "See where you stand among learners.", icon: "🏆", link: "/leaderboard", bgColor: "from-red-500 to-rose-800" },
    { title: "Your Profile", description: "Manage your data & achievements.", icon: "👤", link: "/profile", bgColor: "from-indigo-400 to-violet-800" },
  ];

  const particlesInit = async (engine: any) => {
    await loadSlim(engine);
  };

  // ✅ Play Sound Helper
  const playSound = (url: string, volume: number = 0.3) => {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play();
  };

  // ✅ Typewriter effect with typing sound
  useEffect(() => {
    let i = 0;
    let forward = true;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      playSound("/sounds/type.mp3", 0.1); // 🔊 typing sound
      if (forward) i++;
      else i--;
      if (i === fullText.length) forward = false;
      if (i === 0) forward = true;
    }, 150);
    return () => clearInterval(interval);
  }, [fullText]);

  useEffect(() => {
    if (cursorRef.current) gsap.to(cursorRef.current, { opacity: 0, repeat: -1, yoyo: true, duration: 0.6 });
  }, []);

  // ✅ Card & Quotes Animation + Sound
  useEffect(() => {
    const timer = setInterval(() => {
      playSound("/sounds/flip.mp3", 0.2); // 🔊 flip sound
      setCurrentCardIndex((i) => (i + 1) % navCards.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const quoteTimer = setInterval(() => setCurrentQuoteIndex((i) => (i + 1) % quotes.length), 6000);
    return () => clearInterval(quoteTimer);
  }, []);

  useEffect(() => {
    if (cardRef.current) gsap.fromTo(cardRef.current, { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out" });
    if (quoteRef.current) gsap.fromTo(quoteRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 1, ease: "power2.out" });
  }, [currentCardIndex, currentQuoteIndex]);

  // ✅ AI Voice Greeting on Load
  useEffect(() => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(`Hello ${user?.username || "Learner"}, welcome to Eduverse! Let's start learning.`);
    utter.pitch = 1.2;
    utter.rate = 0.9;
    utter.volume = 1;
    synth.speak(utter);
  }, []);

  // ✅ Floating AI Avatar animation
  useEffect(() => {
    gsap.to(".ai-avatar", { y: -10, repeat: -1, yoyo: true, ease: "power1.inOut", duration: 2 });
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 overflow-hidden text-white">
      {/* Morphing Blobs */}
      <div className="absolute w-72 h-72 bg-pink-500/30 rounded-full blur-3xl animate-pulse top-20 left-10"></div>
      <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-bounce top-40 right-10"></div>

      {/* Particles */}
      <Particles id="tsparticles" init={particlesInit} options={{
        background: { color: { value: "transparent" } },
        particles: { number: { value: 40 }, move: { enable: true, speed: 1 }, color: { value: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF"] }, links: { enable: true, color: "#aaa", opacity: 0.3 } }
      }} className="absolute top-0 left-0 w-full h-full z-0" />

      {/* Heading */}
      <div className="relative z-10 text-center py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-300 to-blue-300 bg-clip-text text-transparent">
          {typedText}<span ref={cursorRef}>|</span>
        </h1>
        <p className="text-gray-300 text-lg">Your AI-powered learning platform for kids, parents & teachers</p>
      </div>

      {/* Sliding Quotes */}
      <div ref={quoteRef} className="relative z-10 text-center italic text-xl text-gray-200 max-w-3xl mx-auto mb-10">
        {quotes[currentQuoteIndex]}
      </div>

      {/* Rotating Card */}
      <div className="flex justify-center">
        <Link to={navCards[currentCardIndex].link} ref={cardRef}
          className={`p-8 w-full max-w-md rounded-3xl shadow-2xl backdrop-blur-lg bg-gradient-to-br ${navCards[currentCardIndex].bgColor} border border-white/20 transform transition hover:scale-105 hover:rotate-1`}>
          <div className="text-6xl mb-3">{navCards[currentCardIndex].icon}</div>
          <h2 className="text-3xl font-bold mb-2">{navCards[currentCardIndex].title}</h2>
          <p>{navCards[currentCardIndex].description}</p>
        </Link>
      </div>

      {/* Benefits Section */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 px-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-600/30 backdrop-blur-md border border-white/20 shadow-lg">
          <h3 className="text-2xl font-bold mb-2">👦 For Children</h3>
          <p>Fun games, quizzes, and interactive AI lessons with XP rewards.</p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-400/30 to-emerald-700/30 backdrop-blur-md border border-white/20 shadow-lg">
          <h3 className="text-2xl font-bold mb-2">👩‍👩‍👦 For Parents</h3>
          <p>Track your child’s progress and motivate them with achievements.</p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-400/30 to-indigo-700/30 backdrop-blur-md border border-white/20 shadow-lg">
          <h3 className="text-2xl font-bold mb-2">👨‍🏫 For Teachers</h3>
          <p>Create engaging content, assign tasks & monitor student analytics.</p>
        </div>
      </div>

      {/* Floating AI Avatar */}
      <div className="ai-avatar fixed bottom-8 left-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg flex items-center justify-center text-3xl">
        🤖
      </div>

      {/* Floating Quiz Button */}
      <Link to="/quiz" className="fixed bottom-6 right-6 z-20 bg-pink-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-pink-700 transition-all">
        📝 Take Quiz
      </Link>
    </div>
  );
};

export default HomePage;
