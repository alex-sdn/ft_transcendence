import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import SocketContext from "../../../Socket";
// import 'normalize.css';

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
	const [newMessage, setNewMessage] = useState<string>("");
	const socket = useContext(SocketContext);
	const [error, setError] = useState<string>("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setNewMessage("");
		const handleMessageReceive = (message: Message) => {
			if (message.target == target) {
				setMessages(prevMessages => [...prevMessages, message]);
			}
		};

		if (socket) {
			socket.on("message", handleMessageReceive);
			socket.on("error", (error) => {
				if (error.message === "you are muted in this channel")
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

	const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (newMessage.trim() && socket) {
			socket.emit("message", { sender: sender, target: target, message: newMessage });
			setNewMessage("");
		}
	};

	useEffect(() => {
		socket?.on("join", data => {
			if (data.target === target) {
				const joinMessage = {
					sender: data.sender,
					target: data.target,
					message: ` has joined the channel`,
					isCommand: true
				};
				console.log("join");
				setMessages(prevMessages => [...prevMessages, joinMessage]);
			}
		})
		socket?.on("leave", data => {
			if (data.target === target) {
				const leaveMessage = {
					sender: data.sender,
					target: data.target,
					message: ` has left the channel`,
					isCommand: true
				};
				console.log("leave");
				setMessages(prevMessages => [...prevMessages, leaveMessage]);
			}
		})
		socket?.on("mute", data => {
			if (data.channel === target) {
				const muteMessage = {
					sender: data.sender,
					target: data.target,
					message: ` muted ${data.target}`,
					isCommand: true
				};
				setMessages(prevMessages => [...prevMessages, muteMessage]);
			}
		})
		socket?.on("kick", data => {
			if (data.channel === target) {
				const kickMessage = {
					sender: data.sender,
					target: data.target,
					message: ` kicked ${data.target} from the channel`,
					isCommand: true
				};
				console.log("kick");
				setMessages(prevMessages => [...prevMessages, kickMessage]);
			}
		})
		socket?.on("ban", data => {
			if (data.target === target) {
				const banMessage = {
					sender: data.sender,
					target: data.target,
					message: ` banned ${data.target} from the channel`,
					isCommand: true
				};
				console.log("ban");
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

	}, [socket, target]);

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await axios.get(`/api/chat/${target}/messages`, {
					headers: {
						'Authorization': 'Bearer ' + jwtToken,
					},
				});
				if (response.status === 200) {
					const previousmessages: Message[] = response.data.map((msg: any) => ({
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

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	useEffect(() => {
		if (error) {
		  const timeoutId = setTimeout(() => {
			setError('');
		  }, 3000); // Durée d'affichage en millisecondes (ici, 3 secondes)
	
		  return () => clearTimeout(timeoutId);
		}
	  }, [error]);
	

	const placeHolderMessage = error ? error : "Write a message...";

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
					className={error ? "message-input special-placeholder" : "message-input"}
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder={placeHolderMessage}
				/>
				<button
					className="material-symbols-outlined"
					id='send-button-channel'
					type='submit'
				>
					send
				</button>
			</form>
		</div>
	);

};

export default Messages;
