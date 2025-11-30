import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, UserPlus, Calendar, Trash2 } from 'lucide-react';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        duration: 'MONTH_1'
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:4000/api/members');
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/api/members', formData);
            setShowAddModal(false);
            fetchMembers();
            setFormData({ name: '', email: '', duration: 'MONTH_1' });
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Failed to add member');
        }
    };

    const getDurationLabel = (type) => {
        switch (type) {
            case 'MONTH_1': return '1 Month';
            case 'MONTH_3': return '3 Months';
            case 'MONTH_6': return '6 Months';
            case 'YEAR_1': return '1 Year';
            default: return type;
        }
    };

    const handleDeleteMember = async (id) => {
        if (!window.confirm('Are you sure you want to delete this member? This will also delete their loan history.')) return;
        try {
            await axios.delete(`http://localhost:4000/api/members/${id}`);
            fetchMembers();
            alert('Member deleted successfully');
        } catch (error) {
            console.error('Error deleting member:', error);
            alert(error.response?.data?.error || 'Failed to delete member');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Members</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage library members and subscriptions.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New Member
                </button>
            </div>

            {/* Members Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-200 relative">
                            <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="absolute top-4 right-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete member"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-slate-700 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">{member.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                                </div>
                            </div>
                            <div className="border-t border-slate-50 dark:border-slate-700 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Member ID</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">#{member.id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Plan</span>
                                    <span className="font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">
                                        {getDurationLabel(member.membershipType)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Expires</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">
                                        {member.membershipExpiry ? new Date(member.membershipExpiry).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Active Loans</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{member._count?.loans || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Add New Member</h2>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Membership Duration</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'MONTH_1', label: '1 Month' },
                                        { value: 'MONTH_3', label: '3 Months' },
                                        { value: 'MONTH_6', label: '6 Months' },
                                        { value: 'YEAR_1', label: '1 Year' }
                                    ].map((option) => (
                                        <label
                                            key={option.value}
                                            className={`
                        flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all
                        ${formData.duration === option.value
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 ring-1 ring-primary-500'
                                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-300'}
                      `}
                                        >
                                            <input
                                                type="radio"
                                                name="duration"
                                                value={option.value}
                                                checked={formData.duration === option.value}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className="sr-only"
                                            />
                                            <span className="text-sm font-medium">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Create Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;
