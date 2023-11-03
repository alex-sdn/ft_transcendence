import React, { useState } from 'react';

const Channel: React.FC = () => {
    const [message, setMessage] = useState("");

    const handleMessageSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    }

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