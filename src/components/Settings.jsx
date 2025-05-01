import React, { useState, useEffect, useCallback, useContext } from 'react';
import { BiUser, BiMoon, BiSun, BiBell, BiGlobe, BiPalette, BiCog, BiInfoCircle, BiTrash } from 'react-icons/bi';
import { FaTextHeight, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; // Adjust path if needed

function Settings() {
  const [displayName, setDisplayName] = useState('');
  const [theme, setTheme] = useState('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [fontSize, setFontSize] = useState('medium');
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useContext(AuthContext); // Get user and signOut from context

  const fetchUserSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDisplayName(data.displayName || user?.username || '');
        setTheme(data.theme || 'dark');
        setNotificationsEnabled(data.notificationsEnabled !== undefined ? data.notificationsEnabled : true);
        setPreferredLanguage(data.preferredLanguage || 'en');
        setFontSize(data.fontSize || 'medium');
      } else {
        console.error('Failed to fetch user settings:', response.status);
        // Optionally handle error (e.g., display a message to the user)
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
      // Optionally handle error (e.g., display a message to the user)
    }
  }, [user?.username]);

  const saveUserSettings = useCallback(async (settings) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        console.log('User settings saved successfully');
        // Optionally display a success message to the user
      } else {
        console.error('Failed to save user settings:', response.status);
        // Optionally handle error (e.g., display an error message to the user)
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
      // Optionally handle error (e.g., display an error message to the user)
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Account deleted successfully');
        await signOut(); // Sign out after successful deletion
        navigate('/register'); // Redirect to registration page (or wherever appropriate)
      } else {
        console.error('Failed to delete account:', response.status);
        // Optionally display an error message to the user
      }
      setDeleteAccountConfirmation(false); // Reset confirmation state
    } catch (error) {
      console.error('Error deleting account:', error);
      // Optionally display an error message to the user
      setDeleteAccountConfirmation(false); // Reset confirmation state
    }
  }, [navigate, signOut]);

  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = getFontSizeValue(fontSize);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const handleDisplayNameChange = (event) => {
    setDisplayName(event.target.value);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleLanguageChange = (event) => {
    setPreferredLanguage(event.target.value);
  };

  const handleFontSizeChange = (event) => {
    setFontSize(event.target.value);
  };

  const handleSave = () => {
    const settingsToSave = {
      displayName,
      theme,
      notificationsEnabled,
      preferredLanguage,
      fontSize,
    };
    saveUserSettings(settingsToSave);
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleDeleteAccountClick = () => {
    setDeleteAccountConfirmation(true);
  };

  const handleConfirmDeleteAccount = () => {
    deleteAccount();
  };

  const handleCancelDeleteAccount = () => {
    setDeleteAccountConfirmation(false);
  };

  const getFontSizeValue = (size) => {
    switch (size) {
      case 'small':
        return '0.9em';
      case 'large':
        return '1.1em';
      default:
        return '1em';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400">Settings</h2>
        <button onClick={handleGoBack} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Back
        </button>
      </div>

      {/* Account Settings */}
      <div className="mb-6 bg-gray-800 rounded-md p-4">
        <h3 className="text-lg font-semibold text-gray-400 mb-2 flex items-center">
          <BiUser className="mr-2" /> Account
        </h3>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="displayName" className="text-gray-300">
            Display Name:
          </label>
          <input
            type="text"
            id="displayName"
            className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700"
            value={displayName}
            onChange={handleDisplayNameChange}
            placeholder={user?.username}
          />
        </div>
        <div className="mt-4">
          <button
            onClick={handleDeleteAccountClick}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <BiTrash className="inline-block mr-1" /> Delete Account
          </button>
        </div>

        {/* Delete Account Confirmation Modal */}
        {deleteAccountConfirmation && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-md p-6 max-w-md w-full relative">
              <h3 className="text-xl font-bold text-red-400 mb-4">Confirm Delete Account</h3>
              <p className="text-gray-400 mb-4">Are you sure you want to permanently delete your account? This action cannot be undone.</p>
              <div className="flex justify-end space-x-2">
                <button onClick={handleCancelDeleteAccount} className="bg-gray-500 hover:bg-gray-400 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Cancel
                </button>
                <button onClick={handleConfirmDeleteAccount} className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appearance Settings */}
      <div className="mb-6 bg-gray-800 rounded-md p-4">
        <h3 className="text-lg font-semibold text-gray-400 mb-2 flex items-center">
          <BiPalette className="mr-2" /> Appearance
        </h3>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-gray-300">Theme:</label>
          <button
            onClick={toggleTheme}
            className={`bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${theme === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800'}`}
          >
            {theme === 'dark' ? <BiMoon className="inline-block mr-1" /> : <BiSun className="inline-block mr-1" />}
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="fontSize" className="text-gray-300 flex items-center">
            <FaTextHeight className="mr-2" /> Font Size:
          </label>
          <select
            id="fontSize"
            className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700"
            value={fontSize}
            onChange={handleFontSizeChange}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      {/* Preferences */}
      <div className="mb-6 bg-gray-800 rounded-md p-4">
        <h3 className="text-lg font-semibold text-gray-400 mb-2 flex items-center">
          <BiCog className="mr-2" /> Preferences
        </h3>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-gray-300 flex items-center">
            <BiBell className="mr-2" /> Notifications:
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded border-gray-600 bg-gray-700"
              checked={notificationsEnabled}
              onChange={toggleNotifications}
            />
          </label>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="language" className="text-gray-300 flex items-center">
            <BiGlobe className="mr-2" /> Language:
          </label>
          <select
            id="language"
            className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700"
            value={preferredLanguage}
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="de">German</option>
            <option value="es">Ukrainian</option>
          </select>
        </div>
        {/* Add more preference settings here if needed */}
      </div>

      {/* Privacy */}
      <div className="mb-6 bg-gray-800 rounded-md p-4">
        <h3 className="text-lg font-semibold text-gray-400 mb-2 flex items-center">
          <FaShieldAlt className="mr-2" /> Privacy
        </h3>
        <p className="text-gray-500 mb-2">Here you can manage your privacy settings.</p>
        {/* Add specific privacy settings controls here */}
        <div className="mb-2 flex items-center justify-between">
          <label className="text-gray-300">Data Sharing:</label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded border-gray-600 bg-gray-700"
              // Add state and handler for this setting if needed
            />
            <span className="ml-2 text-gray-400">Enabled</span>
          </label>
        </div>
        {/* Add more privacy options */}
      </div>

      {/* About */}
      <div className="mb-6 bg-gray-800 rounded-md p-4">
        <h3 className="text-lg font-semibold text-gray-400 mb-2 flex items-center">
          <BiInfoCircle className="mr-2" /> About
        </h3>
        <p className="text-gray-500 mb-2">Feeling AI Platform v1.0</p>
        <p className="text-gray-500 mb-2">Developed with ❤️ by Your Team.</p>
        <p className="text-gray-500">For support, please visit our website.</p>
        {/* Add more information about the platform */}
      </div>

      <button onClick={handleSave} className="bg-purple-500 hover:bg-purple-400 text-white font-semibold py-3 px-6 rounded-md focus:outline-none focus:shadow-outline">
        Save Settings
      </button>
    </div>
  );
}

export default Settings;