import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../assets/Frame 1000003437.png";
import logo from "../assets/logo.png";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("Weak");

  const navigate = useNavigate();

  // Function to validate password
  const validatePassword = (password) => {
    if (password.length < 8) return "Weak";
    if (!/[A-Z]/.test(password)) return "Medium";
    if (!/[0-9]/.test(password) && !/[!@#$%^&*]/.test(password))
      return "Medium";
    return "Strong";
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(validatePassword(newPassword));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Section */}
      <div
        className="flex-1 flex flex-col justify-center items-center text-white p-8 md:h-full h-[40vh] md:h-screen"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className="text-3xl md:text-4xl font-bold mb-4">
          Welcome to Speak Wise
        </p>
        <p className="text-md md:text-lg mb-4">
          Speak Confidently, Present Flawlessly.
        </p>
        <br />
        <br />

        <h2 className="text-lg md:text-2xl font-semibold">
          Confident Communication
        </h2>
        <p className="text-center text-sm md:text-base">
          Enhance your speech and presentation skills with real-time AI-driven
          feedback.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-4/5 max-w-md">
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Logo" className=" h-8 mr-2" />
            <h1 className="text-xl md:text-2xl font-bold">Speak Wise</h1>
          </div>
          <div className="flex justify-between mb-4">
            <button className="flex-1 py-2 text-center border-b-2 border-blue-500">
              Sign In
            </button>
            <button
              className="flex-1 py-2 text-center text-gray-500"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
          <form>
            <label className="block text-left text-gray-700 font-medium mb-1">
              Email Id
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Enter Email"
            />
            <label className="block text-left text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 rounded-lg p-2 mb-2"
              placeholder="Enter Password"
            />
            <p
              className={`text-sm mb-4 ${
                passwordStrength === "Weak"
                  ? "text-red-500"
                  : passwordStrength === "Medium"
                  ? "text-yellow-500"
                  : "text-green-500"
              }`}
            >
              Password Strength: {passwordStrength}
            </p>
            <ul className="text-sm text-gray-500 mb-4">
              <li>✓ At least 8 characters</li>
              <li>✓ Contains an uppercase letter</li>
              <li>✓ Contains a number or symbol</li>
            </ul>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg"
              disabled={passwordStrength !== "Strong"}
            >
              Login
            </button>
          </form>
          <div className="flex items-center mt-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-2 text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <button className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center mt-4">
            <FaGoogle className="w-4 h-4 mr-2" color="#4285F4" />
            Sign in with Google
          </button>
          <p className="text-xs text-gray-500 text-center mt-4">
            By signing up to create an account, I accept Company's{" "}
            <a href="#" className="text-blue-500">
              Terms of Use
            </a>{" "}
            &{" "}
            <a href="#" className="text-blue-500">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
