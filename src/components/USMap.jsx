import { useEffect, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { gsap } from 'gsap';
import congressData from '../data/congressData.json';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const USMap = ({ onStateSelect }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const stateRefs = useRef({});

  // Calculate color based on total amount
  const getStateColor = (stateName) => {
    const stateData = congressData.states[stateName];
    if (!stateData) return '#1a1a1a';

    const maxAmount = congressData.totalMoney / 49; // Average per state for baseline
    const intensity = Math.min(stateData.totalAmount / (maxAmount * 3), 1); // Cap at 3x average

    // Interpolate from dark gray to bright red (grungy palette)
    const r = Math.floor(26 + (255 - 26) * intensity);
    const g = Math.floor(26 * (1 - intensity));
    const b = Math.floor(26 * (1 - intensity));

    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleMouseEnter = (geo, stateName) => {
    setHoveredState(stateName);

    // GSAP elevation animation
    const element = stateRefs.current[stateName];
    if (element) {
      gsap.to(element, {
        scale: 1.05,
        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
        duration: 0.3,
        ease: 'power2.out',
        transformOrigin: 'center'
      });
    }
  };

  const handleMouseLeave = (stateName) => {
    setHoveredState(null);

    const element = stateRefs.current[stateName];
    if (element) {
      gsap.to(element, {
        scale: 1,
        filter: 'drop-shadow(0 0px 0px rgba(0,0,0,0))',
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleClick = (geo, stateName) => {
    setSelectedState(stateName);
    if (onStateSelect) {
      onStateSelect(stateName, congressData.states[stateName]);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0'
    }}>
      <div style={{
        width: '95%',
        height: '85%',
        maxWidth: '1600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000
          }}
          width={980}
          height={600}
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 0 30px rgba(139, 0, 0, 0.3))'
          }}
        >
          <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name;
              const fillColor = getStateColor(stateName);
              const isHovered = hoveredState === stateName;
              const isSelected = selectedState === stateName;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  ref={(el) => (stateRefs.current[stateName] = el)}
                  onMouseEnter={() => handleMouseEnter(geo, stateName)}
                  onMouseLeave={() => handleMouseLeave(stateName)}
                  onClick={() => handleClick(geo, stateName)}
                  style={{
                    default: {
                      fill: fillColor,
                      stroke: isSelected ? '#ff0000' : '#333333',
                      strokeWidth: isSelected ? 2.5 : 1.5,
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    },
                    hover: {
                      fill: fillColor,
                      stroke: '#ff4444',
                      strokeWidth: 2,
                      outline: 'none',
                      cursor: 'pointer'
                    },
                    pressed: {
                      fill: fillColor,
                      stroke: '#ff0000',
                      strokeWidth: 2.5,
                      outline: 'none'
                    }
                  }}
                />
              );
            })
          }
          </Geographies>
        </ComposableMap>

        {/* Legend */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '12px',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <span>Low</span>
          <div style={{
            width: '200px',
            height: '16px',
            background: 'linear-gradient(to right, #1a1a1a, #ff0000)',
            border: '2px solid #333',
            borderRadius: '2px',
            boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)'
          }} />
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default USMap;
