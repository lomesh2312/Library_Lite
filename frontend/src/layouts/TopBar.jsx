import React, { useState, useEffect } from 'react';
import { User, Sun, Moon, X, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const TopBar = () => {
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [newProfileUrl, setNewProfileUrl] = useState(user.profileUrl || '');
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const refreshProfile = async () => {
            const token = localStorage.getItem('token');
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

            if (!token || !storedUser.id) return;

            try {

                const res = await axios.get('/api/admins', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const currentUser = res.data.find(
                    u => u.email_id === storedUser.email || u.admin_id === storedUser.id
                );

                if (currentUser) {

                    const updatedUser = {
                        id: currentUser.admin_id,
                        name: currentUser.name,
                        email: currentUser.email_id,
                        isAdmin: true,
                        profileUrl: currentUser.profileUrl
                    };


                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setNewProfileUrl(currentUser.profileUrl || '');
                }
            } catch (e) {
                console.error("Failed to refresh profile", e);
            }
        };

        refreshProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!user.id) {
            alert('User ID not found. Please login again.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.put(`/api/admins/${user.id}`, { profileUrl: newProfileUrl });
            const updatedUser = { ...user, profileUrl: response.data.admin.profileUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setShowProfileModal(false);
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className="h-16 bg-white dark:bg-slate-850 border-b border-gray-200 dark:border-slate-700 flex items-center justify-end px-6 sticky top-0 z-10 transition-colors duration-200">
                {/* Right Actions */}
                <div className="flex items-center space-x-4 ml-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Admin Profile Trigger */}
                    <div
                        className="flex items-center pl-4 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setShowProfileModal(true)}
                    >
                        <div className="flex flex-col text-right mr-3 hidden sm:block">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Admin'}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Librarian</span>
                        </div>
                        {user.profileUrl ? (
                            <img
                                src={user.profileUrl}
                                alt={user.name}
                                className="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-slate-600"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600">
                                <User className="h-5 w-5" />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Profile</h2>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <div className="relative mb-4">
                                {newProfileUrl ? (
                                    <img
                                        src={newProfileUrl}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 dark:text-gray-500 border-4 border-white dark:border-slate-700 shadow-lg">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Profile Image URL
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Camera className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent sm:text-sm transition-colors"
                                        placeholder="https://example.com/image.jpg"
                                        value={newProfileUrl}
                                        onChange={(e) => setNewProfileUrl(e.target.value)}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Enter a direct link to an image (e.g., from GitHub, Gravatar, etc.)
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowProfileModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopBar;
