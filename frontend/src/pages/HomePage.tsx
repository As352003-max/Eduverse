// HomePage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const quotes = [
  "“Education is the passport to the future, for tomorrow belongs to those who prepare for it today.” – Malcolm X",
  "“The beautiful thing about learning is that no one can take it away from you.” – B.B. King",
  "“Tell me and I forget. Teach me and I remember. Involve me and I learn.” – Benjamin Franklin",
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const quoteRef = useRef<HTMLParagraphElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const navCards = [
    {
      title: "Start Learning",
      description: "Explore our AI-powered modules and expand your knowledge.",
      icon: "📚",
      link: "/modules",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
    {
      title: "Play & Earn XP",
      description: "Engage in fun games and quizzes to earn experience points.",
      icon: "🎮",
      link: "/games",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      title: "Take a Quiz",
      description: "Test your knowledge and track your progress.",
      icon: "📝",
      link: "/quiz",
      bgColor: "bg-pink-100",
      textColor: "text-pink-700",
    },
    {
      title: "Ask the AI",
      description: "Get instant answers and explanations from your AI assistant.",
      icon: "🤖",
      link: "/ai-chat",
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
    },
    {
      title: "Build & Collaborate",
      description: "Work on exciting projects, solo or with your peers.",
      icon: "💡",
      link: "/projects",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
    },
    {
      title: "See Your Rank",
      description: "Check out the global leaderboard and see where you stand.",
      icon: "🏆",
      link: "/leaderboard",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
    },
    {
      title: "Manage Profile",
      description: "Update your personal information and view your achievements.",
      icon: "👤",
      link: "/profile",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-700",
    },
  ];

  const particlesInit = async (engine: any) => {
    await loadSlim(engine);
  };

  useEffect(() => {
    if (quoteRef.current) {
      gsap.fromTo(
        quoteRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" }
      );
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % navCards.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, [currentCardIndex]);

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: false,
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            number: { value: 50, density: { enable: true, area: 800 } },
            color: {
              value: ["#6366F1", "#F472B6", "#34D399", "#F59E0B"],
            },
            shape: { type: "circle" },
            links: {
              enable: true,
              color: "#94A3B8",
              distance: 130,
              opacity: 0.4,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1.5,
              direction: "none",
              outMode: "bounce",
            },
          },
        }}
        className="absolute top-0 left-0 w-full h-full z-0"
      />

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          Welcome, <span className="text-indigo-600">{user?.username || "Learner"}</span>!
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Your personalized learning journey begins here.
        </p>
        <p
          ref={quoteRef}
          className="italic text-md md:text-lg text-gray-700 mt-2 max-w-2xl mx-auto"
        >
          {randomQuote}
        </p>

        <div className="flex justify-center mt-12">
          <Link
            to={navCards[currentCardIndex].link}
            ref={cardRef}
            className={`rounded-2xl shadow-xl p-8 transition-transform transform hover:scale-105 w-full max-w-md ${navCards[currentCardIndex].bgColor}`}
          >
            <div className={`text-6xl mb-4 ${navCards[currentCardIndex].textColor}`}>
              {navCards[currentCardIndex].icon}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {navCards[currentCardIndex].title}
            </h2>
            <p className="text-gray-700">{navCards[currentCardIndex].description}</p>
          </Link>
        </div>
      </div>

      {/* Floating Quiz Button */}
      <Link
        to="/quiz"
        className="fixed bottom-6 right-6 z-20 bg-pink-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-pink-700 transition-all duration-300"
      >
        📝 Take Quiz
      </Link>
    </div>
  );
};

export default HomePage;
