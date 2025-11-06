import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import './AidTimeline.css';

const AidTimeline = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [comparisonCountry, setComparisonCountry] = useState('all');
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const timelineRef = useRef(null);

  // Major country aid data (typical annual amounts + historical cumulative totals in billions)
  // Historical totals: 1948-2025 cumulative aid (inflation-adjusted where available)
  const countryAidData = {
    'all': { name: 'All Other Countries Combined', avgAnnual: null, historicalTotal: null, flag: '' },
    'ukraine': { name: 'Ukraine', avgAnnual: 1.5, historicalTotal: 30.5, flag: '🇺🇦' },
    'egypt': { name: 'Egypt', avgAnnual: 1.4, historicalTotal: 198.9, flag: '🇪🇬' },
    'jordan': { name: 'Jordan', avgAnnual: 1.45, historicalTotal: 35.0, flag: '🇯🇴' },
    'ethiopia': { name: 'Ethiopia', avgAnnual: 1.2, historicalTotal: 45.0, flag: '🇪🇹' },
    'afghanistan': { name: 'Afghanistan', avgAnnual: 0.8, historicalTotal: 168.5, flag: '🇦🇫' },
    'congo': { name: 'DR Congo', avgAnnual: 0.79, historicalTotal: 15.0, flag: '🇨🇩' },
    'yemen': { name: 'Yemen', avgAnnual: 0.51, historicalTotal: 8.0, flag: '🇾🇪' },
    'southsudan': { name: 'South Sudan', avgAnnual: 0.45, historicalTotal: 6.0, flag: '🇸🇸' },
    'somalia': { name: 'Somalia', avgAnnual: 0.42, historicalTotal: 12.0, flag: '🇸🇴' },
    'iraq': { name: 'Iraq', avgAnnual: 0.45, historicalTotal: 75.0, flag: '🇮🇶' },
    'kenya': { name: 'Kenya', avgAnnual: 0.35, historicalTotal: 25.0, flag: '🇰🇪' },
    'nigeria': { name: 'Nigeria', avgAnnual: 0.32, historicalTotal: 18.0, flag: '🇳🇬' },
    'tanzania': { name: 'Tanzania', avgAnnual: 0.21, historicalTotal: 12.0, flag: '🇹🇿' },
    'uganda': { name: 'Uganda', avgAnnual: 0.27, historicalTotal: 15.0, flag: '🇺🇬' },
    'southafrica': { name: 'South Africa', avgAnnual: 0.24, historicalTotal: 20.0, flag: '🇿🇦' },
    'colombia': { name: 'Colombia', avgAnnual: 0.2, historicalTotal: 35.0, flag: '🇨🇴' },
    'bangladesh': { name: 'Bangladesh', avgAnnual: 0.24, historicalTotal: 28.0, flag: '🇧🇩' },
    'haiti': { name: 'Haiti', avgAnnual: 0.23, historicalTotal: 15.0, flag: '🇭🇹' },
    'lebanon': { name: 'Lebanon', avgAnnual: 0.24, historicalTotal: 12.0, flag: '🇱🇧' },
    'pakistan': { name: 'Pakistan', avgAnnual: 0.25, historicalTotal: 65.0, flag: '🇵🇰' },
    'syria': { name: 'Syria', avgAnnual: 0.1, historicalTotal: 4.0, flag: '🇸🇾' },
    'guatemala': { name: 'Guatemala', avgAnnual: 0.12, historicalTotal: 8.0, flag: '🇬🇹' },
    'honduras': { name: 'Honduras', avgAnnual: 0.1, historicalTotal: 7.0, flag: '🇭🇳' },
    'mozambique': { name: 'Mozambique', avgAnnual: 0.36, historicalTotal: 10.0, flag: '🇲🇿' },
    'zambia': { name: 'Zambia', avgAnnual: 0.17, historicalTotal: 8.0, flag: '🇿🇲' },
    'zimbabwe': { name: 'Zimbabwe', avgAnnual: 0.17, historicalTotal: 7.0, flag: '🇿🇼' },
    'ghana': { name: 'Ghana', avgAnnual: 0.13, historicalTotal: 9.0, flag: '🇬🇭' },
    'nepal': { name: 'Nepal', avgAnnual: 0.11, historicalTotal: 6.0, flag: '🇳🇵' },
    'indonesia': { name: 'Indonesia', avgAnnual: 0.08, historicalTotal: 15.0, flag: '🇮🇩' },
    'philippines': { name: 'Philippines', avgAnnual: 0.15, historicalTotal: 22.0, flag: '🇵🇭' },
    'vietnam': { name: 'Vietnam', avgAnnual: 0.05, historicalTotal: 150.0, flag: '🇻🇳' },
    'mexico': { name: 'Mexico', avgAnnual: 0.11, historicalTotal: 10.0, flag: '🇲🇽' },
    'brazil': { name: 'Brazil', avgAnnual: 0.05, historicalTotal: 8.0, flag: '🇧🇷' },
    'india': { name: 'India', avgAnnual: 0.06, historicalTotal: 65.0, flag: '🇮🇳' },
    'china': { name: 'China', avgAnnual: 0.01, historicalTotal: 2.0, flag: '🇨🇳' },
    'turkey': { name: 'Turkey', avgAnnual: 0.08, historicalTotal: 25.0, flag: '🇹🇷' },
    'uk': { name: 'United Kingdom', avgAnnual: 0.002, historicalTotal: 0.5, flag: '🇬🇧' },
    'canada': { name: 'Canada', avgAnnual: 0.001, historicalTotal: 0.2, flag: '🇨🇦' },
    'france': { name: 'France', avgAnnual: 0.003, historicalTotal: 0.4, flag: '🇫🇷' },
    'germany': { name: 'Germany', avgAnnual: 0.002, historicalTotal: 0.5, flag: '🇩🇪' },
    'australia': { name: 'Australia', avgAnnual: 0.001, historicalTotal: 0.2, flag: '🇦🇺' },
    'japan': { name: 'Japan', avgAnnual: 0.002, historicalTotal: 15.0, flag: '🇯🇵' },
    'southkorea': { name: 'South Korea', avgAnnual: 0.005, historicalTotal: 127.6, flag: '🇰🇷' },
    'italy': { name: 'Italy', avgAnnual: 0.002, historicalTotal: 5.0, flag: '🇮🇹' },
    'spain': { name: 'Spain', avgAnnual: 0.003, historicalTotal: 3.0, flag: '🇪🇸' },
    'poland': { name: 'Poland', avgAnnual: 0.05, historicalTotal: 10.0, flag: '🇵🇱' },
    'russia': { name: 'Russia', avgAnnual: 0.0, historicalTotal: 0.0, flag: '🇷🇺' },
  };

  // Israel's verified historical total (1948-2025)
  const israelHistoricalTotal = 317.9;

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

  // Calculate cumulative aid from timeline (for display purposes)
  const cumulativeIsrael = timelineEvents.reduce((sum, event) => sum + event.israelAid, 0);
  const cumulativeOthers = timelineEvents.reduce((sum, event) => sum + (event.totalAid - event.israelAid), 0);

  // Get comparison data
  const getComparisonData = () => {
    if (comparisonCountry === 'all') {
      return {
        name: 'All Other Countries Combined',
        total: cumulativeOthers,
        label: 'Average Annual Aid to All Others',
        sublabel: 'Per year across 190+ countries',
        flag: '🌍'
      };
    } else {
      const countryData = countryAidData[comparisonCountry];
      return {
        name: countryData.name,
        total: countryData.historicalTotal,
        label: `Total U.S. Aid to ${countryData.name} (1948-2025)`,
        sublabel: 'Cumulative historical total',
        flag: countryData.flag
      };
    }
  };

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
    // Scale event size based on aid amount - smaller for compact layout
    const minSize = 30;
    const maxSize = 70;
    const scale = Math.min(israelAid / 20, 1);
    return minSize + (scale * (maxSize - minSize));
  };

  return (
    <div className="aid-timeline-container">
      <div className="aid-timeline-content">
        <PageTitle />
        <p className="timeline-subtitle">
          U.S. Aid to Israel vs. All Other Countries Combined • 1948-2025
        </p>

        {/* Key Statistics */}
        <div className="timeline-stats-section">
          <div className="stat-comparison-grid">
            <div className="stat-card israel">
              <div className="stat-icon">🇮🇱</div>
              <div className="stat-label">Total U.S. Aid to Israel (1948-2025)</div>
              <div className="stat-value">${israelHistoricalTotal.toFixed(1)}B</div>
              <div className="stat-period">Verified historical total (inflation-adjusted)</div>
            </div>

            <div className="stat-card comparison">
              <div className="comparison-symbol">VS</div>
            </div>

            <div
              className={`stat-card others ${comparisonCountry !== 'all' ? 'selected' : ''}`}
              onClick={() => setShowCountrySelector(!showCountrySelector)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div className="stat-icon">{getComparisonData().flag}</div>
              <div className="stat-label">{getComparisonData().label}</div>
              <div className="stat-value">
                ${comparisonCountry === 'all'
                  ? (cumulativeOthers / timelineEvents.length).toFixed(1)
                  : getComparisonData().total.toFixed(1)}B
              </div>
              <div className="stat-period">{getComparisonData().sublabel}</div>

              {showCountrySelector && (
                <div className="country-selector-popup">
                  <div className="country-selector-header">
                    <span>Select Country to Compare</span>
                    <button onClick={(e) => { e.stopPropagation(); setShowCountrySelector(false); }}>✕</button>
                  </div>
                  <div className="country-list">
                    <div
                      className={`country-option ${comparisonCountry === 'all' ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setComparisonCountry('all'); }}
                    >
                      <span>🌍 All Other Countries Combined</span>
                    </div>
                    {Object.entries(countryAidData).filter(([key]) => key !== 'all').map(([key, data]) => (
                      <div
                        key={key}
                        className={`country-option ${comparisonCountry === key ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setComparisonCountry(key); }}
                      >
                        <span>{data.flag} {data.name}</span>
                        <span className="country-total">${data.historicalTotal.toFixed(1)}B</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-label">Timeline Total: Israel Aid (1948-2025)</div>
            <div className="stat-value">${cumulativeIsrael.toFixed(1)} Billion</div>
            <div className="stat-period">Cumulative from timeline events shown above</div>
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
          <div className="comparison-header">
            <h2>Aid Distribution by Year: Israel vs Selected Country</h2>
            <div className="country-selector">
              <label htmlFor="country-select">Compare with:</label>
              <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {Object.entries(countryAidData).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.flag} {data.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="comparison-chart">
            {timelineEvents.map((event, index) => {
              let comparisonAid;
              let comparisonName;

              if (selectedCountry === 'all') {
                comparisonAid = event.totalAid - event.israelAid;
                comparisonName = 'All Others';
              } else {
                comparisonAid = countryAidData[selectedCountry].avgAnnual;
                comparisonName = countryAidData[selectedCountry].name;
              }

              const totalForComparison = event.israelAid + comparisonAid;
              const israelPercent = (event.israelAid / totalForComparison) * 100;
              const comparisonPercent = (comparisonAid / totalForComparison) * 100;

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
                      style={{ width: `${comparisonPercent}%` }}
                      title={`${comparisonName}: $${comparisonAid.toFixed(1)}B (${comparisonPercent.toFixed(1)}%)`}
                    >
                      {comparisonPercent > 15 && (
                        <span>${comparisonAid.toFixed(1)}B</span>
                      )}
                    </div>
                  </div>
                  <div className="chart-total">
                    ${selectedCountry === 'all' ? event.totalAid.toFixed(1) : totalForComparison.toFixed(1)}B
                    {selectedCountry === 'all' ? ' total' : ` (Israel: ${israelPercent.toFixed(0)}% vs ${comparisonName}: ${comparisonPercent.toFixed(0)}%)`}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color israel"></span>
              <span>🇮🇱 Israel</span>
            </div>
            <div className="legend-item">
              <span className="legend-color others"></span>
              <span>
                {countryAidData[selectedCountry].flag} {countryAidData[selectedCountry].name}
                {selectedCountry === 'all' && ' (190+ nations)'}
              </span>
            </div>
          </div>

          {selectedCountry !== 'all' && (
            <div className="comparison-note">
              <p>
                <strong>Note:</strong> {countryAidData[selectedCountry].name} receives approximately
                ${countryAidData[selectedCountry].avgAnnual.toFixed(2)}B in annual U.S. aid (averaged over recent years).
                The chart shows how Israel's aid compares to this country across different time periods.
              </p>
            </div>
          )}
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
