import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const AnimatedEye = () => {
  const eyeRef = useRef(null);
  const pupilRef = useRef(null);
  const eyelidTopRef = useRef(null);
  const eyelidBottomRef = useRef(null);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // Cursor tracking
    const handleMouseMove = (e) => {
      if (isBlinking || !eyeRef.current || !pupilRef.current) return;

      const eye = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = eye.left + eye.width / 2;
      const eyeCenterY = eye.top + eye.height / 2;

      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);

      // Limit pupil movement to stay within the eye
      const distance = Math.min(8, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 20);

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

    // Blinking animation
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);

      // Blink animation
      const tl = gsap.timeline({
        onComplete: () => setIsBlinking(false)
      });

      tl.to([eyelidTopRef.current, eyelidBottomRef.current], {
        scaleY: 1,
        duration: 0.1,
        ease: 'power2.in'
      })
      .to([eyelidTopRef.current, eyelidBottomRef.current], {
        scaleY: 0,
        duration: 0.1,
        ease: 'power2.out',
        delay: 0.05
      });
    }, 3000 + Math.random() * 2000); // Blink every 3-5 seconds

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(blinkInterval);
    };
  }, [isBlinking]);

  return (
    <div
      ref={eyeRef}
      style={{
        position: 'relative',
        width: '45px',
        height: '45px',
        display: 'inline-block',
        marginLeft: '-8px',
        marginRight: '-8px',
        verticalAlign: 'middle'
      }}
    >
      {/* Eye white (sclera) */}
      <svg
        width="45"
        height="45"
        viewBox="0 0 45 45"
        style={{
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        {/* Outer eye shape */}
        <ellipse
          cx="22.5"
          cy="22.5"
          rx="20"
          ry="14"
          fill="#f5f5f5"
          stroke="#f5f5f5"
          strokeWidth="2.5"
        />

        {/* Pupil container */}
        <g ref={pupilRef}>
          {/* Iris */}
          <circle
            cx="22.5"
            cy="22.5"
            r="7"
            fill="#8B0000"
          />
          {/* Pupil */}
          <circle
            cx="22.5"
            cy="22.5"
            r="4"
            fill="#000"
          />
          {/* Light reflection */}
          <circle
            cx="20"
            cy="20"
            r="1.5"
            fill="#ff4444"
            opacity="0.8"
          />
        </g>

        {/* Eyelids for blinking */}
        <g>
          {/* Top eyelid */}
          <ellipse
            ref={eyelidTopRef}
            cx="22.5"
            cy="15"
            rx="20"
            ry="14"
            fill="#f5f5f5"
            stroke="#f5f5f5"
            strokeWidth="2.5"
            style={{
              transformOrigin: '22.5px 22.5px',
              transform: 'scaleY(0)'
            }}
          />
          {/* Bottom eyelid */}
          <ellipse
            ref={eyelidBottomRef}
            cx="22.5"
            cy="30"
            rx="20"
            ry="14"
            fill="#f5f5f5"
            stroke="#f5f5f5"
            strokeWidth="2.5"
            style={{
              transformOrigin: '22.5px 22.5px',
              transform: 'scaleY(0)'
            }}
          />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedEye;
