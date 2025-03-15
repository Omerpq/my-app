import { motion } from "framer-motion";

const AnimatedRedLightBadge = () => (
  <motion.svg
    className="absolute top-0 left-[99%] transform -translate-x-1/2 -translate-y-[40%]"
    width="28"
    height="28"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="5" fill="#C62828" />
    <motion.circle
      cx="50"
      cy="50"
      r="27"
      fill="none"
      stroke="#C62828"
      strokeWidth="2"
      filter="url(#glowRed)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "loop", ease: "linear" }}
    />
    <motion.circle
      cx="50"
      cy="50"
      r="40"
      fill="none"
      stroke="#C62828"
      strokeWidth="2"
      filter="url(#glowRed)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
    />
  </motion.svg>
);
export default AnimatedRedLightBadge;
