import { useState } from "react";
import { motion } from "framer-motion";
import { RadioGroup } from "@headlessui/react";
import logo from "../../assets/logo.png";
import axios from "axios";

const questions = [
  // { id: "q1", question: "🤔 What’s your name?", type: "text" },
  {
    id: "q1",
    question: "🎯 What’s your primary goal for using this app?",
    type: "radio",
    options: [
      "🗣 Improve public speaking",
      "📢 Enhance presentation skills",
      "🚀 Reduce filler words",
      "💃 Improve body language",
    ],
  },
  {
    id: "q2",
    question: "🎤 What kind of presentations do you usually give?",
    type: "radio",
    options: [
      "🏢 Business presentations",
      "🎓 Educational talks",
      "🤝 Interviews",
      "✨ Other",
    ],
  },
  {
    id: "q3",
    question: "📊 How would you rate your current speaking skills?",
    type: "radio",
    options: ["🔰 Beginner", "⚡ Intermediate", "🎯 Expert"],
  },
  {
    id: "q4",
    question: "😅 Do you struggle with any of these? (Select all that apply)",
    type: "checkbox",
    options: [
      "🙊 Filler words (e.g., 'um,' 'like')",
      "🕺 Body posture",
      "🗣 Speaking fluency",
      "😰 Nervousness",
      "👀 Maintaining eye contact",
    ],
  },
];

export default function Questionnaire() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleNext = () => {
    if (step < questions.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    try {
      // Assuming the user ID is stored in localStorage or a similar storage after login
      const userId = localStorage.getItem("userId");
      console.log("User ID:", userId); // Debugging
      if (!userId) {
        alert("❌ User is not logged in. Please log in to save answers.");
        return;
      }


      const response = await axios.post(
        "http://localhost:5000/responses",
        {
          userId, // Pass the dynamic userId here
          answers, // Include the answers from state
        }
      );

      console.log("Response saved:", response.data);
      alert("🎉 Your answers have been saved!");
    } catch (error) {
      console.error("Error saving response:", error);
      alert("❌ Failed to save answers. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-center mb-4">
        <img src={logo} alt="Logo" className=" h-8 mr-2" />
        <h1 className="text-xl md:text-2xl font-bold">Speak Wise</h1>
      </div>
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-2xl lg:max-w-3xl transition-all"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {questions[step].question}
        </h2>
        {questions[step].type === "radio" && (
          <RadioGroup
            value={answers[questions[step].id]}
            onChange={(value) => handleChange(questions[step].id, value)}
            className="space-y-4"
          >
            {questions[step].options.map((option, index) => (
              <RadioGroup.Option
                key={index}
                value={option}
                className={({ checked }) =>
                  `block p-4 rounded-lg cursor-pointer text-lg font-bold transition-all ${
                    checked
                      ? "bg-[#465FF1] text-white"
                      : "bg-gradient-to-b from-[rgba(6,31,184,0.1)] to-[rgba(6,31,184,0.3)] text-black"
                  }`
                }
              >
                {option}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        )}

        {questions[step].type === "checkbox" && (
          <div className="space-y-4">
            {questions[step].options.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  const selectedOptions = answers[questions[step].id] || [];
                  const isSelected = selectedOptions.includes(option);
                  setAnswers({
                    ...answers,
                    [questions[step].id]: isSelected
                      ? selectedOptions.filter((item) => item !== option)
                      : [...selectedOptions, option],
                  });
                }}
                className={`block p-4 rounded-lg cursor-pointer text-lg text-center font-bold transition-all ${
                  answers[questions[step].id]?.includes(option)
                    ? "bg-[#465FF1] text-white"
                    : "bg-gradient-to-b from-[rgba(6,31,184,0.1)] to-[rgba(6,31,184,0.3)] text-black"
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center items-center space-x-4 mt-8">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="w-1/2 text-center bg-blue-500 text-white py-2 rounded-lg"
            >
              ⬅️ Back
            </button>
          )}
          <button
            onClick={step === questions.length - 1 ? handleSubmit : handleNext}
            className="w-1/2 text-center bg-blue-500 text-white py-2 rounded-lg"
          >
            {step === questions.length - 1 ? "🎉 Finish" : "➡️ Next"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
