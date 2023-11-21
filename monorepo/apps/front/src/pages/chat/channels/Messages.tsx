import React, { useContext, useState, useEffect } from 'react';
import SocketContext from '../../../Socket';

interface Message {
    user: string;
    content: string;
    channelName: string;
}

const Messages: React.FC<Message> = ({ user, channelName }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const socket = useContext(SocketContext);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const handleMessageReceive = (message: Message) => {
            setMessages(prevMessages => [...prevMessages, message]);
            console.log(messages);
        };

        if (socket) {
            socket.on("message", handleMessageReceive);
            socket.on("error", (error) => {
                setError(error.message);
            });
        }

        return () => {
            if (socket) {
                socket.off("message", handleMessageReceive);
                socket.off("error");
            }
        };
    }, [socket]);

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newMessage.trim() && socket) {
            socket.emit("message", { sender: user, target: channelName , message: newMessage});
            setNewMessage('');
        }
    };


    return (
        <div className="messages-container">
            <div className="messages-list">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        <strong>{msg.user}:</strong> <span>{msg.content}</span>
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
                <button
                    className="material-symbols-outlined"
                    id='send-button'
                    type='submit'
                >
                    send
                </button>
            </form>
        </div>
    );
};

export default Messages;
