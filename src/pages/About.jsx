import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <PageTitle />

        <div className="about-text">
          <h2>About This Project</h2>
          <p>
            Where Are Jew is a comprehensive transparency platform tracking AIPAC (American Israel Public Affairs Committee)
            lobby influence, U.S. aid to Israel, defense contractor profits, and the financial connections between
            American taxpayers, politicians, and military funding.
          </p>

          <h2>Features</h2>

          <h3>Interactive US Map</h3>
          <p>
            Our heat map visualization shows AIPAC lobby money distribution across all 50 states. Click any state to see:
          </p>
          <ul>
            <li><strong>Congresspeople:</strong> All representatives with their AIPAC funding, party affiliation, positions, and next election dates. Search and filter by party or name.</li>
            <li><strong>Taxes:</strong> Your state's estimated taxpayer contribution to Israel aid (Oct 2023 - Sep 2025), including breakdowns for F-35s, missile defense, ammunition, and military stockpiles.</li>
            <li><strong>Congressional Districts:</strong> Defense contractors with facilities in your state and which districts profit from Israel aid contracts.</li>
          </ul>
          <p>
            The map features zoom and pan controls, dynamic city labels, and hover animations. States with extreme
            funding (2.5x average or more) are highlighted with special outlines.
          </p>

          <h3>Aid Timeline</h3>
          <p>
            Explore the complete history of U.S. aid to Israel from 1948 to 2025. Our interactive timeline features
            15 major events with detailed context, casualty information, and aid amounts. Compare Israel's aid against
            all other countries combined and discover that Israel receives more total aid than any other nation in
            U.S. history ($317.9B cumulative).
          </p>

          <h3>Company Profit Tracker</h3>
          <p>
            Track the top 8 defense contractors profiting from Israel military support, representing over $487 billion
            in contracts. See headquarters locations, key products, facility locations across America, and detailed
            contract values. Learn how $39.2 billion in active Foreign Military Sales flows to companies like Lockheed
            Martin, RTX/Raytheon, and Boeing.
          </p>

          <h3>Comment Board</h3>
          <p>
            Join the conversation. Our community discussion forum lets you select any congressperson and read or post
            anonymous comments about their voting records and AIPAC funding. All comments are stored locally in your
            browser and can be posted anonymously or with a custom name.
          </p>

          <h2>Data Sources</h2>
          <p>
            We use only credible, verified sources:
          </p>
          <ul>
            <li>
              <a href="https://www.trackaipac.com/congress" target="_blank" rel="noopener noreferrer">
                TrackAIPAC.com
              </a> - AIPAC political contributions
            </li>
            <li>Council on Foreign Relations (CFR) - Historical aid data</li>
            <li>U.S. State Department - Official aid packages</li>
            <li>Congressional Research Service - Aid analysis and breakdowns</li>
            <li>Brown University Costs of War Project - State taxpayer contributions</li>
            <li>U.S. Treasury & USAFacts.org - Tax allocation data</li>
            <li>Quincy Institute - Defense contractor analysis</li>
          </ul>

          <h2>Purpose</h2>
          <p>
            This platform provides transparency about political funding, lobby influence, military aid distribution,
            and corporate profits in American politics. We believe citizens deserve to know how their tax dollars
            are spent, which politicians receive lobby money, and which corporations profit from military aid.
            Our goal is to help Americans make more informed decisions about their elected representatives and
            understand the financial incentives behind U.S. foreign policy.
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
