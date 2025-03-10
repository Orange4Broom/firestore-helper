/**
 * Příklad použití firestore-helper v React aplikaci
 */
import React, { useEffect, useState } from 'react';

// Import using named exports (recommended)
import {
    initialize,
    get,
    create,
    update,
    removeDoc, // Používáme removeDoc místo delete kvůli klíčovému slovu
    Result
} from 'firestore-helper';

// Definice typů pro data
interface User {
    id?: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: any; // Firestore timestamp
}

function UsersComponent() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Inicializace Firebase
        initialize({
            apiKey: "YOUR_API_KEY",
            authDomain: "your-app.firebaseapp.com",
            projectId: "your-project-id",
            storageBucket: "your-app.storage.app",
            messagingSenderId: "your-messaging-id",
            appId: "your-app-id",
            measurementId: "your-measurement-id"
        });

        // Načtení uživatelů
        loadUsers();
    }, []);

    // Načtení uživatelů
    const loadUsers = async () => {
        setLoading(true);
        try {
            // Získání aktivních uživatelů, seřazených podle data vytvoření
            const result = await get<User[]>({
                path: 'users',
                where: [
                    ['isActive', '==', true]
                ],
                orderBy: [
                    ['createdAt', 'desc']
                ],
                limit: 10
            });

            if (result.data) {
                setUsers(result.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Vytvoření nového uživatele
    const createUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
        setLoading(true);
        try {
            const result = await create<User>({
                path: 'users',
                data: {
                    ...userData,
                    createdAt: new Date()
                }
            });

            if (result.data) {
                // Automaticky načte aktualizovaná data, pokud je refetch=true (výchozí)
                loadUsers();
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Aktualizace uživatele
    const updateUser = async (userId: string, userData: Partial<User>) => {
        setLoading(true);
        try {
            await update({
                path: 'users',
                docId: userId,
                data: userData,
                refetch: false // Nechceme automaticky načítat data
            });

            // Manuálně obnovíme seznam
            loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Smazání uživatele
    const deleteUser = async (userId: string) => {
        setLoading(true);
        try {
            await removeDoc({
                path: 'users',
                docId: userId,
                refetch: false
            });

            // Manuálně obnovíme seznam
            loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1>Users</h1>
            <button onClick={() => createUser({ name: 'New User', email: 'new@example.com', isActive: true })}>
                Add User
            </button>

            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name} ({user.email})
                        <button onClick={() => updateUser(user.id!, { isActive: !user.isActive })}>
                            {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => deleteUser(user.id!)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UsersComponent; 