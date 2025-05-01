import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiTrash2, FiArchive, FiX } from 'react-icons/fi';
import config from '/src/config/config.json';
import { useNavigate } from 'react-router-dom';

// Placeholder for sentiment analysis function (I'll need to implement this)
const analyzeSentiment = async (text) => {
    const negativeKeywords = ['sad', 'upset', 'angry', 'frustrated', 'betrayed', 'depressed'];
    const positiveKeywords = ['happy', 'joyful', 'excited', 'good'];

    if (negativeKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return 'negative';
    } else if (positiveKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return 'positive';
    } else {
        return 'neutral';
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

    const handleSendMessage = async () => {
        if (inputText.trim()) {
            const userMessage = inputText;
            const timestamp = new Date().toLocaleTimeString();
            const newUserMessage = { id: Date.now(), sender: 'user', text: userMessage, timestamp };
            setConversation(prevConversation => [...prevConversation, newUserMessage]);
            setInputText('');
            setIsBotTyping(true);

            // --- Security Agent (First Pass) ---
            const securityAgentResponse = await interactWithSecurityAgent(userMessage);

            if (securityAgentResponse?.isDangerous) {
                const securityMessage = { id: Date.now(), sender: 'ai', text: config.locales.securityAlertMessage, timestamp: new Date().toLocaleTimeString() };
                setConversation(prevConversation => [...prevConversation, securityMessage]);
                setIsBotTyping(false);
                return;
            }

            // --- Brain Agent orchestrates the response ---
            const brainAgentResponse = await interactWithBrainAgent(userMessage, [...conversation, newUserMessage], userName);

            if (brainAgentResponse?.response?.text) {
                const aiMessage = brainAgentResponse.response.text;
                const aiTimestamp = new Date().toLocaleTimeString();
                const newAiMessage = { id: Date.now(), sender: 'ai', text: aiMessage, timestamp: aiTimestamp };
                setConversation(prevConversation => [...prevConversation, newAiMessage]);
            }

            // --- Summarizing Agent (can be called after the Brain Agent's response) ---
            const allMessagesForSummary = [...conversation, newUserMessage, ...(brainAgentResponse?.response?.text ? [{ sender: 'ai', text: brainAgentResponse.response.text }] : [])];
            const summarizingAgentResponse = await interactWithSummarizingAgent(allMessagesForSummary);
            if (summarizingAgentResponse?.summary) {
                console.log("Conversation Summary:", summarizingAgentResponse.summary);
            }

            setIsBotTyping(false);
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

    const handleEditMessage = (id, text) => {
        setEditingMessageId(id);
        setEditText(text);
    };

    const handleSaveEdit = (id) => {
        const updatedConversation = conversation.map(msg =>
            msg.id === id ? { ...msg, text: editText } : msg
        );
        setConversation(updatedConversation);
        setEditingMessageId(null);
        setEditText('');
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
            // --- Save to the journal database ---
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

    const TypingIndicator = () => (
        <div className="flex justify-start items-center">
            <div className="inline-block h-3 w-3 rounded-full bg-cyan-400 animate-bounce mr-1"></div>
            <div className="inline-block h-3 w-3 rounded-full bg-cyan-400 animate-bounce mr-1 delay-150"></div>
            <div className="inline-block h-3 w-3 rounded-full bg-cyan-400 animate-bounce delay-300"></div>
        </div>
    );

    const handleBackButton = () => {
        console.log("Navigating back to MainMenu...");
        navigate('/');
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-300 relative">
            {/* Disclaimer Pop-up */}
            {showDisclaimer && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20 flex justify-center items-center">
                    <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-lg p-8 text-center">
                        <h2 className="text-xl font-semibold text-yellow-400 mb-4">Important Information</h2>
                        <p className="text-gray-300 mb-6">{config.locales.aiDisclaimer}</p>
                        <button onClick={closeDisclaimer} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-400">
                            I Understand
                            </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gray-800 bg-opacity-70 p-4 shadow-md border-b border-gray-700 flex items-center justify-between">
                <button onClick={handleBackButton} className="text-gray-400 hover:text-gray-300 focus:outline-none" aria-label={config.locales.backButtonLabel}>
                    &lt;
                </button>
                <div className="flex items-center space-x-2">
                    <button onClick={handleOpenHistory} className="text-blue-400 hover:text-blue-300 focus:outline-none relative">
                        <FiArchive className="h-5 w-5" />
                        {previousChats.length > 0 && (
                            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white text-xs rounded-full px-1">
                                {previousChats.length}
                            </span>
                        )}
                    </button>
                    <h1 className="text-xl font-semibold text-cyan-400">{config.locales.chatHeading}</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleSaveConversation} className="text-green-500 hover:text-green-400 focus:outline-none">
                        {config.locales.headerSave}
                    </button>
                    <button onClick={handleClearChat} className="text-red-500 hover:text-red-400 focus:outline-none" aria-label={config.locales.clearButtonLabel}>
                        <FiTrash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Conversation History Menu */}
            {isHistoryOpen && (
                <div className="absolute top-16 left-4 bg-gray-800 bg-opacity-95 rounded-md shadow-lg z-10 w-56 overflow-y-auto max-h-64">
                    <h3 className="p-3 text-lg font-semibold text-blue-300 border-b border-gray-700">
                        {config.locales.chatHistoryHeading}
                    </h3>
                    {previousChats.length > 0 ? (
                        previousChats.map((chat) => (
                            <div key={chat.timestamp} className="relative">
                                <button
                                    onClick={() => handleLoadChat(chat)}
                                    className="block w-full text-left p-3 hover:bg-gray-700 text-gray-400 border-b border-gray-700 last:border-b-0 transition duration-200 ease-in-out"
                                >
                                    {chat.name || new Date(chat.timestamp).toLocaleString()}
                                    {chat.name && <span className="text-xs text-gray-500 italic ml-1">({new Date(chat.timestamp).toLocaleDateString()})</span>}
                                </button>
                                <button
                                    onClick={() => handleDeleteChat(chat.id)}
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
                </div>
            )}

            {/* Conversation Area */}
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4">
                <div className="space-y-3">
                    {conversation.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
                            {editingMessageId === message.id ? (
                                <div className="inline-block rounded-lg py-2 px-3 bg-gray-800 bg-opacity-80 text-gray-300 border border-blue-500">
                                    <input
                                        type="text"
                                        className="bg-gray-700 bg-opacity-70 border rounded py-1 px-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(message.id)}
                                    />
                                    <div className="mt-1 space-x-2">
                                        <button onClick={() => handleSaveEdit(message.id)} className="bg-purple-500 hover:bg-purple-700 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400">{config.locales.saveEditButton}</button>
                                        <button onClick={handleCancelEdit} className="bg-gray-600 bg-opacity-70 hover:bg-gray-700 text-gray-300 text-xs font-bold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-600">{config.locales.cancelEditButton}</button>
                                    </div>
                                </div>
                            ) : (
                                <div className={`inline-block rounded-lg py-2 px-3 ${message.sender === 'user' ? 'bg-purple-600 bg-opacity-80 text-white' : 'bg-gray-800 bg-opacity-80 text-cyan-300'} shadow-md`}>
                                    <p className="text-sm break-words">{message.text}</p>
                                    <div className="flex items-center justify-between text-xs mt-1">
                                        <span className="text-gray-500">{message.timestamp}</span>
                                        {message.sender === 'user' && (
                                            <button onClick={() => handleEditMessage(message.id, message.text)} className="text-gray-500 hover:text-gray-400 focus:outline-none">{config.locales.editButton}</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {isBotTyping && <TypingIndicator />}
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-gray-800 bg-opacity-70 p-4 border-t border-gray-700">
                <div className="flex items-center">
                    <input
                        type="text"
                        className="flex-grow bg-gray-700 bg-opacity-70 border rounded-full py-2.5 px-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder={config.locales.inputPlaceholder}
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                        className="ml-3 bg-purple-500 hover:bg-purple-700 text-white font-bold rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        onClick={handleSendMessage}
                    >
                        <FiSend className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;