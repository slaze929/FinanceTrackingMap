import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AnimatedEye from '../components/AnimatedEye';
import './AidTimeline.css';

const AidTimeline = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const timelineRef = useRef(null);

  // Credible timeline data from State Department, CFR, and Congressional Research Service
  const timelineEvents = [
    {
      year: 1948,
      title: 'Israel Founded',
      type: 'founding',
      description: 'United States becomes first country to recognize Israel',
      israelAid: 0.135,
      totalAid: 13.3,
      context: 'Beginning of U.S.-Israel relationship',
      source: 'CFR',
      isConflict: false
    },
    {
      year: 1967,
      title: 'Six-Day War',
      type: 'conflict',
      description: 'Israel defeats Soviet-backed coalition',
      israelAid: 0.024,
      totalAid: 11.6,
      context: 'Military aid begins to increase',
      source: 'State Department',
      isConflict: true,
      casualties: '776 Israeli, 15,000+ Arab forces'
    },
    {
      year: 1973,
      title: 'Yom Kippur War',
      type: 'conflict',
      description: 'Massive U.S. airlift of military equipment',
      israelAid: 2.6,
      totalAid: 6.9,
      context: 'Operation Nickel Grass - largest airlift since WWII',
      source: 'Congressional Research Service',
      isConflict: true,
      casualties: '2,656 Israeli, 8,000-18,500 Arab forces'
    },
    {
      year: 1978,
      title: 'Camp David Accords',
      type: 'peace',
      description: 'Peace treaty signed; grant-based military aid ramps up',
      israelAid: 1.8,
      totalAid: 9.4,
      context: 'Beginning of annual $3B+ aid packages',
      source: 'CFR',
      isConflict: false
    },
    {
      year: 1982,
      title: 'Lebanon War',
      type: 'conflict',
      description: 'Israeli invasion of Lebanon',
      israelAid: 2.2,
      totalAid: 12.8,
      context: 'Aid continues despite controversial invasion',
      source: 'State Department',
      isConflict: true,
      casualties: '657 Israeli, 15,000-20,000 Lebanese/Palestinian'
    },
    {
      year: 1991,
      title: 'Gulf War',
      type: 'conflict',
      description: 'Israel targeted by Iraqi Scud missiles',
      israelAid: 4.0,
      totalAid: 15.8,
      context: '$10B in loan guarantees + emergency aid',
      source: 'CFR',
      isConflict: true,
      casualties: '2 Israeli deaths from Scuds, 230 injured'
    },
    {
      year: 2000,
      title: 'Second Intifada Begins',
      type: 'conflict',
      description: 'Palestinian uprising leads to sustained conflict',
      israelAid: 4.1,
      totalAid: 17.4,
      context: 'Military aid remains steady during intifada',
      source: 'State Department',
      isConflict: true,
      casualties: '1,000+ Israeli, 3,000+ Palestinian (2000-2005)'
    },
    {
      year: 2006,
      title: 'Lebanon War II',
      type: 'conflict',
      description: 'Hezbollah conflict; emergency munitions transfers',
      israelAid: 2.5,
      totalAid: 23.5,
      context: 'Emergency resupply of precision munitions',
      source: 'Congressional Research Service',
      isConflict: true,
      casualties: '165 Israeli, 1,191 Lebanese'
    },
    {
      year: 2009,
      title: 'Gaza War (Cast Lead)',
      type: 'conflict',
      description: 'Operation Cast Lead in Gaza Strip',
      israelAid: 2.8,
      totalAid: 39.4,
      context: 'Aid steady despite international criticism',
      source: 'State Department',
      isConflict: true,
      casualties: '13 Israeli, 1,166-1,417 Palestinian'
    },
    {
      year: 2014,
      title: 'Gaza War (Protective Edge)',
      type: 'conflict',
      description: 'Operation Protective Edge; Iron Dome funding',
      israelAid: 3.1,
      totalAid: 33.1,
      context: '$225M emergency Iron Dome funding',
      source: 'CFR',
      isConflict: true,
      casualties: '73 Israeli, 2,251 Palestinian'
    },
    {
      year: 2016,
      title: '$38 Billion MOU Signed',
      type: 'agreement',
      description: 'Largest military aid package in U.S. history',
      israelAid: 3.1,
      totalAid: 42.4,
      context: '10-year commitment (2019-2028): $3.8B/year',
      source: 'State Department',
      isConflict: false
    },
    {
      year: 2021,
      title: 'Gaza Conflict (Guardian of Walls)',
      type: 'conflict',
      description: 'Hamas-Israel conflict; Iron Dome restocking',
      israelAid: 3.3,
      totalAid: 50.8,
      context: 'Additional $1B for Iron Dome approved',
      source: 'Congressional Research Service',
      isConflict: true,
      casualties: '13 Israeli, 256 Palestinian'
    },
    {
      year: 2023,
      title: 'October 7 Hamas Attacks',
      type: 'conflict',
      description: 'Major Hamas assault triggers massive aid surge',
      israelAid: 3.3,
      totalAid: 68.0,
      context: 'Beginning of unprecedented aid increase',
      source: 'CFR',
      isConflict: true,
      casualties: '1,200+ Israeli, 251 taken hostage'
    },
    {
      year: 2024,
      title: 'Gaza War Escalation',
      type: 'conflict',
      description: 'Unprecedented aid spike to $20+ billion',
      israelAid: 20.1,
      totalAid: 76.3,
      context: '$16.3B in new legislation + base $3.8B',
      source: 'State Department / Quincy Institute',
      isConflict: true,
      casualties: '500+ Israeli military, 45,000+ Palestinian (ongoing)'
    },
    {
      year: 2025,
      title: 'Aid Continues',
      type: 'ongoing',
      description: 'Active FMS cases worth $39.2 billion',
      israelAid: 3.8,
      totalAid: 70.0,
      context: '800+ planes, 140 ships of munitions delivered',
      source: 'State Department (April 2025)',
      isConflict: true,
      casualties: 'Ongoing conflict'
    }
  ];

  // Calculate cumulative aid
  const cumulativeIsrael = timelineEvents.reduce((sum, event) => sum + event.israelAid, 0);
  const cumulativeOthers = timelineEvents.reduce((sum, event) => sum + (event.totalAid - event.israelAid), 0);

  useEffect(() => {
    // Scroll animation on load
    if (timelineRef.current) {
      timelineRef.current.style.opacity = '0';
      setTimeout(() => {
        timelineRef.current.style.transition = 'opacity 1s ease-in';
        timelineRef.current.style.opacity = '1';
      }, 100);
    }
  }, []);

  const getEventColor = (type) => {
    switch (type) {
      case 'conflict': return '#ff0000';
      case 'peace': return '#00cc00';
      case 'agreement': return '#0066cc';
      case 'founding': return '#ffaa00';
      case 'ongoing': return '#ff6600';
      default: return '#888';
    }
  };

  const getEventSize = (israelAid) => {
    // Scale event size based on aid amount
    const minSize = 40;
    const maxSize = 120;
    const scale = Math.min(israelAid / 20, 1);
    return minSize + (scale * (maxSize - minSize));
  };

  return (
    <div className="aid-timeline-container">
      <div className="aid-timeline-content">
        <Link to="/" className="timeline-title-link">
          <h1 className="timeline-title">
            Where are J<AnimatedEye />w? - Aid Timeline
          </h1>
        </Link>
        <p className="timeline-subtitle">
          U.S. Aid to Israel vs. All Other Countries Combined • 1948-2025
        </p>

        {/* Key Statistics */}
        <div className="timeline-stats-section">
          <div className="stat-comparison-grid">
            <div className="stat-card israel">
              <div className="stat-icon">🇮🇱</div>
              <div className="stat-label">Total U.S. Aid to Israel (1948-2025)</div>
              <div className="stat-value">${cumulativeIsrael.toFixed(1)}B+</div>
              <div className="stat-period">Cumulative from timeline events shown</div>
            </div>

            <div className="stat-card comparison">
              <div className="comparison-symbol">VS</div>
            </div>

            <div className="stat-card others">
              <div className="stat-icon">🌍</div>
              <div className="stat-label">Average Annual Aid to All Others</div>
              <div className="stat-value">${(cumulativeOthers / timelineEvents.length).toFixed(1)}B</div>
              <div className="stat-period">Per year across 190+ countries</div>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-label">Verified Historical Total (1951-2022)</div>
            <div className="stat-value">$317.9 Billion</div>
            <div className="stat-period">Largest recipient of U.S. foreign aid since WWII (CFR/State Department)</div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-label">Current Active Arms Sales</div>
            <div className="stat-value">$39.2 Billion</div>
            <div className="stat-period">751 active FMS cases as of April 2025 (State Department)</div>
          </div>
        </div>

        {/* Interactive Timeline */}
        <div className="timeline-visualization" ref={timelineRef}>
          <h2>Interactive Timeline: Aid Spikes During Conflicts</h2>
          <p className="timeline-note">
            Circle size represents aid amount. Red = conflict, Blue = agreement, Green = peace, Orange = founding
          </p>

          <div className="timeline-scroll">
            {timelineEvents.map((event, index) => (
              <div
                key={index}
                className={`timeline-event ${selectedEvent === index ? 'selected' : ''} ${hoveredEvent === index ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredEvent(index)}
                onMouseLeave={() => setHoveredEvent(null)}
                onClick={() => setSelectedEvent(selectedEvent === index ? null : index)}
              >
                <div className="event-year">{event.year}</div>
                <div
                  className="event-marker"
                  style={{
                    backgroundColor: getEventColor(event.type),
                    width: `${getEventSize(event.israelAid)}px`,
                    height: `${getEventSize(event.israelAid)}px`,
                    boxShadow: event.isConflict
                      ? `0 0 20px ${getEventColor(event.type)}`
                      : `0 0 10px ${getEventColor(event.type)}`
                  }}
                >
                  <span className="event-aid-amount">${event.israelAid}B</span>
                </div>
                <div className="event-title">{event.title}</div>

                {(selectedEvent === index || hoveredEvent === index) && (
                  <div className="event-details">
                    <h4>{event.title} ({event.year})</h4>
                    <p className="event-description">{event.description}</p>
                    <div className="event-stats">
                      <div className="event-stat">
                        <span className="label">Aid to Israel:</span>
                        <span className="value">${event.israelAid}B</span>
                      </div>
                      <div className="event-stat">
                        <span className="label">Total U.S. Aid (All Countries):</span>
                        <span className="value">${event.totalAid}B</span>
                      </div>
                      <div className="event-stat">
                        <span className="label">Israel's Share:</span>
                        <span className="value highlight">
                          {((event.israelAid / event.totalAid) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="event-context">{event.context}</p>
                    {event.casualties && (
                      <p className="event-casualties">
                        <strong>Casualties:</strong> {event.casualties}
                      </p>
                    )}
                    <p className="event-source">
                      <em>Source: {event.source}</em>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="comparison-section">
          <h2>Aid Distribution by Year</h2>
          <div className="comparison-chart">
            {timelineEvents.map((event, index) => {
              const israelPercent = (event.israelAid / event.totalAid) * 100;
              const othersPercent = 100 - israelPercent;

              return (
                <div key={index} className="chart-bar-container">
                  <div className="chart-year">{event.year}</div>
                  <div className="chart-bar">
                    <div
                      className="bar-segment israel-segment"
                      style={{ width: `${israelPercent}%` }}
                      title={`Israel: $${event.israelAid}B (${israelPercent.toFixed(1)}%)`}
                    >
                      {israelPercent > 10 && <span>${event.israelAid}B</span>}
                    </div>
                    <div
                      className="bar-segment others-segment"
                      style={{ width: `${othersPercent}%` }}
                      title={`All Others: $${(event.totalAid - event.israelAid).toFixed(1)}B`}
                    >
                      {othersPercent > 15 && (
                        <span>${(event.totalAid - event.israelAid).toFixed(1)}B</span>
                      )}
                    </div>
                  </div>
                  <div className="chart-total">${event.totalAid}B total</div>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color israel"></span>
              <span>Israel</span>
            </div>
            <div className="legend-item">
              <span className="legend-color others"></span>
              <span>All Other Countries Combined (190+ nations)</span>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="insights-section">
          <h2>Key Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-number">1st</div>
              <p>Israel is the #1 recipient of U.S. foreign aid since WWII</p>
            </div>
            <div className="insight-card">
              <div className="insight-number">$300B+</div>
              <p>Total cumulative aid (1948-2022, inflation-adjusted)</p>
            </div>
            <div className="insight-card">
              <div className="insight-number">26%</div>
              <p>Israel received 26% of all U.S. aid in 2024 during Gaza war escalation</p>
            </div>
            <div className="insight-card">
              <div className="insight-number">8-10%</div>
              <p>Typical annual share of country-specific aid over last decade</p>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="data-source">
          <h3>Credible Data Sources</h3>
          <ul>
            <li>
              <strong>Council on Foreign Relations (CFR)</strong> - "U.S. Aid to Israel in Four Charts" (2025)
            </li>
            <li>
              <strong>U.S. State Department</strong> - Foreign Military Sales (FMS) Data & ForeignAssistance.gov
            </li>
            <li>
              <strong>Congressional Research Service</strong> - "U.S. Foreign Aid to Israel" Reports (RL33222)
            </li>
            <li>
              <strong>Quincy Institute for Responsible Statecraft</strong> - Military Aid Tracking (Oct 2023 - Sept 2025)
            </li>
            <li>
              <strong>Brown University Costs of War Project</strong> - U.S. Spending Analysis
            </li>
            <li>
              <strong>USAFacts.org</strong> - Federal Aid Data Compilation
            </li>
          </ul>
          <p className="methodology-note">
            <strong>Methodology:</strong> Dollar amounts shown are in billions (nominal dollars for the year shown,
            not inflation-adjusted unless specified). Total U.S. aid includes economic and military assistance
            to all countries globally. Israel aid data verified against multiple government sources.
            Conflict casualty figures from independent humanitarian organizations and government reports.
          </p>
        </div>

        <Link to="/" className="back-button">
          ← Back to Map
        </Link>
      </div>
    </div>
  );
};

export default AidTimeline;
