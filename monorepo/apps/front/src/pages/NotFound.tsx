import React from 'react';
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
    return (
        <div className="not_found">
            <h2>Page not found!</h2>
            <p>Go to the <Link to="/">HomePage</Link>.</p>
        </div>
    ) 
}

export default NotFound;