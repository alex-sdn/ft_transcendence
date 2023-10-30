import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const ChatLayout: React.FC = () => {
    return (
        <div>
            <div className="sidebar">
                <h2>Channels:</h2>
                {/* rajouter une barre de recherche Search ? */}
                <nav>
                    <ul>
                        <li>
                            <NavLink to={`/chat/channel/1`}>Channel1</NavLink>
                        </li>
                        <li>
                            <NavLink to={`/chat/channel/2`}>Channel2</NavLink>
                        </li>
                    </ul>
                </nav>
                <div>
                    <form method="post">
                        <button type="submit">New</button>
                    </form>
                </div>
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default ChatLayout;