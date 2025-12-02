import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, TrendingUp, DollarSign, Calendar } from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState({
        totalEarnings: 0,
        transactions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/reports');
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">

            <div>
                <h1 className="text-2xl font-bold text-slate-800">Financial Reports</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Track revenue from memberships, book issues, and fines.</p>
            </div>


            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-8 text-white shadow-lg max-w-md">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-emerald-100 font-medium">Total Earnings</p>
                        <h2 className="text-4xl font-bold">₹{reports.totalEarnings.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="flex items-center text-emerald-100 text-sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span>Updated just now</span>
                </div>
            </div>


            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Transaction History</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading reports...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-700">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {reports.transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    reports.transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.source === 'Membership' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                                    tx.source === 'Book Issue' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                    }`}>
                                                    {tx.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                {tx.description}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                +₹{tx.amount}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


export default Reports;
