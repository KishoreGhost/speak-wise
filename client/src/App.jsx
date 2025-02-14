import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PostureTester from "./Pose";
import Login from "./Components/Login"
import Signup from "./Components/Signup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/posture-tester" element={<PostureTester />} />
      </Routes>
    </Router>
  );
}

export default App;
