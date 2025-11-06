import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const AnimatedEye = () => {
  const eyeContainerRef = useRef(null);
  const irisRef = useRef(null);

  useEffect(() => {
    // Cursor tracking
    const handleMouseMove = (e) => {
      if (!eyeContainerRef.current || !irisRef.current) return;

      const eye = eyeContainerRef.current.getBoundingClientRect();
      const eyeCenterX = eye.left + eye.width / 2;
      const eyeCenterY = eye.top + eye.height / 2;

      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);

      // MOVEMENT RANGE: Adjust these values to control how far the iris moves
      const maxDistance = 3;     // Maximum pixels the iris can move (reduced to keep iris in circle)
      const sensitivity = 35;    // Movement sensitivity (increased for smoother, limited movement)

      const distance = Math.min(maxDistance, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / sensitivity);

      const irisX = Math.cos(angle) * distance;
      const irisY = Math.sin(angle) * distance;

      gsap.to(irisRef.current, {
        x: irisX,
        y: irisY,
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
      ref={eyeContainerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'inline-block',
        filter: 'drop-shadow(0 0 8px rgba(139, 0, 0, 0.6))'
      }}
    >
      {/* Eye frame (static) */}
      <img
        src="/eye-frame.png"
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none'
        }}
      />

      {/* Iris (moves with cursor) - ADJUST SIZE HERE */}
      <div
        ref={irisRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40%',    /* IRIS SIZE: Adjust percentage (e.g., 30%, 50%) */
          height: '40%',   /* IRIS SIZE: Keep same as width for circular shape */
          pointerEvents: 'none'
        }}
      >
        <img
          src="/eye-iris.png"
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
    </div>
  );
};

export default AnimatedEye;
