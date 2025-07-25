import React, { useEffect, useState, useRef, useCallback } from 'react'; // Added useCallback
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

import { markTextAsRead, updateVideoWatchTime } from '../api/progressApi';
import {
  BookOpenIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

// Extend Window interface to include YT and onYouTubeIframeAPIReady
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const buttonHover = {
  scale: 1.05,
  boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
};

const getYouTubeId = (url: string): string => {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([a-zA-Z0-9_-]{11})(?:\S+)?/);
  return match ? match[1] : '';
};

// Define types that match your LearningModule schema
interface ContentPiece {
  _id?: string;
  title?: string;
  type: 'text' | 'video' | 'quiz' | 'puzzle' | 'simulation' | 'drag-and-drop';
  data: any;
}

interface Topic {
  _id?: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: ContentPiece[];
}

interface LearningModule {
  _id: string;
  title: string;
  description: string;
  gradeLevel: { min: number; max: number; };
  topics: Topic[];
  xpAward: number;
  thumbnailUrl?: string;
}

const NewModuleDetailPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  const [module, setModule] = useState<LearningModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState(false);
  const [textRead, setTextRead] = useState(false);
  const [videoStartTime, setVideoStartTime] = useState<number | null>(null);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);

  // Derive content items from the FIRST topic (adjust if you have multiple topics to display)
  const firstTopicContent = module?.topics?.[0]?.content || [];
  const textContentItem = firstTopicContent.find((item: ContentPiece) => item.type === 'text');
  const videoContentItem = firstTopicContent.find((item: ContentPiece) => item.type === 'video');
  const quizContentItem = firstTopicContent.find((item: ContentPiece) => item.type === 'quiz');

  // Use content item _id if available, otherwise fallback to a generated ID
  // Note: contentId should probably be a string if it's an ObjectId from MongoDB
  const textContentId = textContentItem?._id || `${moduleId}-text-default`;
  const videoContentId = videoContentItem?._id || `${moduleId}-video-default`;
  const quizContentId = quizContentItem?._id || `${moduleId}-quiz-default`;


  // Access data from the first topic's content
  const textBody = textContentItem?.data?.text ?? '';
  const firstVideoUrl = videoContentItem?.data?.url;
  const firstVideoId = firstVideoUrl ? getYouTubeId(firstVideoUrl) : '';
  const hasQuiz = firstTopicContent.some((item: ContentPiece) => item.type === 'quiz');

  // Effect for fetching module data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/learning-modules/${moduleId}`);
        setModule(res.data);

        // Load progress from local storage for initial state
        // These are local UI states, not necessarily reflecting backend progress
        const savedVideoWatched = localStorage.getItem(`module-${moduleId}-videoWatched`) === 'true';
        const savedTextRead = localStorage.getItem(`module-${moduleId}-textRead`) === 'true';

        setVideoWatched(savedVideoWatched);
        setTextRead(savedTextRead);

      } catch (err) {
        console.error('Failed to load module:', err);
        setError('Failed to load module. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (moduleId) fetchData();
  }, [moduleId]);

  // Effect for YouTube Player API loading and initialization
  useEffect(() => {
    if (!firstVideoId) {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      return;
    }

    const scriptId = 'youtube-iframe-api';
    if (!document.getElementById(scriptId)) {
      const tag = document.createElement('script');
      tag.id = scriptId;
      // Correct YouTube Iframe API script URL
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.body.appendChild(tag);
      }
    }

    window.onYouTubeIframeAPIReady = () => {
      if (window.YT && iframeRef.current) {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player(iframeRef.current, {
          videoId: firstVideoId,
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              console.log("YouTube Player is Ready for video ID:", firstVideoId);
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                if (videoStartTime === null) { // Only set start time if not already set
                  setVideoStartTime(Date.now());
                }
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                handleFocusLoss();
              } else if (event.data === window.YT.PlayerState.ENDED) {
                setVideoWatched(true);
                handleFocusLoss();
              }
            },
          },
        });
      } else {
        console.warn("YouTube API or iframe reference not ready for player initialization.");
      }
    };

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      const existingTag = document.getElementById(scriptId);
      if (existingTag && existingTag.parentNode) {
        existingTag.parentNode.removeChild(existingTag);
      }
      (window as any).onYouTubeIframeAPIReady = undefined;
    };
  }, [firstVideoId, videoStartTime]); // Added videoStartTime to dependency to ensure handleFocusLoss has latest state

  // Effect to handle marking content as watched/read if it doesn't exist
  useEffect(() => {
    if (module) {
      const hasVideo = firstTopicContent.some((item: ContentPiece) => item.type === 'video');
      const hasText = firstTopicContent.some((item: ContentPiece) => item.type === 'text');

      if (!hasVideo) setVideoWatched(true);
      if (!hasText) setTextRead(true);
    }
  }, [module, firstTopicContent]);

  // Effect to save progress to local storage (for UI state persistence)
  useEffect(() => {
    if (moduleId) {
      localStorage.setItem(`module-${moduleId}-videoWatched`, videoWatched ? 'true' : 'false');
      localStorage.setItem(`module-${moduleId}-textRead`, textRead ? 'true' : 'false');
    }
  }, [videoWatched, textRead, moduleId]);

  // Function to save video watch time to backend - Wrapped in useCallback for useEffect dependency
  const handleFocusLoss = useCallback(async () => {
    if (videoStartTime !== null && firebaseUser?.uid && moduleId && videoContentId) {
      const now = Date.now();
      const secondsWatched = Math.floor((now - videoStartTime) / 1000);

      if (secondsWatched > 0) {
        console.log("handleFocusLoss: Attempting to send video progress with data:", {
          userId: firebaseUser.uid,
          moduleId: moduleId,
          contentId: videoContentId, // This might be a string, check type in API call
          secondsWatched: secondsWatched
        });
        try {
          await updateVideoWatchTime(firebaseUser.uid, moduleId, videoContentId, secondsWatched);
          console.log(`Saved ${secondsWatched} seconds of video watch time for content ID: ${videoContentId}.`);
        } catch (error) {
          console.error('Error saving video watch time:', error);
        }
      }
      setVideoStartTime(null); // Reset start time after saving
    } else {
      console.warn("handleFocusLoss: Skipping video progress save due to missing data.", {
        videoStartTime,
        firebaseUserUid: firebaseUser?.uid,
        moduleId,
        videoContentId // Confirm this is not undefined
      });
    }
  }, [videoStartTime, firebaseUser?.uid, moduleId, videoContentId]); // Dependencies for useCallback

  // Effect to attach/detach event listeners for focus loss (saving video progress)
  useEffect(() => {
    window.addEventListener('beforeunload', handleFocusLoss);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFocusLoss();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      handleFocusLoss(); // Also call on unmount for final save
      window.removeEventListener('beforeunload', handleFocusLoss);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleFocusLoss]); // Depends on handleFocusLoss to ensure latest version is used

  // Function to mark text content as read
  const handleTextRead = async () => {
    if (!firebaseUser?.uid || !moduleId || !textContentId) {
      console.warn("Cannot mark text as read: missing user ID, module ID, or content ID.");
      return;
    }
    console.log("handleTextRead: Attempting to send text read progress with data:", {
      userId: firebaseUser.uid,
      moduleId: moduleId,
      contentId: textContentId // This might be a string, check type in API call
    });

    try {
      setTextRead(true);
      await markTextAsRead(firebaseUser.uid, moduleId, textContentId);
      console.log('Text marked as read successfully for content ID:', textContentId);
    } catch (err) {
      console.error('Error marking text as read:', err);
      setTextRead(false);
      alert('Failed to mark text as read. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <ArrowPathIcon className="h-20 w-20 text-indigo-600 animate-spin" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xl font-semibold text-indigo-700"
        >
          Loading Module...
        </motion.p>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <ExclamationCircleIcon className="h-24 w-24 text-red-500 mb-6" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-3xl font-semibold text-red-600 mb-6"
        >
          {error || 'Module not found.'}
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
        >
          Retry
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-indigo-100 py-12">
      <div className="container mx-auto p-6 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-center text-indigo-800 mb-12 tracking-wide"
        >
          <BookOpenIcon className="inline h-10 w-10 mr-3 text-indigo-600" /> {module.title}
        </motion.h1>

        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-12"
        >
          {textBody && (
            <motion.section
              variants={fadeInUp}
              className="rounded-lg p-6 border border-indigo-200 bg-indigo-50"
            >
              <h3 className="text-2xl font-semibold mb-4 text-indigo-700 flex items-center gap-2">
                📘 Text
              </h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">{textBody}</p>
              <motion.button
                whileHover={textRead ? {} : buttonHover}
                disabled={textRead}
                onClick={handleTextRead}
                className={`mt-6 px-6 py-3 rounded-full font-semibold shadow-lg text-white transition ${
                  textRead ? 'bg-green-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {textRead ? 'Marked as Read ✓' : 'Mark as Read'}
              </motion.button>
            </motion.section>
          )}

          {firstVideoId && (
            <motion.section
              variants={fadeInUp}
              className="rounded-lg p-6 border border-purple-300 bg-purple-50"
            >
              <h3 className="text-2xl font-semibold mb-4 text-purple-700 flex items-center gap-2">
                🎥 Video
              </h3>
              <div className="space-y-4">
                <p className="text-lg font-medium text-purple-800">
                  {videoContentItem?.title || 'Module Video'}
                </p>
                <div className="relative w-full h-64 sm:h-96 rounded-lg shadow-md overflow-hidden">
                  <iframe
                    ref={iframeRef}
                    className="absolute top-0 left-0 w-full h-full rounded-lg z-0"
                    src={`https://www.youtube.com/embed/${firstVideoId}?enablejsapi=1&origin=${window.location.origin}&autoplay=0&controls=1&rel=0&modestbranding=1`} // Corrected YouTube embed URL
                    title={videoContentItem?.title || 'Module Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {!videoWatched && (
                    <div
                      className="absolute top-0 left-0 w-full h-full z-10 cursor-pointer bg-black bg-opacity-20 flex items-center justify-center"
                      onClick={() => {
                        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                          playerRef.current.playVideo();
                          setVideoStartTime(Date.now());
                        } else {
                          console.warn('YouTube player not ready to play video or video ID is invalid.');
                        }
                      }}
                    >
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        className="bg-indigo-600 text-white p-4 rounded-full shadow-lg font-semibold text-lg"
                      >
                        Click to Play & Start Tracking
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {hasQuiz && (
            <motion.section variants={fadeInUp}>
              <h3 className="text-2xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                📝 Quiz
              </h3>
              <motion.button
                whileHover={textRead && videoWatched ? buttonHover : {}}
                onClick={() => {
                  navigate(`/newmodule/${moduleId}/quiz`);
                }}
                disabled={!(textRead && videoWatched)}
                className={`mt-4 px-8 py-3 rounded-full shadow-lg text-white font-semibold transition ${
                  textRead && videoWatched
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Start Quiz
              </motion.button>
              {!(textRead && videoWatched) && (
                <p className="text-sm text-red-600 mt-3 font-medium">
                  Please read the text and watch the video to unlock the quiz.
                </p>
              )}
            </motion.section>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NewModuleDetailPage;