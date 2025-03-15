// src/ResetPassword.jsx
import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useTheme } from "./context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./ResetPassword.css";

export default function ResetPassword() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { token } = useParams(); // Extract the token from URL
  console.log("Extracted token:", token);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Update password strength as the password changes
  useEffect(() => {
    const strength = evaluatePasswordStrength(password);
    setPasswordStrength(strength);
  }, [password]);

  // Function to evaluate password strength (score from 0 to 5)
  const evaluatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 6) score++; // Minimum length bonus
    if (pass.length >= 10) score++; // Longer password bonus
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++; // Mixed case
    if (/\d/.test(pass)) score++; // Contains number
    if (/[\W_]/.test(pass)) score++; // Contains special character
    return score;
  };

  // Map the strength score to a label and color
  const getStrengthLabel = (score) => {
    if (score <= 1) return "Weak";
    if (score <= 3) return "Moderate";
    return "Strong";
  };

  const getStrengthColor = (score) => {
    if (score <= 1) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password fields
    if (password.trim() === "") {
      setPasswordError("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    setIsLoading(true);

    // Simulate API call to reset password (replace with actual API call)
    //setTimeout(() => {
      //setIsLoading(false);
      //alert("Password has been reset successfully!");
      // Optionally, redirect the user (for example, to the login page)
    //}, 1500);
   
    // Replacing the above "Simulate API Call..." code with the following one.
    fetch("http://localhost:5000/api/auth/reset-password",
    { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }) })
    .then((response) => response.json()) .then((data) => { setIsLoading(false);
      if (data.error) { setPasswordError(data.error); } 
      else { alert("Password has been reset successfully!"); navigate("/login"); } })
       .catch((error) => { setIsLoading(false);
        setPasswordError("An unexpected error occurred"); });
  };

  // Detect Caps Lock on the password field
  const handlePasswordKeyEvent = (e) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400"
      }`}
    >
      <div
        className={`p-8 rounded-xl w-96 transition-all duration-500 transform ${
          darkMode
            ? "bg-gray-800 text-white shadow-lg border border-gray-700"
            : "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 shadow-2xl border border-gray-200"
        }`}
      >
        <h2 className="text-2xl font-semibold text-center">Reset Password</h2>
        <form onSubmit={handleSubmit} className="mt-6" noValidate>
          <label
            className={`block font-semibold ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            New Password
          </label>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handlePasswordKeyEvent}
              onKeyUp={handlePasswordKeyEvent}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ${
                darkMode
                  ? "bg-gray-700 text-[#f0f0f0]"
                  : "bg-white text-gray-900 border-gray-300 shadow-inner"
              } focus:border-blue-500`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {capsLockOn && (
            <p className="text-yellow-500 text-xs mt-1">Caps Lock is on</p>
          )}
          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}

          {/* Password Strength Meter */}
          {password && (
            <div className="mt-2">
              <div className="w-full h-2 bg-gray-300 rounded">
                <div
                  className={`h-2 rounded ${getStrengthColor(passwordStrength)}`}
                  style={{
                    width: `${Math.min((passwordStrength / 5) * 100, 100)}%`,
                    transition: "width 0.3s ease-in-out",
                  }}
                ></div>
              </div>
              <p className="text-xs mt-1 text-gray-600">
                Strength: {getStrengthLabel(passwordStrength)}
              </p>
            </div>
          )}

          <label
            className={`block mt-4 font-semibold ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ${
              darkMode
                ? "bg-gray-700 text-[#f0f0f0]"
                : "bg-white text-gray-900 border-gray-300 shadow-inner"
            } focus:border-blue-500`}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 mt-6 text-white rounded-lg transition-all duration-300 transform ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#ff9933] hover:bg-[#ff8800] shadow-md hover:shadow-lg active:scale-95 active:opacity-90"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Resetting...
              </div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-500 hover:underline text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
