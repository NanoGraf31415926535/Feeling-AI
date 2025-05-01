import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiChat, BiBook, BiCog, BiHeart, BiPlusCircle } from 'react-icons/bi'; // Import a plus icon
import { BiLogOut } from 'react-icons/bi';
import { AuthContext } from '/src/contexts/AuthContext.jsx';
import Articles from './Articles'; // Ensure this path is correct

const primaryColor = 'cyan';
const textColor = 'gray-300';
const backgroundColor = 'gray-800';
const backgroundOpacity = 'bg-opacity-75';
const borderColor = 'gray-700';
const titleColor = 'teal-400';
const accentTextColor = 'cyan-200';
const hoverEffect = 'hover:bg-gray-700';
const focusRingColor = 'focus:ring-cyan-500';

function MainMenu() {
  const { isAuthenticated, signOut, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    // navigate('/signin'); // signOut in AuthContext handles navigation
  };

  return (
    <div className={`min-h-screen bg-gray-900 text-${textColor} flex flex-col items-center p-6`}>
      <div className="absolute top-6 left-6">
        <h1 className={`text-2xl font-bold text-${titleColor} transform rotate-[-10deg] shadow-md`}>
          Feeling<span className="text-sm text-${accentTextColor} ml-1">AI</span>
        </h1>
      </div>

      {isAuthenticated && (
        <nav className={`${backgroundColor} ${backgroundOpacity} rounded-b-lg shadow-md w-full mb-4 border-b border-${borderColor}`}> {/* Reduced marginBottom */}
          <div className="flex justify-around items-center p-4">
            <Link
              to="/chat"
              className={`flex flex-col items-center text-${primaryColor}-300 hover:text-${accentTextColor} transition duration-200 focus:outline-none focus:ring-2 ${focusRingColor}`}
            >
              <BiChat className="h-6 w-6 mb-1" />
              <span className="text-sm font-semibold">Chat</span>
            </Link>
            <Link
              to="/journal"
              className={`flex flex-col items-center text-${primaryColor}-300 hover:text-${accentTextColor} transition duration-200 focus:outline-none focus:ring-2 ${focusRingColor}`}
            >
              <BiBook className="h-6 w-6 mb-1" />
              <span className="text-sm font-semibold">Journal</span>
            </Link>
            <Link
              to="/settings"
              className={`flex flex-col items-center text-${primaryColor}-300 hover:text-${accentTextColor} transition duration-200 focus:outline-none focus:ring-2 ${focusRingColor}`}
            >
              <BiCog className="h-6 w-6 mb-1" />
              <span className="text-sm font-semibold">Settings</span>
            </Link>
            <Link
              to="/support"
              className={`flex flex-col items-center text-${primaryColor}-300 hover:text-${accentTextColor} transition duration-200 focus:outline-none focus:ring-2 ${focusRingColor}`}
            >
              <BiHeart className="h-6 w-6 mb-1" />
              <span className="text-sm font-semibold">Support</span>
            </Link>
            <Link
              to="/create-article"
              className={`flex flex-col items-center text-green-400 hover:text-green-300 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <BiPlusCircle className="h-6 w-6 mb-1" />
              <span className="text-sm font-semibold">New Article</span>
            </Link>
            <button
              onClick={handleSignOut}
              className={`flex flex-col items-center text-red-400 hover:text-red-300 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500`}
            >
              <BiLogOut className="h-6 w-6 mb-1" />
              <span className="text-sm font-semibold">Sign Out</span>
            </button>
          </div>
        </nav>
      )}

      {isAuthenticated && <Articles />}

      {!isAuthenticated && (
        <div className="mt-8 space-y-3 w-full max-w-md">
          <Link
            to="/signin"
            className={`block ${backgroundColor} ${hoverEffect} text-${accentTextColor} py-3 px-6 rounded-md transition duration-200 focus:outline-none focus:ring-2 ${focusRingColor} font-semibold text-center`}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className={`block ${backgroundColor} ${hoverEffect} text-${accentTextColor} py-3 px-6 rounded-md transition duration-200 focus:outline-none focus:ring-2 ${focusRingColor} font-semibold text-center`}
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}

export default MainMenu;