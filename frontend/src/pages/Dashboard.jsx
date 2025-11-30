import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Users, Clock, AlertCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeLoans: 0,
        overdueLoans: 0,
        totalMembers: 0,
        totalEarnings: 0,
        recentActivity: [],
        graphData: { labels: [], data: [] }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-500 font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {trend}
                </span>
                <span className="text-slate-400 dark:text-slate-500 ml-2">vs last month</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, Admin! Here's what's happening today.</p>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Total Books"
                    value={loading ? "..." : stats.totalBooks}
                    icon={BookOpen}
                    color="bg-black dark:bg-slate-900"
                    trend="+2%"
                />
                <StatCard
                    title="Total Earnings"
                    value={loading ? "..." : `₹${stats.totalEarnings.toLocaleString()}`}
                    icon={TrendingUp}
                    color="bg-gray-900 dark:bg-slate-700"
                    trend="+15%"
                />
                <StatCard
                    title="Active Loans"
                    value={loading ? "..." : stats.activeLoans}
                    icon={Clock}
                    color="bg-gray-700 dark:bg-slate-600"
                    trend="+5%"
                />
                <StatCard
                    title="Overdue Books"
                    value={loading ? "..." : stats.overdueLoans}
                    icon={AlertCircle}
                    color="bg-gray-500 dark:bg-slate-500"
                    trend="-2%"
                />
                <StatCard
                    title="Total Members"
                    value={loading ? "..." : stats.totalMembers}
                    icon={Users}
                    color="bg-gray-400 dark:bg-slate-400"
                    trend="+8%"
                />
            </div>

            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 transition-colors duration-200">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-gray-400 text-center py-4">Loading activity...</p>
                        ) : stats.recentActivity.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No recent activity.</p>
                        ) : (
                            stats.recentActivity.map((loan) => (
                                <div key={loan.id} className="flex items-center justify-between group">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                <span className="font-bold">{loan.user?.name}</span> borrowed <span className="font-bold">{loan.book?.title}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(loan.loanedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${loan.returned ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300' : 'bg-black dark:bg-white text-white dark:text-black'}`}>
                                        {loan.returned ? 'Returned' : 'Borrowed'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                
                <div className="bg-black dark:bg-slate-900 p-6 rounded-2xl text-white shadow-lg transition-colors duration-200">
                    <h2 className="text-lg font-bold mb-2">Weekly Earnings</h2>
                    <p className="text-gray-400 text-sm mb-6">Revenue for the past 7 days.</p>

                    
                    <div className="flex items-end justify-between h-40 gap-2">
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">Loading...</div>
                        ) : stats.graphData?.data?.map((val, i) => {
                            
                            const maxVal = Math.max(...stats.graphData.data, 1); 
                            const height = Math.max((val / maxVal) * 100, 5); 

                            return (
                                <div key={i} className="w-full bg-white/20 rounded-t-lg hover:bg-white/40 transition-colors relative group" style={{ height: `${height}%` }}>
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                        ₹{val}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                        {stats.graphData?.labels?.map((label, i) => (
                            <span key={i}>{label}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
