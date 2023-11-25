import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import SocketContext from "../../../Socket";
import Cookies from "js-cookie";

export interface Message {
    sender: string;
    target: string;
    message: string;
    isCommand: boolean;
}

export interface MessageProps {
    sender: string;
    target: string;
}

const Messages: React.FC<MessageProps> = ({ sender, target }) => {
    const jwtToken = Cookies.get('jwt-token');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const socket = useContext(SocketContext);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const handleMessageReceive = (message: Message) => {
            setMessages(prevMessages => [...prevMessages, message]);
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

    useEffect(() => {
        const fetchMessages = async () => {
            const response = await axios.get(`/api/chat/:${target}/messages`, {
                headers: {
                    'Authorization': 'Bearer ' + jwtToken,
                },
            },);
            if (response.status === 200) {
                setMessages(response.data);
            }
        }
        fetchMessages();
    }, [target, jwtToken]);

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newMessage.trim() && socket) {
            socket.emit("message", { sender: sender, target: target, message: newMessage });
            setNewMessage('');
        }
    };


    return (
        <div className="messages-container">
            <div className="messages-list">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.isCommand ? "command-message" : "regular-message"}>
                        <strong>{msg.sender}:</strong> <span>{msg.message}</span>
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
