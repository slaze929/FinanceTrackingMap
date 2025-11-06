import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import congressData from '../data/congressData.json';
import AnimatedEye from '../components/AnimatedEye';
import './CommentBoard.css';

const CommentBoard = () => {
  const location = useLocation();
  const [selectedState, setSelectedState] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [anonymousName, setAnonymousName] = useState('');

  // Check for incoming state from navigation (when clicking "View on Comment Board")
  useEffect(() => {
    if (location.state?.stateName && location.state?.person) {
      setSelectedState(location.state.stateName);
      setSelectedPerson(location.state.person);
    }
  }, [location.state]);

  // Load comments from localStorage on mount
  useEffect(() => {
    const savedComments = localStorage.getItem('congressComments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  // Save comments to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(comments).length > 0) {
      localStorage.setItem('congressComments', JSON.stringify(comments));
    }
  }, [comments]);

  // Get all states sorted alphabetically
  const states = Object.keys(congressData.states).sort();

  // Get congresspeople for selected state
  const congresspeople = selectedState ? congressData.states[selectedState]?.congresspeople || [] : [];

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPerson) return;

    const personKey = `${selectedPerson.name}-${selectedPerson.position}`;
    const comment = {
      id: Date.now(),
      name: anonymousName.trim() || 'Anonymous',
      text: newComment,
      timestamp: new Date().toISOString(),
    };

    setComments(prev => ({
      ...prev,
      [personKey]: [...(prev[personKey] || []), comment]
    }));

    setNewComment('');
    setAnonymousName('');
  };

  const getComments = (person) => {
    const personKey = `${person.name}-${person.position}`;
    return comments[personKey] || [];
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="comment-board-container">
      <div className="comment-board-content">
        <Link to="/" className="board-title-link">
          <h1 className="board-title">
            Where are J<AnimatedEye />w? - Comment Board
          </h1>
        </Link>
        <p className="board-subtitle">Anonymous forum for discussing congresspeople and AIPAC influence</p>

        <div className="board-layout">
          {/* Left Sidebar - State & Person Selection */}
          <div className="board-sidebar">
            <div className="sidebar-section">
              <h3>Select State</h3>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedPerson(null);
                }}
                className="state-select"
              >
                <option value="">Choose a state...</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {selectedState && (
              <div className="sidebar-section">
                <h3>Congresspeople ({congresspeople.length})</h3>
                <div className="person-list">
                  {congresspeople.map((person, index) => (
                    <div
                      key={index}
                      className={`person-item ${selectedPerson === person ? 'active' : ''}`}
                      onClick={() => setSelectedPerson(person)}
                    >
                      <div className="person-info">
                        <div className="person-name">{person.name}</div>
                        <div className="person-meta">
                          <span className={`party-badge ${person.party === 'D' ? 'dem' : 'rep'}`}>
                            {person.party === 'D' ? 'D' : 'R'}
                          </span>
                          <span className="position-badge">{person.position}</span>
                        </div>
                      </div>
                      <div className="comment-count">
                        {getComments(person).length} comments
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content - Comments */}
          <div className="board-main">
            {!selectedPerson ? (
              <div className="no-selection">
                <h2>Select a congressperson to view comments</h2>
                <p>Choose a state from the sidebar, then select a congressperson to view and add comments.</p>
              </div>
            ) : (
              <>
                {/* Person Header */}
                <div className="person-header">
                  {selectedPerson.photo && (
                    <img src={selectedPerson.photo} alt={selectedPerson.name} className="person-photo" />
                  )}
                  <div className="person-details">
                    <h2>{selectedPerson.name}</h2>
                    <div className="person-tags">
                      <span className={`party-tag ${selectedPerson.party === 'D' ? 'dem' : 'rep'}`}>
                        {selectedPerson.party === 'D' ? 'Democrat' : 'Republican'}
                      </span>
                      <span className="position-tag">{selectedPerson.position}</span>
                      <span className="lobby-tag">
                        Lobby Total: ${selectedPerson.lobbyTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment Form */}
                <div className="comment-form-section">
                  <h3>Post a Comment</h3>
                  <form onSubmit={handleSubmitComment} className="comment-form">
                    <input
                      type="text"
                      placeholder="Name (optional - leave blank for Anonymous)"
                      value={anonymousName}
                      onChange={(e) => setAnonymousName(e.target.value)}
                      className="name-input"
                      maxLength={50}
                    />
                    <textarea
                      placeholder="Share your thoughts about this congressperson..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="comment-textarea"
                      rows={4}
                      maxLength={1000}
                      required
                    />
                    <div className="form-footer">
                      <span className="char-count">{newComment.length}/1000</span>
                      <button type="submit" className="submit-button">
                        Post Comment
                      </button>
                    </div>
                  </form>
                </div>

                {/* Comments List */}
                <div className="comments-section">
                  <h3>Comments ({getComments(selectedPerson).length})</h3>
                  {getComments(selectedPerson).length === 0 ? (
                    <div className="no-comments">
                      <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    <div className="comments-list">
                      {getComments(selectedPerson)
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map(comment => (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                              <span className="comment-author">{comment.name}</span>
                              <span className="comment-time">{formatTimestamp(comment.timestamp)}</span>
                            </div>
                            <div className="comment-body">
                              {comment.text}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <Link to="/" className="back-button">
          ← Back to Map
        </Link>
      </div>
    </div>
  );
};

export default CommentBoard;
