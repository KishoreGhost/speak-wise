import { useState } from "react";
import { motion } from "framer-motion";
import { RadioGroup } from "@headlessui/react";

const questions = [
  { id: "q1", question: "🤔 What’s your name?", type: "text" },
  {
    id: "q2",
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
    id: "q3",
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
    id: "q4",
    question: "📊 How would you rate your current speaking skills?",
    type: "radio",
    options: ["🔰 Beginner", "⚡ Intermediate", "🎯 Expert"],
  },
  {
    id: "q5",
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
        {questions[step].type === "text" && (
          <input
            type="text"
            className="w-full border-2 border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            onChange={(e) => handleChange(questions[step].id, e.target.value)}
          />
        )}
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
                className="block p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-purple-300 hover:scale-105 transition-all text-lg"
              >
                {option}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        )}
        {questions[step].type === "checkbox" && (
          <div className="space-y-4">
            {questions[step].options.map((option, index) => (
              <label
                key={index}
                className="block p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-purple-300 hover:scale-105 transition-all text-lg"
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  onChange={(e) => {
                    const selectedOptions = answers[questions[step].id] || [];
                    if (e.target.checked) {
                      setAnswers({
                        ...answers,
                        [questions[step].id]: [...selectedOptions, option],
                      });
                    } else {
                      setAnswers({
                        ...answers,
                        [questions[step].id]: selectedOptions.filter((item) => item !== option),
                      });
                    }
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        )}
        <div className="flex justify-between mt-8">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-all text-lg"
            >
              ⬅️ Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-all text-lg"
          >
            {step === questions.length - 1 ? "🎉 Finish" : "➡️ Next"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
