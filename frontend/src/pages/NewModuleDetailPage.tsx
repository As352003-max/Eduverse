import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { markTextAsRead, updateVideoWatchTime } from '../api/progressApi';
import { BookOpenIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const buttonHover = { scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.2)' };

const getYouTubeId = (url: string): string => {
  const match = url?.match(/(?:\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
};

const NewModuleDetailPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState(false);
  const [textRead, setTextRead] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const contentIndex = 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get(`/learning-modules/${moduleId}`);
        setModule(res.data);
        setVideoWatched(localStorage.getItem(`module-${moduleId}-videoWatched`) === 'true');
        setTextRead(localStorage.getItem(`module-${moduleId}-textRead`) === 'true');
      } catch {
        setError('Failed to load module.');
      } finally {
        setLoading(false);
      }
    };
    if (moduleId) fetchData();
  }, [moduleId]);

  // ✅ Extract all content from all topics
  const allContent = module?.topics?.flatMap((topic: any) => topic.content) || [];
  const textContent = allContent.find((c: any) => c.type === 'text');
  const videoContent = allContent.filter((c: any) => c.type === 'video');
  const quizContent = allContent.filter((c: any) => c.type === 'quiz');

  const handleTextRead = async () => {
    if (!firebaseUser?.uid || !moduleId) return;
    try {
      setTextRead(true);
      await markTextAsRead(firebaseUser.uid, moduleId, contentIndex);
    } catch (err) {
      console.error('Error marking text as read:', err);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <ArrowPathIcon className="h-20 w-20 text-indigo-600 animate-spin" />
        <motion.p className="mt-4 text-xl font-semibold text-indigo-700">Loading Module...</motion.p>
      </div>
    );

  if (error || !module)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <ExclamationCircleIcon className="h-24 w-24 text-red-500 mb-6" />
        <motion.p className="text-3xl font-semibold text-red-600">{error || 'Module not found.'}</motion.p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-indigo-100 py-12">
      <div className="container mx-auto p-6 max-w-4xl">
        <motion.h1 className="text-5xl font-extrabold text-center text-indigo-800 mb-12">
          <BookOpenIcon className="inline h-10 w-10 mr-3 text-indigo-600" />
          {module.title}
        </motion.h1>

        <motion.div className="bg-white rounded-2xl shadow-xl p-8 space-y-12">
          {/* ✅ Text Section */}
          <motion.section variants={fadeInUp} className="rounded-lg p-6 border border-indigo-200 bg-indigo-50">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700">📘 Text</h3>
            {textContent ? (
              <>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">{textContent.data.text}</p>
                <motion.button
                  whileHover={textRead ? {} : buttonHover}
                  disabled={textRead}
                  onClick={handleTextRead}
                  className={`mt-6 px-6 py-3 rounded-full font-semibold shadow-lg text-white ${
                    textRead ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {textRead ? 'Marked as Read ✓' : 'Mark as Read'}
                </motion.button>
              </>
            ) : (
              <p className="text-gray-600">No text available.</p>
            )}
          </motion.section>

          {/* ✅ Video Section */}
          <motion.section variants={fadeInUp} className="rounded-lg p-6 border border-purple-300 bg-purple-50">
            <h3 className="text-2xl font-semibold mb-4 text-purple-700">🎥 Video</h3>
            {videoContent.length > 0 ? (
              videoContent.map((video: any, idx: number) => (
                <div key={idx} className="space-y-4 mb-6">
                  <p className="text-lg font-medium text-purple-800">{video.title}</p>
                  <div className="relative w-full h-64 rounded-lg shadow-md">
                    <iframe
                      ref={iframeRef}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${getYouTubeId(video.data.url)}`}
                      title={video.title}
                      allowFullScreen
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No videos available.</p>
            )}
          </motion.section>

          {/* ✅ Quiz Section (Shows all quizzes if available) */}
          {quizContent.length > 0 && (
            <motion.section variants={fadeInUp} className="rounded-lg p-6 border border-green-300 bg-green-50">
              <h3 className="text-2xl font-semibold mb-4 text-green-700">📝 Quiz</h3>

              {quizContent.map((quiz: any, idx: number) => (
                <div key={idx} className="mb-4 p-4 border border-green-200 rounded-lg bg-white">
                  <p className="font-medium text-lg text-green-800">{quiz.title}</p>
                  <motion.button
                    whileHover={textRead && videoWatched ? buttonHover : {}}
                    disabled={!(textRead && videoWatched)}
                    onClick={() => navigate(`/newmodule/${moduleId}/quiz/${idx}`)}
                    className={`mt-2 px-6 py-2 rounded-full shadow text-white font-semibold ${
                      textRead && videoWatched ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'
                    }`}
                  >
                    Start Quiz
                  </motion.button>
                  {!(textRead && videoWatched) && (
                    <p className="text-sm text-red-600 mt-2">Please read the text and watch the video to unlock the quiz.</p>
                  )}
                </div>
              ))}
            </motion.section>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NewModuleDetailPage;
