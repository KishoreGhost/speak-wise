import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const HomePage = () => {
  const [scores, setScores] = useState({
    communication: 78,
    grammar: 58,
    expression: 89,
    gestures: 82,
  });
  const [feedback, setFeedback] = useState("");
  const [summary, setSummary] = useState("");

  // List of YouTube video IDs
  const videoList = [
    { id: "DfXtmYhMfIY", title: "Public Speaking Tips" },
    { id: "tShavGuo0_E", title: "How to Speak with Confidence" },
    { id: "GJzDyoqZUIE", title: "5 Secret Public Speaking Techniques" },
    { id: "fCujEU6x7xA", title: "Avoid These Public Speaking Mistakes" },
  ];

  useEffect(() => {
    const fetchData = async () => {
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
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white text-blue-900 px-8 py-8">
      {/* Header */}
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
          {videoList.map((video) => (
            <div
              key={video.id}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <iframe
                className="w-full h-56 md:h-64"
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allowFullScreen
              ></iframe>
              <p className="text-center text-lg text-gray-700 mt-3">
                {video.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
