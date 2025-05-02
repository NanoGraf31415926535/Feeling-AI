import React from 'react';

 function MessageBubble({ message, isEditing, editText, onEditChange, onSaveEdit, onCancelEdit, onEdit }) {
     return (
         <div className={`inline-block rounded-lg py-2 px-3 ${message.sender === 'user' ? 'bg-purple-600 bg-opacity-80 text-white' : 'bg-gray-800 bg-opacity-80 text-cyan-300'} shadow-md`}>
             {isEditing ? (
                 <div>
                     <input
                         type="text"
                         className="bg-gray-700 bg-opacity-70 border rounded py-1 px-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                         value={editText}
                         onChange={onEditChange}
                         onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(message.id)}
                     />
                     <div className="mt-1 space-x-2">
                         <button onClick={() => onSaveEdit(message.id)} className="bg-purple-500 hover:bg-purple-700 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400">Save</button>
                         <button onClick={onCancelEdit} className="bg-gray-600 bg-opacity-70 hover:bg-gray-700 text-gray-300 text-xs font-bold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-600">Cancel</button>
                     </div>
                 </div>
             ) : (
                 <div>
                     <p className="text-sm break-words">{message.text}</p>
                     <div className="flex items-center justify-between text-xs mt-1">
                         <span className="text-gray-500">{message.timestamp}</span>
                         {message.sender === 'user' && (
                             <button onClick={() => onEdit(message.id, message.text)} className="text-gray-500 hover:text-gray-400 focus:outline-none">Edit</button>
                         )}
                     </div>
                 </div>
             )}
         </div>
     );
 }

 export default MessageBubble;