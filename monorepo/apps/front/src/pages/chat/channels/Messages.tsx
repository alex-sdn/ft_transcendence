import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import SocketContext from "../../../Socket";
import Kick, { kickProps } from "./Kick";

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

		const handleKickEvent = (kickData: kickProps) => {
			const kickMessage = {
				sender: sender,
				target: target,
				message: `${sender} has kicked ${kickData.selectedMember.name} from the channel.`,
				isCommand: true
			};
			setMessages(prevMessages => [...prevMessages, kickMessage]);
		};

		if (socket) {
			socket.on("message", handleMessageReceive);
			socket.on("kick", handleKickEvent);
			socket.on("error", (error) => {
				setError(error.message);
			});
		}

		return () => {
			if (socket) {
				socket.off("message", handleMessageReceive);
				socket.off("kick", handleKickEvent);
				socket.off("error");
			}
		};
	}, [socket, jwtToken]);

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
						//target: msg.target,
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

	//const handleKick = async () => {
	//	const createPromise = new Promise<{
	//		sender: string;
	//		target: string
	//	}>((resolve, reject) => {
	//		if (socket) {
	//			socket.emit("kick", { target: selectedMember.name, channel: selectedChannel });
	//			socket.on("kick", (data) => {
	//				resolve(data);
	//			});
	//			socket.on("error", data => {
	//				reject(data);
	//			});
	//		}
	//	});

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
