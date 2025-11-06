// API base URL - change this when deploying
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Comment API functions
export const commentAPI = {
  // Get all comments for a specific congressperson
  getComments: async (personKey) => {
    const response = await fetch(`${API_BASE_URL}/comments/${encodeURIComponent(personKey)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  },

  // Get all comments (grouped by person)
  getAllComments: async () => {
    const response = await fetch(`${API_BASE_URL}/comments`);
    if (!response.ok) {
      throw new Error('Failed to fetch all comments');
    }
    return response.json();
  },

  // Post a new comment
  postComment: async (personKey, name, text, timestamp) => {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personKey,
        name,
        text,
        timestamp,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to post comment');
    }

    return response.json();
  },

  // Get comment count for a specific congressperson
  getCommentCount: async (personKey) => {
    const response = await fetch(`${API_BASE_URL}/comments/${encodeURIComponent(personKey)}/count`);
    if (!response.ok) {
      throw new Error('Failed to fetch comment count');
    }
    return response.json();
  },
};
