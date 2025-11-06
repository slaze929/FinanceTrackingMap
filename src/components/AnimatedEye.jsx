import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const AnimatedEye = () => {
  const eyeRef = useRef(null);
  const pupilRef = useRef(null);

  useEffect(() => {
    // Cursor tracking
    const handleMouseMove = (e) => {
      if (!eyeRef.current || !pupilRef.current) return;

      const eye = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = eye.left + eye.width / 2;
      const eyeCenterY = eye.top + eye.height / 2;

      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);

      // Limit pupil movement to stay within the eye
      const distance = Math.min(10, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 20);

      const pupilX = Math.cos(angle) * distance;
      const pupilY = Math.sin(angle) * distance;

      gsap.to(pupilRef.current, {
        x: pupilX,
        y: pupilY,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={eyeRef}
      style={{
        position: 'relative',
        width: '50px',
        height: '50px',
        display: 'inline-block',
        marginLeft: '-8px',
        marginRight: '-8px',
        verticalAlign: 'middle',
        filter: 'drop-shadow(0 0 8px rgba(139, 0, 0, 0.6))'
      }}
    >
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible'
        }}
      >
        <defs>
          {/* Subtle vignette for sclera */}
          <radialGradient id="scleraGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="70%" stopColor="#e8e4d8" />
            <stop offset="100%" stopColor="#d4d0c4" />
          </radialGradient>

          {/* Blood vessel pattern */}
          <radialGradient id="bloodshot" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0" />
            <stop offset="60%" stopColor="#4a0000" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#8B0000" stopOpacity="0.2" />
          </radialGradient>

          {/* Iris gradient */}
          <radialGradient id="irisGrad" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="40%" stopColor="#8B0000" />
            <stop offset="80%" stopColor="#4a0000" />
            <stop offset="100%" stopColor="#1a0000" />
          </radialGradient>

          {/* Pupil glow */}
          <radialGradient id="pupilGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="70%" stopColor="#000000" />
            <stop offset="100%" stopColor="#8B0000" stopOpacity="0.5" />
          </radialGradient>
        </defs>

        {/* Outer eye glow */}
        <ellipse
          cx="25"
          cy="25"
          rx="23"
          ry="16"
          fill="none"
          stroke="#8B0000"
          strokeWidth="0.5"
          opacity="0.4"
        />

        {/* Eye white (sclera) - subtle gradient */}
        <ellipse
          cx="25"
          cy="25"
          rx="21"
          ry="15"
          fill="url(#scleraGrad)"
          stroke="#3a3a3a"
          strokeWidth="1.5"
        />

        {/* Bloodshot overlay */}
        <ellipse
          cx="25"
          cy="25"
          rx="21"
          ry="15"
          fill="url(#bloodshot)"
        />

        {/* Blood vessels - random red lines */}
        <path
          d="M 10,25 Q 15,20 20,22"
          stroke="#8B0000"
          strokeWidth="0.5"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M 12,28 Q 18,26 22,28"
          stroke="#8B0000"
          strokeWidth="0.4"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M 35,20 Q 30,22 28,25"
          stroke="#8B0000"
          strokeWidth="0.5"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M 38,25 Q 33,24 30,26"
          stroke="#8B0000"
          strokeWidth="0.4"
          fill="none"
          opacity="0.3"
        />

        {/* Pupil container */}
        <g ref={pupilRef}>
          {/* Iris - dark red with gradient */}
          <circle
            cx="25"
            cy="25"
            r="8"
            fill="url(#irisGrad)"
          />

          {/* Iris detail lines */}
          <circle
            cx="25"
            cy="25"
            r="8"
            fill="none"
            stroke="#2a0000"
            strokeWidth="0.3"
            strokeDasharray="2,2"
            opacity="0.6"
          />

          {/* Pupil - deep black with subtle glow */}
          <circle
            cx="25"
            cy="25"
            r="5"
            fill="url(#pupilGlow)"
          />

          {/* Inner pupil shadow */}
          <circle
            cx="25"
            cy="25"
            r="4.5"
            fill="#000000"
          />

          {/* Eerie light reflection - red tint */}
          <circle
            cx="22"
            cy="22"
            r="1.8"
            fill="#ff6666"
            opacity="0.9"
          />
          <circle
            cx="22.5"
            cy="22.5"
            r="0.8"
            fill="#ffffff"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedEye;
