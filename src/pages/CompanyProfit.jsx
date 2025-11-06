import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import './CompanyProfit.css';

const CompanyProfit = () => {
  const companies = [
    {
      name: 'Lockheed Martin',
      products: ['F-35 Lightning II Fighter Jets', 'Hellfire Missiles', 'C-130 Transport Aircraft', 'Iron Beam Laser Components'],
      description: 'Leading defense contractor and cornerstone of Israel\'s air superiority capabilities',
      headquarters: 'Bethesda, Maryland',
      keyFacilities: ['Fort Worth, TX', 'Marietta, GA', 'Orlando, FL', 'Palmdale, CA'],
      contracts: '$313 Billion',
      contractPeriod: 'Pentagon Contracts 2020-2024',
      rank: 1
    },
    {
      name: 'RTX (Raytheon Technologies)',
      products: ['Iron Dome Tamir Interceptors', 'Patriot Missile Systems', 'Air Defense Radars', 'Precision Munitions'],
      description: 'Co-producer of Iron Dome interceptor missiles, critical for Israel\'s missile defense',
      headquarters: 'Arlington, Virginia',
      keyFacilities: ['Tucson, AZ', 'Tewksbury, MA', 'Andover, MA', 'East Hartford, CT'],
      contracts: '$145 Billion',
      contractPeriod: 'Pentagon Contracts 2020-2024',
      rank: 2
    },
    {
      name: 'Boeing',
      products: ['F-15 Fighter Jets', 'Apache Helicopters', 'Precision-Guided Munitions', 'KC-46 Tankers'],
      description: 'Major supplier of fighter jets, helicopters, and smart bombs to Israel',
      headquarters: 'Arlington, Virginia',
      keyFacilities: ['St. Louis, MO', 'Philadelphia, PA', 'Seattle, WA', 'El Segundo, CA'],
      contracts: '$25.6 Billion',
      contractPeriod: '$18.8B F-15 Contract (Aug 2024) + $6.8B Munitions (Feb 2025)',
      rank: 3
    },
    {
      name: 'General Dynamics',
      products: ['MK-80 Bomb Bodies', '120mm Tank Cartridges', 'High Explosive Mortar Cartridges', 'Penetrator Warheads'],
      description: 'Only U.S. company producing metal bodies for MK-80 bomb series, primary aerial munition for Israel',
      headquarters: 'Reston, Virginia',
      keyFacilities: ['Lima, OH', 'Scranton, PA', 'McAlester, OK'],
      contracts: '$2.09 Billion',
      contractPeriod: '$2B Bomb Bodies (Feb 2025) + $93M Weapons (2024)',
      rank: 4
    },
    {
      name: 'Rafael Advanced Defense Systems',
      products: ['Iron Dome System', 'Trophy Active Protection', 'Spike Missiles', 'David\'s Sling'],
      description: 'Israeli defense contractor, co-produces Iron Dome with RTX, major recipient of U.S. military funding',
      headquarters: 'Haifa, Israel',
      keyFacilities: ['Haifa, Israel', 'Tel Aviv, Israel'],
      contracts: '$5.2 Billion',
      contractPeriod: 'Contract January 2025',
      rank: 5
    },
    {
      name: 'Northrop Grumman',
      products: ['120mm Tank Cartridges', 'Missile Components', 'Defense Electronics'],
      description: 'Contractor for tank ammunition and advanced defense systems',
      headquarters: 'Falls Church, Virginia',
      keyFacilities: ['Palmdale, CA', 'Melbourne, FL', 'Rolling Meadows, IL'],
      contracts: '$61.1 Million',
      contractPeriod: '120mm Mortar Cartridges Contract 2024',
      rank: 6
    },
    {
      name: 'Elbit Systems',
      products: ['Iron Beam High-Power Laser', 'Communication Systems', 'Unmanned Aircraft Systems', 'Hermes 900 Drones'],
      description: 'Israeli defense contractor supplying laser defense systems and advanced communications to IDF',
      headquarters: 'Haifa, Israel',
      keyFacilities: ['Haifa, Israel', 'Rehovot, Israel'],
      contracts: '$330 Million',
      contractPeriod: '$200M Iron Beam (Oct 2024) + $130M Communications (Dec 2024)',
      rank: 7
    },
    {
      name: 'L3Harris Technologies',
      products: ['Light Attack Aircraft', 'Communication Systems', 'Electronic Warfare', 'SINCGARS Radios'],
      description: 'Provider of advanced communication and aircraft systems for border defense',
      headquarters: 'Melbourne, Florida',
      keyFacilities: ['Melbourne, FL', 'Rochester, NY', 'Salt Lake City, UT'],
      contracts: 'MOU Signed',
      contractPeriod: 'Light Attack Aircraft MOU (Oct 2025)',
      rank: 8
    }
  ];

  return (
    <div className="company-profit-container">
      <div className="company-profit-content">
        <PageTitle />
        <p className="company-subtitle">Defense Contractors Profiting from U.S. Military Aid to Israel</p>

        {/* Key Statistics */}
        <div className="stats-section">
          <div className="stat-card large">
            <div className="stat-label">Active Foreign Military Sales (FMS)</div>
            <div className="stat-value">$39.2 Billion</div>
            <div className="stat-period">As of April 2025</div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total U.S. Military Aid Since Oct 2023</div>
              <div className="stat-value">$23 Billion</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Defense Industry Boom from Wars</div>
              <div className="stat-value">$270B</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Top 8 Contractors Total Contracts</div>
              <div className="stat-value">$487B+</div>
            </div>
          </div>
        </div>

        {/* Companies Section */}
        <div className="companies-section">
          <h2>Major Defense Contractors (Ranked by Contract Value)</h2>
          <div className="companies-grid">
            {companies.map((company, index) => (
              <div key={index} className="company-card">
                <div className="company-header">
                  <div className="company-title-wrapper">
                    <div className="company-rank">#{company.rank}</div>
                    <h3>{company.name}</h3>
                  </div>
                  <div className="company-location">
                    HQ: {company.headquarters}
                  </div>
                </div>

                <div className="company-body">
                  <div className="contract-value-section">
                    <div className="contract-value">{company.contracts}</div>
                    <div className="contract-period">{company.contractPeriod}</div>
                  </div>

                  <p className="company-description">{company.description}</p>

                  <div className="products-section">
                    <strong>Key Products:</strong>
                    <ul className="products-list">
                      {company.products.map((product, i) => (
                        <li key={i}>{product}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="facilities-section">
                    <strong>Major U.S. Facilities:</strong>
                    <div className="facilities-list">
                      {company.keyFacilities.map((facility, i) => (
                        <span key={i} className="facility-tag">{facility}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note about Congressional Districts */}
        <div className="info-note">
          <h3>Congressional District Information</h3>
          <p>
            To see which congressional districts house these defense contractors,
            visit the main map and click on any state. You'll find a "Congressional Districts"
            tab in the state information panel that shows contractor locations within that state's districts.
          </p>
        </div>

        {/* Data Source */}
        <div className="data-source">
          <h3>Data Sources</h3>
          <ul>
            <li>U.S. State Department Foreign Military Sales (FMS) Data (April 2025)</li>
            <li>Brown University Costs of War Project</li>
            <li>Quincy Institute for Responsible Statecraft - Profits of War Report (2020-2024)</li>
            <li>Congressional Research Service Reports</li>
            <li>Defense contractor public filings and press releases (2024-2025)</li>
            <li>U.S. Department of Defense contract announcements</li>
          </ul>
        </div>

        <Link to="/" className="back-button">
          ← Back to Map
        </Link>
      </div>
    </div>
  );
};

export default CompanyProfit;
