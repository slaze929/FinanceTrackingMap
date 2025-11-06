import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const contractAddress = "TBA";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="header-nav">
      <a
        href="https://x.com"
        target="_blank"
        rel="noopener noreferrer"
        className="x-link"
      >
        <img src="/x-logo.svg" alt="X" className="x-logo" />
      </a>
      <button
        onClick={copyToClipboard}
        className="ca-button"
        title="Click to copy contract address"
      >
        {copied ? 'COPIED!' : `CA:${contractAddress}`}
      </button>
      <Link to="/about" className="about-link">
        ABOUT
      </Link>
    </div>
  );
};

export default Header;
