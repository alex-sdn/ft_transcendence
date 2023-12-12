import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import SocketContext from "../../../Socket";
import { Message } from "../channels/Messages";
import { useParams } from "react-router-dom";

interface PrivMessage {
	sender: string;
	message: string;
	isCommand: boolean;
}

interface PrivMessageProps {
	sender: string;
}

const PrivMessages: React.FC<PrivMessageProps> = ({ sender }) => {
	const jwtToken = Cookies.get('jwt-token');
	const [privmessages, setPrivmessages] = useState<PrivMessage[]>([]);
	const [newMessage, setNewMessage] = useState<string>("");
	const socket = useContext(SocketContext);
	// const [error, setError] = useState<string>("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setNewMessage("");
		const handleMessageReceive = (privmessage: PrivMessage) => {
			setPrivmessages(prevMessages => [...prevMessages, privmessage]);
		};

		if (socket) {
			socket.on("privmsg", handleMessageReceive);
			// socket.on("error", (error) => {
			// 	setError(error.message);
			// });
		}

		return () => {
			if (socket) {
				socket.off("privmsg", handleMessageReceive);
				// socket.off("error");
			}
		};
	}, [socket, jwtToken, sender]);

	const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (newMessage.trim() && socket) {
			socket.emit("privmsg", { target: sender, message: newMessage });
			setNewMessage('');
		}
	};
	useEffect(() => {

		socket?.on("invite", data => {
			if (data.sender === sender) {
				const inviteMessage = {
					sender: data.sender,
					target: data.target,
					message: ` invited ${data.target} to ${data.channel}`,
					isCommand: true
				};
				setPrivmessages(prevMessages => [...prevMessages, inviteMessage]);
			}
		})
		return () => {
			socket?.off("invite");
		};

	}, [socket, sender]);

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await axios.get(`/api/chat/${sender}/privmsg`, {
					headers: {
						'Authorization': 'Bearer ' + jwtToken,
					},
				});
				if (response.status === 200) {
					const previousmessages: PrivMessage[] = response.data.map((msg: any) => ({
						sender: msg.sender.nickname,
						message: msg.message,
						isCommand: msg.isCommand,
					}));
					setPrivmessages(previousmessages);
				}
			} catch (error) {
				console.error('Error fetching messages:', error);
			}
		};

		fetchMessages();
	}, [sender, jwtToken]);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [privmessages]);

	return (
		<div className="privmessages-container">
			<div className="privmessages-list">
				{privmessages.map((msg, index) => (
					<div key={index} className={msg.isCommand ? "privcommand-message" : "privregular-message"}>
						<strong>{msg.sender}</strong>{!msg.isCommand && ":"} <span>{msg.message}</span>
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
					placeholder="Write a message..."
				/>
				<button
					className="material-symbols-outlined"
					id='send-button-privmsg'
					type='submit'
				>
					send
				</button>
			</form>
		</div>
	);

};

export default PrivMessages;
