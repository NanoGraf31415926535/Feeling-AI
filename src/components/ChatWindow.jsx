import React, { useState, useEffect, useRef } from 'react';
import config from '/src/config/config.json';
import { useNavigate } from 'react-router-dom';
import Disclaimer from '/src/components/ChatComponents/Disclaimer';
import ChatHeader from '/src/components/ChatComponents/ChatHeader.jsx';
import ChatHistoryMenu from '/src/components/ChatComponents/ChatHistoryMenu';
import MessageBubble from '/src/components/ChatComponents/MessageBubble';
import TypingIndicator from '/src/components/ChatComponents/TypingIndicator';
import ChatInput from '/src/components/ChatComponents/ChatInput';

 const analyzeSentiment = async (text) => {
     try {
         const prompt = `Analyze the sentiment of the following text and return only one word: 'positive', 'negative', or 'neutral'. Text: "${text}"`;
         const response = await puter.ai.chat(prompt);
         const sentiment = response?.message?.content?.toLowerCase()?.trim();

         if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
             return sentiment;
         } else {
             console.warn('Unexpected sentiment analysis response:', response);
             return 'neutral';
         }
     } catch (error) {
         console.error('Error during sentiment analysis with puter.ai:', error);
         return 'neutral';
     }
 };

 const interactWithMoodBoosterAgent = async (lastUserMessage) => {
     try {
         const prompt = config.ai.moodBoosterAgentPrompt.replace('{{userMessage}}', lastUserMessage);
         const response = await puter.ai.chat(prompt);
         return { response: response?.message?.content };
     } catch (error) {
         console.error('Error in mood booster agent:', error);
         return { response: "Here's a little something: Why don't scientists trust atoms? Because they make up everything!" };
     }
 };

 const interactWithBrainAgent = async (userMessage, conversationHistory, userName) => {
     try {
         const sentiment = await analyzeSentiment(userMessage);
         const lastUserMessage = conversationHistory[conversationHistory.length - 1]?.text || "";
         const context = JSON.stringify(conversationHistory.slice(-5));

         const brainPrompt = config.ai.brainAgentPrompt
             .replace('{{userMessage}}', userMessage)
             .replace('{{conversationHistory}}', context)
             .replace('{{userName}}', userName || '')
             .replace('{{sentiment}}', sentiment);

         const brainResponse = await puter.ai.chat(brainPrompt);
         const instructions = JSON.parse(brainResponse?.message?.content || '{}');
         const agentResponses = [];

         if (instructions.agentsToCall) {
             for (const agent of instructions.agentsToCall) {
                 switch (agent) {
                     case 'empathy':
                         const empathyResult = await interactWithEmpathyAgent(userMessage);
                         if (empathyResult?.response) agentResponses.push({ text: empathyResult.response, source: 'empathy' });
                         break;
                     case 'encouragement':
                         const encouragementResult = await interactWithEncouragementAgent(userMessage);
                         if (encouragementResult?.response) agentResponses.push({ text: encouragementResult.response, source: 'encouragement' });
                         break;
                     case 'deepDive':
                         const deepDiveResult = await interactWithDeepDiveAgent(userMessage, conversationHistory, userName);
                         if (deepDiveResult?.response) agentResponses.push({ text: deepDiveResult.response, source: 'deepDive' });
                         break;
                     case 'moodBooster':
                         const moodBoosterResult = await interactWithMoodBoosterAgent(lastUserMessage);
                         if (moodBoosterResult?.response) agentResponses.push({ text: moodBoosterResult.response, source: 'moodBooster' });
                         break;
                     case 'probing':
                         const probingResult = await interactWithProbingAgent(userMessage, conversationHistory, userName);
                         if (probingResult?.response) agentResponses.push({ text: probingResult.response, source: 'probing' });
                         break;
                     default:
                         console.warn(`Unknown agent requested by Brain Agent: ${agent}`);
                 }
             }
         }

         const combinedResponse = agentResponses.map(res => res.text).join('\n');
         return { response: { text: combinedResponse } };

     } catch (error) {
         console.error('Error in brain agent:', error);
         return { response: { text: "I'm having trouble processing that right now." } };
     }
 };

 const interactWithProbingAgent = async (userMessage, conversation, userName) => {
     try {
         const promptTemplate = userName ? config.ai.probingAgentPrompt.withUserName : config.ai.probingAgentPrompt.withoutUserName;
         const prompt = promptTemplate
             .replace('{{userName}}', userName || '')
             .replace('{{userMessage}}', userMessage)
             .replace('{{conversation}}', JSON.stringify(conversation.slice(-5)));
         const response = await puter.ai.chat(prompt);
         return { response: response?.message?.content };
     } catch (error) {
         console.error('Error in probing agent:', error);
         return { response: "What are your thoughts on that?" };
     }
 };

 const interactWithSecurityAgent = async (userMessage) => {
     try {
         const prompt = config.ai.securityAgentPrompt.replace('{{userMessage}}', userMessage);
         const response = await puter.ai.chat(prompt);
         const aiResponse = response?.message?.content?.toUpperCase()?.trim();

         if (aiResponse === 'DANGER') {
             return { isDangerous: true };
         } else if (aiResponse === 'SAFE') {
             return { isDangerous: false };
         } else {
             console.warn("Unexpected response from security agent:", aiResponse);
             return { isDangerous: false };
         }
     } catch (error) {
         console.error('Error in security agent:', error);
         return { isDangerous: false };
     }
 };

 const interactWithEmpathyAgent = async (userMessage) => {
     try {
         const prompt = config.ai.empathyAgentPrompt.replace('{{userMessage}}', userMessage);
         const response = await puter.ai.chat(prompt);
         return { response: response?.message?.content };
     } catch (error) {
         console.error('Error in empathy agent:', error);
         return { response: "I hear you." };
     }
 };

 const interactWithEncouragementAgent = async (userMessage) => {
     try {
         const prompt = config.ai.encouragementAgentPrompt.replace('{{userMessage}}', userMessage);
         const response = await puter.ai.chat(prompt);
         return { response: response?.message?.content };
     } catch (error) {
         console.error('Error in encouragement agent:', error);
         return { response: "Keep going, you're doing great." };
     }
 };

 const interactWithDeepDiveAgent = async (userMessage, conversationHistory, userName) => {
     try {
         const prompt = config.ai.deepDiveAgentPrompt
             .replace('{{userMessage}}', userMessage)
             .replace('{{conversationHistory}}', JSON.stringify(conversationHistory.slice(-5)))
             .replace('{{userName}}', userName || '');
         const response = await puter.ai.chat(prompt);
         return { response: response?.message?.content };
     } catch (error) {
         console.error('Error in deep dive agent:', error);
         return { response: "What makes you say that?" };
     }
 };

 const interactWithSummarizingAgent = async (allMessages) => {
     try {
         const messagesText = allMessages.map(msg => `${msg.sender}: ${msg.text}`).join("\n");
         const prompt = config.ai.summarizingAgentPrompt.replace('{{messagesText}}', messagesText);
         const response = await puter.ai.chat(prompt);
         return { summary: response?.message?.content };
     } catch (error) {
         console.error('Error in summarizing agent:', error);
         return { summary: "Sorry, I'm having trouble summarizing right now." };
     }
 };

 function ChatWindow() {
     const [inputText, setInputText] = useState('');
     const [conversation, setConversation] = useState([]);
     const [conversationStage, setConversationStage] = useState(0);
     const [userName, setUserName] = useState('');
     const [editingMessageId, setEditingMessageId] = useState(null);
     const [editText, setEditText] = useState('');
     const [isBotTyping, setIsBotTyping] = useState(false);
     const [isHistoryOpen, setIsHistoryOpen] = useState(false);
     const [previousChats, setPreviousChats] = useState([]);
     const chatContainerRef = useRef(null);
     const [showDisclaimer, setShowDisclaimer] = useState(true);
     const navigate = useNavigate();

     useEffect(() => {
         if (chatContainerRef.current) {
             chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
         }
         if (conversation.length === 0) {
             setConversation([{ id: Date.now(), sender: 'ai', text: config.locales.welcomeMessage, timestamp: new Date().toLocaleTimeString() }]);
         }
     }, [conversation, isBotTyping]);

     const handleInputChange = (event) => {
         setInputText(event.target.value);
     };

     const handleSendMessage = async () => {
        if (inputText.trim()) {
            const userMessage = inputText;
            const timestamp = new Date().toLocaleTimeString();
            const newUserMessage = { id: Date.now(), sender: 'user', text: userMessage, timestamp };
            setConversation(prevConversation => [...prevConversation, newUserMessage]);
            setInputText('');
            setIsBotTyping(true);
   
            try {
                const securityAgentResponse = await interactWithSecurityAgent(userMessage);
   
                if (securityAgentResponse?.isDangerous) {
                    const securityMessage = { id: Date.now(), sender: 'ai', text: config.locales.securityAlertMessage, timestamp: new Date().toLocaleTimeString() };
                    setConversation(prevConversation => [...prevConversation, securityMessage]);
                    return;
                }
   
                const brainAgentResponse = await interactWithBrainAgent(userMessage, [...conversation, newUserMessage], userName);
   
                if (brainAgentResponse?.response?.text) {
                    const aiMessage = brainAgentResponse.response.text;
                    const aiTimestamp = new Date().toLocaleTimeString();
                    const newAiMessage = { id: Date.now(), sender: 'ai', text: aiMessage, timestamp: aiTimestamp };
                    setConversation(prevConversation => [...prevConversation, newAiMessage]);
                }
   
                const allMessagesForSummary = [...conversation, newUserMessage, ...(brainAgentResponse?.response?.text ? [{ sender: 'ai', text: brainAgentResponse.response.text }] : [])];
                const summarizingAgentResponse = await interactWithSummarizingAgent(allMessagesForSummary);
                if (summarizingAgentResponse?.summary) {
                    console.log("Conversation Summary:", summarizingAgentResponse.summary);
                }
            } catch (error) {
                console.error("Error during send message processing:", error);
            } finally {
                setIsBotTyping(false);
            }
        }
    };

     const handleEditMessage = (id, text) => {
         setEditingMessageId(id);
         setEditText(text);
     };

     const handleSaveEdit = async (id) => {
        const updatedConversation = conversation.map(msg => {
            if (msg.id === id && msg.sender === 'user') {
                return { ...msg, text: editText, isEdited: true };
            }
            return msg;
        });
        setConversation(updatedConversation);
        setEditingMessageId(null);
        setEditText('');
        setIsBotTyping(true);
   
        try {
            const latestAiMessageIndex = updatedConversation.slice().reverse().findIndex(msg => msg.sender === 'ai');
   
            if (latestAiMessageIndex !== -1) {
                const indexFromEnd = updatedConversation.length - 1 - latestAiMessageIndex;
                const currentConversation = updatedConversation.slice(0, indexFromEnd);
   
                const brainAgentResponse = await interactWithBrainAgent(
                    updatedConversation.find(msg => msg.id === id).text,
                    currentConversation,
                    userName
                );
   
                if (brainAgentResponse?.response?.text) {
                    const aiMessage = brainAgentResponse.response.text;
                    const aiTimestamp = new Date().toLocaleTimeString();
                    const newAiMessage = { id: Date.now(), sender: 'ai', text: aiMessage, timestamp: aiTimestamp, isRegenerated: true };
                    const newConversation = [...currentConversation, newAiMessage];
                    setConversation(newConversation);
                }
            }
        } catch (error) {
            console.error("Error during edit save processing:", error);
        } finally {
            setIsBotTyping(false);
        }
    };

     const handleCancelEdit = () => {
         setEditingMessageId(null);
         setEditText('');
     };

     const handleClearChat = () => {
         setConversation([]);
         setConversationStage(0);
         setUserName('');
     };

     const handleSaveConversation = () => {
         const name = prompt(config.locales.saveConversationPrompt);
         if (name) {
             const timestamp = new Date().toLocaleString();
             const conversationData = {
                 name,
                 timestamp,
                 conversation: conversation,
                 conversationStage: conversationStage,
                 userName: userName
             };

             const token = localStorage.getItem('authToken');
             fetch('http://localhost:5001/api/journal', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${token}`,
                 },
                 body: JSON.stringify({
                     text: JSON.stringify(conversationData),
                     tags: ['chat_history']
                 }),
             })
             .then(response => {
                 if (!response.ok) {
                     console.error('Failed to save conversation to journal database:', response.status);
                 } else {
                     console.log('Conversation saved to journal database.');
                 }
             })
             .catch(error => {
                 console.error('Error saving conversation to journal database:', error);
             });
         }
     };

     const handleOpenHistory = () => {
         setIsHistoryOpen(true);
         const token = localStorage.getItem('authToken');
         fetch('http://localhost:5001/api/journal', {
             method: 'GET',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`,
             },
         })
         .then(response => {
             if (!response.ok) {
                 console.error('Failed to retrieve journal entries:', response.status);
                 return [];
             }
             return response.json();
         })
         .then(data => {
             const chatHistoriesFromDb = data
                 .filter(entry => entry.tags && entry.tags.includes('chat_history'))
                 .map(entry => {
                     try {
                         const conversationData = JSON.parse(entry.text);
                         return { ...conversationData, id: entry.id };
                     } catch (error) {
                         console.error('Error parsing chat history from database:', entry.id, error);
                         return null;
                     }
                 })
                 .filter(Boolean);

             setPreviousChats(chatHistoriesFromDb);
         })
         .catch(error => {
             console.error('Error fetching journal entries:', error);
             setPreviousChats([]);
         });
     };

     const handleLoadChat = (chat) => {
         setConversation(chat.conversation);
         setConversationStage(chat.conversationStage);
         setUserName(chat.userName);
         setIsHistoryOpen(false);
     };

     const handleDeleteChat = (chatId) => {
         const token = localStorage.getItem('authToken');
         fetch(`http://localhost:5001/api/journal/${chatId}`, {
             method: 'DELETE',
             headers: {
                 'Authorization': `Bearer ${token}`,
             },
         })
         .then(response => {
             if (!response.ok) {
                 console.error(`Failed to delete chat history with ID ${chatId} from database:`, response.status);
             } else {
                 console.log(`Chat history with ID ${chatId} deleted from database.`);
                 handleOpenHistory();
             }
         })
         .catch(error => {
             console.error(`Error deleting chat history with ID ${chatId} from database:`, error);
         });
     };

     const closeDisclaimer = () => {
         setShowDisclaimer(false);
     };

     const handleBackButton = () => {
         console.log("Navigating back to MainMenu...");
         navigate('/');
     };

     return (
         <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-300 relative">
             {showDisclaimer && <Disclaimer onClose={closeDisclaimer} />}

             <ChatHeader
                 onBack={handleBackButton}
                 onOpenHistory={handleOpenHistory}
                 previousChatsCount={previousChats.length}
                 onSaveConversation={handleSaveConversation}
                 onClearChat={handleClearChat}
             />

             <ChatHistoryMenu
                 isOpen={isHistoryOpen}
                 onClose={() => setIsHistoryOpen(false)}
                 previousChats={previousChats}
                 onLoadChat={handleLoadChat}
                 onDeleteChat={handleDeleteChat}
             />

             {/* Conversation Area */}
             <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4">
                 <div className="space-y-3">
                     {conversation.map((message) => (
                         <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
                             <MessageBubble
                                 message={message}
                                 isEditing={editingMessageId === message.id}
                                 editText={editText}
                                 onEditChange={(e) => setEditText(e.target.value)}
                                 onSaveEdit={handleSaveEdit}
                                 onCancelEdit={handleCancelEdit}
                                 onEdit={handleEditMessage}
                             />
                         </div>
                     ))}
                     {isBotTyping && <TypingIndicator />}
                 </div>
             </div>

             <ChatInput
                 inputText={inputText}
                 onInputChange={handleInputChange}
                 onSendMessage={handleSendMessage}
             />
         </div>
     );
 }

 export default ChatWindow;