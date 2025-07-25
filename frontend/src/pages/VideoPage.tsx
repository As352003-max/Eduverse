import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VideoPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const videoUrl = location.state?.videoUrl;

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-red-600 text-lg font-semibold">
        ❌ No video URL provided.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
      <video
        src={videoUrl}
        controls
        autoPlay
        className="w-full max-w-4xl rounded-lg shadow-xl"
      />
      <button
        onClick={() => navigate(-1)}
        className="mt-6 text-white bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full font-semibold shadow-md"
      >
        ✖ Close Video
      </button>
    </div>
  );
};

export default VideoPage;
