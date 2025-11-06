import { Link } from 'react-router-dom';
import './PageTitle.css';

const PageTitle = () => {
  return (
    <Link to="/" className="page-title-link">
      <h1 className="page-title">Where Are Jew</h1>
    </Link>
  );
};

export default PageTitle;
