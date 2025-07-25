import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, ref, set, onValue } from "../firebase";

type LevelMenuProps = {
  totalLevels: number;
};

const LevelMenu: React.FC<LevelMenuProps> = ({ totalLevels }) => {
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([0]);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email || "anonymous@guest.com");

        const profileRef = ref(db, `users/${user.uid}/profile`);
        onValue(profileRef, (snapshot) => {
          const data = snapshot.val();
          setUserName(data?.name || "Player");
        });

        const unlockedRef = ref(db, `users/${user.uid}/unlockedLevels`);
        onValue(unlockedRef, (snapshot) => {
          const data = snapshot.val();
          if (Array.isArray(data)) {
            const updated = data.includes(0) ? data : [0, ...data];
            setUnlockedLevels(updated);
          } else {
            // Set level 0 if no valid data found
            set(unlockedRef, [0]);
            setUnlockedLevels([0]);
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const goToLevel = (levelIndex: number) => {
    if (unlockedLevels.includes(levelIndex)) {
      navigate(`/game/${levelIndex}`);
    } else {
      alert("🔒 Level locked! Play the previous levels first.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#1a1a3d",
        color: "white",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        fontFamily: "Press Start 2P, sans-serif",
        textAlign: "center",
      }}
    >
      {/* 🌟 GAME NAME */}
      <h1 style={{ color: "#ffffff", marginBottom: "0.5rem", fontSize: "2rem" }}>
        🕹️ Shadow Match Adventure
      </h1>

      {/* 🌟 SELECT LEVEL TITLE */}
      <h2 style={{ color: "#ffcc00", marginBottom: "1.5rem", animation: "pulseTitle 2s infinite" }}>
        🌟 Select Level
      </h2>

      {userId ? (
        <>
          {/* 👋 HELLO MESSAGE */}
          <div
            style={{
              marginBottom: "2rem",
              background: "#333",
              padding: "1rem 2rem",
              borderRadius: "10px",
              boxShadow: "0 0 15px #ffcc0055",
            }}
          >
            <strong style={{ fontSize: "1rem", color: "#ffcc00" }}>
              👋 Hello, {userName}
            </strong>
            <p style={{ fontSize: "0.8rem", color: "#ccc" }}>{userEmail}</p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              width: "100%",
              maxWidth: "500px",
            }}
          >
            {Array.from({ length: totalLevels }).map((_, i) => {
              const isUnlocked = unlockedLevels.includes(i);
              return (
                <div
                  key={i}
                  onClick={() => goToLevel(i)}
                  style={{
                    padding: "1.5rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "15px",
                    cursor: isUnlocked ? "pointer" : "not-allowed",
                    transition: "all 0.3s ease",
                    border: isUnlocked ? "2px solid #ffcc00" : "2px solid #444",
                    boxShadow: isUnlocked
                      ? "0 0 20px #ffcc0075"
                      : "0 0 8px rgba(255,255,255,0.1)",
                    position: "relative",
                  }}
                  onMouseOver={(e) => {
                    if (isUnlocked) e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseOut={(e) => {
                    if (isUnlocked) e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {isUnlocked && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        width: "15px",
                        height: "15px",
                        backgroundColor: "#ffcc00",
                        borderRadius: "50%",
                        animation: "sparkle 1.5s infinite alternate",
                        boxShadow: "0 0 10px #ffcc00",
                      }}
                    />
                  )}

                  <p style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                    🎯 Level {i + 1}
                  </p>
                  <button
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "50px",
                      border: "none",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      backgroundColor: isUnlocked ? "#ffcc00" : "#888",
                      color: isUnlocked ? "#000" : "#ccc",
                      cursor: isUnlocked ? "pointer" : "not-allowed",
                      boxShadow: isUnlocked
                        ? "0 4px 12px rgba(255, 204, 0, 0.4)"
                        : "none",
                      transition: "background 0.3s ease",
                    }}
                  >
                    {isUnlocked ? "🚀 Start" : "🔐 Locked"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p>🔐 Please sign in to continue.</p>
      )}

      <style>
        {`
          @keyframes pulseTitle {
            0%   { transform: scale(1); opacity: 1; }
            50%  { transform: scale(1.08); opacity: 0.85; }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes sparkle {
            0%   { opacity: 0.4; transform: scale(0.8); }
            50%  { opacity: 1;   transform: scale(1.1); }
            100% { opacity: 0.4; transform: scale(0.8); }
          }
        `}
      </style>
    </div>
  );
};

export default LevelMenu;
