import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:5000");

function Chat({ username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.emit("join_room", room); // Join the event-specific room
    
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    
    // Cleanup listener
    return () => socket.off("receive_message");
  }, [room]);

  return (
    <div className="chat-window bg-gray-100 p-4 rounded-lg shadow-md max-w-md">
      <div className="chat-header mb-2 font-bold">Event Chat: {room}</div>
      <div className="chat-body h-64 overflow-y-scroll bg-white p-2 mb-2">
          {messageList.map((msg, index) => (
            <div key={index} className={`message ${username === msg.author ? "text-right" : "text-left"}`}>
               <div className="inline-block bg-blue-100 p-2 rounded m-1">
                 <p className="text-sm">{msg.message}</p>
                 <span className="text-xs text-gray-500">{msg.time} - {msg.author}</span>
               </div>
            </div>
          ))}
      </div>
      <div className="chat-footer flex">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          className="grow p-2 border rounded-l-lg"
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyPress={(event) => event.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-r-lg">Send</button>
      </div>
    </div>
  );
}

export default Chat;