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
  const [resetKey, setResetKey] = useState(0);
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

    // Bring element to front by moving it to the end of parent
    const element = stateRefs.current[stateName];
    if (element && element.parentNode) {
      element.parentNode.appendChild(element);

      // GSAP elevation animation
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

    // Bring selected element to front
    const element = stateRefs.current[stateName];
    if (element && element.parentNode) {
      element.parentNode.appendChild(element);
    }

    if (onStateSelect) {
      onStateSelect(stateName, congressData.states[stateName]);
    }
  };

  const handleReset = () => {
    setPosition({ coordinates: [0, 0], zoom: 1 });
    setSelectedState(null);
    setResetKey(prev => prev + 1);
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

    // Enhanced collision detection with label positioning
    const baseThreshold = 1.2; // Further increased for better spacing
    const zoomFactor = Math.max(0.1, 1 / roundedZoom);
    const collisionThreshold = baseThreshold * zoomFactor;

    // Calculate font size once for collision detection (with strict cap)
    const baseFontSize = 1.5;
    const maxFontSize = 3; // Reduced cap to prevent large overlapping text
    const fontSize = Math.min(baseFontSize + (roundedZoom - 3) * 0.2, maxFontSize);

    // Label positioning options: top, topRight, right, bottomRight, bottom, bottomLeft, left, topLeft
    const labelPositions = [
      { dx: 0, dy: -1.2, anchor: 'middle', name: 'top' },
      { dx: 0, dy: 1.2, anchor: 'middle', name: 'bottom' },
      { dx: 1.2, dy: 0, anchor: 'start', name: 'right' },
      { dx: -1.2, dy: 0, anchor: 'end', name: 'left' },
      { dx: 0.9, dy: -0.9, anchor: 'start', name: 'topRight' },
      { dx: 0.9, dy: 0.9, anchor: 'start', name: 'bottomRight' },
      { dx: -0.9, dy: 0.9, anchor: 'end', name: 'bottomLeft' },
      { dx: -0.9, dy: -0.9, anchor: 'end', name: 'topLeft' }
    ];

    const visible = [];
    const labelBounds = []; // Store bounding boxes of labels

    for (let i = 0; i < cities.length && visible.length < maxCities; i++) {
      const city = cities[i];

      // Check collision with city markers
      const hasMarkerCollision = visible.some((visibleCity) => {
        const distance = Math.sqrt(
          Math.pow(city.coordinates[0] - visibleCity.coordinates[0], 2) +
          Math.pow(city.coordinates[1] - visibleCity.coordinates[1], 2)
        );
        return distance < collisionThreshold;
      });

      if (!hasMarkerCollision) {
        // Find best label position that doesn't overlap with existing labels
        let bestPosition = labelPositions[0];
        let foundPosition = false;

        for (const position of labelPositions) {
          // More accurate label dimension estimation
          // Each character is roughly 0.6 * fontSize in width for this font
          const charWidth = fontSize * 0.6;
          const labelWidth = (city.name.length * charWidth) / roundedZoom;
          const labelHeight = (fontSize * 1.2) / roundedZoom; // Add line height

          // Add padding around labels for better spacing
          const padding = 0.3 / roundedZoom;
          const totalWidth = labelWidth + padding * 2;
          const totalHeight = labelHeight + padding * 2;

          // Calculate offset distance from marker (accounting for label size)
          const offsetDistance = Math.max(totalWidth, totalHeight) * 1.5;
          const labelX = city.coordinates[0] + (position.dx * offsetDistance);
          const labelY = city.coordinates[1] + (position.dy * offsetDistance);

          // Calculate bounding box based on text anchor
          let boundX, boundY;
          if (position.anchor === 'middle') {
            boundX = labelX - totalWidth / 2;
            boundY = labelY - totalHeight / 2;
          } else if (position.anchor === 'start') {
            boundX = labelX;
            boundY = labelY - totalHeight / 2;
          } else { // 'end'
            boundX = labelX - totalWidth;
            boundY = labelY - totalHeight / 2;
          }

          // Check if this position overlaps with any existing labels
          const overlaps = labelBounds.some((bounds) => {
            const horizontalOverlap =
              boundX < bounds.x + bounds.width &&
              boundX + totalWidth > bounds.x;
            const verticalOverlap =
              boundY < bounds.y + bounds.height &&
              boundY + totalHeight > bounds.y;
            return horizontalOverlap && verticalOverlap;
          });

          if (!overlaps) {
            bestPosition = position;
            foundPosition = true;

            // Store this label's bounding box
            labelBounds.push({
              x: boundX,
              y: boundY,
              width: totalWidth,
              height: totalHeight
            });
            break;
          }
        }

        // Only add city if we found a non-overlapping position
        if (foundPosition) {
          visible.push({
            ...city,
            labelPosition: bestPosition
          });
        }
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
            animation: cityFadeIn 0.4s ease-out forwards;
          }

          @keyframes cityFadeIn {
            to {
              opacity: 1;
            }
          }

          .city-text {
            transition: font-size 0.2s ease-out, x 0.2s ease-out, y 0.2s ease-out;
          }

          line.city-marker {
            transition: opacity 0.3s ease-out;
          }

          /* Ensure hovered states render on top */
          .rsm-geography {
            pointer-events: all;
          }

          .rsm-geography:hover {
            filter: drop-shadow(0 4px 8px rgba(255, 68, 68, 0.6));
          }

          .rsm-geography.state-hovered {
            filter: drop-shadow(0 4px 8px rgba(255, 68, 68, 0.6)) !important;
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
            key={resetKey}
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={0.1}
            maxZoom={1000}
          >
            <Geographies geography={geoUrl}>
            {({ geographies }) => {
              // Sort geographies to render hovered/selected states last (on top)
              const sortedGeographies = [...geographies].sort((a, b) => {
                const aName = a.properties.name;
                const bName = b.properties.name;
                if (aName === hoveredState || aName === selectedState) return 1;
                if (bName === hoveredState || bName === selectedState) return -1;
                return 0;
              });

              return sortedGeographies.map((geo) => {
                const stateName = geo.properties.name;
                const fillColor = getStateColor(stateName);
                const isHovered = hoveredState === stateName;
                const isSelected = selectedState === stateName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className={isHovered ? 'state-hovered' : ''}
                    ref={(el) => (stateRefs.current[stateName] = el)}
                    onMouseEnter={() => handleMouseEnter(geo, stateName)}
                    onMouseLeave={() => handleMouseLeave(stateName)}
                    onClick={() => handleClick(geo, stateName)}
                    style={{
                      default: {
                        fill: fillColor,
                        stroke: isSelected ? '#ff0000' : '#333333',
                        strokeWidth: isSelected ? 2.5 : 0.5,
                        strokeLinejoin: 'round',
                        strokeLinecap: 'round',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        vectorEffect: 'non-scaling-stroke',
                        paintOrder: 'fill'
                      },
                      hover: {
                        fill: fillColor,
                        stroke: '#ff4444',
                        strokeWidth: 2.5,
                        strokeLinejoin: 'round',
                        strokeLinecap: 'round',
                        outline: 'none',
                        cursor: 'pointer',
                        vectorEffect: 'non-scaling-stroke',
                        paintOrder: 'fill'
                      },
                      pressed: {
                        fill: fillColor,
                        stroke: '#ff0000',
                        strokeWidth: 3,
                        strokeLinejoin: 'round',
                        strokeLinecap: 'round',
                        outline: 'none',
                        vectorEffect: 'non-scaling-stroke',
                        paintOrder: 'fill'
                      }
                    }}
                  />
                );
              });
            }}
            </Geographies>

            {/* City names and markers - only show when zoomed in on a specific state */}
            {visibleCities.length > 0 && (() => {
              // Dynamic font size calculation based on zoom - with strict maximum (matching collision detection)
              const baseFontSize = 1.5;
              const maxFontSize = 3; // Reduced cap to prevent large overlapping text
              const fontSize = Math.min(baseFontSize + (roundedZoom - 3) * 0.2, maxFontSize);
              const strokeWidth = fontSize * 0.08;
              const maxDotSize = 1.2; // Reduced dot size
              const dotSize = Math.min(0.6 + (roundedZoom - 3) * 0.08, maxDotSize);

              return visibleCities.map((city, index) => {
                const position = city.labelPosition || { dx: 0, dy: -1.2, anchor: 'middle' };

                // Calculate offset distance matching collision detection
                const charWidth = fontSize * 0.6;
                const labelWidth = (city.name.length * charWidth) / roundedZoom;
                const labelHeight = (fontSize * 1.2) / roundedZoom;
                const padding = 0.3 / roundedZoom;
                const totalWidth = labelWidth + padding * 2;
                const totalHeight = labelHeight + padding * 2;
                const offsetDistance = Math.max(totalWidth, totalHeight) * 1.5;

                const labelX = position.dx * offsetDistance;
                const labelY = position.dy * offsetDistance;

                return (
                  <Marker key={`${city.name}-${index}`} coordinates={city.coordinates}>
                    {/* City dot marker */}
                    <circle
                      className="city-marker"
                      r={dotSize}
                      fill="#000000"
                      stroke="#333333"
                      strokeWidth={0.2}
                    />

                    {/* Connecting line from dot to label (subtle) */}
                    {(Math.abs(position.dx) > 0.5 || Math.abs(position.dy) > 0.5) && (
                      <line
                        x1={0}
                        y1={0}
                        x2={labelX * 0.5}
                        y2={labelY * 0.5}
                        stroke="#444444"
                        strokeWidth={0.12}
                        className="city-marker"
                        opacity={0.4}
                      />
                    )}

                    {/* City label */}
                    <text
                      className="city-marker city-text"
                      textAnchor={position.anchor}
                      x={labelX}
                      y={labelY}
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
                );
              });
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

      {/* Reset Control */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '30px',
        zIndex: 10
      }}>
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
