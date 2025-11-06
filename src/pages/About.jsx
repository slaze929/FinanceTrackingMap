import { Link } from 'react-router-dom';
import AnimatedEye from '../components/AnimatedEye';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">
          Where are J<AnimatedEye />w?
        </h1>

        <div className="about-text">
          <h2>About This Project</h2>
          <p>
            This interactive map tracks AIPAC (American Israel Public Affairs Committee)
            lobby money distributed to congresspeople across the United States.
          </p>

          <p>
            Click on any state to see detailed information about congressional
            representatives and the lobby funds they've received.
          </p>

          <h2>Data Source</h2>
          <p>
            All data is sourced from{' '}
            <a
              href="https://www.trackaipac.com/congress"
              target="_blank"
              rel="noopener noreferrer"
            >
              TrackAIPAC.com
            </a>
            , which provides comprehensive tracking of AIPAC political contributions.
          </p>

          <h2>Purpose</h2>
          <p>
            This visualization aims to provide transparency about political funding
            and lobby influence in American politics, helping citizens make more
            informed decisions about their elected representatives.
          </p>
        </div>

        <Link to="/" className="back-button">
          ← Back to Map
        </Link>
      </div>
    </div>
  );
};

export default About;
