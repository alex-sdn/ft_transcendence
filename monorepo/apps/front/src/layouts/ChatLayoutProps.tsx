import { Socket } from "socket.io";

export interface ChatLayoutProps {
    socket: Socket;
    closeModal: () => void;
}