import React, { useState } from 'react';
import './ChatWindow.css';
import { GoogleGenerativeAI } from '@google/generative-ai';

const configuration = {
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta'
};

const genAI = new GoogleGenerativeAI(configuration.apiKey);

function ChatWindow() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            const userMessage = { text: input, sender: 'user' };
            setMessages(prev => [...prev, userMessage]);
            setInput('');
            setIsLoading(true);

            try {
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.0-pro",
                    generationConfig: {
                        temperature: 0.9,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2048,
                    },
                });

                const updatedHistory = [...chatHistory, userMessage];
                setChatHistory(updatedHistory);

                const systemPrompt = `You are a thoughtful Christmas Gift Advisor. Help users find perfect gifts based on their needs.

Language Rules:
- Simply respond in the same language as the user's message
- No need to indicate or mark which language you're using
- Just naturally match the user's language

Gift Recommendation Guide:
1. Ask about gift recipient (if not provided):
   - Relationship to user
   - Age range
   - Interests/hobbies
   - Budget range
2. Provide 2-3 specific gift suggestions with:
   - Item description
   - Why it's suitable
   - Estimated price range
   - Where to buy
3. Include creative and thoughtful options

Current conversation history:
${updatedHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

Remember: Respond naturally in the user's language without any language markers or tags.`;

                const result = await model.generateContent(systemPrompt);
                const response = await result.response;
                const text = response.text();

                const aiMessage = { text: text, sender: 'ai' };
                setMessages(prev => [...prev, aiMessage]);
                setChatHistory(prev => [...prev, aiMessage]);
            } catch (error) {
                console.error('Detailed Error:', error);
                setMessages(prev => [...prev, {
                    text: `哎呀，我正想怼你呢，系统出问题了... ${error.message}`,
                    sender: 'ai'
                }]);
            }

            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <span className="material-icons header-icon">card_giftcard</span>
                <h2>GiftMaster</h2>
                <p className="subtitle">Your Personal Christmas Gift Advisor</p>
            </div>
            <div className="chat-window">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender}`}>
                            <span className={`material-icons message-avatar ${message.sender}`}>
                                {message.sender === 'user' ? 'face' : 'sentiment_very_satisfied'}
                            </span>
                            <div className="message-content">
                                {message.text.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message ai loading">
                            <span className="material-icons message-avatar">card_giftcard</span>
                            <div className="message-content">
                                Finding the perfect gift for you...
                            </div>
                        </div>
                    )}
                </div>
                <div className="chat-input-container">
                    <form onSubmit={handleSubmit} className="chat-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tell me what kind of gift you're looking for..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Thinking...' : 'Send'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow; 