import React from 'react';

 function TypingIndicator() {
     return (
         <div className="flex justify-start items-center">
             <div className="inline-block h-3 w-3 rounded-full bg-cyan-400 animate-bounce mr-1"></div>
             <div className="inline-block h-3 w-3 rounded-full bg-cyan-400 animate-bounce mr-1 delay-150"></div>
             <div className="inline-block h-3 w-3 rounded-full bg-cyan-400 animate-bounce delay-300"></div>
         </div>
     );
 }

 export default TypingIndicator;