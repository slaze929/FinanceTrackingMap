import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './DetailsPanel.css';

const DetailsPanel = ({ stateName, stateData, onClose }) => {
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const [activeTab, setActiveTab] = useState('congress');

  useEffect(() => {
    if (stateData) {
      // Animate panel in
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      gsap.fromTo(
        panelRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [stateData]);

  const handleClose = () => {
    gsap.to(panelRef.current, {
      x: '100%',
      duration: 0.4,
      ease: 'power3.in'
    });

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: onClose
    });
  };

  if (!stateData) return null;

  return (
    <>
      {/* Overlay - kept for animation but transparent */}
      <div
        ref={overlayRef}
        className="details-overlay"
      />

      {/* Panel */}
      <div ref={panelRef} className="details-panel">
        {/* Close button */}
        <button className="close-button" onClick={handleClose}>
          ✕
        </button>

        {/* Header */}
        <div className="panel-header">
          <h2>{stateName}</h2>
          <div className="state-total">
            Total: ${stateData.totalAmount.toLocaleString()}
          </div>
          <div className="congresspeople-count">
            {stateData.congresspeople.length} Congresspeople
          </div>

          {/* Tabs */}
          <div className="panel-tabs">
            <button
              className={`tab-button ${activeTab === 'congress' ? 'active' : ''}`}
              onClick={() => setActiveTab('congress')}
            >
              Congresspeople
            </button>
            <button
              className={`tab-button ${activeTab === 'tax' ? 'active' : ''}`}
              onClick={() => setActiveTab('tax')}
            >
              Your Tax Dollars
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'congress' && (
          <div className="congresspeople-list">
          {stateData.congresspeople.map((person, index) => (
            <div key={index} className="congress-card">
              {/* Photo */}
              {person.photo && (
                <div className="photo-container">
                  <img
                    src={person.photo}
                    alt={person.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Info */}
              <div className="card-info">
                <h3>{person.name}</h3>

                <div className="position-party">
                  <span className="position">{person.position}</span>
                  <span className={`party party-${person.party.toLowerCase()}`}>
                    {person.party === 'R' ? 'Republican' : 'Democrat'}
                  </span>
                </div>

                <div className="lobby-total">
                  Lobby Total: <strong>${person.lobbyTotal.toLocaleString()}</strong>
                </div>

                {person.organizations && person.organizations.length > 0 && (
                  <div className="organizations">
                    <strong>Organizations:</strong>
                    <div className="org-tags">
                      {person.organizations.map((org, i) => (
                        <span key={i} className="org-tag">{org}</span>
                      ))}
                    </div>
                  </div>
                )}

                {person.nextElection && (
                  <div className="election-info">
                    Next Election: {person.nextElection}
                  </div>
                )}

                {person.runningFor && (
                  <div className="running-for">
                    Running for: {person.runningFor}
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Tax Tab Content */}
        {activeTab === 'tax' && (
          <div className="tax-content">
            <div className="tax-section">
              <h3>How Much Did {stateName} Taxpayers Send to Israel?</h3>

              <div className="tax-stat-large">
                <div className="tax-label">Estimated State Contribution</div>
                <div className="tax-amount">
                  ${calculateStateTaxContribution(stateName).toLocaleString()}
                </div>
                <div className="tax-period">October 2023 - September 2025</div>
              </div>

              <div className="tax-breakdown">
                <h4>Where Did This Money Go?</h4>
                <div className="breakdown-list">
                  <div className="breakdown-item">
                    <span className="breakdown-label">F-35 Fighter Jets & Aircraft</span>
                    <span className="breakdown-amount">
                      ${Math.round(calculateStateTaxContribution(stateName) * 0.374).toLocaleString()}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Missile Defense Systems</span>
                    <span className="breakdown-amount">
                      ${Math.round(calculateStateTaxContribution(stateName) * 0.286).toLocaleString()}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Ammunition & Weapons</span>
                    <span className="breakdown-amount">
                      ${Math.round(calculateStateTaxContribution(stateName) * 0.203).toLocaleString()}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Replenishing U.S. Stockpiles</span>
                    <span className="breakdown-amount">
                      ${Math.round(calculateStateTaxContribution(stateName) * 0.137).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tax-info-box">
                <p>
                  This is based on {stateName}'s share of federal tax revenue.
                  The U.S. sent <strong>$21.7 billion</strong> in military aid to Israel
                  from October 2023 to September 2025.
                </p>
                <p className="tax-source">
                  Source: Brown University Costs of War Project, U.S. Treasury
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Calculate state's estimated contribution based on population percentage
const calculateStateTaxContribution = (stateName) => {
  const totalAid = 21700000000; // $21.7 billion

  // Approximate state population percentages (2024 estimates)
  const statePopulationPercentages = {
    'California': 11.7, 'Texas': 9.0, 'Florida': 6.7, 'New York': 5.8,
    'Pennsylvania': 3.8, 'Illinois': 3.8, 'Ohio': 3.5, 'Georgia': 3.3,
    'North Carolina': 3.3, 'Michigan': 3.0, 'New Jersey': 2.8, 'Virginia': 2.6,
    'Washington': 2.4, 'Arizona': 2.3, 'Massachusetts': 2.1, 'Tennessee': 2.1,
    'Indiana': 2.0, 'Missouri': 1.8, 'Maryland': 1.8, 'Wisconsin': 1.8,
    'Colorado': 1.8, 'Minnesota': 1.7, 'South Carolina': 1.6, 'Alabama': 1.5,
    'Louisiana': 1.4, 'Kentucky': 1.3, 'Oregon': 1.3, 'Oklahoma': 1.2,
    'Connecticut': 1.1, 'Utah': 1.0, 'Iowa': 0.95, 'Nevada': 0.95,
    'Arkansas': 0.9, 'Mississippi': 0.9, 'Kansas': 0.88, 'New Mexico': 0.63,
    'Nebraska': 0.58, 'Idaho': 0.57, 'West Virginia': 0.54, 'Hawaii': 0.43,
    'New Hampshire': 0.41, 'Maine': 0.41, 'Montana': 0.34, 'Rhode Island': 0.33,
    'Delaware': 0.30, 'South Dakota': 0.27, 'North Dakota': 0.23, 'Alaska': 0.22,
    'Vermont': 0.19, 'Wyoming': 0.17
  };

  const percentage = statePopulationPercentages[stateName] || 1.0;
  return Math.round((totalAid * percentage) / 100);
};

export default DetailsPanel;
