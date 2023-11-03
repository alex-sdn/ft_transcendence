import React, { useContext, useState } from 'react';
import SocketContext from '../../Socket';


const Channel: React.FC = () => {
    const [message, setMessage] = useState("");
    const socket = useContext(SocketContext);

    const handleMessageSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    }

    // socket.on('message', (data: JSON)
    //     //envoyer message a tous les users du channel (ou seulement ceux online ?)
    // );

    return (
        <div className='channel'>
            <h2>Nom du Channel</h2>
            <div id='chat' >
                <p>
                    <input type='text'
                        placeholder='Send a message'
                        onChange={handleMessageSubmit}
                        minLength={1} />
                </p>
                <p>
                    <button
                        className="material-symbols-outlined"
                        id='send-button'
                        type='submit'
                        value={message}>
                        send
                    </button>
                </p>
            </div>
        </div>


    );
}

export default Channel;