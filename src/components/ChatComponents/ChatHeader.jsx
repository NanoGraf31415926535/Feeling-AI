import React from 'react';
import { FiSend, FiTrash2, FiArchive } from 'react-icons/fi';
import config from '/src/config/config.json';

 function ChatHeader({ onBack, onOpenHistory, previousChatsCount, onSaveConversation, onClearChat }) {
     return (
         <div className="bg-gray-800 bg-opacity-70 p-4 shadow-md border-b border-gray-700 flex items-center justify-between">
             <button onClick={onBack} className="text-gray-400 hover:text-gray-300 focus:outline-none" aria-label={config.locales.backButtonLabel}>
                 &lt;
             </button>
             <div className="flex items-center space-x-2">
                 <button onClick={onOpenHistory} className="text-blue-400 hover:text-blue-300 focus:outline-none relative">
                     <FiArchive className="h-5 w-5" />
                     {previousChatsCount > 0 && (
                         <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white text-xs rounded-full px-1">
                             {previousChatsCount}
                         </span>
                     )}
                 </button>
                 <h1 className="text-xl font-semibold text-cyan-400">{config.locales.chatHeading}</h1>
             </div>
             <div className="flex items-center space-x-2">
                 <button onClick={onSaveConversation} className="text-green-500 hover:text-green-400 focus:outline-none">
                     {config.locales.headerSave}
                 </button>
                 <button onClick={onClearChat} className="text-red-500 hover:text-red-400 focus:outline-none" aria-label={config.locales.clearButtonLabel}>
                     <FiTrash2 className="h-5 w-5" />
                 </button>
             </div>
         </div>
     );
 }

 export default ChatHeader;