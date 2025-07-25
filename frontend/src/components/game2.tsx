import React, { useState, useEffect, useRef } from "react";
import { auth, db, ref, set, get } from "../firebase";
import { useParams } from "react-router-dom";
import { Modal, Progress } from "antd";
import "./ShadowMatchGame.css";
import { classifyWithAI } from "../utils/aiClassifier";
import { logDataExample } from "../utils/dataLogger";
import appleShadow from './appleshadow.png';
import bananashadow  from './bananashadow.webp';
import mangoShadow from './mangoshadow.png';
import compassshadow from './compassshadow.png';
import Telescopeshadow from './Telescopeshadow.png';
import circleshadow from  './circleshadow.png';
import squareshadow from  './squareshdow.png';
import rectangleshadow from  './rectangleshadow.png';
import microscopeshadow from  './microscopeshadow.png';
import catshadow from  './catshadow.png';
import dogshadow from  './dogshadow.png';
import elephantshadow from  './Elephantshadow.png';
import carshadow from './car.png';
import bikeshadow from './bikeshadow.png';
import busshadow from './Carshadow.png'
import triangleshadow from './triangleshadow.png'

import { FaArrowLeft } from "react-icons/fa"; 



import { useNavigate } from 'react-router-dom';



// -------------------- Types --------------------
// -------------------- Types --------------------
type Item = {
  id: number;
  name: string;
  img: string;
  shadow: string;
  audio: string;
  hint: string;
  aiHint: string;
  refinedHint?: string;
  category: string;
};

type Level = {
  level: number;
  grade: number;
  instruction: string;
  gridSize: number;
  items: Item[];
    showImage?: boolean;
  showName?: boolean; 
};

type UserInfo = {
  name?: string;
  email?: string;
  role?: string;
  totalXp?: number;
  mistakeHistory?: Record<string, number>;
};
// -------------------- Simulated AI Classifier --------------------
const realAIClassifier = async (hint: string, options: string[]): Promise<string> => {
  const response = await fetch("http://localhost:5000/api/classify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ hint, options })
  });

  const data = await response.json();
  return data.guess || "Unknown";
};


const levels: Level[] = [
  // Grade 1 — Clear, 1:1 outline
  {
    level: 1,
    grade: 1,
    instruction: "Match the shadow with the correct fruit!",
    gridSize: 3,
    showImage: true,      // ✅ Show image
    showName: true,
    items: [
      {
        id: 1,
        name: "Apple",
        img: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
        shadow: appleShadow, // clean silhouette
        audio: "",
        hint: "Red and round, keeps doctors away.",
      aiHint: "A red, round fruit with smooth skin and a stem, often linked to health sayings.",
        category: "Fruit"
      },
      {
        id: 2,
        name: "Banana",
        img: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg",
        shadow: bananashadow,
        audio: "",
        hint: "Long yellow fruit you peel, loved by monkeys.",
                aiHint: "A long, curved, yellow fruit with a peelable skin and soft inside.",
        category: "Fruit"
      },
      {
        id: 3,
        name: "Mango",
        img: "https://upload.wikimedia.org/wikipedia/commons/9/90/Hapus_Mango.jpg",
        shadow: mangoShadow,
        audio: "",
        hint: "National fruit of India. Juicy and sweet.",
         aiHint: "A tropical fruit with orange-yellow flesh, a large seed, and a sweet aroma.",
        category: "Fruit"
      }
    ]
  },
  // Grade 2 — Horizontal flipped shadows
  {
    level: 2,
    grade: 2,
    instruction: "Match the vehicle to its flipped shadow!",
    gridSize: 3,
    showImage: true,      
    showName: true,       
    items: [
      {
        id: 1,
        name: "Car",
        img: "https://tse2.mm.bing.net/th/id/OIP.8zzzjKj_0W4NdMHAtIjm-gHaDu?pid=Api&P=0&h=180",
        shadow: carshadow, 
        audio: "",
        hint: "Has four wheels and used for travel.",
         aiHint: "A small four-wheeled vehicle typically used for personal transport on roads.",
        category: "Vehicle"
      },
      {
        id: 2,
        name: "Bus",
        img: "https://cdn.pixabay.com/photo/2018/03/07/16/07/coach-3206326_1280.png",
        shadow: busshadow,
        audio: "",
        hint: "It carries many passengers.",
        aiHint: "A large motor vehicle designed to carry many people on fixed routes.",
        category: "Vehicle"
      },
      {
        id: 3,
        name: "Bike",
        img: "https://tse2.mm.bing.net/th/id/OIP.Rk5t3WYp-PyRfM6c_Z0i6QHaEi?pid=Api&P=0&h=180",
        shadow: bikeshadow,
        audio: "",
        hint: "Two wheels, speedy ride!",
aiHint: "A two-wheeled motor vehicle, often faster than a bicycle, used for solo travel.",
        category: "Vehicle"
      }
    ]
  },
  // Grade 3 — Shape cropped or scaled
  {
    level: 3,
    grade: 3,
    instruction: "Find the animal with this partial shadow!",
    gridSize: 3,
        showImage: true,
    showName: false, 
    items: [
      {
        id: 1,
        name: "Dog",
        img: "https://images.squarespace-cdn.com/content/v1/54822a56e4b0b30bd821480c/45ed8ecf-0bb2-4e34-8fcf-624db47c43c8/Golden+Retrievers+dans+pet+care.jpeg",
        shadow: dogshadow, // cropped ears
        audio: "",
        hint: "Barks and wags its tail.",
        aiHint: "A furry pet with a wagging tail and barking sound, known for loyalty.",
        category: "Animal"
      },
      {
        id: 2,
        name: "Cat",
        img: "https://vetmarlborough.co.nz/wp-content/uploads/cat-facts.jpg",
        shadow: catshadow, // cropped tail
        audio: "",
        hint: "Purrs and loves milk.",
aiHint: "A small, agile animal with whiskers and soft fur, often purrs and drinks milk.",
        category: "Animal"
      },
      {
        id: 3,
        name: "Elephant",
        img: "https://upload.wikimedia.org/wikipedia/commons/3/37/African_Bush_Elephant.jpg",
        shadow: elephantshadow, // scaled down
        audio: "",
        hint: "Largest land animal with trunk.",
        aiHint: "A massive gray animal with large ears, thick legs, and a long trunk.It is not cat and not dog",
        category: "Animal"
      }
    ]
  },
  // Grade 4 — Shadow with extra noise or distractors
  {
    level: 4,
    grade: 4,
    instruction: "Which shape matches this shadow with extra details?",
    gridSize: 4,
    showImage: false,     
    showName: true,
    items: [
      {
        id: 1,
        name: "Circle",
        img: "https://tse1.mm.bing.net/th/id/OIP.ETZzoz_UgHt5XuU8Lsg8YgHaHa?pid=Api&P=0&h=180",
        shadow: circleshadow, // added lines
        audio: "",
        hint: "It's round and has no corners.",
  
        aiHint: "A perfectly round shape with no corners or edges, like a ring or coin.",
        category: "Shape"
      },
      {
        id: 2,
        name: "Square",
        img: "https://clipground.com/images/black-square-png-2.png",
        shadow: squareshadow,
        audio: "",
        hint: "It has 4 equal straight sides.",
            aiHint: "This shape has four equal sides and four 90-degree angles. It is not a triangle",
        category: "Shape"
      },
      {
        id: 3,
        name: "Triangle",
        img: "https://tse2.mm.bing.net/th/id/OIP.OYntQzEavORf45dhoff9gQHaHa?pid=Api&P=0&h=180",
        shadow: triangleshadow,
        audio: "",
        hint: "Three sides and three angles.",
  aiHint: "A shape made of three straight sides and three sharp corners or angles.",
        category: "Shape"
      },
      {
        id: 4,
        name: "Rectangle",
        img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAVFBMVEX///8AAADY2Nju7u7Dw8P8/PwEBATb29vq6urX19d6enrf39/Gxsb5+fmFhYXm5ubOzs4UFBQZGRldXV1nZ2e4uLhLS0sqKiozMzMsLCyUlJQ/Pz+uXnzbAAABv0lEQVR4nO3dzW5aMRCAUQM1XP4CIWnSpu//nuWiVOpyDAuP0Tls72I+2WI5LgUAAAAAAAAAAODp1euvlGm5Xaa3WW5Wt5FrbQm8fr3dvS5GcdntSzm2HeH+rffUjd6n+BnOH/7sPXC710M8sM6B694TN7rOe47e1GPdjxe4WF8nXpXgRa0f1+9HS5wnfosWHhYDnuHNNhZY3nsPereX2CEee895v8/YLd0OekVnq1DhofeYD9iECn/0HvMBS4XDFz7/LVWoMD+FCvNTqDA/hQrzU6gwP4UK81OoMD+FCvNTqDA/hQrzU6gwP4UK81OoMD+FCvNTqDA/hQrzU6gwP4UK81OoMD+FCvNTqDA/hQrzU6gwP4UK81OoMD+FCvNTqDA/hQrzU6gwu3Ww8Pn3Jp56j/mA2O7L46X3nHf7FdpfWofeQRsrPPce9G6b0JbdWsto+9j/2QV3Qdf5v2bAbdeLS+x/5naI5/HWXV/nnUpstX6dH0Y4f/aeuNnvU/gFiDpv1p92vSdu9HJbOd/yxEU5ff3pPXXYx9fUkvaf1Qim+UGEpsP71vaqSV8DjQoAAAAAAAAAAAAAAAAAAAF/AT4aXlDl7fDEAAAAAElFTkSuQmCC",
        shadow: rectangleshadow,
        audio: "",
        
        hint: "Four sides, two long and two short.",
 aiHint: "A four-sided shape with two long sides and two short sides, all angles are 90 degrees.It is not triangle",
        category: "Shape"
      }
    ]
  },
  // Grade 5 — Ambiguous/distorted shadows
  {
    level: 5,
    grade: 5,
    instruction: "Match the tricky scientific instrument with its distorted shadow!",
    gridSize: 3,
    showImage: false,     
    showName: true,
    items: [
      {
        id: 1,
        name: "Telescope",
        img: "https://pngimg.com/uploads/telescope/telescope_PNG58.png",
        shadow: Telescopeshadow, // distorted
        audio: "",
        hint: "Used to see stars and planets.",
               aiHint: "An optical instrument used to observe faraway celestial bodies like stars and planets.",
        category: "Scientific Instrument"
      },
      {
        id: 2,
        name: "Microscope",
        img: "https://tse3.mm.bing.net/th/id/OIP.1bBdpV3QBTG1EeLsjKzMswHaI6?pid=Api&P=0&h=180",
        shadow: microscopeshadow,
        audio: "",
        hint: "Used to view tiny organisms.",
              aiHint: "A lab tool used to magnify tiny objects like cells or bacteria.",
        category: "Scientific Instrument"
      },
      {
        id: 3,
        name: "Compass",
        img: "https://tse3.mm.bing.net/th/id/OIP.a1aBwgrP2mT3_xT9B9rqPQHaO0?pid=Api&P=0&h=180",
        shadow: compassshadow,
        audio: "",
        hint: "Used in geometry to draw circles.",
        aiHint: "A drawing tool with two arms used to make circles or arcs in geometry.",
        category: "Scientific Instrument"
      }
    ]
  }
];


const ShadowMatchGame: React.FC = () => {
    const navigate = useNavigate();

 
  const { levelId } = useParams<{ levelId?: string }>();
   const handleBackToMenu = () => {
    navigate(`/shadow-game/${levelId}`);
  };
  const levelIndex = Math.max(0, Math.min(parseInt(levelId || "0"), levels.length - 1));

  const [currentLevel, setCurrentLevel] = useState<number>(levelIndex);
  const [shadowItem, setShadowItem] = useState<Item | null>(null);
  const [choices, setChoices] = useState<Item[]>([]);
  const [message, setMessage] = useState<string>("");
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [showPicture, setShowPicture] = useState<boolean>(false);
  const [instruction, setInstruction] = useState<string>("");
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [unplayedItems, setUnplayedItems] = useState<Item[]>([]);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([0]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const [attemptsForCurrentItem, setAttemptsForCurrentItem] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState(false);
 const [bandages, setBandages] = useState<number>(0);
const correctCountRef = useRef<number>(0); // ✅ NEW REF

const [usedBandages, setUsedBandages] = useState(0);
const [earnedBandages, setEarnedBandages] = useState(0);

const [showBandage, setShowBandage] = useState(false);

  const [isRetry, setIsRetry] = useState(false);

const preloadAssets = (level: Level) => {
  level.items.forEach((item) => {
    const img = new Image();
    img.src = item.img;

    const shadow = new Image();
    shadow.src = item.shadow;

    if (item.audio) {
      const audio = new Audio(item.audio);
      audio.preload = "auto";
    }
  });
};

useEffect(() => {
  const fetchBandages = async () => {
    const user = auth.currentUser;
    if (user) {
      const bandageRef = ref(db, `users/${user.uid}/bandages`);
      const snapshot = await get(bandageRef);
      if (snapshot.exists()) {
        setBandages(snapshot.val());
      } else {
        setBandages(0); // fallback if not found
      }
    }
  };

  fetchBandages();
}, []);


useEffect(() => {
  // Preload and start game immediately (non-blocking)
  const init = () => {
    preloadAssets(levels[currentLevel]); // 🚀 Don't wait — load essential assets
    startLevel();                        // 🚀 Show game immediately

    const user = auth.currentUser;
    if (user) {
      fetchUserInfo();                   // 🔄 Background Firebase fetch
      fetchUnlockedLevels();
    }
  };

  init(); // ✅ Call the function you defined

  // Optional: idle-time preload again (redundant, can be removed)
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      preloadAssets(levels[currentLevel]);
    });
  } else {
    // Fallback for Safari or unsupported browsers
    setTimeout(() => {
      preloadAssets(levels[currentLevel]);
    }, 200);
  }
}, [currentLevel]);



  const fetchUserInfo = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) setUserInfo(snapshot.val() as UserInfo);
  };

  const fetchUnlockedLevels = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const unlockedRef = ref(db, `users/${user.uid}/unlockedLevels`);
    const snapshot = await get(unlockedRef);
    setUnlockedLevels(snapshot.exists() ? (snapshot.val() as number[]) : [0]);
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  };
const startLevel = (retry = false) => {
  const items = [...levels[currentLevel].items];
  setUnplayedItems(items);
  setCorrectCount(0); // make sure this resets

correctCountRef.current = 0;

  setWrongCount(0);
  setShowPicture(false);
  setMessage("");
  setUsedBandages(0);
setEarnedBandages(0);

  setShowSummary(false);
  setInstruction(levels[currentLevel].instruction);
  setIsRetry(retry);
  speak(levels[currentLevel].instruction);
  loadNextItem(items, retry);
};




  const sortChoicesByMistakes = (allItems: Item[]): Item[] => {
    if (!userInfo?.mistakeHistory) return allItems.sort(() => 0.5 - Math.random());
    return allItems
      .map(item => ({
        item,
        mistakes: userInfo.mistakeHistory?.[item.name] || 0
      }))
      .sort((a, b) => b.mistakes - a.mistakes)
      .map(entry => entry.item);
  };

const loadNextItem = (itemsLeft = unplayedItems, isFirstRetry = isRetry) => {
  setAttemptsForCurrentItem(0);

  if (itemsLeft.length === 0) {
saveProgress(correctCountRef.current); // ✅ explicit final value

  setShowBandage(true);
    handleLevelUnlock();
    setShowSummary(true);
    return;
  }

  const nextItems = [...itemsLeft];
  const randomIndex = Math.floor(Math.random() * nextItems.length);
  const nextItem = nextItems.splice(randomIndex, 1)[0];

  const otherItems = levels[currentLevel].items.filter(i => i.name !== nextItem.name);

  // 🛠️ Update logic to use isFirstRetry instead of checking correctCount
  const shouldShowOnlyTwoOptions = isFirstRetry;
  const maxChoices = shouldShowOnlyTwoOptions ? 2 : levels[currentLevel].gridSize;

  const distractors = sortChoicesByMistakes(otherItems).slice(0, maxChoices - 1);
  const finalChoices = [...distractors, nextItem].sort(() => 0.5 - Math.random());

  setShadowItem(nextItem);
  setChoices(finalChoices);
  setUnplayedItems(nextItems);
  setShowPicture(false);
  setMessage("");
  setAiExplanation("");
};

  const updateMistakeHistory = async (itemName: string, isCorrect: boolean) => {
    const user = auth.currentUser;
    if (!user) return;
    const refPath = ref(db, `users/${user.uid}/mistakeHistory/${itemName}`);
    const snapshot = await get(refPath);
    const current = snapshot.exists() ? snapshot.val() : 0;
    await set(refPath, isCorrect ? Math.max(0, current - 1) : current + 1);
  };

const saveProgress = async (finalCorrectCount: number) => {
  const user = auth.currentUser;
  if (!user) return;

  const levelKey = `level_${currentLevel + 1}`;
  const progressRef = ref(db, `users/${user.uid}/progress/${levelKey}`);

const newXp = finalCorrectCount * 10;


  // ✅ Always save current level stats (latest attempt)
  await set(progressRef, {
    xp: newXp,
          correct: finalCorrectCount,
    wrong: wrongCount,
    email: user.email,
    name: user.displayName || "Anonymous",
    timestamp: Date.now(),
  });
  console.log("✅ Saved level progress:", newXp);

  // ✅ Always add XP to total, no matter if level was repeated
  const xpRef = ref(db, `users/${user.uid}/totalXp`);
  const totalXpSnapshot = await get(xpRef);
  const prevTotalXp = totalXpSnapshot.exists() ? totalXpSnapshot.val() : 0;

  const updatedTotalXp = prevTotalXp + newXp;

  await set(xpRef, updatedTotalXp);
  console.log("✅ Updated totalXp:", updatedTotalXp);
};


 const handleLevelUnlock = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const passed = correctCountRef.current >= Math.ceil(levels[currentLevel].items.length / 2);

  const nextLevelIndex = currentLevel + 1;

  if (passed) {
    // ✅ Award +1 bandage
    const bandageRef = ref(db, `users/${user.uid}/bandages`);
    const bandageSnap = await get(bandageRef);
    const currentBandages = bandageSnap.exists() ? bandageSnap.val() : 0;

 await set(bandageRef, currentBandages + 1);
setBandages(currentBandages + 1);
setEarnedBandages(prev => prev + 1); // Track earned

    // 🔓 Unlock the next level if not already unlocked
    if (nextLevelIndex < levels.length) {
      const unlockedRef = ref(db, `users/${user.uid}/unlockedLevels`);
      const unlockedSnap = await get(unlockedRef);
      const currentUnlocked = unlockedSnap.exists() ? unlockedSnap.val() : [];

      if (!currentUnlocked.includes(nextLevelIndex)) {
        const updatedUnlocked = [...new Set([...currentUnlocked, nextLevelIndex])];
        await set(unlockedRef, updatedUnlocked);
        setUnlockedLevels(updatedUnlocked);
      }
    }
  }
};


  const handleSelect = async (item: Item) => {
    if (!shadowItem) return;

    const start = Date.now();
    const aiGuess = await classifyWithAI(shadowItem.aiHint, choices.map(c => c.name));
    const responseTime = Date.now() - start;

   const normalize = (s: string) =>
  s.toLowerCase()
   .replace(/[\W_]+/g, "") // Removes all non-alphanumeric and underscores
   .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
   .normalize("NFKC")
   .trim();

    const aiGuessClean = normalize(aiGuess);
    const correctAnswer = normalize(shadowItem.name);
    const selectedAnswer = normalize(item.name);
 
    const isCorrect = selectedAnswer === correctAnswer; // ✅ only user matters for correctness

  const isAICorrect = aiGuessClean === correctAnswer;

   console.log("shadowItem.name:", shadowItem.name, [...shadowItem.name].map(c => c.charCodeAt(0)));
console.log("item.name:", item.name, [...item.name].map(c => c.charCodeAt(0)));
console.log("ai =", aiGuessClean );
console.log("selectedAnswer =",selectedAnswer);
console.log("selectedAnswer =",selectedAnswer);


    const explanation = `
🤖 Based on the hint: "${shadowItem.aiHint}", I looked for key clues such as "${
  shadowItem.aiHint.split(" ").slice(0, 5).join(" ")
}..." which point to something that is usually associated with "${shadowItem.name}".

I evaluated all options:
${choices.map((c) => `- ${c.name}: ${c.aiHint}`).join("\n")}

After analyzing the descriptions, "${aiGuess}" matched the hint most closely in terms of shape, color, and category. So I selected it as the best fit.
`;

    

    await logDataExample({
      level: currentLevel + 1,
      grade: levels[currentLevel].grade,
      hint: shadowItem.aiHint,
      category: shadowItem.category,
      options: choices.map((c) => c.name),
      correctAnswer: shadowItem.name,
      aiGuess,
      userSelected: item.name,
      isCorrect,
      responseTime,
      explanation,
    });

    await updateMistakeHistory(item.name, isCorrect);

 if (isCorrect) {
  setMessage(`✅ Correct! answer`);
correctCountRef.current += 1;
setCorrectCount(correctCountRef.current); // Update UI state

  setWrongCount(0); // reset wrong count for next item
  setShowPicture(true);
  successSoundRef.current?.play().catch(() => {});
  setTimeout(() => {
    setMessage("");
    loadNextItem();
  }, 1200);
} else {
  const newWrongCount = wrongCount + 1;
  setWrongCount(newWrongCount);
  setAttemptsForCurrentItem(prev => prev + 1);

  if (newWrongCount % 2 === 1) {
    // First wrong attempt: let user try again
    setMessage("❌ Try again! Wrong answer.");
     return;
  } else {
    // Second wrong attempt: read full explanation before proceeding
    const correctItem = shadowItem.name;
    const fullText = `The correct answer was ${correctItem}. Now here's why. ${explanation}`;

    setMessage(`ℹ️ The correct answer was: ${correctItem}`);
    setAiExplanation(explanation);
    setShowPicture(true);

    const utterance = new SpeechSynthesisUtterance(fullText);

    utterance.onend = () => {
      setMessage("");
      setWrongCount(0); // reset for next item
      loadNextItem();
    };

    // Speak full explanation before moving forward
    window.speechSynthesis.cancel(); // stop any previous speech
    window.speechSynthesis.speak(utterance);
  }
}

  
  };
console.log("wrongCount:", wrongCount);
console.log("bandages:", bandages);
console.log("showPicture:", showPicture);

  const handleHint = () => {
    if (!shadowItem) return;
    const text = `${shadowItem.refinedHint || shadowItem.hint} It's a kind of ${shadowItem.category}.`;
    setMessage("💡 Hint: " + text);
    speak(text);
  };

  const handleNextLevel = () => {
    if (unlockedLevels.includes(currentLevel + 1)) {
      setCurrentLevel(Math.min(currentLevel + 1, levels.length - 1));
    }
  };

  const handlePrevLevel = () => setCurrentLevel(Math.max(0, currentLevel - 1));

  if (!levels[currentLevel]) return <div>⚠️ Invalid level. Please restart the game.</div>;

const handleUseBandage = async () => {
  if (!shadowItem || bandages <= 0) return;

  const user = auth.currentUser;
  if (!user) return;

  const newBandageCount = bandages - 1;
  setBandages(newBandageCount);
  setUsedBandages(prev => prev + 1); // Track usage

  const bandageRef = ref(db, `users/${user.uid}/bandages`);
  await set(bandageRef, newBandageCount); // Update in DB


  setWrongCount(0); // skip penalty
  setMessage("🩹 Bandage used! Skipping this and moving to next...");
  setShowPicture(true);
     setShowPicture(false);

  setTimeout(() => {
    setMessage("");
    loadNextItem();
  }, 1200);
};
const canUseBandage = !showPicture && bandages > 0 && wrongCount % 2 === 1;



  return (
    
    <div className="shadow-game-container">
      <div className="game-card fade-in">

 

    <button className="go-menu-btn" onClick={handleBackToMenu}>
  <FaArrowLeft style={{ marginRight: "8px" }} />
  Go to Menu
</button>

     <div className="header-bar">
          <h2 className="xp-info highlighted-xp">🌟 XP: {correctCount * 10}</h2>

        </div>
        {showSummary ? (
          <div className="summary-screen zoom-in">
            <h2>📊 Level Summary</h2>
            <p>✅ Correct: {correctCount}</p>
            <p>❌ Wrong: {wrongCount}</p>
            <p>🩹 Bandages Used: {usedBandages}</p>
<p>🎁 Bandages Earned: {earnedBandages}</p>

            <div className="summary-buttons">
              {currentLevel > 0 && (
                <button onClick={handlePrevLevel} className="btn prev-btn">⬅️ Previous Game</button>
              )}
              {correctCount >= Math.ceil(levels[currentLevel].items.length / 2) ? (
                currentLevel + 1 < levels.length ? (
                  <button onClick={handleNextLevel} className="btn next-btn">➡️ Next Game</button>
                ) : (
                  <p className="completion-text">🎉 Game completed!</p>
                )
              ) : (
         <button onClick={() => startLevel(true)} className="btn retry-btn">🔁 Retry Game</button>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="instruction fade-in">📢 {instruction}</p>
            {shadowItem && (
              <div className="shadow-image-container">
                <div className={`shadow-box ${showPicture ? "reveal" : "grayscale"}`}>
                  <img
                    src={showPicture ? shadowItem.img : shadowItem.shadow}
                    alt="shadow match"
                    draggable={false}
                    className="shadow-main-img"
                  />
                </div>
                {!showPicture && (
                  <button className="btn hint-btn bounce" onClick={handleHint}>💡 Hint</button>
                )}
{!showPicture && bandages > 0 && wrongCount === 1 && (
  <button className="btn bandage-btn" onClick={handleUseBandage}>
    🩹 Use Bandage ({bandages} left)
  </button>
)}



              </div>
            )}
          <div className={`choices-grid grid-${Math.min(choices.length, 4)}`}>
  {choices.map((item) => (
    <div
      key={item.id}
      className="choice-card scale-on-hover"
      onClick={() => handleSelect(item)}
    >
      {/* Show image only if enabled for this level */}
      {levels[currentLevel].showImage && (
        <img src={item.img} alt={item.name} draggable={false} />
      )}

      {/* Show name only if enabled for this level */}
      {levels[currentLevel].showName && (
        <p>{item.name}</p>
      )}
    </div>
  ))}
</div>

            {message && <p className="message slide-in">{message}</p>}
   {aiExplanation && (
  <div className="ai-explanation-card fade-in">
    <button
      className="btn toggle-explanation-btn"
      onClick={() => setShowExplanation(prev => !prev)}
    >
      {showExplanation ? "🔽 Hide AI Explanation" : "🧠 Show AI Explanation"}
    </button>

    {showExplanation && (
      <div className="ai-explanation-content slide-down">
        <h3 className="ai-title">🤖 How AI Made the Choice</h3>
        <pre className="explanation-text">
          {aiExplanation}
        </pre>
      </div>
    )}
  </div>
)}


          </>
        )}
      </div>
    </div>
  );
};



export default ShadowMatchGame;
