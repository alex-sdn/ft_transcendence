import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const ChatLayout: React.FC = () => {
    const channels = ["Chocolat", "Chien", "Chat", "Cafeine", "Cafe"];
    const [value, setValue] = useState("");

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value,);
    }

    return (
        <div>
            <div className="sidebar">
                {/* rajouter une barre de recherche Search */}
                <nav>
                    <ul>
                        <li>
                            <NavLink to={`/chat/channel/1`}>Channel1</NavLink>
                        </li>
                        <li>
                            <NavLink to={`/chat/channel/2`}>Channel2</NavLink>
                        </li>
                        <li>
                            <NavLink to="create-channel">Create new channel</NavLink>
                        </li>
                    </ul>
                </nav>
                <div className="searchBar">
                    <div>
                        <input type="text" value={value} onChange={handleValueChange} />
                        <button /*onClick={(renvoie sur la page du channel selectionne)}*/>
                            <span className="material-symbols-outlined">search</span>
                        </button>
                    </div>
                    <ul>
                        {
                            value && (channels.filter((element) => element.toLowerCase().includes(value.toLowerCase()))
                                .map((element, index) => <li onClick={() => setValue(element)} key={index}>{element}</li>))
                        }
                    </ul>
                </div>
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default ChatLayout;