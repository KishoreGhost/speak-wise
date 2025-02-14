import { useState, useEffect, useRef } from "react";
import axios from "axios";

const STT = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!window.MediaRecorder) {
      alert("Your browser does not support audio recording.");
      return;
    }
  }, []);

  const toggleListening = async () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      let audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        console.log("Audio recorded, sending for analysis...");
        analyzeSpeech(audioBlob);
      };

      recognitionRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const analyzeSpeech = async () => {
    try {
      const formData = new FormData();
      formData.append("text", text);

      const response = await axios.post("https://api.deepgram.com/v1/analyze", formData, {
        headers: {
          "Authorization": `Token 70eb5206de1008d8d80657b1d88f4a3af8b1c3d6`,
          "Content-Type": "application/json"
        }
      });

      setAnalysis(response.data);
    } catch (error) {
      console.error("Error analyzing speech:", error.response?.data || error.message);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-xl font-bold">Advanced Speech Analysis</h1>
      <button
        onClick={toggleListening}
        className={`px-4 py-2 rounded text-white ${isListening ? "bg-red-500" : "bg-blue-500"}`}
      >
        {isListening ? "Stop" : "Start"} Listening
      </button>
      <p className="border p-2 min-h-[50px]">{text || "Your speech will appear here..."}</p>

      {analysis && (
        <div className="mt-4">
          <h2 className="font-semibold">Analysis</h2>
          <p><strong>Emotion:</strong> {analysis.emotion}</p>
          <p><strong>Sentiment:</strong> {analysis.sentiment}</p>
          <p><strong>Filler Words:</strong> {analysis.filler_words.join(", ") || "None"}</p>
          <p><strong>Speech Speed (WPM):</strong> {analysis.speech_rate}</p>
        </div>
      )}
    </div>
  );
};

export default STT;
