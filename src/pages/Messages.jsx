import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import {
  Search,
  Send,
  Phone,
  MoreVertical,
  Image as ImageIcon,
  Paperclip,
  CheckCheck,
  Clock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { formatTime, formatDate } from '../lib/constants';
import { messagesAPI } from '../services/apiClient';

function Messages() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const isProvider = user?.role === 'provider';

  // Fetch conversations from API
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getConversations();
      if (response.success) {
        setConversations(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      const response = await messagesAPI.getMessages(conversationId);
      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    setSending(true);
    try {
      const response = await messagesAPI.sendMessage(selectedChat.id, message.trim());
      if (response.success) {
        setMessage('');
        // Refresh messages
        fetchMessages(selectedChat.id);
        // Refresh conversations to update last message
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 fade-in">
      {/* Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`w-full flex items-start gap-3 p-4 hover:bg-[var(--secondary)] transition-colors border-b border-[var(--border)] ${
                  selectedChat?.id === conv.id ? 'bg-[var(--secondary)]' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conv.participant.avatar} />
                    <AvatarFallback className="bg-[var(--primary)] text-white">
                      {getInitials(conv.participant.name)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.participant.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--success)] rounded-full border-2 border-[var(--card)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">{conv.participant.name}</span>
                    <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                      {formatTime(conv.lastMessage.time)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] truncate">{conv.lastMessage.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[var(--primary)]">{conv.booking.service}</span>
                    {conv.lastMessage.unread > 0 && (
                      <span className="min-w-[20px] h-5 flex items-center justify-center text-xs font-bold bg-[var(--primary)] text-white rounded-full px-1.5">
                        {conv.lastMessage.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedChat(null)}
                >
                  <ArrowLeft size={20} />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedChat.participant.avatar} />
                  <AvatarFallback className="bg-[var(--primary)] text-white">
                    {getInitials(selectedChat.participant.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedChat.participant.name}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {selectedChat.participant.online ? (
                      <span className="text-[var(--success)]">Online</span>
                    ) : (
                      'Offline'
                    )}
                    {' • '}{selectedChat.booking.service}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone size={18} />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical size={18} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => {
                const isMe = msg.senderId === user?.id;
                const showDate = index === 0 || formatDate(messages[index - 1].time) !== formatDate(msg.time);

                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div className="text-center">
                        <span className="text-xs text-[var(--muted-foreground)] bg-[var(--secondary)] px-3 py-1 rounded-full">
                          {formatDate(msg.time)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? 'bg-[var(--primary)] text-white rounded-br-none'
                            : 'bg-[var(--secondary)] rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/70' : 'text-[var(--muted-foreground)]'}`}>
                          <span className="text-[10px]">{formatTime(msg.time)}</span>
                          {isMe && (
                            msg.status === 'read' ? (
                              <CheckCheck size={12} className="text-white" />
                            ) : (
                              <Clock size={12} />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <Paperclip size={18} />
                </Button>
                <Button type="button" variant="ghost" size="icon">
                  <ImageIcon size={18} />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!message.trim()}>
                  <Send size={18} />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--muted-foreground)]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--secondary)] flex items-center justify-center mx-auto mb-4">
                <Send size={24} />
              </div>
              <h3 className="font-semibold mb-1">Your Messages</h3>
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
