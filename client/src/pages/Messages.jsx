import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  ExternalLink,
  Inbox
} from 'lucide-react';
import { messagesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeOtherUserId, setActiveOtherUserId] = useState(searchParams.get('otherUserId') || null);
  const [activeListingId, setActiveListingId] = useState(searchParams.get('listingId') || null);
  const [activeThread, setActiveThread] = useState(null);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const QUICK_PROMPTS = [
    'Is this item still available?',
    'Can we meet at FOT Electronics Lab tomorrow?',
    'Can we meet at the Library lobby around 1:00 PM?',
    'Can I test it before taking it?'
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/messages');
      return;
    }

    async function loadConversations() {
      try {
        const convList = await messagesApi.getConversations();
        setConversations(convList || []);

        if (!activeOtherUserId && convList && convList.length > 0) {
          setActiveOtherUserId(convList[0].otherUserId);
          if (convList[0].listing) setActiveListingId(convList[0].listing.id);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoadingConv(false);
      }
    }

    loadConversations();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!activeOtherUserId || !isAuthenticated) return;

    async function loadThread() {
      setLoadingThread(true);
      try {
        const threadData = await messagesApi.getThread(activeOtherUserId, activeListingId);
        setActiveThread(threadData);
      } catch (err) {
        console.error('Failed to load message thread:', err);
      } finally {
        setLoadingThread(false);
      }
    }

    loadThread();
    const interval = setInterval(loadThread, 5000);
    return () => clearInterval(interval);
  }, [activeOtherUserId, activeListingId, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  const handleSelectConversation = (otherId, listId) => {
    setActiveOtherUserId(otherId);
    setActiveListingId(listId || null);
    setSearchParams({ otherUserId: otherId, ...(listId ? { listingId: listId } : {}) });
  };

  const handleSendMessage = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : inputMessage;
    if (!text.trim() || !activeOtherUserId) return;

    setSending(true);
    try {
      await messagesApi.send({
        receiver_id: activeOtherUserId,
        listing_id: activeListingId || activeThread?.listing?.id || null,
        content: text.trim()
      });

      setInputMessage('');

      const updated = await messagesApi.getThread(activeOtherUserId, activeListingId);
      setActiveThread(updated);

      const convList = await messagesApi.getConversations();
      setConversations(convList || []);
    } catch (err) {
      addToast(err.message || 'Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-700" />
          <span>Campus Messages</span>
        </h1>
        <p className="text-xs text-slate-500">
          Direct communication with verified undergraduates for campus meetups and inquiries
        </p>
      </div>

      <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Left Col: Conversation List */}
        <div
          className={`${
            activeOtherUserId ? 'hidden md:block' : 'block'
          } md:col-span-4 border-r border-slate-300 bg-slate-50 flex flex-col`}
        >
          <div className="p-3 border-b border-slate-300 bg-white font-bold text-xs uppercase tracking-wider text-slate-800">
            Student Chats ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
            {loadingConv ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading chats...</div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const isSelected = conv.otherUserId === activeOtherUserId;
                return (
                  <button
                    key={conv.otherUserId}
                    onClick={() => handleSelectConversation(conv.otherUserId, conv.listing?.id)}
                    className={`w-full p-3 text-left flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-teal-50 border-l-4 border-[#0d9488]'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {conv.otherUser?.full_name ? conv.otherUser.full_name.charAt(0) : 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {conv.otherUser?.full_name || 'Student'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {conv.lastMessage?.created_at
                            ? new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      <span className="text-[10px] text-teal-800 font-mono block">
                        {conv.otherUser?.reg_id}
                      </span>
                      {conv.listing && (
                        <span className="text-[11px] text-slate-700 font-medium truncate block mt-0.5">
                          Item: {conv.listing.title}
                        </span>
                      )}
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {conv.lastMessage?.content}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center space-y-2 text-xs">
                <p className="font-bold text-slate-700">No active conversations</p>
                <p className="text-slate-500 text-[11px]">
                  Browse items and click "Message Seller" to start a chat.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Active Thread */}
        <div
          className={`${
            !activeOtherUserId ? 'hidden md:flex' : 'flex'
          } md:col-span-8 flex-col bg-white h-full`}
        >
          {activeOtherUserId && activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-slate-300 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => setActiveOtherUserId(null)}
                    className="md:hidden p-1 text-slate-600"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {activeThread.otherUser?.full_name ? activeThread.otherUser.full_name.charAt(0) : 'S'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block truncate">
                      {activeThread.otherUser?.full_name || 'Student'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {activeThread.otherUser?.reg_id} &bull; {activeThread.otherUser?.department || 'Department of ICT'}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/profile?userId=${activeOtherUserId}`}
                  className="text-xs text-teal-700 font-semibold hover:underline"
                >
                  Profile &rarr;
                </Link>
              </div>

              {/* Context Item Bar */}
              {activeThread.listing && (
                <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500">Item:</span>
                    <span className="font-bold text-slate-800 truncate">{activeThread.listing.title}</span>
                    <span className="text-teal-800 font-bold shrink-0">
                      Rs. {Number(activeThread.listing.price).toLocaleString()}
                    </span>
                  </div>
                  <Link
                    to={`/listings/${activeThread.listing.id}`}
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-0.5 shrink-0 ml-2 text-[11px]"
                  >
                    <span>Details</span> <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
                {activeThread.messages?.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded px-3 py-2 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#0d9488] text-white'
                            : 'bg-white border border-slate-300 text-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                <span className="text-slate-500 font-semibold shrink-0">Prompts:</span>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="whitespace-nowrap px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-700 shrink-0 text-[11px]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-white border-t border-slate-300 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message regarding meetup, time, or location..."
                  className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0d9488] text-slate-900"
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="px-3 py-1.5 bg-[#0d9488] hover:bg-teal-700 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-1">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-xs text-slate-700">Select a student discussion</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Pick a chat from the left panel or contact a student through a listing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
