import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '/src/contexts/AuthContext.jsx'; // Adjust the path if necessary

function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { signOut } = useAuth(); // Get the signOut function from the AuthContext

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken'); 

        const response = await fetch('http://localhost:5001/api/articles', { 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('Unauthorized access. Please log in again.');
            return;
          }
          const message = `An error occurred: ${response.status}`;
          throw new Error(message);
        }

        const data = await response.json();
        setArticles(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, [signOut]); // Include signOut in the dependency array in case it changes (though unlikely)

  const handleLogoutFromError = () => {
    signOut(); // Call the signOut function from the AuthContext
  };

  if (loading) {
    return <p className="text-gray-400 italic">Loading articles...</p>;
  }

  if (error) {
    return (
      <div className="mt-8 w-full text-red-500">
        <h2 className="text-xl font-semibold text-teal-400 mb-4">Latest Articles</h2>
        <p>Error fetching articles: {error.message}</p>
        {error === 'Unauthorized access. Please log in again.' && (
          <button
            onClick={handleLogoutFromError}
            className="inline-block mt-2 text-blue-400 hover:text-blue-300 transition duration-200"
          >
            Sign Out
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 w-full">
      <h2 className="text-xl font-semibold text-teal-400 mb-4">Latest Articles</h2>
      {articles.length > 0 ? (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li
              key={article.id}
              className="bg-gray-800 bg-opacity-75 rounded-md shadow-md p-4 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">{article.title}</h3>
              <p className="text-gray-300 text-sm">
                {article.summary || (article.content?.length > 150 ? article.content.substring(0, 150) + '...' : article.content)}
              </p>
              <Link
                to={`/article/${article.id}`}
                className="inline-block mt-2 text-blue-400 hover:text-blue-300 transition duration-200"
              >
                Read More
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 italic">No articles available yet.</p>
      )}
    </div>
  );
}

export default Articles;