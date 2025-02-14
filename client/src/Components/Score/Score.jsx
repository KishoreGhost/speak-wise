import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SCORES = {
  facial: {
    score: 75,
    label: "GOOD",
    title: "Expression Score",
    description: "This score measures your facial expressions during the presentation. Higher score means better engagement.",
    feedback: "Your facial expressions show good engagement. You maintained good eye contact and showed appropriate reactions.",
    history: [
      { time: "0:00", score: 65 },
      { time: "1:00", score: 70 },
      { time: "2:00", score: 75 },
      { time: "3:00", score: 72 },
      { time: "4:00", score: 78 },
      { time: "5:00", score: 75 }
    ]
  },
  voice: {
    score: 42,
    label: "MODERATE",
    title: "Voice Score",
    description: "This score measures your voice clarity and fluency. Higher score means better speech delivery.",
    feedback: "Your voice shows some signs of stuttering. Try practicing breathing exercises and speaking slower.",
    history: [
      { time: "0:00", score: 45 },
      { time: "1:00", score: 40 },
      { time: "2:00", score: 38 },
      { time: "3:00", score: 44 },
      { time: "4:00", score: 42 },
      { time: "5:00", score: 42 }
    ]
  },
  gesture: {
    score: 88,
    label: "EXCELLENT",
    title: "Gesture Score",
    description: "This score evaluates your hand movements and body language during the presentation.",
    feedback: "Your gestures effectively emphasize key points and show confidence. Keep up the natural movements!",
    history: [
      { time: "0:00", score: 82 },
      { time: "1:00", score: 85 },
      { time: "2:00", score: 90 },
      { time: "3:00", score: 88 },
      { time: "4:00", score: 86 },
      { time: "5:00", score: 88 }
    ]
  }
};

export default function ScoreCard() {
  const [showModal, setShowModal] = useState(false);
  const [currentScore, setCurrentScore] = useState("facial");
  const currentData = SCORES[currentScore];

  const handleNextScore = () => {
    const scores = Object.keys(SCORES);
    const currentIndex = scores.indexOf(currentScore);
    const nextIndex = (currentIndex + 1) % scores.length;
    setCurrentScore(scores[nextIndex]);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#2563eb"; // blue-600
    if (score >= 60) return "#16a34a"; // green-600
    if (score >= 40) return "#ea580c"; // orange-600
    return "#dc2626"; // red-600
  };

  const getLabelBgColor = (score) => {
    if (score >= 80) return "bg-blue-100 text-blue-800";
    if (score >= 60) return "bg-green-100 text-green-800";
    if (score >= 40) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl p-6 bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{currentData.title}</h2>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getLabelBgColor(currentData.score)}`}>
            {currentData.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-lg bg-gray-50">
            <div className={`text-6xl font-bold mb-2`} style={{ color: getScoreColor(currentData.score) }}>
              {currentData.score}
            </div>
            <div className="text-sm text-gray-500">OUT OF 100</div>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis domain={[0, 100]} stroke="#6b7280" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke={getScoreColor(currentData.score)} 
                  strokeWidth={2}
                  dot={{ fill: getScoreColor(currentData.score) }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-sm text-gray-600 text-center mb-6">{currentData.description}</p>

        <div className="flex justify-between gap-4">
          <button
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowModal(true)}
          >
            View Feedback
          </button>
          <button
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleNextScore}
          >
            Next Score
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{currentData.title} Feedback</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="py-4">
              <p className="text-gray-700">{currentData.feedback}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}