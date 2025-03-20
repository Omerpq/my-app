// src/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext.jsx";
import { useLanguage } from "./context/LanguageContext"; // Use global language context
import "./Login.css";
import EvolvexLogo from "./images/Evolvex_logo.png";



export default function Login() {
  const { darkMode, toggleTheme } = useTheme();
  const { login: authLogin } = useAuth();
  const { language, toggleLanguage } = useLanguage(); // Use global language context
  const french = language === "fr";

  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const isDisabled = email.trim() === "" || password.trim() === "";

  // Auto-fill remembered email on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (email.trim() === "") {
      setEmailError(french ? "Le courriel est requis" : "Email is required");
      valid = false;
    } else {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        setEmailError(french ? "Entrez un courriel valide" : "Enter a valid email");
        valid = false;
      }
    }
    if (password.trim() === "") {
      setPasswordError(french ? "Le mot de passe est requis" : "Password is required");
      valid = false;
    }
    if (valid) {
      // Save or remove remembered email
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setIsLoading(true);
      try {
         const response = await fetch("https://my-app-1-uzea.onrender.com/api/auth/login", {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
          setPasswordError(
            data.error || (french ? "Échec de la connexion" : "Login failed")
          );
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          authLogin(data.user);
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error during login:", error);
        setPasswordError(
          french
            ? "Une erreur inattendue est survenue. Veuillez réessayer."
            : "An unexpected error occurred. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Detect Caps Lock on the password field
  const handlePasswordKeyEvent = (e) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen transition-all duration-500 ${
        darkMode ? "bg-gray-900" : "bg-login"
      }`}
    >
      <div
        className={`relative p-8 rounded-xl max-w-md w-full transition-all duration-500 transform ${
          darkMode
            ? "bg-gray-800 text-white dark-glow border border-gray-700"
            : "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 shadow-2xl border border-gray-200"
        }`}
      >
        {/* Français Toggle in Top-Right Corner */}
        <div className="absolute top-4 right-4">
          <label className="flex items-center cursor-pointer">
            <span className={`mr-2 font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Français
            </span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={french}
                onChange={toggleLanguage}
              />
              <div
                className={`block w-10 h-6 rounded-full transition-all duration-300 ${
                  french
                    ? "bg-gradient-to-r from-blue-900 to-blue-800 shadow-[0_0_14px_#60A5FA]"
                    : "bg-gray-600 shadow-inner"
                }`}
              ></div>
              <div
                className={`absolute w-4 h-4 rounded-full top-1 transition-transform duration-300 ${
                  french ? "translate-x-4" : "translate-x-1"
                } bg-gray-300 border border-white shadow-[0_0_12px_#93C5FD]`}
              ></div>
            </div>
          </label>
        </div>

        {/* Logo */}
        <div className="flex justify-center">
        <img src={EvolvexLogo} alt="Logo" className="w-28 mb-0" />

        </div>

        {/* Form Title */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          {french ? "Bienvenue" : "Welcome back"}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            {french ? "Courriel" : "Email"}
          </label>
          <input
            type="email"
            placeholder={french ? "Entrez votre courriel" : "Enter your email"}
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ${
              darkMode
                ? "bg-gray-700 text-[#f0f0f0]"
                : "bg-white text-gray-900 border-gray-300 shadow-inner"
            } focus:border-blue-500`}
          />
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}

          <label className={`block mt-4 font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            {french ? "Mot de passe" : "Password"}
          </label>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={french ? "Entrez votre mot de passe" : "Enter your password"}
              value={password}
              maxLength="8"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handlePasswordKeyEvent}
              onKeyUp={handlePasswordKeyEvent}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ${
                darkMode
                  ? "bg-gray-700 text-[#f0f0f0]"
                  : "bg-white text-gray-900 border-gray-300 shadow-inner"
              } focus:border-blue-500 ${passwordError ? "animate-shake" : ""}`}
            />
            <button
              type="button"
              tabIndex="-1"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 right-3 flex items-center text-gray-500 ${
                darkMode ? "hover:text-gray-300" : "hover:text-gray-700"
              }`}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="min-h-[1.75rem]">
            {capsLockOn && (
              <p className={`${darkMode ? "text-yellow-500" : "text-yellow-700"} text-xs mt-1`}>
                {french ? "Verr. Maj activé" : "Caps Lock is on"}
              </p>
            )}
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>

          <div className="mt-1 flex flex-col items-start">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {french ? "Se souvenir de moi" : "Remember me"}
              </span>
            </label>
            <Link to="/forgot-password" className="mt-1 text-sm text-blue-500 hover:underline">
              {french ? "Mot de passe oublié ?" : "Forgot Password?"}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isDisabled || isLoading}
            className={`w-full py-2 mt-6 text-white rounded-lg transition-all duration-300 transform ${
              isDisabled || isLoading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-[#ff9933] text-white hover:bg-[#ff8800] shadow-[0_0_10px_#ff9933] hover:shadow-[0_0_12px_#ff9933] active:scale-95 active:opacity-90"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                {french ? "Traitement..." : "Processing..."}
              </div>
            ) : (
              french ? "Connexion" : "Login"
            )}
          </button>
        </form>

        {/* Dark Mode Toggle Switch at the Bottom */}
        <div className="flex justify-center mt-6">
          <label className="flex items-center cursor-pointer">
            <span className="mr-2 font-semibold">
              {french ? "Mode sombre" : "Dark mode"}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={darkMode}
                onChange={toggleTheme}
              />
              <div
                className={`block w-10 h-6 rounded-full transition-all duration-300 ${
                  darkMode
                    ? "bg-gradient-to-r from-red-700 to-[#800000] shadow-[0_0_14px_#800000]"
                    : "bg-gray-600 shadow-inner"
                }`}
              ></div>
              <div
                className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform duration-300 ${
                  darkMode
                    ? "translate-x-4 bg-gray-300 shadow-[0_0_12px_#800000]"
                    : "translate-x-1 bg-gray-600"
                }`}
              ></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
