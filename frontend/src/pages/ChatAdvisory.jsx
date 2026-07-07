import React, { useState, useRef, useEffect } from 'react';
import { Send, Sprout, User, ShieldAlert, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export default function ChatAdvisory() {
  const { fetchWithAuth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Predefined quick questions for organic mountain crops
  const promptChips = [
    "My Rajma leaves have brown circular spots. What should I do?",
    "Organic control for codling moth in Ramgarh apple orchards?",
    "How to prevent storage mold in Mandua (Finger Millet)?",
    "Traditional recipe for Dashaparni Ark bio-pest control."
  ];

  // Scroll to bottom of chat whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetchWithAuth('http://localhost:5000/api/chat/history');
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to load chat history:", errorData.detail);
        }
      } catch (err) {
        console.error("Network error loading chat history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadChatHistory();
  }, []);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input.trim();
    if (!text) return;

    if (!textToSend) {
      setInput('');
    }
    setError('');

    // Construct the new message
    const userMessage = { role: 'user', content: text };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Send chat history to backend API running on port 5000 with Auth
      const response = await fetchWithAuth('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedHistory }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply }
      ]);
    } catch (err) {
      console.error("Advisory Chat Error:", err);
      setError(err.message || "Failed to contact the advisory server. Ensure your backend server is running on port 5000 and configured.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  return (
    <div className="bg-cream min-h-[85vh] flex flex-col font-sans">
      {/* Toast Error Alert */}
      {error && <Toast message={error} onClose={() => setError('')} />}

      {/* Disclaimer Banner - REQUIRED */}
      <div className="bg-terracotta/15 border-b border-terracotta/30 text-charcoal py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-xs sm:text-sm font-medium">
          <AlertTriangle className="h-4.5 w-4.5 text-terracotta shrink-0" />
          <span className="text-center">
            <strong>AI guidance:</strong> Please verify with a licensed agricultural extension officer before acting on suggestions.
          </span>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col min-h-[500px]">
        {/* Main Header / Status */}
        <div className="flex items-center justify-between border-b border-pine/10 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 border border-pine/20 bg-cream-dark/50 text-pine">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-pine">Advisory Chat</h1>
              <p className="text-xs text-charcoal/60">Uttarakhand Mountain Crop Assistance</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs font-semibold text-charcoal/50 hover:text-terracotta transition-colors duration-200 flex items-center space-x-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Chat</span>
            </button>
          )}
        </div>

        {/* Chat Feed */}
        <div className="flex-grow border border-pine/15 bg-cream-dark/10 p-4 sm:p-6 min-h-[350px] max-h-[500px] overflow-y-auto flex flex-col space-y-4">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="my-auto text-center max-w-md mx-auto py-8">
              <Sparkles className="h-8 w-8 text-terracotta mx-auto mb-4" />
              <h3 className="font-serif font-bold text-lg text-pine mb-2">Welcome, Supervisor</h3>
              <p className="text-sm text-charcoal/70 leading-relaxed mb-6">
                Ask crop-specific queries in simple language (e.g. diagnosing apple rot, rajma pests, organic manures, or millet preservation).
              </p>
              
              {/* Prompt Suggestions */}
              <div className="text-left space-y-2">
                <span className="text-[11px] font-semibold text-charcoal/40 uppercase tracking-wider block mb-2">
                  Suggested Questions:
                </span>
                {promptChips.map((chip, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(chip)}
                    className="w-full text-left p-3 text-xs border border-pine/10 bg-cream/70 hover:border-terracotta hover:bg-cream transition-colors duration-200 block text-charcoal font-medium hover:text-pine"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 border relative ${
                      msg.role === 'user'
                        ? 'bg-pine text-cream border-pine/30'
                        : 'bg-cream border-pine/15 text-charcoal'
                    }`}
                  >
                    {/* Tiny avatar mark */}
                    <div className="flex items-center space-x-1.5 mb-2 border-b border-current/10 pb-1 text-[10px] font-semibold opacity-70">
                      {msg.role === 'user' ? (
                        <>
                          <User className="h-3 w-3" />
                          <span>Field Supervisor</span>
                        </>
                      ) : (
                        <>
                          <Sprout className="h-3 w-3 text-terracotta" />
                          <span className="text-pine font-serif">Agri-Allied Advisor</span>
                        </>
                      )}
                    </div>
                    {/* Message content */}
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loader UI for pending requests */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-cream border border-pine/15 p-4 text-charcoal/70 flex items-center space-x-2">
                    <Sprout className="h-4 w-4 animate-bounce text-terracotta" />
                    <span className="text-xs font-semibold animate-pulse">Consulting advisor database...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-4 border border-pine/15 bg-cream p-3 flex space-x-2 items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your crop or pest question (e.g., 'organic cure for apple scab')..."
            rows={1}
            disabled={isLoading}
            className="flex-grow bg-transparent text-xs sm:text-sm text-charcoal placeholder-charcoal/40 py-2 px-3 border border-pine/10 focus:outline-none focus:border-terracotta resize-none min-h-[40px] max-h-[80px]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-pine hover:bg-pine-light text-cream disabled:bg-pine/40 border border-pine disabled:border-transparent transition-all duration-200 self-end shrink-0"
            title="Send query"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
