import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SocketContext from '../../Socket';


interface Message {
  sender: string;
  content: string;
}

const Messages: React.FC<{ channelName: string }> = ({ channelName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleMessage = (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket]);

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('message', {
        sender: 'me', // Replace with the actual sender's information
        content: newMessage.trim(),
        target: channelName
      });
      setNewMessage('');
    }
  };

  return (
    <div className="messages-container">
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          className="message-input"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
        />
        <button className="send-button" type="submit" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Messages;
