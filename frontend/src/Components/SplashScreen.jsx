import React, { useEffect, useState } from "react";
import "./SplashScreen.css";
import splashVideo from "../videos/SplashScreen.mp4";
import logo from "../images/Evolvex_logo.png";

// Define irregular progress breakpoints over 3 seconds
const progressPoints = [
  { t: 0, p: 0 },
  { t: 0.45, p: 5 },
  { t: 0.9, p: 15 },
  { t: 1.35, p: 15 },
  { t: 1.8, p: 15 },
  { t: 2.25, p: 60 },
  { t: 2.7, p: 70 },
  { t: 2.8, p: 70 },
  { t: 2.85, p: 70 },
  { t: 2.9, p: 90 },
  { t: 3.0, p: 100 },
];

// Interpolate progress linearly between breakpoints
function interpolateProgress(elapsed) {
  if (elapsed >= 3) return 100;
  for (let i = 0; i < progressPoints.length - 1; i++) {
    const p0 = progressPoints[i];
    const p1 = progressPoints[i + 1];
    if (elapsed >= p0.t && elapsed < p1.t) {
      const ratio = (elapsed - p0.t) / (p1.t - p0.t);
      return p0.p + ratio * (p1.p - p0.p);
    }
  }
  return 0;
}

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // Update progress over 3 seconds and trigger fade out afterward
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const newProgress = interpolateProgress(elapsed);
      setProgress(newProgress);
      if (elapsed >= 3) {
        clearInterval(interval);
        setFadeOut(true);
        // Wait for fade-out transition (500ms) before finishing
        setTimeout(() => {
          if (typeof onFinish === "function") {
            onFinish();
          }
        }, 500);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [onFinish]);

  // Particle animation: strong, shiny blue particles repelled by the cursor
  useEffect(() => {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    let particles = [];
    const numParticles = 150;
    const mouse = { x: null, y: null };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1 + 0.5,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx = -p.dx;
        if (p.y < 0 || p.y > canvas.height) p.dy = -p.dy;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 50) {
            const angle = Math.atan2(dy, dx);
            const repulse = (50 - distance) / 50;
            p.x += Math.cos(angle) * repulse * 3;
            p.y += Math.sin(angle) * repulse * 3;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,84,255,1)";
        ctx.shadowColor = "rgba(0,84,255,0.8)";
        ctx.shadowBlur = 10;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    animate();
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div id="splash-overlay" className={fadeOut ? "fade-out" : ""}>
      <div id="splash">
        
        <video id="splashVideo" autoPlay muted loop>
        <source src={splashVideo} type="video/mp4" />
        Your browser does not support the video tag.
        </video>
        <canvas id="particleCanvas"></canvas>
        <div className="logo">
          <img src={logo} alt="Evolvex Logo" />
        </div>
        <div id="loadingBar">
          <div id="loadingProgress" style={{ width: `${progress}%` }}></div>
        </div>
        <div id="loadingText">{Math.floor(progress)}%</div>
      </div>
    </div>
  );
};

export default SplashScreen;
