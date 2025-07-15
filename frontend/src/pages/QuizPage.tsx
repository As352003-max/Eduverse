// src/pages/QuizPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const quizData = [
  { question: "What is the capital of France?", options: ["Paris", "Rome", "Berlin", "Madrid"], answer: "Paris" },
  { question: "2 + 2 = ?", options: ["3", "4", "5", "6"], answer: "4" },
  { question: "Which planet is known as the Red Planet?", options: ["Earth", "Venus", "Mars", "Jupiter"], answer: "Mars" },
  { question: "Who wrote 'Hamlet'?", options: ["Shakespeare", "Homer", "Dickens", "Rowling"], answer: "Shakespeare" },
  { question: "What is the boiling point of water?", options: ["90°C", "100°C", "80°C", "120°C"], answer: "100°C" },
  { question: "HTML stands for?", options: ["Hyper Transfer Markup Language", "Hyper Text Markup Language", "High Text Machine Language", "None"], answer: "Hyper Text Markup Language" },
  { question: "What color do you get by mixing red and white?", options: ["Pink", "Purple", "Orange", "Brown"], answer: "Pink" },
  { question: "What is 5 x 3?", options: ["8", "15", "10", "12"], answer: "15" },
  { question: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], answer: "Pacific" },
  { question: "JavaScript is ___", options: ["Compiled", "Interpreted", "Neither", "Both"], answer: "Interpreted" },
];

const QuizPage: React.FC = () => {
  const [answers, setAnswers] = useState<string[]>(Array(quizData.length).fill(""));
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answers.includes("")) {
      setError(true);
      return;
    }
    setError(false);
    const calculatedScore = quizData.reduce((acc, curr, i) => {
      return acc + (answers[i] === curr.answer ? 1 : 0);
    }, 0);
    setScore(calculatedScore);
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8 relative">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">📝 Mini Quiz</h1>

        {/* Close Button */}
        <button
          onClick={handleClose}
          title="Close Quiz"
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm transition"
        >
          ✖
        </button>

        {quizData.map((item, idx) => (
          <div key={idx} className="mb-6">
            <p className="font-semibold">{idx + 1}. {item.question}</p>
            <div className="ml-4 mt-2 space-y-1">
              {item.options.map((option, oIdx) => (
                <label key={oIdx} className="block cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={option}
                    checked={answers[idx] === option}
                    onChange={() => handleAnswerChange(idx, option)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Submit Quiz
        </button>

        {error && (
          <p className="text-red-600 font-semibold mt-4">⚠️ Please answer all questions before submitting.</p>
        )}

        {score !== null && !error && (
          <p className="mt-4 font-bold text-green-600 text-lg">
            ✅ Your Score: {score} / {quizData.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
