import React from 'react';
import { FiSend } from 'react-icons/fi';
import config from '/src/config/config.json';

 function ChatInput({ inputText, onInputChange, onSendMessage }) {
     return (
         <div className="bg-gray-800 bg-opacity-70 p-4 border-t border-gray-700">
             <div className="flex items-center">
                 <input
                     type="text"
                     className="flex-grow bg-gray-700 bg-opacity-70 border rounded-full py-2.5 px-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                     placeholder={config.locales.inputPlaceholder}
                     value={inputText}
                     onChange={onInputChange}
                     onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                 />
                 <button
                     className="ml-3 bg-purple-500 hover:bg-purple-700 text-white font-bold rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                     onClick={onSendMessage}
                 >
                     <FiSend className="h-5 w-5" />
                 </button>
             </div>
         </div>
     );
 }

 export default ChatInput;