import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast"; // Use react-hot-toast
import Header from "../Components/Header/Header";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const HomePage = () => {
  const getRandomScore = (min = 50, max = 100) => Math.floor(Math.random() * (max - min + 1) + min);

const [scores, setScores] = useState({
  communication: getRandomScore(),
  grammar: getRandomScore(),
  expression: getRandomScore(),
  gestures: getRandomScore(),
});

  const [loading, setLoading] = useState(false);
  const [strippedOutput, setStrippedOutput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [videos, setVideos] = useState([]);

  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  useEffect(() => {
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
    const fetchYouTubeVideos = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=public%20speaking&type=video&key=${YOUTUBE_API_KEY}&maxResults=8`
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

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file.");
      return;
    }

    setSelectedFile(file);
    toast.success("Video file selected successfully!");
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/run-script", {
        method: "GET",
      });
      const data = await response.json();
      console.log("Python Output:", data.output);
  
      // Extract only the Overall Performance Summary
      const summaryMatch =
        data.output.split("=== Overall Performance Summary ===")[1]?.trim() ||
        "No summary found.";
  
      setStrippedOutput(summaryMatch);
  
      // Update the scores with new random values
      setScores({
        communication: getRandomScore(),
        grammar: getRandomScore(),
        expression: getRandomScore(),
        gestures: getRandomScore(),
      });
  
      toast.success("Python script executed successfully!");
    } catch (error) {
      console.error("Error executing Python script:", error);
      toast.error("Error executing Python script.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white text-blue-900 px-8 py-8">
      <Header />
    <Toaster/>

      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold">Your Communication Dashboard</h1>
        <p className="text-gray-600 mt-3 text-xl">
          Track your progress and enhance your speaking skills
        </p>
      </div>

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

      <div className="w-full max-w-screen-xl mx-auto mt-10 p-6 bg-blue-50 text-blue-900 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold">AI Summary</h2>
        <p className="mt-3 text-lg text-gray-700">
          {strippedOutput || "Waiting for AI analysis..."}
        </p>
      </div>

      <div className="flex justify-center gap-8 mt-8 w-full max-w-screen-xl mx-auto">
        <button
          className="flex-1 bg-blue-500 hover:bg-blue-700 text-white text-2xl px-6 py-4 rounded-xl shadow-md transition"
          onClick={handleUploadButtonClick}
        >
          Upload Video for AI Feedback
        </button>

        <input
          type="file"
          accept="video/mp4,video/*"
          onChange={handleAudioUpload}
          ref={fileInputRef}
          style={{ display: "none" }}
        />

<button
  className={`flex items-center justify-center flex-1 text-white text-2xl px-6 py-4 rounded-xl shadow-md transition ${
    loading
      ? "bg-blue-700 cursor-not-allowed"
      : "bg-blue-500 hover:bg-blue-700"
  }`}
  onClick={handleFileSave}
  disabled={loading}
>
  {loading ? (
    <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
  ) : (
    "Save File"
  )}
</button>


        <Link
          to="/posture-tester"
          className="flex-1 bg-green-500 hover:bg-green-700 text-white text-2xl px-6 py-4 rounded-xl shadow-md transition text-center"
        >
          Get Live Recommendations
        </Link>
      </div>
      {selectedFile && <p>Selected file: {selectedFile.name}</p>}

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
