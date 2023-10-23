import React, { useState } from "react";
import { Form, redirect } from "react-router-dom";

const Username: React.FC = () => {
    const [formData, setFormData] = useState({ username: '' });

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/user/me/editNickname', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    //'Authorization': Bearer token,
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                return redirect('/')
            } else {
                return { error: 'Username already taken' };
            }
        } catch (error) {
            console.error('Erreur lors de la requête:', error);
            // Gérer les erreurs de requête ici
        }
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            username: event.target.value,
        });
    };

    return (
        <div>
            <Form method="post" action="/username" onSubmit={handleFormSubmit}>
                <label>
                    <p>
                        <span>Username:</span>
                    </p>
                    <p>
                        <input type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleUsernameChange}
                            required />
                    </p>
                </label>
                <p>
                    <button type="submit">Submit</button>
                </p>
            </Form>
        </div>
    );
}

export default Username;