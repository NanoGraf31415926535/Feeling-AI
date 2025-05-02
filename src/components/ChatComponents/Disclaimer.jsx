import React from 'react';
import config from '/src/config/config.json';

 function Disclaimer({ onClose }) {
     return (
         <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20 flex justify-center items-center">
             <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-lg p-8 text-center">
                 <h2 className="text-xl font-semibold text-yellow-400 mb-4">Important Information</h2>
                 <p className="text-gray-300 mb-6">{config.locales.aiDisclaimer}</p>
                 <button onClick={onClose} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-400">
                     I Understand
                 </button>
             </div>
         </div>
     );
 }

 export default Disclaimer;