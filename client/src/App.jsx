import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import PostureTester from "./Pose";
import Questionnaire from "./Components/UserInfoQuestions/Questions";

function App() {
  return (
    <>
      {/* <PostureTester /> */}
      <Questionnaire />
      
    </>
  );
}

export default App;
