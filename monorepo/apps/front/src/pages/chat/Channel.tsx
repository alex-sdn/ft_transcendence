import React from 'react';
import { useParams } from 'react-router-dom';
import Messages from './Messages'; // Make sure this path is correct based on your project structure
import ChannelMembers from './ChannelMembers';

const Channel: React.FC = () => {
    const { channelName } = useParams<{ channelName: string }>();

    return (
        <div className="channel">
            <h2>{channelName}</h2>
            <Messages /> {/* Messages component will handle messages */}
            <ChannelMembers /> {/* This component handles showing channel members */}
        </div>
    );
}

export default Channel;
