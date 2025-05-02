import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { BiPlus, BiSearch, BiCalendarAlt, BiTag, BiTrash, BiPencil } from 'react-icons/bi';

const Journal = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [entries, setEntries] = useState([]);
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryTags, setNewEntryTags] = useState(''); // New state for tags
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editText, setEditText] = useState('');
  const [editTags, setEditTags] = useState(''); // State for editing tags
  const [fetchError, setFetchError] = useState(null);
  const [addError, setAddError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/journal', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the JWT
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Filter out entries tagged as 'chat_history'
        const regularEntries = data.filter(entry => !(entry.tags && entry.tags.includes('chat_history')));
        setEntries(regularEntries);
      } else {
        console.error('Failed to fetch entries:', response.status);
        setFetchError(`Failed to fetch entries: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('There was an error fetching entries:', error);
      setFetchError('Network error while fetching entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    setFilteredEntries(
      entries.filter((entry) =>
        entry.text.toLowerCase().includes(searchText.toLowerCase()) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase())))
      )
    );
  }, [entries, searchText]);

  const handleTextChange = (event) => {
    setNewEntryText(event.target.value);
  };

  const handleAddEntry = async () => {
    if (newEntryText.trim()) {
      setAddError(null);
      const newEntry = {
        text: newEntryText,
        tags: newEntryTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        timestamp: new Date().toLocaleString(), // Backend will handle the actual timestamp
      };

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5001/api/journal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include the JWT
          },
          body: JSON.stringify(newEntry),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('New entry added:', data);
          fetchEntries();
          setNewEntryText('');
          setNewEntryTags('');
          setIsAddingNew(false);
        } else {
          console.error('Failed to add entry:', response.status);
          setAddError(`Failed to add entry: HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('There was an error adding the entry:', error);
        setAddError('Network error while adding entry.');
      }
    } else {
      setAddError('Entry text cannot be empty.');
    }
  };

  const handleDeleteEntry = async (id) => {
    setDeleteError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/journal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Include the JWT
        },
      });

      if (response.ok) {
        console.log(`Entry with ID ${id} deleted`);
        fetchEntries();
        setSelectedEntry(null);
        setEditingEntry(null);
      } else {
        console.error(`Failed to delete entry with ID ${id}:`, response.status);
        setDeleteError(`Failed to delete entry: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('There was an error deleting the entry:', error);
      setDeleteError('Network error while deleting entry.');
    }
  };

  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setEditText(entry.text);
    setEditTags(entry.tags ? entry.tags.join(', ') : ''); // Populate edit tags
    setSelectedEntry(null);
  };

  const handleEditInputChange = (event) => {
    setEditText(event.target.value);
  };

  const handleEditTagsChange = (event) => {
    setEditTags(event.target.value);
  };

  const handleSaveEdit = async (id) => {
    if (editText.trim()) {
      setUpdateError(null);
      const updatedEntry = {
        text: editText,
        tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      };
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5001/api/journal/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include the JWT
          },
          body: JSON.stringify(updatedEntry),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Entry with ID ${id} updated:`, data);
          fetchEntries();
          setEditingEntry(null);
          setEditText('');
          setEditTags('');
        } else {
          console.error(`Failed to update entry with ID ${id}:`, response.status);
          setUpdateError(`Failed to update entry: HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('There was an error updating the entry:', error);
        setUpdateError('Network error while updating entry.');
      }
    } else {
      setUpdateError('Edited text cannot be empty.');
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditText('');
    setEditTags('');
    setSelectedEntry(selectedEntry);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-4 flex flex-col">
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-purple-400">Journal</h2>
        <div>
          <button onClick={() => setIsAddingNew(true)} className="bg-green-500 hover:bg-green-400 text-white font-semibold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400">
            <BiPlus className="inline-block mr-1" /> New
          </button>
          <button onClick={handleGoBack} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Back
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-800 rounded-md p-2">
        <BiSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search entries or tags..."
          className="bg-gray-800 text-gray-300 w-full focus:outline-none"
          value={searchText}
          onChange={handleSearchChange}
        />
      </div>

      {/* New Entry Section (Conditional Rendering) */}
      {isAddingNew && (
        <div className="mb-4 bg-gray-800 rounded-md p-4">
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 mb-2"
            rows="5"
            placeholder="Write your new reflection here..."
            value={newEntryText}
            onChange={handleTextChange}
          />
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 mb-2"
            placeholder="Enter tags (comma-separated)"
            value={newEntryTags}
            onChange={(e) => setNewEntryTags(e.target.value)}
          />
          {addError && <p className="text-red-500 text-sm mb-2">{addError}</p>}
          <div className="flex justify-end">
            <button onClick={handleAddEntry} className="bg-purple-500 hover:bg-purple-400 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 mr-2">
              Save
            </button>
            <button onClick={() => setIsAddingNew(false)} className="bg-gray-500 hover:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Entry List */}
      <ul className="flex-grow overflow-y-auto space-y-2">
        {loading && <p className="text-gray-500 text-center mt-4">Loading entries...</p>}
        {fetchError && <p className="text-red-500 text-center mt-4">{fetchError}</p>}
        {!loading && filteredEntries.map((entry) => (
          <li
            key={entry.id}
            onClick={() => handleViewEntry(entry)}
            className={`bg-gray-800 rounded-md p-3 cursor-pointer hover:bg-gray-700 transition duration-200 ${selectedEntry?.id === entry.id ? 'ring-2 ring-purple-500' : ''}`}
          >
            <div className="flex justify-between items-center">
              <p className="text-gray-400 italic text-sm">{entry.timestamp}</p>
              <div className="space-x-2">
                {entry.tags && entry.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-purple-800 text-purple-300 rounded-full px-2 py-1 text-xs mr-1">
                    {tag}
                  </span>
                ))}
                <button onClick={(e) => { e.stopPropagation(); handleEditEntry(entry); }} className="text-blue-400 hover:text-blue-300 focus:outline-none">
                  <BiPencil className="h-5 w-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }} className="text-red-400 hover:text-red-300 focus:outline-none">
                  <BiTrash className="h-5 w-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-300 truncate">{entry.text}</p>
          </li>
        ))}
        {!loading && filteredEntries.length === 0 && !isAddingNew && !searchText && (
          <p className="text-gray-500 text-center mt-4">No entries yet. Click "New" to add one.</p>
        )}
        {!loading && filteredEntries.length === 0 && searchText && (
          <p className="text-gray-500 text-center mt-4">No entries found matching your search.</p>
        )}
      </ul>

      {/* Detailed Entry View / Edit Section (Conditional Rendering) */}
      {selectedEntry && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-90 flex items-center justify-center z-10">
          <div className="bg-gray-800 rounded-md p-6 max-w-md w-full relative">
            <h3 className="text-xl font-bold text-purple-400 mb-2">Reflection from {new Date(selectedEntry.timestamp).toLocaleString()}</h3>
            {selectedEntry.tags && selectedEntry.tags.map((tag, index) => (
              <span key={index} className="inline-block bg-purple-800 text-purple-300 rounded-full px-2 py-1 text-xs mr-1">
                {tag}
              </span>
            ))}
            <p className="text-gray-300 mb-4">{selectedEntry.text}</p>
            <div className="flex justify-end">
              <button onClick={() => setSelectedEntry(null)} className="bg-gray-500 hover:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingEntry && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-90 flex items-center justify-center z-10">
          <div className="bg-gray-800 rounded-md p-6 max-w-md w-full relative">
            <h3 className="text-xl font-bold text-blue-400 mb-2">Edit Reflection</h3>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 mb-2"
              rows="5"
              value={editText}
              onChange={handleEditInputChange}
            />
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 mb-2"
              placeholder="Edit tags (comma-separated)"
              value={editTags}
              onChange={handleEditTagsChange}
            />
            {updateError && <p className="text-red-500 text-sm mb-2">{updateError}</p>}
            <div className="flex justify-end">
              <button onClick={() => handleSaveEdit(editingEntry.id)} className="bg-green-500 hover:bg-green-400 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 mr-2">
                Save
              </button>
              <button onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="fixed bottom-4 right-4 bg-red-800 text-white p-3 rounded-md shadow-lg">
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-2">
            <BiTrash className="inline-block" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Journal;