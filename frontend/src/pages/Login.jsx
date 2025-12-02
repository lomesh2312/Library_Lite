import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Library, ArrowRight, Mail, Lock, Github } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/');
            } catch (e) {
                console.error('Failed to parse user data', e);
            }
        }
    }, [searchParams, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });

            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = () => {
        window.location.href = 'https://library-lite.onrender.com/api/auth/github';
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Image/Pattern */}
            <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-50"></div>
                <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
                    <div className="flex items-center space-x-3">
                        <Library className="w-8 h-8" />
                        <span className="text-xl font-bold tracking-wider">LIBRARY LITE</span>
                    </div>
                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold leading-tight">
                            Manage your library with elegance.
                        </h1>
                        <p className="text-lg text-gray-300 max-w-md">
                            A minimalist, powerful dashboard for modern library administration. Track books, members, and loans effortlessly.
                        </p>
                    </div>
                    <div className="text-sm text-gray-400">
                        © 2024 Library Lite System
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start lg:hidden mb-6">
                            <Library className="w-10 h-10 text-black" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-gray-500">Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center animate-in fade-in slide-in-from-top-2">
                            <span className="font-medium mr-2">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                        placeholder="admin@library.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center bg-black text-white py-3.5 rounded-xl hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGithubLogin}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        <Github className="h-5 w-5 mr-2" />
                        Sign in with GitHub
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-black hover:text-gray-800 underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
