import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import SocketContext from "../../../Socket";

export interface PrivMessage {
	sender: string;
	message: string;
}

export interface PrivMessageProps {
	sender: string;
}

const PrivMessages: React.FC<PrivMessageProps> = ({ sender }) => {
	const jwtToken = Cookies.get('jwt-token');
	const [privmessages, setMessages] = useState<PrivMessage[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const socket = useContext(SocketContext);
	const [error, setError] = useState<string>("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	console.log(sender);
	useEffect(() => {
		const handleMessageReceive = (privmessage: PrivMessage) => {
			console.log("enter handle message receive");
			console.log(privmessage);
			setMessages(prevMessages => [...prevMessages, privmessage]);
		};

		if (socket) {
			socket.on("privmsg", handleMessageReceive);
			console.log("listening privmsg");
			socket.on("error", (error) => {
				setError(error.message);
			});
		}

		return () => {
			if (socket) {
				socket.off("privmsg", handleMessageReceive);
				socket.off("error");
			}
		};
	}, [socket, jwtToken]);

	const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log("enter handle send message");
		if (newMessage.trim() && socket) {
			socket.emit("privmsg", { target: sender, message: newMessage });
			setNewMessage('');
		}
	};

	useEffect(() => {
		const fetchMessages = async () => {
			console.log("start fetching messages");
			try {
				const response = await axios.get(`/api/chat/${sender}/privmsg`, {
					headers: {
						'Authorization': 'Bearer ' + jwtToken,
					},
				});
				if (response.status === 200) {
					console.log(response)
					const previousmessages: PrivMessage[] = response.data.map(msg => ({
						sender: msg.sender.nickname,
						message: msg.message,
					}));
					setMessages(previousmessages);
				}
			} catch (error) {
				console.error('Error fetching messages:', error);
			}
		};

		fetchMessages();
	}, [privmessages, jwtToken]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [privmessages]);

	return (
		<div className="privmessages-container">
			<div className="privmessages-list">
				{privmessages.map((msg, index) => (
					<div key={index} className={"privregular-message"}>
						<strong>{msg.sender}</strong>{":"} <span>{msg.message}</span>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>
			<form className="privmessage-form" onSubmit={handleSendMessage}>
				<input
					className="privmessage-input"
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="(Private) Write a message..."
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

export default PrivMessages;
