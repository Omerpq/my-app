// src/ForgotPassword.jsx
import React, { useState } from "react";
import { useTheme } from "./context/ThemeContext"; // Ensure this path is correct
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    // Client-side validation for empty or invalid email
    if (email.trim() === "") {
      setErrorMessage("Email is required");
      return;
    } else {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        setErrorMessage("Correct email is required");
        return;
      }
    }

    try {
        const response = await fetch("https://my-app-1-uzea.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Something went wrong.");
      } else {
        setInfoMessage(data.message || "Reset link sent to your email.");
      }
    } catch (error) {
      console.error("Error in forgot password:", error);
      setErrorMessage("An unexpected error occurred.");
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen transition-all duration-500 ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400"
      }`}
    >
      <div
        className={`p-8 rounded-xl w-96 transition-all duration-500 transform ${
          darkMode
            ? "bg-gray-800 text-white shadow-lg border border-gray-700"
            : "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 shadow-2xl border border-gray-200"
        }`}
      >
        <h2 className="text-2xl font-semibold text-center">Forgot password</h2>
        <form onSubmit={handleForgotPassword} className="mt-6" noValidate>
          <label
            className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ${
              darkMode
                ? "bg-gray-700 text-[#f0f0f0]"
                : "bg-white text-gray-900 border-gray-300 shadow-inner"
            } focus:border-blue-500`}
          />
          {errorMessage && (
            <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
          )}
          {infoMessage && (
            <p className="text-green-600 font-semibold text-sm mt-1">{infoMessage}</p>
          )}
          <button
            type="submit"
            className="w-full py-2 mt-6 text-white rounded-lg transition-all duration-300 transform bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-xl hover:shadow-2xl active:scale-95 active:opacity-90"
          >
            Send Reset Link
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-blue-500 hover:underline"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
