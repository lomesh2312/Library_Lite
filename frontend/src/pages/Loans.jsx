import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Repeat, Plus, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showIssueModal, setShowIssueModal] = useState(false);


    const [selectedBook, setSelectedBook] = useState('');
    const [userId, setUserId] = useState('1');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        fetchLoans();
        fetchBooks();
    }, []);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://library-lite.onrender.com/api/loans');
            setLoans(response.data);
        } catch (error) {
            console.error('Error fetching loans:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await axios.get('https://library-lite.onrender.com/api/books');
            setBooks(response.data.filter(b => b.availableCopies > 0));
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const handleIssueBook = async (e) => {
        e.preventDefault();
        try {

            const issueDate = new Date();
            const defaultDueDate = new Date(issueDate);
            defaultDueDate.setDate(defaultDueDate.getDate() + 7);

            await axios.post('https://library-lite.onrender.com/api/loans', {
                userId,
                bookId: selectedBook,
                dueDate: dueDate || defaultDueDate.toISOString().split('T')[0]
            });
            setShowIssueModal(false);
            fetchLoans();
            fetchBooks();

            setSelectedBook('');
            setDueDate('');
        } catch (error) {
            console.error('Error issuing book:', error);
            alert('Failed to issue book');
        }
    };

    const handleReturnBook = async (id) => {
        if (!window.confirm('Are you sure you want to return this book?')) return;
        try {
            await axios.put(`https://library-lite.onrender.com/api/loans/${id}/return`);
            fetchLoans();
            fetchBooks();
        } catch (error) {
            console.error('Error returning book:', error);
            alert('Failed to return book');
        }
    };

    const handleDeleteLoan = async (id) => {
        if (!window.confirm('Are you sure you want to delete this loan record? This action cannot be undone.')) return;
        try {
            await axios.delete(`https://library-lite.onrender.com/api/loans/${id}`);
            fetchLoans();
            fetchBooks(); // Refresh books list in case available copies changed
            alert('Loan deleted successfully');
        } catch (error) {
            console.error('Error deleting loan:', error);
            alert(error.response?.data?.error || 'Failed to delete loan');
        }
    };

    return (
        <div className="space-y-6">

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Loans Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track borrowed books and due dates.</p>
                </div>
                <button
                    onClick={() => setShowIssueModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Issued New Book
                </button>
            </div>


            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Book Title</th>
                                <th className="px-6 py-4">Borrower (ID)</th>
                                <th className="px-6 py-4">Issue Date</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Return Date</th>
                                <th className="px-6 py-4">Overdue (Days)</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Loading loans...</td></tr>
                            ) : loans.length === 0 ? (
                                <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">No active loans found.</td></tr>
                            ) : (
                                loans.map((loan) => {

                                    const issueDate = new Date(loan.loanedAt);
                                    const strictDueDate = new Date(issueDate);
                                    strictDueDate.setDate(strictDueDate.getDate() + 7);

                                    const isOverdue = !loan.returned && strictDueDate < new Date();
                                    const overdueDays = isOverdue
                                        ? Math.floor((new Date() - strictDueDate) / (1000 * 60 * 60 * 24))
                                        : 0;

                                    return (
                                        <tr key={loan.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{loan.book?.title}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800 dark:text-white">{loan.user?.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">ID: {loan.userId}</div>
                                            </td>
                                            <td className="px-6 py-4">{new Date(loan.loanedAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                                                    {strictDueDate.toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {overdueDays > 0 ? <span className="text-red-600 dark:text-red-400 font-bold">{overdueDays}</span> : '0'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {loan.returned ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Returned
                                                    </span>
                                                ) : isOverdue ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                                                        <AlertCircle className="w-3 h-3 mr-1" /> Overdue
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                                        <Repeat className="w-3 h-3 mr-1" /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center space-x-3">
                                                    {!loan.returned && (
                                                        <button
                                                            onClick={() => handleReturnBook(loan.id)}
                                                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
                                                        >
                                                            Return Book
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteLoan(loan.id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm flex items-center"
                                                        title="Delete loan record"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {showIssueModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Issue New Book</h2>
                        <form onSubmit={handleIssueBook} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Book</label>
                                <select
                                    required
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={selectedBook}
                                    onChange={(e) => setSelectedBook(e.target.value)}
                                >
                                    <option value="">-- Select a Book --</option>
                                    {books.map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} ({book.availableCopies} left)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User ID</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="Enter User ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date (Optional - Defaults to 7 days)</label>
                                <input
                                    type="date"
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowIssueModal(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Issue Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Loans;
