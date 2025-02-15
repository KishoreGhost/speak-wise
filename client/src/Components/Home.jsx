import React, { useState, useEffect } from "react";
<<<<<<< Updated upstream
import { Link } from "react-router-dom";
=======
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import Header from "../Components/Header/Header"; 
>>>>>>> Stashed changes

const HomePage = () => {
  const [scores, setScores] = useState({
    communication: 78,
    grammar: 58,
    expression: 89,
    gestures: 82,
  });
  const [feedback, setFeedback] = useState("");
  const [summary, setSummary] = useState("");
  const [videos, setVideos] = useState([]); // State for storing videos

  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY; // Store API key in environment variables

  useEffect(() => {
    // Fetch AI feedback data
    const fetchFeedbackData = async () => {
      try {
        const response = await fetch("https://your-backend-api.com/feedback");
        const data = await response.json();
        setScores({
          communication: data.communicationScore,
          grammar: data.grammarScore,
          expression: data.expressionScore,
          gestures: data.gesturesScore,
        });
        setFeedback(data.feedback);
        setSummary(data.summary);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      }
    };

    fetchFeedbackData();
  }, []);

  useEffect(() => {
    // Fetch YouTube videos dynamically
    const fetchYouTubeVideos = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=public%20speaking&type=video&key=${YOUTUBE_API_KEY}&maxResults=4`
        );
        const data = await response.json();
        const fetchedVideos = data.items.map((item) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
        }));
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching YouTube videos:", error);
      }
    };

    fetchYouTubeVideos();
  }, [YOUTUBE_API_KEY]);

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white text-blue-900 px-8 py-8">
      {/* Header */}
      <Header />
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold">Your Communication Dashboard</h1>
        <p className="text-gray-600 mt-3 text-xl">
          Track your progress and enhance your speaking skills
        </p>
      </div>

      {/* Scores Section */}
      <div className="flex justify-center w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-screen-xl">
          {Object.entries(scores).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col items-center p-6 bg-blue-100 text-blue-900 rounded-xl shadow-lg w-full h-44"
            >
              <h2 className="text-2xl font-semibold capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </h2>
              <p className="text-6xl font-bold mt-2">{value}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <div className="w-full max-w-screen-xl mx-auto mt-10 p-6 bg-blue-50 text-blue-900 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold">AI Summary</h2>
        <p className="mt-3 text-lg text-gray-700">
          {summary || "Waiting for AI analysis..."}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-8 mt-8 w-full max-w-screen-xl mx-auto">
        <button className="flex-1 bg-blue-500 hover:bg-blue-700 text-white text-2xl px-6 py-4 rounded-xl shadow-md transition">
          Upload Video for AI Feedback
        </button>
        <Link
          to="/posture-tester"
          className="flex-1 bg-green-500 hover:bg-green-700 text-white text-2xl px-6 py-4 rounded-xl shadow-md transition text-center"
        >
          Get Live Recommendations
        </Link>
      </div>

      {/* Video Section */}
      <div className="w-full max-w-screen-xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold mb-5 text-center">
          Improve Your Public Speaking
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-4">
                <p className="text-lg font-semibold text-gray-700 text-center">
                  {video.title}
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-center text-blue-500 hover:underline"
                >
                  Watch Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
