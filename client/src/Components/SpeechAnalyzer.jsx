import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaStop } from "react-icons/fa";
import logo from "../assets/logo.png";

const SpeechAnalyzer = () => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [isPresentationActive, setIsPresentationActive] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [emotion, setEmotion] = useState("Neutral");
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let newText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          newText += event.results[i][0].transcript + " ";
        }
        setTranscript((prevTranscript) => prevTranscript + " " + newText.trim());
        analyzeEmotion(newText);
      };
      recognitionRef.current = recognition;

      if (isTranscribing) {
        recognition.start();
      } else {
        recognition.stop();
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isTranscribing]);

  const analyzeEmotion = (text) => {
    const keywords = {
      happy: ["great", "happy", "joy", "excited", "awesome"],
      sad: ["sad", "unhappy", "down", "depressed", "upset"],
      angry: ["angry", "mad", "furious", "annoyed", "frustrated"],
      neutral: [],
    };

    for (const [emotionType, words] of Object.entries(keywords)) {
      if (words.some((word) => text.toLowerCase().includes(word))) {
        setEmotion(emotionType.charAt(0).toUpperCase() + emotionType.slice(1));
        return;
      }
    }
    setEmotion("Neutral");
  };

  const stopPresentation = () => {
    setIsPresentationActive(false);
    setIsCameraOn(false);
    setIsMicOn(false);
    setIsTranscribing(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100 p-4 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between w-full p-4 bg-white shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center">
          <img src={logo} alt="SpeakWise Logo" className="w-10 h-10 mr-2" />
          <h1 className="text-xl font-semibold text-gray-800">SpeakWise</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 mt-20 px-6 gap-6 overflow-hidden">
        {isPresentationActive ? (
          <div className="flex-1 flex items-center justify-center bg-black rounded-lg relative overflow-hidden">
            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted={!isMicOn}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-white text-xl font-semibold flex items-center justify-center h-full w-full">
                Camera Off
              </div>
            )}
          </div>
        ) : null}
        {/* Live Transcription & Analysis */}
        <div className={`${isPresentationActive ? "w-1/3" : "w-2/3"} p-6 bg-white shadow-md rounded-lg text-left overflow-auto`}>
          <h2 className="text-2xl font-bold mb-4">{isPresentationActive ? "Live Transcription" : "Speech Analysis"}</h2>
          <p className="text-gray-700 text-lg whitespace-pre-wrap">{transcript || "No transcription available."}</p>
          <p className={`text-2xl font-semibold mt-4 ${emotion === "Happy" ? "text-green-600" : emotion === "Sad" ? "text-blue-600" : emotion === "Angry" ? "text-red-600" : "text-gray-600"}`}>
            Emotion: {emotion}
          </p>
        </div>
      </div>

      {/* Controls */}
      {isPresentationActive && (
        <div className="flex justify-center space-x-6 mt-6">
          <button
            onClick={() => setIsMicOn((prev) => !prev)}
            className={`p-4 rounded-full shadow-md transition-all transform hover:scale-110 duration-300 ${isMicOn ? "bg-red-500" : "bg-gray-500"}`}
            disabled={!isPresentationActive}
          >
            {isMicOn ? <FaMicrophone className="text-white text-2xl" /> : <FaMicrophoneSlash className="text-white text-2xl" />}
          </button>
          <button
            onClick={() => setIsCameraOn((prev) => !prev)}
            className={`p-4 rounded-full shadow-md transition-all transform hover:scale-110 duration-300 ${isCameraOn ? "bg-blue-500" : "bg-gray-500"}`}
            disabled={!isPresentationActive}
          >
            {isCameraOn ? <FaVideo className="text-white text-2xl" /> : <FaVideoSlash className="text-white text-2xl" />}
          </button>
          <button
            onClick={stopPresentation}
            className="p-4 bg-black rounded-full shadow-md transition-all transform hover:scale-110 duration-300"
          >
            <FaStop className="text-white text-2xl" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeechAnalyzer;