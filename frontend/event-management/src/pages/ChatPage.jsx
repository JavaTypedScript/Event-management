import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Connect to root URL (remove /api if present)
const ENDPOINT = import.meta.env.VITE_API_URL?.replace('/api', '') ;
let socket;

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]); // List of users
  const [selectedChat, setSelectedChat] = useState(null); // Currently active chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const location = useLocation(); // Get navigation state
  const scrollRef = useRef();

  // 1. Fetch Conversations & Handle Auto-Open
  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await api.get('/chat');
        setConversations(data);

        // --- AUTO-OPEN LOGIC ---
        // Check if we were sent here with a specific chat ID (from Event Details)
        const chatToOpenId = location.state?.openChatId;
        
        if (chatToOpenId) {
          const targetChat = data.find(c => c._id === chatToOpenId);
          if (targetChat) {
             setSelectedChat(targetChat);
             // Clear state so it doesn't keep resetting on refresh
             window.history.replaceState({}, document.title); 
          }
        }
        // -----------------------

      } catch (error) {
        console.error("Failed to load chats");
      }
    };
    if (user) loadChats();
  }, [user]); // Removed 'location.state' dependency to prevent loops

  // 2. Initialize Socket Connection
  useEffect(() => {
    socket = io(ENDPOINT);
    if (user) socket.emit("setup", user);
    
    socket.on("message_received", (newMessageReceived) => {
      // Is this message for the chat I'm currently looking at?
      if (selectedChat && selectedChat._id === newMessageReceived.conversationId) {
        setMessages((prev) => [...prev, newMessageReceived]);
      } else {
        // Optional: Trigger a toast notification or badge here
      }
    });

    return () => socket.disconnect();
  }, [selectedChat, user]);

  // 3. Load Messages when a Chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/chat/${selectedChat._id}`);
        setMessages(data);
        socket.emit("join_chat", selectedChat._id);
      } catch (error) {
        console.error("Failed to load messages");
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // 4. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. Helper: Smart Name Display
  const getChatDetails = (chat) => {
    // CASE 1: Group Chat
    if (chat.isGroup) {
        return { 
            name: chat.chatName || "Event Discussion", 
            subtext: "Group Chat",
            initial: "#"
        };
    }
    
    // CASE 2: Direct Message
    // Find the OTHER person
    const partner = chat.participants.find(p => p._id !== user._id);
    
    if (!partner) return { name: "Unknown User", subtext: "", initial: "?" };

    // FIX: If the partner is an Organizer, show their Club Name!
    if (partner.role === 'organizer' && partner.managedClub) {
        return {
            name: partner.managedClub, // e.g., "Robotics Club"
            subtext: `Rep: ${partner.name}`, // e.g., "Rep: John Doe"
            initial: partner.managedClub.charAt(0).toUpperCase()
        };
    }

    // Default: Just their name
    return { 
        name: partner.name, 
        subtext: "Student",
        initial: partner.name.charAt(0).toUpperCase() 
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    // Optimistic Update
    const tempMsg = { 
        _id: Date.now(), 
        sender: { _id: user._id, name: user.name }, 
        text: newMessage,
        conversationId: selectedChat._id,
        createdAt: new Date().toISOString()
    };
    setMessages([...messages, tempMsg]);
    setNewMessage("");

    try {
        // Send via Socket
        socket.emit("new_message", { 
            conversationId: selectedChat._id, 
            senderId: user._id, 
            text: tempMsg.text 
        });
        
        // Persist to DB via API
        await api.post('/messages', { 
            content: tempMsg.text, 
            chatId: selectedChat._id 
        });
    } catch (error) {
        console.error("Failed to send message", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[85vh]">
      
      {/* SIDEBAR: CONVERSATION LIST */}
      <Card className="col-span-1 hidden md:flex flex-col h-full">
        <div className="p-4 border-b font-semibold bg-muted/20">
            Messages ({conversations.length})
        </div>
        <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 p-2">
                {conversations.map((chat) => {
                    const { name, subtext, initial } = getChatDetails(chat);
                    return (
                        <button
                            key={chat._id}
                            onClick={() => setSelectedChat(chat)}
                            className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors text-sm
                                ${selectedChat?._id === chat._id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        >
                            <Avatar className="h-9 w-9 border border-white/20">
                                <AvatarFallback className={selectedChat?._id === chat._id ? "text-primary-foreground bg-primary-foreground/20" : ""}>
                                    {initial}
                                </AvatarFallback>
                            </Avatar>
                            <div className="overflow-hidden">
                                <p className="font-bold truncate">{name}</p>
                                <p className={`text-xs truncate ${selectedChat?._id === chat._id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                    {subtext}
                                </p>
                            </div>
                        </button>
                    );
                })}
                {conversations.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm p-4">
                        No conversations yet. Go to an Event and message an organizer!
                    </div>
                )}
            </div>
        </ScrollArea>
      </Card>

      {/* MAIN CHAT AREA */}
      <Card className="col-span-1 md:col-span-3 flex flex-col h-full overflow-hidden shadow-sm">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/20 flex items-center gap-3 shadow-sm z-10">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{getChatDetails(selectedChat).initial}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-sm">{getChatDetails(selectedChat).name}</h3>
                    <p className="text-xs text-muted-foreground">Active Now</p>
                </div>
            </div>

            {/* Messages List */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/50">
              <div className="space-y-4 flex flex-col">
                {messages.map((m, index) => {
                    const isMe = m.sender._id === user._id;
                    return (
                        <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                                isMe 
                                    ? "bg-blue-600 text-white rounded-br-none" 
                                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                            }`}>
                                {m.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t flex gap-2 items-center">
              <Input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type your message..." 
                className="rounded-full bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage} className="rounded-full h-10 w-10 bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-slate-50/30">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-700">Your Messages</h3>
            <p className="text-sm">Select a conversation from the sidebar to start chatting.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatPage;