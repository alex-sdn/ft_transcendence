import React, { useContext, useState, useEffect } from 'react';
import SocketContext from '../../../Socket';
import axios from "axios";

interface Message {
  sender: string;
  content: string;
}

const Messages: React.FC<{ channelName: string }> = ({ channelName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleMessageReceive = (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    };

    socket.on('message', handleMessageReceive);

    return () => {
      socket.off('message', handleMessageReceive);
    };
  }, [socket]);

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('message', {
        sender: 'me', 
        content: newMessage.trim(),
        target: channelName,
      });
      setNewMessage('');
    }
  };

  return (
    <div className="messages-container">
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}:</strong> <span>{msg.content}</span>
          </div>
        ))}
      </div>
          <form className="message-form" onSubmit={handleSendMessage}>
              <input type='text'
                  name='message'
                  placeholder='Write a message...'
                  onChange={(e) => setNewMessage(e.target.value)} />
              <button
                  className="material-symbols-outlined"
                  id='send-button'
                  type='submit'
              >
                  send
              </button>
        <input
          className="message-input"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
        />
      </form>
    </div>
  );
};

export default Messages;
