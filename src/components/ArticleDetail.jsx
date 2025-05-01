import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const textColor = 'gray-300';
const backgroundColor = 'gray-800';
const backgroundOpacity = 'bg-opacity-75';
const borderColor = 'gray-700';
const titleColor = 'cyan-300';
const accentTextColor = 'cyan-200';
const errorTextColor = 'red-500';
const loadingTextColor = 'gray-400';
const createdTextColor = 'gray-500';
const deleteButtonColor = 'red-500';
const deleteButtonHoverColor = 'red-700';

function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:5001/api/articles/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('Unauthorized access. Please log in again.');
            navigate('/signin');
            return;
          }
          const message = `HTTP error! status: ${response.status}`;
          throw new Error(message);
        }
        const data = await response.json();
        setArticle(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.error || `Failed to delete article: ${response.status}`);
        return;
      }

      navigate('/'); // Corrected redirection: back to the main menu
    } catch (error) {
      console.error('Error deleting article:', error);
      setError('Failed to delete article. Please try again.');
    }
  };

  if (loading) {
    return <p className={`italic text-${loadingTextColor}`}>Loading article details...</p>;
  }

  if (error) {
    return <p className={`text-${errorTextColor}`}>Error loading article: {error}</p>;
  }

  if (!article) {
    return <p className={`italic text-${loadingTextColor}`}>Article not found.</p>;
  }

  return (
    <div className={`mt-8 w-full bg-${backgroundColor} ${backgroundOpacity} rounded-md shadow-md p-6 border border-${borderColor}`}>
      <h2 className={`text-xl font-semibold text-${titleColor} mb-4`}>{article.title}</h2>
      <p className={`text-${textColor} leading-relaxed`}>{article.content}</p>
      <p className={`mt-4 text-${createdTextColor}`}>Created At: {new Date(article.createdAt).toLocaleDateString()}</p>
      <button
        onClick={handleDelete}
        className={`mt-6 bg-${deleteButtonColor} hover:bg-${deleteButtonHoverColor} text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-${deleteButtonColor}-500`}
      >
        Delete Article
      </button>
    </div>
  );
}

export default ArticleDetail;