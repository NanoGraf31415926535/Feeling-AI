import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const textColor = 'gray-300';
const inputBackgroundColor = 'bg-gray-700 bg-opacity-50';
const inputBorderColor = 'border-gray-700';
const focusBorderColor = 'focus:border-teal-500 focus:ring-teal-500';
const buttonBackgroundColor = 'bg-teal-500';
const buttonHoverBackgroundColor = 'hover:bg-teal-700';
const buttonTextColor = 'text-white';
const errorTextColor = 'text-red-500';

function CreateArticle() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, summary, content }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.error || `Failed to create article: ${response.status}`);
        return;
      }

      navigate('/');
    } catch (error) {
      console.error('Error creating article:', error);
      setError('Failed to create article. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-6 flex justify-center items-center">
      <div className="bg-gray-800 bg-opacity-75 rounded-lg shadow-md p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-teal-400 mb-4">Create New Article</h2>
        {error && <p className={`${errorTextColor} mb-2`}>{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400">Title:</label>
            <input
              type="text"
              id="title"
              className={`mt-1 block w-full rounded-md ${inputBorderColor} ${inputBackgroundColor} ${textColor} shadow-sm ${focusBorderColor}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-400">Summary (optional):</label>
            <textarea
              id="summary"
              rows="2"
              className={`mt-1 block w-full rounded-md ${inputBorderColor} ${inputBackgroundColor} ${textColor} shadow-sm ${focusBorderColor}`}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-400">Content:</label>
            <textarea
              id="content"
              rows="8"
              className={`mt-1 block w-full rounded-md ${inputBorderColor} ${inputBackgroundColor} ${textColor} shadow-sm ${focusBorderColor}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full ${buttonBackgroundColor} ${buttonHoverBackgroundColor} ${buttonTextColor} font-bold py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-400`}
          >
            Create Article
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateArticle;