import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaStop,
} from "react-icons/fa";
import logo from "../assets/logo.png";

const SpeechAnalyzer = () => {
  const [isDemoStarted, setIsDemoStarted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [isPresentationActive, setIsPresentationActive] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [emotion, setEmotion] = useState("Neutral");
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let stream;

    const getCameraAccess = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error accessing camera/microphone:", error);
      }
    };

    if (isDemoStarted && isCameraOn) {
      getCameraAccess();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isDemoStarted, isCameraOn]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let newText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newText += event.results[i][0].transcript + " ";
          }
        }
        setTranscript(
          (prevTranscript) => prevTranscript + " " + newText.trim()
        );
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

  if (!isDemoStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-semibold mb-4">Welcome to SpeakWise</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Get started with a live speech analysis demo or skip to the home page.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Skip
          </button>
          <button
            onClick={() => setIsDemoStarted(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Continue with Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100 p-4 font-sans overflow-hidden">
      <div className="flex items-center justify-between w-full p-4 bg-white shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center">
          <img src={logo} alt="SpeakWise Logo" className="w-15 h-10 mr-2" />
          <h1 className="text-xl font-semibold text-gray-800">SpeakWise</h1>
        </div>
      </div>

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
        <div
          className={`${
            isPresentationActive ? "w-1/3" : "w-2/3"
          } p-6 bg-white shadow-md rounded-lg text-left overflow-hidden flex flex-col`}
        >
          <h2 className="text-2xl font-bold mb-4">
            {isPresentationActive ? "Live Transcription" : "Speech Analysis"}
          </h2>
          <div className="text-gray-700 text-lg whitespace-pre-wrap overflow-auto flex-1">
            {transcript ||
              "No Transcription is available. Please start the demo to see it in action."}
          </div>
        </div>
      </div>

      {isPresentationActive && (
        <div className="flex justify-center space-x-6 mt-6">
          <button
            onClick={() => setIsMicOn((prev) => !prev)}
            className={`p-4 rounded-full shadow-md transition-all transform hover:scale-110 duration-300 ${
              isMicOn ? "bg-red-500" : "bg-gray-500"
            }`}
            disabled={!isPresentationActive}
          >
            {isMicOn ? (
              <FaMicrophone className="text-white text-2xl" />
            ) : (
              <FaMicrophoneSlash className="text-white text-2xl" />
            )}
          </button>
          <button
            onClick={() => setIsCameraOn((prev) => !prev)}
            className={`p-4 rounded-full shadow-md transition-all transform hover:scale-110 duration-300 ${
              isCameraOn ? "bg-blue-500" : "bg-gray-500"
            }`}
            disabled={!isPresentationActive}
          >
            {isCameraOn ? (
              <FaVideo className="text-white text-2xl" />
            ) : (
              <FaVideoSlash className="text-white text-2xl" />
            )}
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
