import { useState } from 'react';
import { Link } from 'react-router-dom';
import congressData from '../data/congressData.json';
import './Header.css';

const Header = () => {
  const contractAddress = "TBA";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format the last updated date
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="header-nav-left">
        <button
          onClick={copyToClipboard}
          className="ca-button"
          title="Click to copy contract address"
        >
          {copied ? 'COPIED!' : `CA:${contractAddress}`}
        </button>
        <span className="last-updated">
          Last Updated: {formatDate(congressData.lastUpdated)}
        </span>
      </div>
      <div className="header-nav">
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="x-link"
        >
          <img src="/x-logo.svg" alt="X" className="x-logo" />
        </a>
        <Link to="/about" className="about-link">
          ABOUT
        </Link>
        <Link to="/comments" className="comments-link">
          COMMENT BOARD
        </Link>
        <Link to="/company-profit" className="company-profit-link">
          COMPANY PROFIT
        </Link>
        <Link to="/aid-timeline" className="aid-timeline-link">
          AID TIMELINE
        </Link>
      </div>
    </>
  );
};

export default Header;
