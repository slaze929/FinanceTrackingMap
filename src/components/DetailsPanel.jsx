import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './DetailsPanel.css';
import votingRecordsData from '../data/votingRecords.json';

const DetailsPanel = ({ stateName, stateData, onClose }) => {
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const [activeTab, setActiveTab] = useState('congress');
  const [searchTerm, setSearchTerm] = useState('');
  const [partyFilter, setPartyFilter] = useState('all'); // 'all', 'D', 'R'

  useEffect(() => {
    if (stateData) {
      // Reset filters when new state is selected
      setSearchTerm('');
      setPartyFilter('all');

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

  // Filter congresspeople based on search and party filter
  const filteredCongresspeople = stateData.congresspeople.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParty = partyFilter === 'all' || person.party === partyFilter;
    return matchesSearch && matchesParty;
  });

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
              Taxes
            </button>
            <button
              className={`tab-button ${activeTab === 'districts' ? 'active' : ''}`}
              onClick={() => setActiveTab('districts')}
            >
              Districts
            </button>
            <button
              className={`tab-button ${activeTab === 'voting' ? 'active' : ''}`}
              onClick={() => setActiveTab('voting')}
            >
              Voting Record
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'congress' && (
          <>
            {/* Search and Filter Controls */}
            <div className="filter-controls">
              <input
                type="text"
                placeholder="Search by name or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />

              <div className="party-filters">
                <button
                  className={`party-filter-btn ${partyFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setPartyFilter('all')}
                >
                  All ({stateData.congresspeople.length})
                </button>
                <button
                  className={`party-filter-btn democrat ${partyFilter === 'D' ? 'active' : ''}`}
                  onClick={() => setPartyFilter('D')}
                >
                  Democrats ({stateData.congresspeople.filter(p => p.party === 'D').length})
                </button>
                <button
                  className={`party-filter-btn republican ${partyFilter === 'R' ? 'active' : ''}`}
                  onClick={() => setPartyFilter('R')}
                >
                  Republicans ({stateData.congresspeople.filter(p => p.party === 'R').length})
                </button>
              </div>
            </div>

            {/* Results count */}
            {(searchTerm || partyFilter !== 'all') && (
              <div className="results-count">
                Showing {filteredCongresspeople.length} of {stateData.congresspeople.length} congresspeople
              </div>
            )}

            <div className="congresspeople-list">
            {filteredCongresspeople.length > 0 ? (
              filteredCongresspeople.map((person, index) => (
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

                <div className="card-footer">
                  <div className="card-footer-left">
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

                  <Link
                    to="/comments"
                    state={{ stateName, person }}
                    className="comment-board-link"
                  >
                    View on Comment Board →
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No congresspeople found matching your filters.</p>
          </div>
        )}
          </div>
          </>
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

        {/* Congressional Districts Tab Content */}
        {activeTab === 'districts' && (
          <div className="districts-content">
            <div className="districts-section">
              <h3>Defense Contractors in {stateName}</h3>

              <div className="districts-intro">
                <p>
                  This tab shows which defense contractors benefiting from U.S. military aid to Israel
                  have facilities, offices, or manufacturing plants located in {stateName}.
                </p>
              </div>

              {getStateContractors(stateName).length > 0 ? (
                <div className="contractors-list">
                  {getStateContractors(stateName).map((contractor, index) => (
                    <div key={index} className="contractor-card">
                      <div className="contractor-header">
                        <h4>{contractor.company}</h4>
                        <span className="contractor-type">{contractor.type}</span>
                      </div>
                      <div className="contractor-body">
                        <div className="contractor-facilities">
                          <strong>Facilities in {stateName}:</strong>
                          <ul>
                            {contractor.facilities.map((facility, i) => (
                              <li key={i}>
                                <span className="facility-name">{facility.location}</span>
                                {facility.district && (
                                  <span className="district-badge">District {facility.district}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="contractor-products">
                          <strong>Products:</strong>
                          <p>{contractor.products}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-contractors">
                  <p>
                    No major defense contractors with known facilities in {stateName} were identified
                    in our current database. This doesn't mean there are no defense-related businesses
                    in the state, just that the major contractors supplying Israel are primarily based elsewhere.
                  </p>
                </div>
              )}

              <div className="districts-info-box">
                <h4>About This Data</h4>
                <p>
                  This information is based on publicly available data about defense contractor
                  facilities and congressional district boundaries. The contractors listed here
                  are among those profiting from the $39.2 billion in active Foreign Military Sales
                  to Israel as of April 2025.
                </p>
                <p className="districts-source">
                  Source: State Department FMS data, Defense contractor public filings
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Voting Record Tab Content */}
        {activeTab === 'voting' && (
          <div className="voting-content">
            <div className="voting-section">
              <h3>Israel-Related Congressional Votes</h3>

              <div className="voting-intro">
                <p>
                  Track how {stateName} representatives voted on key Israel-related legislation
                  and see the correlation with lobby funding they received.
                </p>
              </div>

              {/* Correlation Analysis */}
              <div className="correlation-box">
                <h4>Funding vs. Voting Pattern Analysis</h4>
                <div className="correlation-stats">
                  <div className="correlation-stat">
                    <div className="stat-label">Total AIPAC Funding to {stateName}</div>
                    <div className="stat-value">${stateData.totalAmount.toLocaleString()}</div>
                  </div>
                  <div className="correlation-stat">
                    <div className="stat-label">Representatives Tracked</div>
                    <div className="stat-value">{stateData.congresspeople.length}</div>
                  </div>
                  <div className="correlation-stat">
                    <div className="stat-label">Major Votes Tracked</div>
                    <div className="stat-value">{votingRecordsData.votes.length}</div>
                  </div>
                </div>
                <div className="correlation-note">
                  <strong>Analysis Note:</strong> Research shows strong correlation between
                  pro-Israel lobby funding and voting patterns. Members receiving higher amounts
                  of AIPAC funding consistently vote in favor of military aid and weapons sales to Israel.
                </div>
              </div>

              {/* Major Votes List */}
              <div className="major-votes-section">
                <h4>Major Israel-Related Votes (2023-2024)</h4>
                <div className="votes-list">
                  {votingRecordsData.votes.map((vote, index) => (
                    <div key={vote.id} className="vote-card">
                      <div className="vote-header">
                        <div className="vote-title-section">
                          <h5>{vote.title}</h5>
                          <div className="vote-meta">
                            <span className="vote-bill">{vote.billNumber}</span>
                            <span className="vote-date">{new Date(vote.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            <span className={`vote-result ${vote.result.toLowerCase()}`}>{vote.result}</span>
                          </div>
                        </div>
                        <div className="vote-totals">
                          <div className="vote-total-item yea">
                            <span className="vote-total-label">Yea</span>
                            <span className="vote-total-number">{vote.voteTotals.yea}</span>
                          </div>
                          <div className="vote-total-item nay">
                            <span className="vote-total-label">Nay</span>
                            <span className="vote-total-number">{vote.voteTotals.nay}</span>
                          </div>
                        </div>
                      </div>
                      <p className="vote-description">{vote.description}</p>
                      {vote.significance && (
                        <div className="vote-significance">
                          <strong>Significance:</strong> {vote.significance}
                        </div>
                      )}
                      <div className="vote-footer">
                        <span className="vote-chamber">{vote.chamber}</span>
                        <span className="vote-roll">Roll Call: {vote.rollCallNumber}</span>
                        <a
                          href={vote.congressGovUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="vote-source-link"
                        >
                          View on Congress.gov →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sources */}
              <div className="voting-info-box">
                <h4>Data Sources & Methodology</h4>
                <div className="source-info">
                  <p><strong>Primary Source:</strong> {votingRecordsData.source}</p>
                  <p><strong>Additional Sources:</strong></p>
                  <ul>
                    {votingRecordsData.additionalSources.map((source, i) => (
                      <li key={i}>{source}</li>
                    ))}
                  </ul>
                  <p><strong>Methodology:</strong> {votingRecordsData.notes.methodology}</p>
                  <p className="data-integrity"><strong>Data Integrity:</strong> {votingRecordsData.notes.dataIntegrity}</p>
                  <p className="data-updated">Last Updated: {votingRecordsData.lastUpdated}</p>
                </div>
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

// Get defense contractors with facilities in the state
const getStateContractors = (stateName) => {
  const contractorsData = {
    'Texas': [
      {
        company: 'Lockheed Martin',
        type: 'Aerospace & Defense',
        products: 'F-35 Fighter Jets, F-16 components',
        facilities: [
          { location: 'Fort Worth', district: '12' },
          { location: 'Grand Prairie', district: '24' }
        ]
      }
    ],
    'Georgia': [
      {
        company: 'Lockheed Martin',
        type: 'Aerospace & Defense',
        products: 'C-130 transport aircraft, F-35 components',
        facilities: [
          { location: 'Marietta', district: '11' }
        ]
      }
    ],
    'Florida': [
      {
        company: 'Lockheed Martin',
        type: 'Aerospace & Defense',
        products: 'Missile systems, training & simulation',
        facilities: [
          { location: 'Orlando', district: '10' },
          { location: 'Jupiter', district: '21' }
        ]
      }
    ],
    'Missouri': [
      {
        company: 'Boeing',
        type: 'Aerospace & Defense',
        products: 'F-15 Fighter Jets, F/A-18 Super Hornet',
        facilities: [
          { location: 'St. Louis', district: '1' }
        ]
      }
    ],
    'Pennsylvania': [
      {
        company: 'Boeing',
        type: 'Aerospace & Defense',
        products: 'CH-47 Chinook, V-22 Osprey helicopters',
        facilities: [
          { location: 'Philadelphia (Ridley Park)', district: '5' }
        ]
      }
    ],
    'Washington': [
      {
        company: 'Boeing',
        type: 'Aerospace & Defense',
        products: 'KC-46 Tankers, military aircraft',
        facilities: [
          { location: 'Seattle/Everett', district: '2' },
          { location: 'Renton', district: '9' }
        ]
      }
    ],
    'Arizona': [
      {
        company: 'RTX/Raytheon',
        type: 'Defense Systems',
        products: 'Missile Defense Systems, Patriot missiles',
        facilities: [
          { location: 'Tucson', district: '7' }
        ]
      }
    ],
    'Massachusetts': [
      {
        company: 'RTX/Raytheon',
        type: 'Defense Systems',
        products: 'Missile systems, air defense radars',
        facilities: [
          { location: 'Tewksbury', district: '3' },
          { location: 'Andover', district: '3' }
        ]
      }
    ],
    'Maryland': [
      {
        company: 'Lockheed Martin',
        type: 'Aerospace & Defense',
        products: 'Corporate headquarters, systems integration',
        facilities: [
          { location: 'Bethesda (HQ)', district: '8' }
        ]
      }
    ],
    'Virginia': [
      {
        company: 'Boeing',
        type: 'Aerospace & Defense',
        products: 'Corporate headquarters',
        facilities: [
          { location: 'Arlington (HQ)', district: '8' }
        ]
      },
      {
        company: 'RTX/Raytheon',
        type: 'Defense Systems',
        products: 'Corporate headquarters',
        facilities: [
          { location: 'Arlington (HQ)', district: '8' }
        ]
      }
    ],
    'California': [
      {
        company: 'Lockheed Martin',
        type: 'Aerospace & Defense',
        products: 'Space systems, missile defense',
        facilities: [
          { location: 'Sunnyvale', district: '17' },
          { location: 'Palmdale', district: '27' }
        ]
      },
      {
        company: 'Boeing',
        type: 'Aerospace & Defense',
        products: 'Satellite systems, defense electronics',
        facilities: [
          { location: 'El Segundo', district: '36' }
        ]
      }
    ],
    'Connecticut': [
      {
        company: 'RTX/Raytheon',
        type: 'Defense Systems',
        products: 'Pratt & Whitney engines',
        facilities: [
          { location: 'East Hartford', district: '1' }
        ]
      }
    ],
    'Alabama': [
      {
        company: 'Lockheed Martin',
        type: 'Aerospace & Defense',
        products: 'Missile systems, space programs',
        facilities: [
          { location: 'Huntsville', district: '5' }
        ]
      }
    ],
    'Colorado': [
      {
        company: 'Lockheed Martin',
        type: 'Aerospace & Defense',
        products: 'Space systems, satellites',
        facilities: [
          { location: 'Littleton', district: '6' }
        ]
      }
    ]
  };

  return contractorsData[stateName] || [];
};

export default DetailsPanel;
