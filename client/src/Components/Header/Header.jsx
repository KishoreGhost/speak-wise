import React from "react";
// import { UserCircle } from "lucide-react";
import logo from "../../assets/logo.png";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="h-16 flex items-center justify-between px-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <h1 className="text-xl font-semibold text-gray-800">SpeakWise</h1>
          </div>

          {/* Profile Icon */}
          <FaUserCircle 
            className="text-gray-600 w-8 h-8 cursor-pointer hover:text-gray-800 transition-colors" 
          />
        </div>
      </header>
      {/* Spacer div to prevent content from going under header */}
      <div className="h-16 w-full"></div>
    </>
  );
};

export default Header;