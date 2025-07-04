import { useState, useContext } from 'react';
import AuthContext from './AuthContext';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setShowLogin } = useContext(AuthContext);

    const handleLogin = (e) => {
        e.preventDefault();
        // Gantilah ini dengan logika autentikasi yang sebenarnya
        if (username === 'admin' && password === 'admin') {
            onLoginSuccess();
        } else {
            setError('Username atau password salah');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px] bg-black/10">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-modalPop">
                <button
                    className="absolute top-2 right-2 text-slate-500 hover:text-rose-800 cursor-pointer text-xl font-bold"
                    onClick={() => setShowLogin(false)}
                    aria-label="Tutup"
                >
                    ×
                </button>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Login Admin</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                        {error && <p className="text-red-500 text-xs italic">{error}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="border-2 border-slate-600 text-slate-900 hover:bg-slate-700 hover:text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer text-center mx-auto"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}