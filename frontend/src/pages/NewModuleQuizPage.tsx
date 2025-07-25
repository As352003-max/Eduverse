import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { recordQuizResult } from '../api/progressApi';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ContentPiece {
    _id?: string;
    title?: string;
    type: 'text' | 'video' | 'quiz';
    data: any;
}

interface Topic {
    _id?: string;
    title: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    content: ContentPiece[];
}

interface LearningModule { // Renamed from Module to LearningModule for clarity
    _id: string;
    title: string;
    content: ContentPiece[]; // This will be the combined content from topics for quiz page
    topics: Topic[]; // Added topics to the type definition
}

const NewModuleQuizPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  const [module, setModule] = useState<LearningModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [earnedBandage, setEarnedBandage] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        // CORRECTED: Fetch from /api/learning-modules
        const res = await apiClient.get(`/learning-modules/${moduleId}`);
        setModule(res.data);
      } catch (err) {
        setError('Failed to fetch module quiz.');
      } finally {
        setLoading(false);
      }
    };
    if (moduleId) fetchModule();
  }, [moduleId]);

  const extractQuizQuestions = (mod: LearningModule): QuizQuestion[] => {
    // Assuming quiz is always in the first topic's content for simplicity
    const quizItem = mod.topics?.[0]?.content.find((item) => item.type === 'quiz');
    if (!quizItem || !quizItem.data?.question) return []; // The quiz data structure is a single object directly with 'question', 'options', 'correctAnswer' from seedDB

    // If quiz data has a 'questions' array (as per the earlier JSON you provided for "learning collection")
    // Use this logic:
    if (quizItem.data.questions && Array.isArray(quizItem.data.questions)) {
        return quizItem.data.questions.map((q: any) => ({
            question: q.question ?? '',
            options: q.options ?? [],
            correctAnswer:
                typeof q.answer === 'number' && q.options && q.options.length > q.answer
                    ? q.options[q.answer]
                    : '',
        }));
    } else {
        // If quiz data is a single question object (as per our seedDB structure)
        return [{
            question: quizItem.data.question ?? '',
            options: quizItem.data.options ?? [],
            correctAnswer: quizItem.data.correctAnswer ?? ''
        }];
    }
  };

  const getQuizContentId = (mod: LearningModule): string => {
    // Get the _id of the quiz content piece from the first topic
    const quizItem = mod.topics?.[0]?.content.find((item) => item.type === 'quiz');
    return quizItem?._id || `${mod._id}-quiz`;
  };

  const quizQuestions = module ? extractQuizQuestions(module) : [];

  const handleSelect = (option: string) => {
    const updated = [...selectedAnswers];
    updated[currentIndex] = option;
    setSelectedAnswers(updated);
  };

  const handleSubmit = async () => {
    if (!firebaseUser?.uid || !moduleId || !module) {
      console.error('Missing user ID, module ID or module');
      return;
    }

    const contentId = getQuizContentId(module);
    if (!contentId) {
      console.error('Missing quiz contentId');
      return;
    }

    const total = quizQuestions.length;
    let correctCount = 0;

    for (let i = 0; i < total; i++) {
      if (selectedAnswers[i] === quizQuestions[i].correctAnswer) {
        correctCount++;
      }
    }

    const fullScore = correctCount === total;
    const bandage = fullScore;

    try {
      await recordQuizResult(
        firebaseUser.uid,
        moduleId,
        contentId,
        correctCount,
        total,
        selectedAnswers,
        bandage
      );
      setScore(correctCount);
      setSubmitted(true);
      setEarnedBandage(bandage);
    } catch (err) {
      console.error('Error saving quiz result summary', err);
    }
  };

  const currentQuestion = quizQuestions[currentIndex];
  const selectedAnswer = selectedAnswers[currentIndex];
  const allAnswered =
    quizQuestions.length > 0 && quizQuestions.every((_, i) => selectedAnswers[i] !== undefined);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
        <p className="ml-4 text-xl text-gray-700">Loading Quiz...</p>
      </div>
    );
  }

  if (error || quizQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <ExclamationCircleIcon className="h-20 w-20 text-red-500 mb-4" />
        <p className="text-red-600 text-center text-2xl font-semibold mb-4">
          {error || 'Quiz not found or no questions available.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-indigo-700 text-center">
          {module?.title} - Quiz
        </h2>

        {!submitted ? (
          <>
            <div className="mb-4">
              <p className="text-xl font-semibold">{`Question ${currentIndex + 1} of ${quizQuestions.length}`}</p>
              <p className="mt-2 mb-4 text-gray-800">{currentQuestion.question}</p>

              {currentQuestion.options.map((opt, i) => (
                <label
                  key={i}
                  className="flex items-center mb-2 cursor-pointer select-none"
                  aria-checked={selectedAnswer === opt}
                  role="radio"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleSelect(opt);
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentIndex}`}
                    value={opt}
                    checked={selectedAnswer === opt}
                    onChange={() => handleSelect(opt)}
                    className="mr-3 cursor-pointer"
                  />
                  {opt}
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                disabled={currentIndex === 0}
                className={`px-5 py-2 rounded-full transition ${
                  currentIndex === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                Previous
              </button>

              {currentIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={() =>
                    setCurrentIndex((idx) => Math.min(quizQuestions.length - 1, idx + 1))
                  }
                  disabled={selectedAnswer === undefined}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className="px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-green-600 mb-2">
              🎉 You scored {score} out of {quizQuestions.length}
            </h3>
            {earnedBandage ? (
              <p className="text-lg text-blue-600 mt-2">
                🩹 Bandage Awarded! Great job on the perfect score!
              </p>
            ) : (
              <p className="text-lg text-gray-500 mt-2">No bandage this time. Try again for 100%!</p>
            )}
            <button
              onClick={() => navigate(`/newmodule/${moduleId}?quizSubmitted=true`)}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
            >
              Back to Module
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewModuleQuizPage;