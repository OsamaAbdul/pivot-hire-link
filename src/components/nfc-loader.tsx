import React from 'react';

const NFCLoader = ({ size = 'h-12 w-12' }) => {
  // Define colors from the logo
  const LINE_COLOR = '#ded2b9'; // Light Tan
  const DOT_COLOR = '#307C5F'; // Emerald Green
  const BG_COLOR = '#132420';  // Dark Teal

  return (
    <div className={`flex items-center justify-center ${size} relative`}>
      
      {/* 1. Outer Ring (Slow Spin & Pulse) - Base Layer */}
      <svg 
        className={`absolute ${size} animate-nfclogo-spin-slow`} // 6s spin
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.5, animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)' }} // Custom timing
      >
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke={LINE_COLOR} 
          strokeWidth="3" 
          strokeDasharray="10 5" // Dashed line adds a technical, modern feel
        />
      </svg>

      {/* 2. Inner Star Pattern (Oscillation) - Mid Layer */}
      <svg 
        className={`absolute ${size} animate-nfclogo-oscillate`} // Scale/Rotate back and forth
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Star lines */}
        <line x1="10" y1="50" x2="90" y2="50" stroke={LINE_COLOR} strokeWidth="1.5" />
        <line x1="50" y1="10" x2="50" y2="90" stroke={LINE_COLOR} strokeWidth="1.5" />
        <line x1="25" y1="25" x2="75" y2="75" stroke={LINE_COLOR} strokeWidth="1.5" />
        <line x1="25" y1="75" x2="75" y2="25" stroke={LINE_COLOR} strokeWidth="1.5" />
      </svg>

      {/* 3. Center Dot (Pulse Ring Effect) - Top Layer */}
      <div 
        className={`absolute h-4 w-4 rounded-full bg-transparent border-4 border-transparent`}
      >
        {/* The green dot that pulses */}
        <div 
          className="absolute inset-0 h-full w-full rounded-full bg-transparent flex items-center justify-center"
        >
          <div className="h-2 w-2 rounded-full bg-opacity-75" style={{ backgroundColor: DOT_COLOR }}></div>
        </div>

        {/* The subtle pulsing aura/ring around the dot */}
        <div 
          className="absolute inset-0 h-full w-full rounded-full animate-nfclogo-pulse-ring"
          style={{ 
            boxShadow: `0 0 10px 1px ${DOT_COLOR}`, // Glowing effect
            border: `2px solid ${DOT_COLOR}`
          }}
        ></div>
      </div>

    </div>
  );
};



export default NFCLoader;