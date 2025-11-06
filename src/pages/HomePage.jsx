import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdjustableEye from '../components/AdjustableEye';
import USMap from '../components/USMap';
import DetailsPanel from '../components/DetailsPanel';
import Header from '../components/Header';
import './HomePage.css';

function HomePage() {
  const [selectedState, setSelectedState] = useState(null);
  const [stateData, setStateData] = useState(null);

  const handleStateSelect = (stateName, data) => {
    setSelectedState(stateName);
    setStateData(data);
  };

  const handleClosePanel = () => {
    setSelectedState(null);
    setStateData(null);
  };

  return (
    <div className="app-container">
      {/* Title with animated eye */}
      <header className="app-header">
        <Link to="/" className="title-link">
          <div className="main-title-container">
            <img
              src="/where-are-jew-text.png"
              alt="WHERE ARE JEW?"
              className="main-title-image"
            />
            <AdjustableEye adjustMode={false} />
          </div>
        </Link>
        <p className="subtitle">
          Track AIPAC lobby money by state
        </p>
        <Header />
      </header>

      {/* US Map */}
      <main className="map-container">
        <USMap onStateSelect={handleStateSelect} />
      </main>

      {/* Details Panel */}
      <DetailsPanel
        stateName={selectedState}
        stateData={stateData}
        onClose={handleClosePanel}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Data source:{' '}
          <a
            href="https://www.trackaipac.com/congress"
            target="_blank"
            rel="noopener noreferrer"
          >
            TrackAIPAC.com
          </a>
        </p>
        <p className="disclaimer">
          Click on any state to view congresspeople and their lobby totals
        </p>
      </footer>
    </div>
  );
}

export default HomePage;
