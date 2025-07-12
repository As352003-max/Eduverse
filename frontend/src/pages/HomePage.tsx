import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // ✅ Use slim version

const quotes = [
  "“Education is the passport to the future, for tomorrow belongs to those who prepare for it today.” – Malcolm X",
  "“The beautiful thing about learning is that no one can take it away from you.” – B.B. King",
  "“Tell me and I forget. Teach me and I remember. Involve me and I learn.” – Benjamin Franklin",
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const quoteRef = useRef<HTMLParagraphElement | null>(null);

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
      link: "/game/start",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
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
    await loadSlim(engine); // ✅ Fixed initialization
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

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: false,
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          particles: {
            number: {
              value: 40,
              density: {
                enable: true,
                area: 800,
              },
            },
            color: { value: "#6366F1" },
            links: {
              enable: true,
              color: "#6366F1",
              distance: 150,
              opacity: 0.5,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1.2,
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {navCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className={`rounded-xl shadow-lg p-6 transition-all transform hover:scale-105 hover:shadow-xl ${card.bgColor}`}
            >
              <div className={`text-5xl mb-4 ${card.textColor}`}>{card.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{card.title}</h2>
              <p className="text-gray-700">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
