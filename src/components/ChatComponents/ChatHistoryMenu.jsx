import React from 'react';
import { FiX } from 'react-icons/fi';
import config from '/src/config/config.json';

 function ChatHistoryMenu({ isOpen, onClose, previousChats, onLoadChat, onDeleteChat }) {
     if (!isOpen) {
         return null;
     }

     return (
         <div className="absolute top-16 left-4 bg-gray-800 bg-opacity-95 rounded-md shadow-lg z-10 w-56 overflow-y-auto max-h-64">
             <h3 className="p-3 text-lg font-semibold text-blue-300 border-b border-gray-700">
                 {config.locales.chatHistoryHeading}
             </h3>
             {previousChats.length > 0 ? (
                 previousChats.map((chat) => (
                     <div key={chat.timestamp} className="relative">
                         <button
                             onClick={() => onLoadChat(chat)}
                             className="block w-full text-left p-3 hover:bg-gray-700 text-gray-400 border-b border-gray-700 last:border-b-0 transition duration-200 ease-in-out"
                         >
                             {chat.name || new Date(chat.timestamp).toLocaleString()}
                             {chat.name && <span className="text-xs text-gray-500 italic ml-1">({new Date(chat.timestamp).toLocaleDateString()})</span>}
                         </button>
                         <button
                             onClick={() => onDeleteChat(chat.id)}
                             className="absolute top-1/2 right-2 -translate-y-1/2 text-red-500 hover:text-red-400 focus:outline-none"
                         >
                             <FiX className="h-4 w-4" />
                         </button>
                     </div>
                 ))
             ) : (
                 <div className="p-4 text-gray-500 italic">
                     {config.locales.noSavedChats}
                 </div>
             )}
             <button
                 onClick={onClose}
                 className="block w-full text-center p-3 hover:bg-gray-700 text-gray-400 border-t border-gray-700 transition duration-200 ease-in-out"
             >
                 {config.locales.closeButton}
             </button>
         </div>
     );
 }

 export default ChatHistoryMenu;