import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../assets/Frame 1000003437.png";
import logo from "../assets/logo.png";
import { FaGoogle } from "react-icons/fa";
import { auth, provider, signInWithPopup, signOut } from "../../firebase";
import toast from "react-hot-toast";

const Login = () => {
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Extract user data here
  
      const userData = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      };
  
      localStorage.setItem("token", user.accessToken);
  
      const response = await fetch("http://localhost:3000/google-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to store user in DB");
      }
  
      toast.success(`Welcome, ${user.displayName}!`);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      console.error("Login Failed", error);
      toast.error("Login Failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout Failed", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        alert("Login successful!");
        console.log("res", data)
        localStorage.setItem("token", data.token); // Save JWT token
        localStorage.setItem("userId", data.user._id)
        navigate("/questions"); // Redirect to the dashboard or homepage
      } else {
        alert(data.message); // Show error message
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("An error occurred during login.");
    }
  };



  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
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
            <button className="flex-1 py-2 text-center border-b-2 border-blue-500" style={{ cursor: "pointer" }}>
              Sign In
            </button>
            <button
              className="flex-1 py-2 text-center text-gray-500"
              onClick={() => navigate("/signup")}
              style={{ cursor: "pointer" }}
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="block text-left text-gray-700 font-medium mb-1">
              Email Id
            </label>
            <input
              type="email"
              value={email}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
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
            <button
              type="submit"
              style={{ cursor: "pointer" }}
              className="w-full bg-blue-500 text-white py-2 rounded-lg"
            >
              Login
            </button>
          </form>
          <div className="flex items-center mt-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-2 text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <button onClick={handleLogin} style={{ cursor: "pointer" }} className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center mt-4">
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
