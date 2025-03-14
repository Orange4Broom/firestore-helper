/**
 * Příklad použití firestore-helper v React aplikaci s využitím hooks a Context API
 * 
 * React verze: 18.x
 * Přístup: Funkcionální komponenty s hooks a Context API pro sdílení stavu
 */
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// Import z firestore-helper knihovny
import {
    initialize,
    get,
    create,
    update,
    removeDoc,
    Result
} from 'firestore-helper-ts';

// Definice typů pro data
interface User {
    id?: string;
    name: string;
    email: string;
    isActive: boolean;
    lastLogin?: any; // Firestore timestamp
}

// Typy pro kontext
interface UserContextState {
    users: User[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    addUser: (user: Omit<User, 'id'>) => Promise<Result<User>>;
    updateUser: (id: string, data: Partial<User>) => Promise<Result<User>>;
    deleteUser: (id: string) => Promise<Result<unknown>>;
}

// Vytvoření kontextu
const UserContext = createContext<UserContextState | undefined>(undefined);

// Provider komponent pro Firebase a Firestore
interface FirebaseProviderProps {
    children: ReactNode;
    firebaseConfig: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
    };
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children, firebaseConfig }) => {
    // Stav
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState<boolean>(false);

    // Inicializace Firebase při prvním renderu
    useEffect(() => {
        try {
            if (!initialized) {
                initialize(firebaseConfig);
                setInitialized(true);
                fetchUsers();
            }
        } catch (err) {
            setError('Chyba při inicializaci Firebase');
            console.error(err);
        }
    }, [firebaseConfig, initialized]);

    // Načtení uživatelů s filtrováním aktivních
    const fetchUsers = useCallback(async (onlyActive: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            const queryOptions = {
                path: 'users',
                orderBy: [['lastLogin', 'desc']],
            };

            // Přidání where podmínky pro aktivní uživatele
            if (onlyActive) {
                queryOptions['where'] = [['isActive', '==', true]];
            }

            const result = await get<User[]>(queryOptions);

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
    }, []);

    // Přidání uživatele
    const addUser = useCallback(async (userData: Omit<User, 'id'>): Promise<Result<User>> => {
        setLoading(true);
        setError(null);

        try {
            const result = await create<User>({
                path: 'users',
                data: {
                    ...userData,
                    lastLogin: new Date(),
                },
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                fetchUsers();
            }

            return result;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Neznámá chyba';
            setError(`Chyba při vytváření uživatele: ${errorMsg}`);
            console.error(err);
            return { error: { message: errorMsg, code: 'unknown' } };
        } finally {
            setLoading(false);
        }
    }, [fetchUsers]);

    // Aktualizace uživatele
    const updateUser = useCallback(async (userId: string, userData: Partial<User>): Promise<Result<User>> => {
        setLoading(true);
        setError(null);

        try {
            const result = await update<User>({
                path: 'users',
                docId: userId,
                data: userData,
                refetch: true,
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                fetchUsers();
            }

            return result;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Neznámá chyba';
            setError(`Chyba při aktualizaci uživatele: ${errorMsg}`);
            console.error(err);
            return { error: { message: errorMsg, code: 'unknown' } };
        } finally {
            setLoading(false);
        }
    }, [fetchUsers]);

    // Smazání uživatele
    const deleteUser = useCallback(async (userId: string): Promise<Result<unknown>> => {
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
                fetchUsers();
            }

            return result;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Neznámá chyba';
            setError(`Chyba při mazání uživatele: ${errorMsg}`);
            console.error(err);
            return { error: { message: errorMsg, code: 'unknown' } };
        } finally {
            setLoading(false);
        }
    }, [fetchUsers]);

    // Připravíme hodnotu kontextu
    const contextValue: UserContextState = {
        users,
        loading,
        error,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook pro použití UserContext
export const useUsers = () => {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error('useUsers musí být použit uvnitř FirebaseProvider');
    }

    return context;
};

/**
 * Příklad komponenty, která používá náš custom hook
 */
export const UserList: React.FC = () => {
    const { users, loading, error, deleteUser } = useUsers();

    if (loading) return <div>Načítání uživatelů...</div>;
    if (error) return <div>Chyba: {error}</div>;

    return (
        <div>
            <h2>Seznam uživatelů</h2>
            {users.length === 0 ? (
                <p>Žádní uživatelé nebyli nalezeni.</p>
            ) : (
                <ul>
                    {users.map(user => (
                        <li key={user.id} style={{ marginBottom: '12px' }}>
                            <div>
                                <strong>{user.name}</strong> ({user.email})
                                <span style={{ marginLeft: '8px', color: user.isActive ? 'green' : 'red' }}>
                                    {user.isActive ? 'Aktivní' : 'Neaktivní'}
                                </span>
                            </div>
                            <div>
                                <button
                                    onClick={() => deleteUser(user.id!)}
                                    style={{
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        marginRight: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Smazat
                                </button>
                                <button
                                    onClick={() => {
                                        // Příklad aktualizace stavu uživatele
                                        const { updateUser } = useUsers();
                                        updateUser(user.id!, { isActive: !user.isActive });
                                    }}
                                    style={{
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {user.isActive ? 'Deaktivovat' : 'Aktivovat'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

/**
 * Formulář pro přidání uživatele
 */
export const UserForm: React.FC = () => {
    const { addUser, loading } = useUsers();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email) {
            setFormError('Jméno a email jsou povinné');
            return;
        }

        const result = await addUser({
            name,
            email,
            isActive: true,
        });

        if (!result.error) {
            // Reset formuláře
            setName('');
            setEmail('');
            setFormError(null);
        } else {
            setFormError(result.error.message);
        }
    };

    return (
        <div style={{ marginBottom: '24px' }}>
            <h2>Přidat nového uživatele</h2>

            {formError && (
                <div style={{ color: 'red', marginBottom: '12px' }}>
                    {formError}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>
                        Jméno:
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>
                        Email:
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Přidávám...' : 'Přidat uživatele'}
                </button>
            </form>
        </div>
    );
};

/**
 * Příklad použití celé aplikace
 */
export const UserManagementApp: React.FC = () => {
    // Konfigurace Firebase
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "your-app.firebaseapp.com",
        projectId: "your-app",
        storageBucket: "your-app.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_ID",
        appId: "YOUR_APP_ID"
    };

    return (
        <FirebaseProvider firebaseConfig={firebaseConfig}>
            <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <h1>Správa uživatelů s Firestore Helper</h1>
                <UserForm />
                <UserList />
            </div>
        </FirebaseProvider>
    );
}; 