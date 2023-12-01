import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import SocketContext from "../../../Socket";
import Channel from "./Channel";

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
	const messagesEndRef = useRef(null);

	useEffect(() => {
		const handleMessageReceive = (message: Message) => {
			if (message.target == target) {
				setMessages(prevMessages => [...prevMessages, message]);
			}
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
	}, [socket, jwtToken, target]);

	useEffect(() => {
		socket?.on("join", data => {
			if (data.target === target){
				console.log(data);
				const joinMessage = {
					sender: data.sender,
					target: data.target, 
					message: ` has joined the channel (new)`, 
					isCommand: true
				};
				setMessages(prevMessages => [...prevMessages, joinMessage]);
			}
		})
		socket?.on("leave", data => {
			if (data.target === target){
				console.log(data);
				const leaveMessage = {
					sender: data.sender,
					target: data.target, 
					message: ` has left the channel (new)`, 
					isCommand: true
				};
				setMessages(prevMessages => [...prevMessages, leaveMessage]);
			}
		})
		socket?.on("mute", data => {
			if (data.target === target){
				console.log(data);
				const muteMessage = {
					sender: data.sender,
					target: data.target, 
					message: ` muted ${data.target} (new)`, 
					isCommand: true
				};
				setMessages(prevMessages => [...prevMessages, muteMessage]);
			}
		})
		socket?.on("kick", data => {
			if (data.target === target){
				console.log("Enter mute:")
				console.log(data);
				const kickMessage = {
					sender: data.sender,
					target: data.target, 
					message: ` kicked ${data.target} from the channel (new)`, 
					isCommand: true
				};
				setMessages(prevMessages => [...prevMessages, kickMessage]);
			}
		})
		socket?.on("ban", data => {
			if (data.target === target){
				console.log(data);
				const banMessage = {
					sender: data.sender,
					target: data.target, 
					message: ` banned ${data.target} from the channel (new)`, 
					isCommand: true
				};
				setMessages(prevMessages => [...prevMessages, banMessage]);
			}
		})


		return () => {
			socket?.off("join");
			socket?.off("leave");
            socket?.off("mute");
            socket?.off("kick");
            socket?.off("ban");
		};

	}, [target, socket]);

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await axios.get(`/api/chat/${target}/messages`, {
					headers: {
						'Authorization': 'Bearer ' + jwtToken,
					},
				});
				console.log(response);
				if (response.status === 200) {
					const previousmessages: Message[] = response.data.map(msg => ({
						sender: msg.sender.nickname,
						target: msg.target,
						message: msg.message,
						isCommand: msg.isCommand,
					}));
					setMessages(previousmessages);
				}
			} catch (error) {
				console.error('Error fetching messages:', error);
			}
		};

		fetchMessages();
	}, [target, jwtToken]);

	const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (newMessage.trim() && socket) {
			socket.emit("message", { sender: sender, target: target , message: newMessage});
			setNewMessage('');
		}
	};

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="messages-container">
			<div className="messages-list">
				{messages.map((msg, index) => (
					<div key={index} className={msg.isCommand ? "command-message" : "regular-message"}>
						<strong>{msg.sender}</strong>{!msg.isCommand && ":"} <span>{msg.message}</span>
					</div>
				))}
				<div ref={messagesEndRef} />
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
