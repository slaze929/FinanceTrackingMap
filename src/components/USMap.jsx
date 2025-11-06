import { useEffect, useRef, useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { gsap } from 'gsap';
import congressData from '../data/congressData.json';
import citiesData from '../data/citiesData.json';
import stateCenters from '../data/stateCenters.json';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// Helper function to find the closest state to current view
const getClosestState = (coordinates) => {
  let closestState = null;
  let minDistance = Infinity;

  Object.entries(stateCenters).forEach(([state, center]) => {
    const distance = Math.sqrt(
      Math.pow(coordinates[0] - center[0], 2) +
      Math.pow(coordinates[1] - center[1], 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestState = state;
    }
  });

  return closestState;
};

const USMap = ({ onStateSelect }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const stateRefs = useRef({});

  // Round zoom to reduce re-renders
  const roundedZoom = Math.round(position.zoom * 2) / 2;

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

  const handleZoomIn = () => {
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [0, 0], zoom: 1 });
  };

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  // Memoize visible cities calculation to prevent recalculation on every render
  const visibleCities = useMemo(() => {
    if (roundedZoom <= 3) return [];

    const currentState = getClosestState(position.coordinates);
    const cities = citiesData.citiesByState[currentState] || [];

    // Limit maximum cities based on zoom
    const maxCities = Math.min(Math.floor(roundedZoom * 3), 30);

    // Collision detection
    const baseThreshold = 0.5;
    const zoomFactor = Math.max(0.1, 1 / roundedZoom);
    const collisionThreshold = baseThreshold * zoomFactor;

    const visible = [];
    for (let i = 0; i < cities.length && visible.length < maxCities; i++) {
      const city = cities[i];
      const hasCollision = visible.some((visibleCity) => {
        const distance = Math.sqrt(
          Math.pow(city.coordinates[0] - visibleCity.coordinates[0], 2) +
          Math.pow(city.coordinates[1] - visibleCity.coordinates[1], 2)
        );
        return distance < collisionThreshold;
      });

      if (!hasCollision) {
        visible.push(city);
      }
    }

    return visible;
  }, [position.coordinates[0], position.coordinates[1], roundedZoom]);

  return (
    <>
      <style>
        {`
          .city-marker {
            opacity: 0;
            animation: cityFadeIn 0.3s ease-out forwards;
          }

          @keyframes cityFadeIn {
            to {
              opacity: 1;
            }
          }

          .city-text {
            transition: font-size 0.2s ease-out;
          }
        `}
      </style>
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
        width: '100%',
        height: '90%',
        maxWidth: '1800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1200
          }}
          width={980}
          height={600}
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 0 30px rgba(139, 0, 0, 0.3))'
          }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={0.1}
            maxZoom={1000}
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

            {/* City names and markers - only show when zoomed in on a specific state */}
            {visibleCities.length > 0 && (() => {
              // Dynamic font size calculation based on zoom - with strict maximum
              const baseFontSize = 1.5;
              const maxFontSize = 4; // Cap at 4px to prevent lag
              const fontSize = Math.min(baseFontSize + (roundedZoom - 3) * 0.3, maxFontSize);
              const strokeWidth = fontSize * 0.08;
              const maxDotSize = 1.5; // Cap dot size too
              const dotSize = Math.min(0.8 + (roundedZoom - 3) * 0.1, maxDotSize);

              return visibleCities.map((city, index) => (
                <Marker key={`${city.name}-${index}`} coordinates={city.coordinates}>
                  {/* City dot marker */}
                  <circle
                    className="city-marker"
                    r={dotSize}
                    fill="#000000"
                    stroke="#333333"
                    strokeWidth={0.2}
                  />

                  {/* City label */}
                  <text
                    className="city-marker city-text"
                    textAnchor="middle"
                    y={-dotSize - 1}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: `${fontSize}px`,
                      fill: '#888',
                      fontWeight: 400,
                      letterSpacing: '0.3px',
                      stroke: '#0a0a0a',
                      strokeWidth: `${strokeWidth}px`,
                      paintOrder: 'stroke',
                      pointerEvents: 'none',
                      textTransform: 'uppercase'
                    }}
                  >
                    {city.name}
                  </text>
                </Marker>
              ));
            })()}
          </ZoomableGroup>
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

      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 10
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            width: '40px',
            height: '40px',
            border: '2px solid #8B0000',
            background: 'rgba(10, 10, 10, 0.9)',
            color: '#8B0000',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: '0 0 15px rgba(139, 0, 0, 0.3)',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(139, 0, 0, 0.2)';
            e.target.style.color = '#ff0000';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(10, 10, 10, 0.9)';
            e.target.style.color = '#8B0000';
          }}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: '40px',
            height: '40px',
            border: '2px solid #8B0000',
            background: 'rgba(10, 10, 10, 0.9)',
            color: '#8B0000',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: '0 0 15px rgba(139, 0, 0, 0.3)',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(139, 0, 0, 0.2)';
            e.target.style.color = '#ff0000';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(10, 10, 10, 0.9)';
            e.target.style.color = '#8B0000';
          }}
        >
          −
        </button>
        <button
          onClick={handleReset}
          style={{
            width: '40px',
            height: '40px',
            border: '2px solid #8B0000',
            background: 'rgba(10, 10, 10, 0.9)',
            color: '#8B0000',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: '0 0 15px rgba(139, 0, 0, 0.3)',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(139, 0, 0, 0.2)';
            e.target.style.color = '#ff0000';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(10, 10, 10, 0.9)';
            e.target.style.color = '#8B0000';
          }}
        >
          ⟲
        </button>
      </div>
    </div>
    </>
  );
};

export default USMap;
