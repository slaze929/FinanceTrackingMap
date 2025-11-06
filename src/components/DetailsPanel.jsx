import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './DetailsPanel.css';

const DetailsPanel = ({ stateName, stateData, onClose }) => {
  const panelRef = useRef(null);
  const overlayRef = useRef(null);

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
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="details-overlay"
        onClick={handleClose}
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
        </div>

        {/* Congresspeople list */}
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
      </div>
    </>
  );
};

export default DetailsPanel;
