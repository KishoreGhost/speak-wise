import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import STT from "./Components/STT";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PostureTester from "./Components/Pose";
import Login from "./Components/Login"
import Signup from "./Components/Signup";
import Questionnaire from "./Components/UserInfoQuestions/Questions";
import SpeechAnalyzer from "./Components/SpeechAnalyzer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/posture-tester" element={<PostureTester />} />
        <Route path="/questions" element={<Questionnaire />} /> 
      </Routes>
    </Router>
  );
}

export default App;
