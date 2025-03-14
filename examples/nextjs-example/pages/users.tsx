/**
 * Příklad použití firestore-helper v Next.js aplikaci
 * 
 * Next.js verze: 14.x
 * 
 * Tento soubor by byl umístěn v adresáři: /pages/users.tsx v projektu Next.js
 */
import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Import z firestore-helper knihovny
import {
    initialize,
    get,
    create,
    update,
    removeDoc,
    Result
} from 'firestore-helper-ts';

// Definice typů 
interface User {
    id?: string;
    name: string;
    email: string;
    role: string;
    lastActive: any; // Firestore timestamp
}

// Inicializace Firebase - můžete to přesunout do _app.tsx pro globální inicializaci
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Komponenta stránky
const UsersPage: NextPage = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState('user');

    // Inicializace Firebase při načtení komponenty
    useEffect(() => {
        try {
            initialize(firebaseConfig);
            loadUsers();
        } catch (err) {
            setError('Chyba při inicializaci Firebase');
            console.error(err);
        }
    }, []);

    // Načtení uživatelů z Firestore
    const loadUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await get<User[]>({
                path: 'users',
                orderBy: [['lastActive', 'desc']],
                limit: 20,
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                setUsers(result.data || []);
            }
        } catch (err) {
            setError('Chyba při načítání uživatelů');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Vytvoření nového uživatele
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newUserName || !newUserEmail) {
            setError('Jméno a email jsou povinné');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await create<User>({
                path: 'users',
                data: {
                    name: newUserName,
                    email: newUserEmail,
                    role: newUserRole,
                    lastActive: new Date(),
                },
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                setNewUserName('');
                setNewUserEmail('');
                setNewUserRole('user');
                loadUsers();
            }
        } catch (err) {
            setError('Chyba při vytváření uživatele');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Smazání uživatele
    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Opravdu chcete smazat tohoto uživatele?')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await removeDoc({
                path: 'users',
                docId: userId,
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                loadUsers();
            }
        } catch (err) {
            setError('Chyba při mazání uživatele');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Head>
                <title>Správa uživatelů</title>
            </Head>

            <h1 className="text-3xl font-bold mb-6">Správa uživatelů</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Formulář pro přidání uživatele */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">Přidat nového uživatele</h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className="block mb-1">Jméno:</label>
                        <input
                            type="text"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Email:</label>
                        <input
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Role:</label>
                        <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={loading}
                        >
                            <option value="user">Uživatel</option>
                            <option value="admin">Administrátor</option>
                            <option value="editor">Editor</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {loading ? 'Přidávám...' : 'Přidat uživatele'}
                    </button>
                </form>
            </div>

            {/* Seznam uživatelů */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Seznam uživatelů</h2>
                {loading && <p>Načítání...</p>}

                {users.length === 0 && !loading ? (
                    <p>Žádní uživatelé nebyli nalezeni.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="py-2 px-4 text-left">Jméno</th>
                                    <th className="py-2 px-4 text-left">Email</th>
                                    <th className="py-2 px-4 text-left">Role</th>
                                    <th className="py-2 px-4 text-left">Poslední aktivita</th>
                                    <th className="py-2 px-4 text-left">Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b">
                                        <td className="py-2 px-4">{user.name}</td>
                                        <td className="py-2 px-4">{user.email}</td>
                                        <td className="py-2 px-4">{user.role}</td>
                                        <td className="py-2 px-4">
                                            {user.lastActive?.toDate?.()
                                                ? new Date(user.lastActive.toDate()).toLocaleString()
                                                : new Date(user.lastActive).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-4">
                                            <button
                                                onClick={() => router.push(`/users/edit/${user.id}`)}
                                                className="bg-green-500 text-white py-1 px-2 rounded mr-2 hover:bg-green-600"
                                            >
                                                Upravit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id!)}
                                                className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                                                disabled={loading}
                                            >
                                                Smazat
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersPage; 