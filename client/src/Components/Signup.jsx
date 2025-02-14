import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../assets/Frame 1000003437.png";
import { FaGoogle } from "react-icons/fa";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";

const SignUpPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("Weak");

  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign Up Success:", result.user);
      navigate("/");
    } catch (error) {
      console.error("Google Sign Up Error:", error);
    }
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(validatePassword(value)); // Update password strength
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Function to validate password
  const validatePassword = (password) => {
    if (password.length < 8) return "Weak";
    if (!/[A-Z]/.test(password)) return "Medium";
    if (!/[0-9]/.test(password) && !/[!@#$%^&*]/.test(password))
      return "Medium";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();
      console.log("Response Data:", data);

      if (response.ok) {
        alert("Signup successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id)
        navigate("/questions");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("An error occurred during signup.");
    }
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
        <p className="text-3xl md:text-4xl font-bold mb-4">Join Us Today</p>
        <p className="text-md md:text-lg mb-4">
          Speak Confidently, Present Flawlessly.
        </p>
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
          <h1 className="text-xl md:text-2xl font-bold text-center">
            Create Your Account
          </h1>
          <div className="flex justify-between">
            <button
              className="flex-1 py-2 text-center text-gray-500"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
            <button
              className="flex-1 py-2 text-center border-b-2 border-blue-500"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="block text-left text-gray-700 font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={handleFirstNameChange}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Enter First Name"
              required
            />
            <label className="block text-left text-gray-700 font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={handleLastNameChange}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Enter Last Name"
              required
            />
            <label className="block text-left text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Enter Email"
              required
            />
            <label className="block text-left text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Enter Password"
              required
            />
            <p
              className={`text-sm text-left mb-4 ${
                passwordStrength === "Weak"
                  ? "text-red-500"
                  : passwordStrength === "Medium"
                  ? "text-yellow-500"
                  : "text-green-500"
              }`}
            >
              Password Strength: {passwordStrength}
            </p>
            <label className="block text-left text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Confirm Password"
              required
            />
            <div className="flex items-center mb-4">
              <input type="checkbox" id="terms" className="mr-2" required />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <a href="#" className="text-blue-500">
                  Terms & Conditions
                </a>
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg"
              style={{ cursor: "pointer" }}
            >
              Sign Up
            </button>
          </form>
          <div className="flex items-center mt-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-2 text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <button
            onClick={handleGoogleSignUp}
            style={{ cursor: "pointer" }}
            className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center mt-4"
          >
            <FaGoogle className="w-4 h-4 mr-2"  color="#4285F4" />
            Sign Up with Google
          </button>
          <p className="text-xs text-gray-500 text-center mt-4">
            Already have an account?{" "}
            <a
              onClick={() => navigate("login")}
              style={{ cursor: "pointer" }}
              className="text-blue-500"
            >
              Sign In Here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
